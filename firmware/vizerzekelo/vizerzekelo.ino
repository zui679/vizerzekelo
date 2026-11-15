// =====================================================================
//  VÍZÉRZÉKELŐ DOBOZ – fő program
//  Arduino UNO R4 WiFi
//
//  Működés egy mondatban:
//    A TPL5110 időzítő negyedóránként bekapcsolja az Arduinót, ami
//    megméri a vizet, elküldi az adatokat, majd szól a TPL5110-nek,
//    hogy kapcsolja le – így két mérés között szinte semmit sem fogyaszt.
//
//  Részletes leírás: docs/02_rendszerterv.md
//  Beállítások:      config.h
//  Jelszavak:        secrets.h (minta: secrets_example.h)
// =====================================================================
#include "config.h"
#include "measurement.h"
#include "calibration.h"
#include "sensors.h"
#include "power.h"
#include "transport.h"
#include "status.h"
#include "service.h"

static void printBanner() {
  Serial.println();
  Serial.println(F("============================================="));
  Serial.println(F("  VÍZÉRZÉKELŐ DOBOZ  v" FIRMWARE_VERSION));
  Serial.print(F("  Adatküldés: "));
#if TRANSPORT_MODE == TRANSPORT_GSM
  Serial.println(F("mobilhálózat (GSM/LTE)"));
#elif TRANSPORT_MODE == TRANSPORT_WIFI
  Serial.println(F("WiFi"));
#else
  Serial.println(F("nincs (csak soros kiírás)"));
#endif
  Serial.println(F("============================================="));
}

// Egy teljes mérési ciklus: mér → küld → kikapcsol
static void runCycle() {
  Measurement m;
  if (serviceJumperStuck()) m.flags |= FLAG_SERVICE_JUMPER;

  // 1. Akku ellenőrzés: ha nagyon lemerült, nem terheljük tovább
  m.batteryV = readBatteryVoltage();
  if (!isnan(m.batteryV)) {
    if (m.batteryV < BATTERY_CRITICAL_V) {
      m.flags |= FLAG_BATT_CRITICAL;
      Serial.print(F("AKKU KRITIKUS ("));
      Serial.print(m.batteryV, 2);
      Serial.println(F(" V) – kihagyjuk a mérést, hogy az akku ne károsodjon."));
      statusShow(ICON_ERROR);
      delay(STATUS_SHOW_MS);
      return;
    }
    if (m.batteryV < BATTERY_LOW_V) m.flags |= FLAG_BATT_LOW;
  }

  // 2. A modem korai indítása (GSM módban), hogy a mérés alatt csatlakozzon
  transportPrepare();

  // 3. Mérés
  statusShow(ICON_MEASURE);
  sensorsMeasure(m);
  printMeasurement(m);

  // 4. Küldés
  statusShow(ICON_SEND);
  bool ok = transportSend(m);
  transportShutdown();

  Serial.println(ok ? F(">>> Adatküldés SIKERES") : F(">>> Adatküldés SIKERTELEN"));
  statusShow(ok ? ICON_OK : ICON_ERROR);
  delay(STATUS_SHOW_MS);
}

void setup() {
  powerBegin();                 // minden kapcsoló KI – ez legyen az első!
  // Megjegyzés: az UNO R4 WiFi-n a "while (!Serial)" nem vár semmire (az USB egy
  // külön chipen megy át, a Serial mindig "igaz"), ezért itt nincs várakozás.
  Serial.begin(115200);

  statusBegin();
  printBanner();
  calibrationLoad();
  sensorsBegin();
  if (calibrationIsFactory()) {
    Serial.println(F("FIGYELEM: a szenzorok még nincsenek kalibrálva (szerviz menü)."));
  }

  if (serviceModeRequested()) {
    serviceMenu();
  }
}

void loop() {
  runCycle();

  // Jelzés a TPL5110-nek → itt normál esetben elmegy a táp.
  statusShow(ICON_NONE);
  powerDone();

  // Ha ide eljutunk, nincs TPL5110 (vagy USB-ről megy a doboz).
  // Ilyenkor magunk várunk a következő mérésig.
  Serial.print(F("Nincs áramtalanítás (USB táp / nincs TPL5110). Következő mérés "));
  Serial.print(FALLBACK_INTERVAL_S);
  Serial.println(F(" mp múlva."));
  delay((uint32_t)FALLBACK_INTERVAL_S * 1000UL);
}
