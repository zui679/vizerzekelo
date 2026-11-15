#include "service.h"
#include "config.h"
#include "calibration.h"
#include "sensors.h"
#include "power.h"
#include "modem.h"
#include "transport.h"
#include "status.h"

// ---------------------------------------------------------------------
// Soros bevitel segédfüggvények
// ---------------------------------------------------------------------
static void flushInput() {
  delay(20);
  while (Serial.available()) Serial.read();
}

// Beolvas egy sort. Ha a soros monitor "Nincs sorvége" módban van,
// 300 ms csend után akkor is lezárja a sort.
static String readLine() {
  String s;
  bool got = false;
  uint32_t last = 0;
  while (true) {
    if (Serial.available()) {
      char c = (char)Serial.read();
      last = millis();
      if (c == '\n') break;
      if (c != '\r') { s += c; got = true; }
    } else if (got && millis() - last > 300) {
      break;
    } else {
      delay(2);
    }
  }
  s.trim();
  return s;
}

static bool askYes(const __FlashStringHelper* question) {
  Serial.print(question);
  Serial.println(F(" (i/n)"));
  String a = readLine();
  return a.equalsIgnoreCase("i") || a.equalsIgnoreCase("igen");
}

// ---------------------------------------------------------------------
// Belépés a szerviz módba
// ---------------------------------------------------------------------
bool serviceModeRequested() {
  if (serviceJumperSet()) {
    Serial.println(F("Szerviz jumper bekötve."));
    return true;
  }
  // Ha a soros monitor nyitva van, adunk pár másodpercet egy Enterre.
  if (Serial) {
    Serial.print(F("Szerviz módhoz nyomj Entert "));
    Serial.print(SERVICE_PROMPT_MS / 1000);
    Serial.println(F(" mp-en belül..."));
    uint32_t start = millis();
    while (millis() - start < SERVICE_PROMPT_MS) {
      if (Serial.available()) { flushInput(); return true; }
      delay(10);
    }
  }
  return false;
}

// ---------------------------------------------------------------------
// Élő feszültség kijelzés kalibráláshoz: addig mér, amíg Entert nem nyomunk.
// Az utolsó mért feszültséget adja vissza.
// ---------------------------------------------------------------------
static float liveVoltage(AnalogSensor s) {
  Serial.print(F("Bekapcsolom: "));
  Serial.println(sensorName(s));
  sensorPower(s, true);
  sensorWarmup(s);
  flushInput();
  Serial.println(F("Várd meg, amíg az érték nem változik (1-2 perc), majd nyomj Entert!"));
  float v = NAN;
  while (true) {
    v = sensorReadVoltageNow(s);
    float t = readWaterTemp();
    Serial.print(F("  U = "));
    Serial.print(v, 4);
    Serial.print(F(" V    vízhőm. = "));
    if (isnan(t)) Serial.print(F("--")); else Serial.print(t, 2);
    Serial.println(F(" °C"));
    if (Serial.available()) { flushInput(); break; }
    delay(300);
  }
  sensorPower(s, false);
  return v;
}

static float waterTempOr25() {
  float t = readWaterTemp();
  if (isnan(t)) {
    Serial.println(F("Figyelem: nincs vízhőmérséklet, 25 °C-kal számolok."));
    return 25.0f;
  }
  return t;
}

// ---------------------------------------------------------------------
// Kalibrációs lépések
// ---------------------------------------------------------------------
static void calibratePh7() {
  Serial.println(F("\n== pH kalibráció: pH 7,00 puffer =="));
  Serial.println(F("1. Öblítsd le a szondát desztillált vízzel, itasd le papírral (ne dörzsöld!)."));
  Serial.println(F("2. Tedd a szondát ÉS a vízhőmérőt a pH 7,00 pufferoldatba."));
  float v = liveVoltage(SENSOR_PH);
  if (v < 0.5f || v > 4.5f) {
    Serial.println(F("Gyanús érték (várható: DFRobot V2 ~1,5 V, PH-4502C ~2,5 V). Bekötés? Jó oldat?"));
    if (!askYes(F("Mégis elmentsem?"))) return;
  }
  cal.phV7 = v;
  cal.phCalTempC = waterTempOr25();
  calibrationSave();
  Serial.println(F("pH 7 kalibráció elmentve. Most jöhet a pH 4 (menü 3)."));
}

static void calibratePh4() {
  Serial.println(F("\n== pH kalibráció: pH 4,00 puffer =="));
  Serial.println(F("1. Öblítsd le a szondát desztillált vízzel, itasd le."));
  Serial.println(F("2. Tedd a szondát ÉS a vízhőmérőt a pH 4,00 pufferoldatba."));
  float v = liveVoltage(SENSOR_PH);
  // A pH 4 és pH 7 közti feszültségkülönbség jó szondánál kb. 0,45-0,57 V
  float dv = fabsf(v - cal.phV7);
  Serial.print(F("Különbség a pH 7-hez képest: "));
  Serial.print(dv, 3);
  Serial.println(F(" V"));
  if (dv < 0.3f || dv > 0.8f) {
    Serial.println(F("Gyanús (várható: kb. 0,4-0,6 V). Rossz oldat, öreg vagy szennyezett szonda?"));
    if (!askYes(F("Mégis elmentsem?"))) return;
  }
  cal.phV4 = v;
  calibrationSave();
  Serial.println(F("pH 4 kalibráció elmentve."));
  calibrationPrint();
}

