#include "modem.h"
#include "config.h"
#include "power.h"

static bool modemOn = false;
static String atResponse;

// ---------------------------------------------------------------------
// AT parancs segédfüggvények
// ---------------------------------------------------------------------

// Vár, amíg a válaszban megjelenik az 'expect' szöveg.
// false-t ad, ha "ERROR" jön vagy lejár az idő.
static bool waitFor(const char* expect, uint32_t timeoutMs) {
  atResponse = "";
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    while (MODEM_SERIAL.available()) {
      char c = (char)MODEM_SERIAL.read();
#if DEBUG_AT
      Serial.write(c);
#endif
      if (atResponse.length() < 600) atResponse += c;
      if (atResponse.indexOf(expect) >= 0) return true;
      if (c == '\n' && atResponse.indexOf("ERROR") >= 0) return false;
    }
    delay(1);
  }
  return false;
}

// Elküld egy AT parancsot, és vár a válaszra.
static bool sendAT(const String& cmd, const char* expect = "OK", uint32_t timeoutMs = 2000) {
  while (MODEM_SERIAL.available()) MODEM_SERIAL.read();   // régi szemét törlése
#if DEBUG_AT
  Serial.print(F(">> "));
  Serial.println(cmd);
#endif
  MODEM_SERIAL.print(cmd);
  MODEM_SERIAL.print("\r\n");
  return waitFor(expect, timeoutMs);
}

// Beolvas egy sort (a '\n' karakterig).
static String readLine(uint32_t timeoutMs) {
  String line;
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    if (MODEM_SERIAL.available()) {
      char c = (char)MODEM_SERIAL.read();
#if DEBUG_AT
      Serial.write(c);
#endif
      if (c == '\n') break;
      if (c != '\r') line += c;
    } else {
      delay(1);
    }
  }
  return line;
}

// "AT" küldése ismételten, amíg a modem "OK"-t nem válaszol.
static bool waitAtReady(uint32_t timeoutMs) {
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    if (sendAT("AT", "OK", 500)) return true;
    delay(300);
  }
  return false;
}

static void pressPwrKey() {
  Serial.println(F("[modem] PWRKEY megnyomása..."));
  digitalWrite(PIN_MODEM_PWRKEY, MODEM_PWRKEY_ACTIVE_HIGH ? HIGH : LOW);
  delay(MODEM_PWRKEY_PULSE_MS);
  digitalWrite(PIN_MODEM_PWRKEY, MODEM_PWRKEY_ACTIVE_HIGH ? LOW : HIGH);
}

// ---------------------------------------------------------------------
// Be- és kikapcsolás
// ---------------------------------------------------------------------
bool modemIsOn() { return modemOn; }

bool modemPowerOn() {
  if (modemOn) return true;
  Serial.println(F("[modem] Táp bekapcsolása..."));
  powerSwitch(PIN_MODEM_POWER, true);
  MODEM_SERIAL.begin(MODEM_BAUD);
  delay(500);

  // Egyes panelek tápra maguktól elindulnak, másoknál "meg kell nyomni" a gombot.
  if (!waitAtReady(3000)) {
    pressPwrKey();
    if (!waitAtReady(MODEM_BOOT_TIMEOUT_MS)) {
      Serial.println(F("[modem] HIBA: nem válaszol. Bekötés? Baud? Táp?"));
      powerSwitch(PIN_MODEM_POWER, false);
      return false;
    }
  }
  sendAT("ATE0");        // ne ismételje vissza a parancsainkat
  sendAT("AT+CMEE=2");   // hibák szöveges formában
  modemOn = true;
  return true;
}

void modemPowerOff() {
  if (modemOn) {
    Serial.println(F("[modem] Leállítás..."));
    // Szabályos leállítás: a modem kijelentkezik a hálózatról.
    sendAT("AT+CPOF", "OK", 5000);
    delay(3000);
  }
  MODEM_SERIAL.end();
  powerSwitch(PIN_MODEM_POWER, false);
  modemOn = false;
}

// ---------------------------------------------------------------------
// Hálózatra csatlakozás
// ---------------------------------------------------------------------
static bool registered(const char* query) {
  if (!sendAT(query, "OK", 2000)) return false;
  // Válasz pl. "+CEREG: 0,1"  → 1 = otthoni hálózat, 5 = roaming
  return atResponse.indexOf(",1") >= 0 || atResponse.indexOf(",5") >= 0;
}

