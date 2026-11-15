// =====================================================================
//  TESZT 06 – Első adatküldés az internetre (WiFi + ThingSpeak)
//
//  Mielőtt a modemmel bajlódnánk, az iskolai WiFi-n kipróbáljuk, hogy
//  a ThingSpeak csatornára eljutnak-e az adatok.
//
//  Teendők:
//   1. ThingSpeak fiók + csatorna létrehozása (docs/05_kommunikacio.md)
//   2. Az alábbi 3 sor kitöltése (a kitöltött fájlt ne töltsd fel nyilvánosan!)
//   3. Feltöltés, majd nézd a csatorna grafikonját a weboldalon!
//
//  A program 20 másodpercenként elküldi:
//    field1 = egy számláló,  field2 = a WiFi jelerőssége (dBm)
//  (A ThingSpeak ingyenes változata 15 mp-nél sűrűbben nem fogad adatot.)
// =====================================================================
#include <WiFiS3.h>

const char* WIFI_SSID = "iskola-wifi-neve";
const char* WIFI_PASS = "wifi-jelszo";
const char* API_KEY   = "XXXXXXXXXXXXXXXX";   // Write API Key

int szamlalo = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  Serial.print("Csatlakozás: ");
  Serial.println(WIFI_SSID);
  while (WiFi.begin(WIFI_SSID, WIFI_PASS) != WL_CONNECTED) {
    Serial.println("...nem sikerült, újrapróbálom");
    delay(3000);
  }
  delay(2000);
  Serial.print("Kapcsolódva! IP cím: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  szamlalo++;
  long rssi = WiFi.RSSI();

  WiFiClient client;
  if (client.connect("api.thingspeak.com", 80)) {
    String url = String("/update?api_key=") + API_KEY +
                 "&field1=" + szamlalo + "&field2=" + rssi;
    client.print("GET " + url + " HTTP/1.1\r\n"
                 "Host: api.thingspeak.com\r\n"
                 "Connection: close\r\n\r\n");
    client.setTimeout(10000);
    String valasz = client.readStringUntil('\n');
    Serial.print("Elküldve: ");
    Serial.print(szamlalo);
    Serial.print("  RSSI: ");
    Serial.print(rssi);
    Serial.print(" dBm  → szerver válasza: ");
    Serial.println(valasz);
    client.stop();
  } else {
    Serial.println("HIBA: a szerver nem elérhető");
  }
  delay(20000);
}
