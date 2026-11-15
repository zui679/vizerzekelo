#include "power.h"
#include "config.h"
#include "sensors.h"

void powerSwitch(int pin, bool on) {
  if (pin < 0) return;
  digitalWrite(pin, on ? HIGH : LOW);
}

void powerBegin() {
  // A TPL5110 a DONE láb felfutó élére kapcsol le, ezért alapból LOW.
  pinMode(PIN_TPL_DONE, OUTPUT);
  digitalWrite(PIN_TPL_DONE, LOW);

  const int switches[] = {PIN_PWR_PH, PIN_PWR_EC, PIN_PWR_TURBIDITY, PIN_PWR_DO, PIN_MODEM_POWER};
  for (int pin : switches) {
    if (pin < 0) continue;
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);   // KI
  }

  pinMode(PIN_MODEM_PWRKEY, OUTPUT);
  digitalWrite(PIN_MODEM_PWRKEY, MODEM_PWRKEY_ACTIVE_HIGH ? LOW : HIGH);  // "nincs megnyomva"

  pinMode(PIN_SERVICE, INPUT_PULLUP);
}

void powerDone() {
  // Felfutó él a DONE lábon → a TPL5110 lekapcsolja az Arduino tápját.
  // Ha mégis tovább élünk (nincs TPL5110, USB táp), visszaállunk LOW-ra,
  // hogy a következő ciklusban újra jelezni tudjunk.
  digitalWrite(PIN_TPL_DONE, HIGH);
  delay(200);
  digitalWrite(PIN_TPL_DONE, LOW);
}

float readBatteryVoltage() {
#if USE_BATTERY_MON
  float v = readVoltage(PIN_ADC_BATTERY) * BATTERY_DIVIDER_RATIO;
  // 1 V alatt biztosan nincs bekötve az osztó (egy Li-ion akku sosem ennyi).
  if (v < 1.0f) return NAN;
  return v;
#else
  return NAN;
#endif
}

bool serviceJumperSet() {
  return digitalRead(PIN_SERVICE) == LOW;
}
