// =====================================================================
//  TESZT 10 – pH mérés vöröskáposztával és színérzékelővel
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  A vöröskáposzta leve természetes pH INDIKÁTOR: savban piros, semleges
//  közegben lila, lúgban kék, zöld, majd sárga lesz. A TCS34725 színérzékelő
//  megméri a színt, a program a SZÍNÁRNYALATBÓL (hue, 0–360°) becsli a pH-t.
//
//  Elkészítés (felnőtt felügyelettel – forró víz!):
//    1. Fél fej vöröskáposztát vágj apróra, öntsd le forró vízzel, 15 perc.
//    2. Szűrd le – a lila lé az indikátor. Hűtőben pár napig eltartható.
//    3. Egy fehér pohárba: kevés vizsgálandó folyadék + néhány kanál káposztalé.
//
//  Bekötés:
//   UNO R4 WiFi: Qwiic/STEMMA QT kábellel a Qwiic aljzatba, vagy 4 vezetékkel:
//                VIN→5V, GND→GND, SDA→SDA, SCL→SCL (Arduino felső sor).
//   Nano lapok:  VIN→3V3 (NEM 5V!), GND→GND, SDA→A4, SCL→A5.
//  Az érzékelő nézzen a pohárba fix távolságból, és takard le a szoba fénye elől!
//
//  Szükséges könyvtár: Adafruit TCS34725
//
//  FONTOS: az alábbi SZIN_PH táblázat csak kiinduló becslés! Mérjétek meg
//  a saját oldataitokkal (ecet ≈ 3, csapvíz ≈ 7–8, szódabikarbóna ≈ 8–9,
//  szappanos víz ≈ 9–10), és írjátok be a saját értékeiteket!
// =====================================================================
#include <Wire.h>
#include <Adafruit_TCS34725.h>

Adafruit_TCS34725 tcs(TCS34725_INTEGRATIONTIME_154MS, TCS34725_GAIN_4X);

// Színárnyalat (fok) → pH.  A pirosat 360 fölé "tekerjük" (0–30° → 360–390°),
// hogy a táblázat folyamatosan csökkenjen.  CSERÉLD A SAJÁT MÉRÉSEIDRE!
struct SzinPh { float hue; float ph; };
const SzinPh SZIN_PH[] = {
  {375, 2},   // piros
  {330, 4},   // rózsaszín
  {290, 6},   // lila
  {260, 7},   // kékes-lila
  {220, 8},   // kék
  {170, 10},  // zöldeskék / zöld
  {90,  12},  // sárgászöld
};
const int N_TABLA = sizeof(SZIN_PH) / sizeof(SZIN_PH[0]);

// RGB → színárnyalat (hue) fokban
float hueSzamol(float r, float g, float b) {
  float mx = max(r, max(g, b));
  float mn = min(r, min(g, b));
  float d = mx - mn;
  if (d < 1e-6) return -1;                  // szürke/fehér: nincs színárnyalat
  float h;
  if (mx == r)      h = 60.0 * fmod((g - b) / d, 6.0);
  else if (mx == g) h = 60.0 * ((b - r) / d + 2.0);
  else              h = 60.0 * ((r - g) / d + 4.0);
  if (h < 0) h += 360.0;
  return h;
}

// Lineáris interpoláció a táblázat két szomszédos pontja között
float phBecsles(float hue) {
  if (hue < 30) hue += 360;                 // piros "tekerése"
  if (hue >= SZIN_PH[0].hue) return SZIN_PH[0].ph;
  for (int i = 1; i < N_TABLA; i++) {
    if (hue >= SZIN_PH[i].hue) {
      float x = (hue - SZIN_PH[i].hue) / (SZIN_PH[i - 1].hue - SZIN_PH[i].hue);
      return SZIN_PH[i].ph + x * (SZIN_PH[i - 1].ph - SZIN_PH[i].ph);
    }
  }
  return SZIN_PH[N_TABLA - 1].ph;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  bool megvan = false;
#if defined(ARDUINO_UNOWIFIR4)
  // UNO R4 WiFi: először a Qwiic aljzat (Wire1)
  megvan = tcs.begin(TCS34725_ADDRESS, &Wire1);
#endif
  // Nano lapokon (és az UNO R4 SDA/SCL fejlécén) a Wire busz: A4 = SDA, A5 = SCL
  if (!megvan) megvan = tcs.begin(TCS34725_ADDRESS, &Wire);
  if (!megvan) {
    Serial.println("HIBA: nem található a TCS34725 színérzékelő. Bekötés? Táp?");
    while (true) delay(1000);
  }
  Serial.println("R;G;B;fenyesseg;hue_fok;pH_becsles");
}

void loop() {
  uint16_t r, g, b, c;
  tcs.getRawData(&r, &g, &b, &c);
  if (c == 0) {
    Serial.println("Túl sötét – világítson a panel LED-je, vagy közelebb a pohárhoz!");
    delay(1000);
    return;
  }
  // A "c" (clear) a teljes fényerő – ezzel osztva a szín független a fényerőtől
  float rn = (float)r / c, gn = (float)g / c, bn = (float)b / c;
  float hue = hueSzamol(rn, gn, bn);

  Serial.print(r); Serial.print(';');
  Serial.print(g); Serial.print(';');
  Serial.print(b); Serial.print(';');
  Serial.print(c); Serial.print(';');
  if (hue < 0) {
    Serial.println("--;-- (nincs szín)");
  } else {
    Serial.print(hue, 0);
    Serial.print(';');
    Serial.println(phBecsles(hue), 1);
  }
  delay(1000);
}
