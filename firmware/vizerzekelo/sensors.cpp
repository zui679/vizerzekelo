#include "sensors.h"
#include "config.h"
#include "calibration.h"
#include "power.h"

#if USE_DS18B20
  #include <OneWire.h>
  #include <DallasTemperature.h>
  static OneWire oneWire(PIN_ONEWIRE);
  static DallasTemperature ds18b20(&oneWire);
#endif

#if USE_BME280
  #include <Wire.h>
  #include <Adafruit_BME280.h>
  static Adafruit_BME280 bme;
  static bool bmeOk = false;
#endif

// ---------------------------------------------------------------------
// Az analóg szenzorok adatai egy táblázatban
// ---------------------------------------------------------------------
struct AnalogSensorInfo {
  int adcPin;
  int powerPin;
  uint32_t warmupMs;
  const char* name;
};

static const AnalogSensorInfo SENSORS[SENSOR_COUNT] = {
  {PIN_ADC_PH,        PIN_PWR_PH,        WARMUP_PH_MS,        "pH"},
  {PIN_ADC_EC,        PIN_PWR_EC,        WARMUP_EC_MS,        "EC/TDS"},
  {PIN_ADC_TURBIDITY, PIN_PWR_TURBIDITY, WARMUP_TURBIDITY_MS, "Zavarossag"},
  {PIN_ADC_DO,        PIN_PWR_DO,        WARMUP_DO_MS,        "Oldott oxigen"},
};

const char* sensorName(AnalogSensor s) { return SENSORS[s].name; }

// ---------------------------------------------------------------------
// Inicializálás
// ---------------------------------------------------------------------
void sensorsBegin() {
  analogReadResolution(ADC_RESOLUTION_BITS);

#if USE_DS18B20
  ds18b20.begin();
  ds18b20.setResolution(12);   // 0,0625 °C felbontás
#endif

#if USE_BME280
  // A Qwiic csatlakozó az UNO R4 WiFi-n a Wire1 buszon van (3,3 V).
  // A BME280 címe panelenként 0x76 vagy 0x77 lehet – mindkettőt kipróbáljuk.
  bmeOk = bme.begin(0x77, &Wire1) || bme.begin(0x76, &Wire1);
#endif
}

// ---------------------------------------------------------------------
// Feszültségmérés zajszűréssel
//   Sok mintát veszünk, sorba rendezzük, eldobjuk a legkisebb és
//   legnagyobb harmadot, a maradékot átlagoljuk ("nyesett átlag").
//   Így egy-egy zavaró tüske nem rontja el az eredményt.
// ---------------------------------------------------------------------
float readVoltage(int adcPin) {
  static uint16_t buf[ADC_SAMPLES];

  analogRead(adcPin);  // az első mérést eldobjuk (csatornaváltás után pontatlan lehet)
  for (int i = 0; i < ADC_SAMPLES; i++) {
    buf[i] = analogRead(adcPin);
    delay(ADC_SAMPLE_DELAY_MS);
  }

  // Beszúrásos rendezés (kis tömbre egyszerű és gyors)
  for (int i = 1; i < ADC_SAMPLES; i++) {
    uint16_t key = buf[i];
    int j = i - 1;
    while (j >= 0 && buf[j] > key) {
      buf[j + 1] = buf[j];
      j--;
    }
    buf[j + 1] = key;
  }

  const int from = ADC_SAMPLES / 3;
  const int to   = ADC_SAMPLES - ADC_SAMPLES / 3;
  uint32_t sum = 0;
  for (int i = from; i < to; i++) sum += buf[i];

  const float avg = (float)sum / (float)(to - from);
  const float maxCount = (float)((1UL << ADC_RESOLUTION_BITS) - 1);
  return avg * ADC_VREF / maxCount;
}

void sensorPower(AnalogSensor s, bool on) {
  powerSwitch(SENSORS[s].powerPin, on);
}

void sensorWarmup(AnalogSensor s) {
  delay(SENSORS[s].warmupMs);
}

float sensorReadVoltageNow(AnalogSensor s) {
  return readVoltage(SENSORS[s].adcPin);
}

