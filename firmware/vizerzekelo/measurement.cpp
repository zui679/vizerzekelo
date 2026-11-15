#include "measurement.h"

struct FlagName { uint16_t flag; const char* name; };

// Ékezet nélküli nevek, mert URL-ben is elküldjük őket.
static const FlagName FLAG_NAMES[] = {
  {FLAG_LEAK,           "SZIVARGAS"},
  {FLAG_BATT_LOW,       "AKKU_GYENGE"},
  {FLAG_BATT_CRITICAL,  "AKKU_KRITIKUS"},
  {FLAG_WATER_TEMP_ERR, "VIZHOMERO_HIBA"},
  {FLAG_BOX_SENSOR_ERR, "DOBOZSZENZOR_HIBA"},
  {FLAG_PH_ERR,         "PH_HIBA"},
  {FLAG_EC_ERR,         "EC_HIBA"},
  {FLAG_TURBIDITY_ERR,  "ZAVAROSSAG_HIBA"},
  {FLAG_DO_ERR,         "DO_HIBA"},
  {FLAG_NOT_CALIBRATED, "NINCS_KALIBRALVA"},
};

String flagsToText(uint16_t flags, const char* separator) {
  if (flags == 0) return String("OK");
  String s;
  for (const FlagName& f : FLAG_NAMES) {
    if (flags & f.flag) {
      if (s.length() > 0) s += separator;
      s += f.name;
    }
  }
  return s;
}

static void printLine(const char* label, float value, int decimals, const char* unit) {
  Serial.print(label);
  if (isnan(value)) {
    Serial.println(F("--- (nincs adat)"));
  } else {
    Serial.print(value, decimals);
    Serial.print(' ');
    Serial.println(unit);
  }
}

void printMeasurement(const Measurement& m) {
  Serial.println(F("------------- MÉRÉSI EREDMÉNYEK -------------"));
  printLine("Vízhőmérséklet:     ", m.waterTempC, 2, "°C");
  printLine("pH:                 ", m.ph, 2, "");
  printLine("  pH nyers feszültség:", m.phVoltage, 4, "V");
  printLine("Vezetőképesség (EC):", m.ecUsCm, 0, "µS/cm");
  printLine("TDS (oldott anyag): ", m.tdsPpm, 0, "mg/l");
  printLine("Zavarosság:         ", m.turbidityNtu, 0, "NTU");
  printLine("Oldott oxigén:      ", m.doMgL, 2, "mg/l");
  printLine("Akkufeszültség:     ", m.batteryV, 2, "V");
  printLine("Doboz hőmérséklet:  ", m.boxTempC, 1, "°C");
  printLine("Doboz páratartalom: ", m.boxHumidity, 0, "%");
  Serial.print(F("Állapot:             "));
  Serial.println(flagsToText(m.flags));
  Serial.println(F("---------------------------------------------"));
}
