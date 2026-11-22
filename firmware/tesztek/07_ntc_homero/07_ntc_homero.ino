// =====================================================================
//  TESZT 07 – Olcsó vízhőmérő: NTC termisztor (oktatási alternatíva)
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  Az NTC olyan ellenállás, aminek az értéke a hőmérséklettel CSÖKKEN
//  (Negative Temperature Coefficient). Egy fix ellenállással feszültségosztót
//  építünk, a feszültségből kiszámoljuk az ellenállást, abból a hőmérsékletet.
//
//  Bekötés (feszültségosztó):
//      TÁP ──[ 10 kΩ fix ]──┬──[ NTC 10 kΩ ]── GND
//                           │
//                           A0
//  TÁP = a lap tápfeszültsége:  UNO R4 WiFi: 5V    Nano lapok: 3V3 (NEM 5V!)
//
//  Alkatrész: vízálló NTC szonda, 10 kΩ @ 25 °C, B = 3950 (a leggyakoribb).
//  Ha más az NTC-d, írd át az R0 és BETA értékeket (a termék leírásában van).
//
//  Kísérletek:
//   - Hasonlítsd össze a DS18B20-szal ugyanabban a pohárban! Mennyi az eltérés?
//   - Rajzold fel: ellenállás – hőmérséklet. Egyenes? (Nem! Ezért kell a képlet.)
//   - Melyik reagál gyorsabban a hőmérséklet-változásra: az NTC vagy a DS18B20?
// =====================================================================

// ---------------------------------------------------------------------
//  Lapfelismerés – a program magától beállítja magát a laphoz
// ---------------------------------------------------------------------
#if defined(ARDUINO_UNOWIFIR4)
  const float VREF    = 5.0;    // az 5V láb feszültsége – mérd meg multiméterrel!
  const int   ADC_BIT = 14;
#elif defined(ARDUINO_SAMD_NANO_33_IOT) || defined(ARDUINO_NANO_RP2040_CONNECT)
  const float VREF    = 3.3;    // a 3V3 láb feszültsége – mérd meg multiméterrel!
  const int   ADC_BIT = 12;
#else
  #error "Ismeretlen lap! Ez a program UNO R4 WiFi, Nano 33 IoT és Nano RP2040 Connect lapra készült."
#endif
const float ADC_MAX = (float)((1UL << ADC_BIT) - 1);

const int   PIN_NTC = A0;
const float R_FIX   = 10000.0;  // a fix ellenállás [Ω] – mérd meg multiméterrel!
const float R0      = 10000.0;  // az NTC ellenállása 25 °C-on [Ω]
const float T0      = 25.0;     // [°C]
const float BETA    = 3950.0;   // az NTC "B értéke"

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  analogReadResolution(ADC_BIT);
  Serial.println("ido_mp;feszultseg_V;ellenallas_ohm;homerseklet_C");
}

void loop() {
  long osszeg = 0;
  for (int i = 0; i < 32; i++) osszeg += analogRead(PIN_NTC);
  float u = (osszeg / 32.0) * VREF / ADC_MAX;

  if (u < 0.01 || u > VREF - 0.01) {
    Serial.println("HIBA: nincs NTC (szakadás vagy zárlat) – ellenőrizd a bekötést!");
    delay(1000);
    return;
  }

  // Feszültségosztó: u = VREF * R_ntc / (R_FIX + R_ntc)  →  R_ntc = R_FIX * u / (VREF - u)
  float r = R_FIX * u / (VREF - u);

  // "Béta" képlet: 1/T = 1/T0 + ln(R/R0) / B   (T kelvinben!)
  float tKelvin = 1.0 / (1.0 / (T0 + 273.15) + log(r / R0) / BETA);
  float t = tKelvin - 273.15;

  Serial.print(millis() / 1000);
  Serial.print(';');
  Serial.print(u, 4);
  Serial.print(';');
  Serial.print(r, 0);
  Serial.print(';');
  Serial.println(t, 2);
  delay(1000);
}