bool modemConnect() {
  if (!modemOn && !modemPowerOn()) return false;

  // 1. SIM kártya
  bool simReady = false;
  for (int i = 0; i < 10 && !simReady; i++) {
    sendAT("AT+CPIN?", "OK", 2000);
    if (atResponse.indexOf("READY") >= 0) {
      simReady = true;
    } else if (atResponse.indexOf("SIM PIN") >= 0 && strlen(SIM_PIN) > 0) {
      sendAT(String("AT+CPIN=\"") + SIM_PIN + "\"", "OK", 5000);
      delay(2000);
    } else {
      delay(1000);
    }
  }
  if (!simReady) {
    Serial.println(F("[modem] HIBA: SIM kártya nem elérhető (behelyezve? PIN?)"));
    return false;
  }

  // 2. APN (a szolgáltató "internet-kapuja")
  sendAT(String("AT+CGDCONT=1,\"IP\",\"") + GSM_APN + "\"");
  if (strlen(GSM_APN_USER) > 0) {
    sendAT(String("AT+CGAUTH=1,1,\"") + GSM_APN_USER + "\",\"" + GSM_APN_PASS + "\"");
  }

  // 3. Várakozás a hálózatra (LTE: CEREG, 2G: CREG)
  Serial.println(F("[modem] Hálózat keresése..."));
  uint32_t start = millis();
  bool ok = false;
  while (millis() - start < MODEM_REG_TIMEOUT_MS) {
    if (registered("AT+CEREG?") || registered("AT+CREG?")) { ok = true; break; }
    delay(2000);
  }
  if (!ok) {
    Serial.println(F("[modem] HIBA: nem sikerült hálózatra csatlakozni (antenna? lefedettség?)"));
    return false;
  }
  Serial.print(F("[modem] Hálózaton vagyunk, "));
  Serial.print((millis() - start) / 1000);
  Serial.println(F(" mp alatt."));

  // 4. Adatkapcsolat (PDP context) bekapcsolása
  sendAT("AT+CGACT=1,1", "OK", 30000);
  return true;
}

int modemSignalDbm() {
  if (!sendAT("AT+CSQ", "OK", 2000)) return 0;
  // Válasz: "+CSQ: 18,99" → az első szám 0..31 (99 = ismeretlen)
  int idx = atResponse.indexOf("+CSQ:");
  if (idx < 0) return 0;
  int csq = atResponse.substring(idx + 5).toInt();
  if (csq <= 0 || csq > 31) return 0;
  return -113 + 2 * csq;   // átváltás dBm-re
}

// ---------------------------------------------------------------------
// HTTP GET kérés a modem beépített HTTP kliensével
// ---------------------------------------------------------------------
int modemHttpGet(const String& url) {
  sendAT("AT+HTTPTERM", "OK", 2000);   // ha egy korábbi munkamenet "beragadt"
  if (!sendAT("AT+HTTPINIT", "OK", 5000)) return -1;

  int result = -2;
  if (sendAT(String("AT+HTTPPARA=\"URL\",\"") + url + "\"", "OK", 5000)) {
    result = -3;
    if (sendAT("AT+HTTPACTION=0", "OK", 5000)) {     // 0 = GET
      result = -4;
      // Válasz később érkezik: "+HTTPACTION: 0,200,2"
      if (waitFor("+HTTPACTION:", MODEM_HTTP_TIMEOUT_MS)) {
        String line = readLine(5000);                 // " 0,200,2"
        int c1 = line.indexOf(',');
        int c2 = line.indexOf(',', c1 + 1);
        if (c1 >= 0) {
          result = line.substring(c1 + 1, c2 > 0 ? c2 : line.length()).toInt();
        }
      }
    }
  }
  sendAT("AT+HTTPTERM", "OK", 2000);
  return result;
}

// ---------------------------------------------------------------------
// Szerviz: kézi AT parancsok a soros monitorból
// ---------------------------------------------------------------------
void modemPassthrough() {
  if (!modemOn && !modemPowerOn()) return;
  Serial.println(F("=== Modem konzol ==="));
  Serial.println(F("Írj AT parancsokat (pl. AT+CSQ, AT+COPS?, AT+CPIN?)."));
  Serial.println(F("Kilépés: KILEP"));
  String line;
  while (true) {
    while (MODEM_SERIAL.available()) Serial.write(MODEM_SERIAL.read());
    while (Serial.available()) {
      char c = (char)Serial.read();
      if (c == '\r') continue;
      if (c == '\n') {
        line.trim();
        if (line.equalsIgnoreCase("KILEP")) return;
        MODEM_SERIAL.print(line);
        MODEM_SERIAL.print("\r\n");
        line = "";
      } else {
        line += c;
      }
    }
  }
}
