// =====================================================================
//  Kalibrációs adatok – az EEPROM-ban tárolódnak, így áramtalanítás
//  után is megmaradnak. A kalibrálás menete: docs/08_kalibracio_es_karbantartas.md
// =====================================================================
#pragma once
#include <Arduino.h>

// Minden mező 4 bájtos, így nincs "kitöltő bájt" a struktúrában
// (ez fontos az ellenőrzőösszeg miatt).
struct Calibration {
  uint32_t magic;        // azonosító: van-e érvényes adat az EEPROM-ban
  uint32_t version;

  float phV7;            // a pH szenzor feszültsége pH 7,00 pufferben [V]
  float phV4;            // a pH szenzor feszültsége pH 4,00 pufferben [V]
  float phCalTempC;      // a kalibráláskori hőmérséklet [°C]

  float ecK;             // EC szorzó ("K érték"), 1413 µS/cm oldattal kalibrálva

  float turbClearV;      // a zavarosság szenzor feszültsége tiszta vízben [V]

  float doSatV;          // DO szenzor feszültsége telített állapotban [V]
  float doCalTempC;      // a DO kalibráláskori hőmérséklet [°C]

  uint32_t checksum;
};

extern Calibration cal;

void calibrationLoad();          // betöltés EEPROM-ból (ha nincs, gyári értékek)
void calibrationSave();          // mentés EEPROM-ba
void calibrationReset();         // gyári értékek (nem menti!)
bool calibrationIsFactory();     // true, ha még sosem kalibráltuk
void calibrationPrint();         // kiírás a soros monitorra
