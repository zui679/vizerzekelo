// =====================================================================
//  Szenzorok olvasása és az értékek kiszámítása.
//  A képletek magyarázata: docs/03_szenzorok.md
// =====================================================================
#pragma once
#include <Arduino.h>
#include "measurement.h"

enum AnalogSensor {
  SENSOR_PH = 0,
  SENSOR_EC,
  SENSOR_TURBIDITY,
  SENSOR_DO,
  SENSOR_COUNT
};

void  sensorsBegin();
void  sensorsMeasure(Measurement& m);   // a teljes mérési sorozat

// Alacsony szintű segédfüggvények (a szerviz menü is használja)
float readVoltage(int adcPin);                       // szűrt feszültség [V]
void  sensorPower(AnalogSensor s, bool on);          // szenzor táp be/ki
void  sensorWarmup(AnalogSensor s);                  // bemelegedési idő kivárása
float sensorReadVoltageNow(AnalogSensor s);          // mérés (táp már be van kapcsolva)
float sensorReadVoltage(AnalogSensor s);             // be → vár → mér → ki
const char* sensorName(AnalogSensor s);

float readWaterTemp();                               // °C, NAN ha hiba
bool  readBox(float& tempC, float& humidity);        // doboz belső klíma

// Átszámítások feszültségből fizikai mennyiségbe
float phFromVoltage(float v, float tempC);
float ecFromVoltage(float v, float tempC, float k);  // µS/cm (25 °C-ra kompenzálva)
float turbidityFromVoltage(float v);                 // NTU
float doFromVoltage(float v, float tempC);           // mg/l
