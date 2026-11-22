// =====================================================================
//  TESZT 04 – Doboz belső klímája (BME280)
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  Bekötés:
//   UNO R4 WiFi: Qwiic kábellel a Qwiic aljzatba (nem kell forrasztani),
//                vagy 5 V-os panelt a fejléc SDA/SCL lábaira.
//   Nano lapok:  VIN → 3V3, GND → GND, SDA → A4, SCL → A5.
//                ⚠️ Csak 3,3 V-ról tápláld (a Nano lapok 3,3 V-osak)!
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

// Megkeresi a szenzort a lap I2C buszán (0x77 vagy 0x76 címen)
bool szenzorKeres() {
#if defined(ARDUINO_UNOWIFIR4)
  // Az UNO R4 WiFi Qwiic aljzata a Wire1 buszon van
  if (bme.begin(0x77, &Wire1) || bme.begin(0x76, &Wire1)) {
    Serial.println("BME280 a Qwiic aljzaton.");
    return true;
  }
#endif
  // Nano lapokon (és az UNO R4 SDA/SCL fejlécén) a Wire busz: A4 = SDA, A5 = SCL
  if (bme.begin(0x77, &Wire) || bme.begin(0x76, &Wire)) {
    Serial.println("BME280 az SDA/SCL lábakon.");
    return true;
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  if (!szenzorKeres()) {
    Serial.println("HIBA: nem található BME280 (0x76 / 0x77). Kábel? Táp?");
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
