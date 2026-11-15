// =====================================================================
//  TESZT 04 – Doboz belső klímája (BME280, Qwiic csatlakozóval)
//
//  Bekötés: Qwiic kábellel az Arduino Qwiic aljzatába (nem kell forrasztani).
//  Szükséges könyvtár: Adafruit BME280 Library
//
//  Miért kell ez? Ha a dobozba víz szivárog, a páratartalom megemelkedik –
//  így még azelőtt észrevesszük, hogy az elektronika tönkremenne.
//
//  Kísérlet: lehelj rá a szenzorra! Mennyit ugrik a páratartalom?
//            Tedd a szenzort egy zacskó szilikagéllel egy dobozba – mi történik?
// =====================================================================
#include <Wire.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  // Az UNO R4 WiFi Qwiic aljzata a Wire1 buszon van!
  if (!bme.begin(0x77, &Wire1) && !bme.begin(0x76, &Wire1)) {
    Serial.println("HIBA: nem található BME280 (0x76 / 0x77). Kábel?");
    while (true) delay(1000);
  }
  Serial.println("homerseklet_C;paratartalom_%;legnyomas_hPa");
}

void loop() {
  Serial.print(bme.readTemperature(), 1);
  Serial.print(';');
  Serial.print(bme.readHumidity(), 1);
  Serial.print(';');
  Serial.println(bme.readPressure() / 100.0, 1);
  delay(2000);
}