static void calibrateEc() {
  Serial.println(F("\n== EC/TDS kalibráció =="));
  Serial.println(F("Tedd a szondát ÉS a vízhőmérőt a kalibráló oldatba (pl. 1413 µS/cm)."));
  Serial.println(F("Add meg az oldat értékét µS/cm-ben, vagy Enter = 1413:"));
  String in = readLine();
  float ref = in.length() ? in.toFloat() : 1413.0f;
  if (ref <= 0) { Serial.println(F("Érvénytelen érték.")); return; }

  float v = liveVoltage(SENSOR_EC);
  float raw = ecFromVoltage(v, waterTempOr25(), 1.0f);
  if (raw <= 1.0f) { Serial.println(F("HIBA: a szenzor nem ad jelet.")); return; }
  float k = ref / raw;
  Serial.print(F("Új K érték: "));
  Serial.println(k, 4);
  if (k < 0.5f || k > 2.0f) {
    Serial.println(F("Gyanús K érték (várható: 0,5-2,0)."));
    if (!askYes(F("Mégis elmentsem?"))) return;
  }
  cal.ecK = k;
  calibrationSave();
  Serial.println(F("EC kalibráció elmentve."));
}

static void calibrateTurbidity() {
  Serial.println(F("\n== Zavarosság: tiszta víz referencia =="));
  Serial.println(F("Tedd a szenzort tiszta (desztillált vagy szűrt) vízbe, SÖTÉT helyen"));
  Serial.println(F("(pl. letakart fekete pohárban – a fény zavarja a mérést)."));
  float v = liveVoltage(SENSOR_TURBIDITY);
  if (v < 3.5f || v > 4.9f) {
    Serial.println(F("Gyanús érték (várható tiszta vízben: kb. 4,0-4,5 V)."));
    if (!askYes(F("Mégis elmentsem?"))) return;
  }
  cal.turbClearV = v;
  calibrationSave();
  Serial.println(F("Zavarosság referencia elmentve."));
}

static void calibrateDo() {
  Serial.println(F("\n== Oldott oxigén: telítési kalibráció =="));
  Serial.println(F("A szondát tartsd levegőn (a membrán legyen nedves, de csepp ne lógjon rajta),"));
  Serial.println(F("vagy erősen átlevegőztetett vízbe. A vízhőmérő legyen mellette."));
  float v = liveVoltage(SENSOR_DO);
  cal.doSatV = v;
  cal.doCalTempC = waterTempOr25();
  calibrationSave();
  Serial.println(F("DO kalibráció elmentve."));
}

// ---------------------------------------------------------------------
// Egyéb menüpontok
// ---------------------------------------------------------------------
static void liveMeasurement() {
  Serial.println(F("\nFolyamatos mérés – kilépés: Enter"));
  flushInput();
  while (!Serial.available()) {
    Measurement m;
    m.batteryV = readBatteryVoltage();
    sensorsMeasure(m);
    printMeasurement(m);
  }
  flushInput();
}

static void sendTest() {
  Serial.println(F("\nTeljes mérés + adatküldés teszt..."));
  Measurement m;
  m.batteryV = readBatteryVoltage();
  transportPrepare();
  sensorsMeasure(m);
  printMeasurement(m);
  bool ok = transportSend(m);
  transportShutdown();
  Serial.println(ok ? F("KÜLDÉS SIKERES") : F("KÜLDÉS SIKERTELEN"));
}

static void printMenu() {
  Serial.println();
  Serial.println(F("=============== SZERVIZ MENÜ ==============="));
  Serial.println(F(" 1  Folyamatos mérés (élő értékek)"));
  Serial.println(F(" 2  pH kalibráció – pH 7,00 puffer"));
  Serial.println(F(" 3  pH kalibráció – pH 4,00 puffer"));
  Serial.println(F(" 4  EC/TDS kalibráció (pl. 1413 µS/cm)"));
  Serial.println(F(" 5  Zavarosság – tiszta víz referencia"));
  Serial.println(F(" 6  Oldott oxigén – telítési kalibráció"));
  Serial.println(F(" 7  Kalibrációs adatok kiírása"));
  Serial.println(F(" 8  Gyári kalibráció visszaállítása"));
  Serial.println(F(" 9  Modem konzol (AT parancsok)"));
  Serial.println(F("10  Mérés + adatküldés teszt"));
  Serial.println(F(" 0  Kilépés, normál működés"));
  Serial.println(F("============================================="));
  Serial.print(F("Választás: "));
}

void serviceMenu() {
  statusShow(ICON_SERVICE);
  while (true) {
    printMenu();
    String choice = readLine();
    Serial.println(choice);
    int c = choice.toInt();
    if (choice == "0") {
      Serial.println(F("Kilépés a szerviz módból."));
      return;
    }
    switch (c) {
      case 1:  liveMeasurement(); break;
      case 2:  calibratePh7(); break;
      case 3:  calibratePh4(); break;
      case 4:  calibrateEc(); break;
      case 5:  calibrateTurbidity(); break;
      case 6:  calibrateDo(); break;
      case 7:  calibrationPrint(); break;
      case 8:
        if (askYes(F("Biztosan törlöd a kalibrációt?"))) {
          calibrationReset();
          calibrationSave();
          Serial.println(F("Gyári értékek visszaállítva és elmentve."));
        }
        break;
      case 9:  modemPassthrough(); modemPowerOff(); break;
      case 10: sendTest(); break;
      default: Serial.println(F("Ismeretlen menüpont.")); break;
    }
    statusShow(ICON_SERVICE);
  }
}
