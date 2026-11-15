#include "calibration.h"
#include "config.h"
#include <EEPROM.h>
#include <stddef.h>

Calibration cal;

static const uint32_t CAL_MAGIC   = 0x56495A31;  // "VIZ1"
static const uint32_t CAL_VERSION = 1;
static const int      CAL_ADDRESS = 0;
static bool loadedFromEeprom = false;

// Egyszerű ellenőrzőösszeg: ha az EEPROM tartalma megsérül,
// észrevesszük, és a gyári értékeket használjuk.
static uint32_t calcChecksum(const Calibration& c) {
  const uint8_t* p = reinterpret_cast<const uint8_t*>(&c);
  uint32_t sum = 0x12345678;
  for (size_t i = 0; i < offsetof(Calibration, checksum); i++) {
    sum = ((sum << 5) | (sum >> 27)) ^ p[i];
  }
  return sum;
}

void calibrationReset() {
  cal.magic      = CAL_MAGIC;
  cal.version    = CAL_VERSION;
#if PH_BOARD == PH_BOARD_PH4502C
  // PH-4502C: pH 7 ≈ 2,5 V (a panel trimmerével beállítva), kb. 0,18 V / pH
  cal.phV7       = 2.500f;
  cal.phV4       = 3.040f;
#else
  // DFRobot Gravity pH V2 tipikus értékei
  cal.phV7       = 1.500f;
  cal.phV4       = 2.032f;
#endif
  cal.phCalTempC = 25.0f;
  cal.ecK        = 1.0f;
  // A DFRobot SEN0189 tiszta vízben kb. 4,2 V-ot ad
  cal.turbClearV = 4.20f;
  cal.doSatV     = 1.60f;
  cal.doCalTempC = 25.0f;
  cal.checksum   = calcChecksum(cal);
}

void calibrationLoad() {
  Calibration tmp;
  EEPROM.get(CAL_ADDRESS, tmp);
  if (tmp.magic == CAL_MAGIC && tmp.version == CAL_VERSION &&
      tmp.checksum == calcChecksum(tmp)) {
    cal = tmp;
    loadedFromEeprom = true;
  } else {
    calibrationReset();
    loadedFromEeprom = false;
  }
}

void calibrationSave() {
  cal.magic    = CAL_MAGIC;
  cal.version  = CAL_VERSION;
  cal.checksum = calcChecksum(cal);
  EEPROM.put(CAL_ADDRESS, cal);
  loadedFromEeprom = true;
}

bool calibrationIsFactory() {
  return !loadedFromEeprom;
}

void calibrationPrint() {
  Serial.println(F("--------------- KALIBRÁCIÓ ---------------"));
  Serial.print(F("Forrás:           "));
  Serial.println(loadedFromEeprom ? F("EEPROM (kalibrált)") : F("GYÁRI ÉRTÉKEK (nincs kalibrálva!)"));
  Serial.print(F("pH 7 feszültség:  ")); Serial.print(cal.phV7, 4); Serial.println(F(" V"));
  Serial.print(F("pH 4 feszültség:  ")); Serial.print(cal.phV4, 4); Serial.println(F(" V"));
  Serial.print(F("pH kal. hőmérs.:  ")); Serial.print(cal.phCalTempC, 1); Serial.println(F(" °C"));
  float slopeMvPerPh = fabsf(cal.phV4 - cal.phV7) / 3.0f * 1000.0f;
  Serial.print(F("pH meredekség:    ")); Serial.print(slopeMvPerPh, 1);
  Serial.println(F(" mV/pH  (jó szonda: kb. 150-190; ha egyre kisebb, öregszik)"));
  Serial.print(F("EC K érték:       ")); Serial.println(cal.ecK, 4);
  Serial.print(F("Tiszta víz (zav.):")); Serial.print(cal.turbClearV, 3); Serial.println(F(" V"));
  Serial.print(F("DO telítési fesz.:")); Serial.print(cal.doSatV, 4); Serial.println(F(" V"));
  Serial.print(F("DO kal. hőmérs.:  ")); Serial.print(cal.doCalTempC, 1); Serial.println(F(" °C"));
  Serial.println(F("------------------------------------------"));
}
