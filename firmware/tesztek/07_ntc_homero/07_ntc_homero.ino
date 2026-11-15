// =====================================================================
//  TESZT 07 – Olcsó vízhőmérő: NTC termisztor (oktatási alternatíva)
//
//  Az NTC olyan ellenállás, aminek az értéke a hőmérséklettel CSÖKKEN
//  (Negative Temperature Coefficient). Egy fix ellenállással feszültségosztót
//  építünk, a feszültségből kiszámoljuk az ellenállást, abból a hőmérsékletet.
//
//  Bekötés (feszültségosztó):
//      5V ──[ 10 kΩ fix ]──┬──[ NTC 10 kΩ ]── GND
//                          │
//                          A0
//
//  Alkatrész: vízálló NTC szonda, 10 kΩ @ 25 °C, B = 3950 (a leggyakoribb).
//  Ha más az NTC-d, írd át az R0 és BETA értékeket (a termék leírásában van).
//
//  Kísérletek:
//   - Hasonlítsd össze a DS18B20-szal ugyanabban a pohárban! Mennyi az eltérés?
//   - Rajzold fel: ellenállás – hőmérséklet. Egyenes? (Nem! Ezért kell a képlet.)
//   - Melyik reagál gyorsabban a hőmérséklet-változásra: az NTC vagy a DS18B20?
// =====================================================================

const int   PIN_NTC = A0;
const float VREF    = 5.0;      // mérd meg az 5V lábat multiméterrel!
const float R_FIX   = 10000.0;  // a fix ellenállás [Ω] – mérd meg multiméterrel!
const float R0      = 10000.0;  // az NTC ellenállása 25 °C-on [Ω]
const float T0      = 25.0;     // [°C]
const float BETA    = 3950.0;   // az NTC "B értéke"

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  analogReadResolution(14);   // 0..16383
  Serial.println("ido_mp;feszultseg_V;ellenallas_ohm;homerseklet_C");
}

void loop() {
  long osszeg = 0;
  for (int i = 0; i < 32; i++) osszeg += analogRead(PIN_NTC);
  float u = (osszeg / 32.0) * VREF / 16383.0;

  if (u < 0.01 || u > VREF - 0.01) {
    Serial.println("HIBA: nincs NTC (szakadás vagy zárlat) – ellenőrizd a bekötést!");
    delay(1000);
    return;
  }

  // Feszültségosztó: u = VREF * R_ntc / (R_FIX + R_ntc)  →  R_ntc = R_FIX * u / (VREF - u)
  float r = R_FIX * u / (VREF - u);

  // "Béta" képlet: 1/T = 1/T0 + ln(R/R0) / B   (T kelvinben!)
  float tKelvin = 1.0 / (1.0 / (T0 + 273.15) + log(r / R0) / BETA);
  float t = tKelvin - 273.15;

  Serial.print(millis() / 1000);
  Serial.print(';');
  Serial.print(u, 4);
  Serial.print(';');
  Serial.print(r, 0);
  Serial.print(';');
  Serial.println(t, 2);
  delay(1000);
}
