#include "transport.h"
#include "config.h"

#if TRANSPORT_MODE == TRANSPORT_GSM
  #include "modem.h"
#elif TRANSPORT_MODE == TRANSPORT_WIFI
  #include <WiFiS3.h>
#endif

// ---------------------------------------------------------------------
// ThingSpeak URL összeállítása
//   Mezők:  1 = vízhőmérséklet  2 = pH          3 = EC (µS/cm)
//           4 = zavarosság      5 = oldott O2   6 = akkufeszültség
//           7 = doboz pára %    8 = jelerősség (dBm)
//   status = állapot szöveg (pl. "OK" vagy "SZIVARGAS AKKU_GYENGE")
// ---------------------------------------------------------------------
static void addField(String& p, int n, float value, int decimals) {
  if (isnan(value)) return;          // hiányzó adatot nem küldünk
  p += "&field";
  p += n;
  p += '=';
  p += String(value, decimals);
}

String buildThingSpeakPath(const Measurement& m) {
  String p = "/update?api_key=";
  p += THINGSPEAK_API_KEY;
  addField(p, 1, m.waterTempC, 2);
  addField(p, 2, m.ph, 2);
  addField(p, 3, m.ecUsCm, 0);
  addField(p, 4, m.turbidityNtu, 0);
  addField(p, 5, m.doMgL, 2);
  addField(p, 6, m.batteryV, 2);
  addField(p, 7, m.boxHumidity, 0);
  if (m.signalDbm != 0) addField(p, 8, (float)m.signalDbm, 0);
  p += "&status=";
  p += flagsToText(m.flags, "%20");  // %20 = szóköz URL-ben
  return p;
}

// =====================================================================
#if TRANSPORT_MODE == TRANSPORT_GSM
// =====================================================================
void transportPrepare() {
#if MODEM_EARLY_START
  modemPowerOn();   // a hálózatkeresés a mérés alatt "a háttérben" zajlik
#endif
}

bool transportSend(Measurement& m) {
  if (!modemConnect()) return false;
  m.signalDbm = modemSignalDbm();
  String url = String("http://") + THINGSPEAK_HOST + buildThingSpeakPath(m);
  int status = modemHttpGet(url);
  Serial.print(F("[GSM] HTTP válasz: "));
  Serial.println(status);
  return status == 200;
}

void transportShutdown() {
  modemPowerOff();
}

// =====================================================================
#elif TRANSPORT_MODE == TRANSPORT_WIFI
// =====================================================================
void transportPrepare() {}

bool transportSend(Measurement& m) {
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println(F("[WiFi] HIBA: nem érhető el a WiFi modul"));
    return false;
  }
  Serial.print(F("[WiFi] Csatlakozás: "));
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_TIMEOUT_MS) {
    delay(500);
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WiFi] HIBA: nem sikerült csatlakozni"));
    return false;
  }
  // Az IP cím megérkezésére is várunk (különben az első kérés elhasalhat)
  while (WiFi.localIP() == IPAddress(0, 0, 0, 0) && millis() - start < WIFI_CONNECT_TIMEOUT_MS) {
    delay(200);
  }
  m.signalDbm = (int)WiFi.RSSI();

  WiFiClient client;
  if (!client.connect(THINGSPEAK_HOST, THINGSPEAK_PORT)) {
    Serial.println(F("[WiFi] HIBA: a szerver nem elérhető"));
    return false;
  }
  String path = buildThingSpeakPath(m);
  client.print(String("GET ") + path + " HTTP/1.1\r\n" +
               "Host: " + THINGSPEAK_HOST + "\r\n" +
               "Connection: close\r\n\r\n");

  // Az első sor pl.: "HTTP/1.1 200 OK"
  client.setTimeout(10000);
  String statusLine = client.readStringUntil('\n');
  client.stop();
  Serial.print(F("[WiFi] Válasz: "));
  Serial.println(statusLine);
  return statusLine.indexOf(" 200") > 0;
}

void transportShutdown() {
  WiFi.disconnect();
  WiFi.end();
}

// =====================================================================
#else  // TRANSPORT_NONE
// =====================================================================
void transportPrepare() {}

bool transportSend(Measurement& m) {
  Serial.println(F("[nincs küldés] Ezt küldenénk:"));
  Serial.println(buildThingSpeakPath(m));
  return true;
}

void transportShutdown() {}
#endif