// Egyszerre mindig csak EGY szenzor kap tápot – így nem zavarják egymást
// a vízen keresztül (különösen a TDS szenzor zavarja a pH mérést).
float sensorReadVoltage(AnalogSensor s) {
  sensorPower(s, true);
  sensorWarmup(s);
  float v = sensorReadVoltageNow(s);
  sensorPower(s, false);
  return v;
}

// ---------------------------------------------------------------------
// Vízhőmérséklet (DS18B20)
// ---------------------------------------------------------------------
float readWaterTemp() {
#if USE_DS18B20
  ds18b20.requestTemperatures();          // kb. 750 ms 12 bites felbontásnál
  float t = ds18b20.getTempCByIndex(0);
  // -127 = nincs szenzor; 85 = bekapcsolási alapérték (még nem mért)
  if (t == DEVICE_DISCONNECTED_C || t < -10.0f || t > 50.0f) return NAN;
  return t;
#else
  return NAN;
#endif
}

// ---------------------------------------------------------------------
// Doboz belső klímája (BME280) – a beázás korai jelzésére
// ---------------------------------------------------------------------
bool readBox(float& tempC, float& humidity) {
#if USE_BME280
  if (!bmeOk) return false;
  tempC = bme.readTemperature();
  humidity = bme.readHumidity();
  return !isnan(tempC) && !isnan(humidity);
#else
  (void)tempC; (void)humidity;
  return false;
#endif
}

// ---------------------------------------------------------------------
// pH
//   A pH szonda feszültsége egyenesen arányos a pH-val. Két pontra
//   kalibrálunk (pH 7 és pH 4), és a két pont közé egyenest húzunk.
//   Hőmérséklet-kompenzáció: a szonda érzékenysége az abszolút
//   hőmérséklettel (Kelvin) arányos (Nernst-egyenlet).
// ---------------------------------------------------------------------
float phFromVoltage(float v, float tempC) {
  if (isnan(v)) return NAN;
  float dv = cal.phV4 - cal.phV7;                  // feszültségváltozás 3 pH egység alatt
  if (fabsf(dv) < 0.01f) return NAN;               // hibás kalibráció
  float slopeCal = dv / (4.0f - 7.0f);             // V / pH a kalibrálás hőmérsékletén
  float slopeNow = slopeCal * (tempC + 273.15f) / (cal.phCalTempC + 273.15f);
  return 7.0f + (v - cal.phV7) / slopeNow;
}

// ---------------------------------------------------------------------
// Vezetőképesség (EC) és TDS – DFRobot Gravity TDS (SEN0244) képlete
//   A melegebb víz jobban vezet (kb. 2 % / °C), ezért 25 °C-ra
//   átszámoljuk, hogy a különböző napok mérései összehasonlíthatók legyenek.
// ---------------------------------------------------------------------
float ecFromVoltage(float v, float tempC, float k) {
  if (isnan(v)) return NAN;
  float coeff = 1.0f + 0.02f * (tempC - 25.0f);
  float vc = v / coeff;
  float ec = (133.42f * vc * vc * vc - 255.86f * vc * vc + 857.39f * vc) * k;
  return ec < 0 ? 0 : ec;
}

// ---------------------------------------------------------------------
// Zavarosság – DFRobot SEN0189 közelítő görbéje (5 V táp mellett)
//   Tiszta víz ≈ 4,2 V → 0 NTU; minél zavarosabb, annál kisebb a feszültség.
//   A tiszta vízben mért feszültséggel "normalizálunk" (kalibráció).
// ---------------------------------------------------------------------
float turbidityFromVoltage(float v) {
  if (isnan(v) || cal.turbClearV < 1.0f) return NAN;
  float va = v * (4.2f / cal.turbClearV);
  if (va >= 4.2f) return 0.0f;
  if (va < 2.5f)  return 3000.0f;   // a görbe érvényességi tartománya alatt: "nagyon zavaros"
  float ntu = -1120.4f * va * va + 5742.3f * va - 4352.9f;
  return ntu < 0 ? 0 : ntu;
}

