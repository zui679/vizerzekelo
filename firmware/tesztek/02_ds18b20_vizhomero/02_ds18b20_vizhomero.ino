// =====================================================================
//  TESZT 02 – Vízhőmérő (DS18B20)
//
//  Bekötés:  piros  → 5V
//            fekete → GND
//            sárga  → D4, ÉS egy 4,7 kΩ ellenállás a D4 és az 5V között
//
//  Szükséges könyvtárak: OneWire, DallasTemperature
//
//  Kísérlet diákoknak:
//   - Mérd meg a csapvíz, a jeges víz és a langyos víz hőmérsékletét!
//   - Mennyi idő alatt áll be az érték, ha áttesszük egyik pohárból a másikba?
//     (Ez a szenzor "időállandója".) Rajzolj grafikont az értékekből!
// =====================================================================
#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_ONEWIRE = 4;

OneWire oneWire(PIN_ONEWIRE);
DallasTemperature szenzor(&oneWire);

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  szenzor.begin();
  szenzor.setResolution(12);
  Serial.print("Talált DS18B20 szenzorok száma: ");
  Serial.println(szenzor.getDeviceCount());
  Serial.println("ido_mp;homerseklet_C");   // fejléc – táblázatkezelőbe másolható
}

void loop() {
  szenzor.requestTemperatures();
  float t = szenzor.getTempCByIndex(0);

  Serial.print(millis() / 1000);
  Serial.print(';');
  if (t == DEVICE_DISCONNECTED_C) {
    Serial.println("HIBA – nincs szenzor (bekötés? felhúzó ellenállás?)");
  } else {
    Serial.println(t, 2);
  }
  delay(1000);
}