// ---------------------------------------------------------------------
// Oldott oxigén – DFRobot SEN0237 (galvanikus szonda), egypontos kalibráció
//   A telítési oxigéntartalom függ a hőmérséklettől (hidegebb víz több
//   oxigént tud oldani) – ezt a táblázat tartalmazza 0..40 °C között (µg/l).
// ---------------------------------------------------------------------
static const uint16_t DO_TABLE[41] = {
  14460, 14220, 13820, 13440, 13090, 12740, 12420, 12110, 11810, 11530,
  11260, 11010, 10770, 10530, 10300, 10080,  9860,  9660,  9460,  9270,
   9080,  8900,  8730,  8570,  8410,  8250,  8110,  7960,  7820,  7690,
   7560,  7430,  7300,  7180,  7070,  6950,  6840,  6730,  6630,  6530, 6410
};

float doFromVoltage(float v, float tempC) {
  if (isnan(v)) return NAN;
  int idx = (int)lroundf(tempC);
  if (idx < 0) idx = 0;
  if (idx > 40) idx = 40;
  // A szonda telítési feszültsége kb. 35 mV/°C-kal változik
  float vSat = cal.doSatV + 0.035f * (tempC - cal.doCalTempC);
  if (vSat < 0.05f) return NAN;
  return v * DO_TABLE[idx] / vSat / 1000.0f;
}

// ---------------------------------------------------------------------
// A teljes mérési sorozat
// ---------------------------------------------------------------------
static bool voltageLooksDisconnected(float v) {
  return isnan(v) || v < 0.02f || v > ADC_VREF - 0.02f;
}

void sensorsMeasure(Measurement& m) {
  // 1. Vízhőmérséklet – ez kell a többi szenzor kompenzációjához
#if USE_DS18B20
  m.waterTempC = readWaterTemp();
  if (isnan(m.waterTempC)) m.flags |= FLAG_WATER_TEMP_ERR;
#endif
  const float tComp = isnan(m.waterTempC) ? 25.0f : m.waterTempC;

  // 2. Doboz belső klímája
#if USE_BME280
  if (!readBox(m.boxTempC, m.boxHumidity)) m.flags |= FLAG_BOX_SENSOR_ERR;
#endif

  // 3. pH
#if USE_PH
  m.phVoltage = sensorReadVoltage(SENSOR_PH);
  if (voltageLooksDisconnected(m.phVoltage)) {
    m.flags |= FLAG_PH_ERR;
  } else {
    m.ph = phFromVoltage(m.phVoltage, tComp);
    if (isnan(m.ph) || m.ph < 0.0f || m.ph > 14.0f) {
      m.flags |= FLAG_PH_ERR;
      m.ph = NAN;
    }
  }
#endif

  // 4. Vezetőképesség / TDS
#if USE_EC
  {
    float v = sensorReadVoltage(SENSOR_EC);
    if (isnan(v) || v > ADC_VREF - 0.02f) {
      m.flags |= FLAG_EC_ERR;
    } else {
      m.ecUsCm = ecFromVoltage(v, tComp, cal.ecK);
      m.tdsPpm = m.ecUsCm * 0.5f;
    }
  }
#endif

  // 5. Zavarosság
#if USE_TURBIDITY
  {
    float v = sensorReadVoltage(SENSOR_TURBIDITY);
    if (voltageLooksDisconnected(v)) m.flags |= FLAG_TURBIDITY_ERR;
    else m.turbidityNtu = turbidityFromVoltage(v);
  }
#endif

  // 6. Oldott oxigén
#if USE_DO
  {
    float v = sensorReadVoltage(SENSOR_DO);
    if (isnan(v) || v > ADC_VREF - 0.02f) m.flags |= FLAG_DO_ERR;
    else m.doMgL = doFromVoltage(v, tComp);
  }
#endif

  if (calibrationIsFactory()) m.flags |= FLAG_NOT_CALIBRATED;
  if (!isnan(m.boxHumidity) && m.boxHumidity > BOX_HUMIDITY_ALARM) m.flags |= FLAG_LEAK;
}
