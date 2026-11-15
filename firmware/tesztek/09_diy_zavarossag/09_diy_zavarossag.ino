// =====================================================================
//  TESZT 09 – Saját építésű zavarosságmérő: LED + fényérzékelő
//
//  Egy LED átvilágít egy átlátszó poharon / csövön, a túloldalon egy
//  fényérzékelő ellenállás (LDR) méri, mennyi fény jut át. Minél zavarosabb
//  a víz, annál kevesebb fény érkezik.
//
//  Bekötés:
//    LED:  D7 ──[ 220 Ω ]──► LED (+, hosszabb láb)   LED (−) ── GND
//    LDR:  5V ──[ LDR ]──┬──[ 10 kΩ ]── GND
//                        │
//                        A2
//  A LED és az LDR egymással szemben, a pohár két oldalán. Az egészet takard
//  le egy dobozzal / fekete papírral, hogy a szoba fénye ne zavarjon!
//
//  Trükk: minden mérésnél kétszer mérünk – LED KI (ez a "háttérfény") és
//  LED BE. A kettő különbsége a LED-től átjutó fény. Így a szoba fénye
//  kevésbé zavar ("differenciális mérés").
//
//  Használat (soros monitor 115200, "Új sor"):
//    Tiszta vízzel a pohárban írd be:  t     (ez lesz a 0% elnyelés)
//
//  Kísérletek:
//   - Tiszta víz, majd cseppenként tej: hány csepp után "vakul meg" a mérő?
//   - Próbáld ki piros, zöld, kék LED-del! Melyik a legérzékenyebb? Miért?
//   - Rajzold fel: tejcseppek száma – elnyelés %. (Beer–Lambert-törvény!)
// =====================================================================

const int   PIN_FENY_LED = 7;
const int   PIN_LDR = A2;
const float VREF    = 5.0;

float tisztaJel = 0;   // a "tiszta víz" jele – a 't' paranccsal állítjuk be

float olvas() {
  long osszeg = 0;
  for (int i = 0; i < 32; i++) osszeg += analogRead(PIN_LDR);
  return (osszeg / 32.0) * VREF / 16383.0;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  analogReadResolution(14);
  pinMode(PIN_FENY_LED, OUTPUT);
  digitalWrite(PIN_FENY_LED, LOW);
  Serial.println("Tiszta vízzel írd be: t");
  Serial.println("hatter_V;ledbe_V;jel_V;elnyeles_%");
}

void loop() {
  digitalWrite(PIN_FENY_LED, LOW);
  delay(150);                      // az LDR lassú, várni kell, amíg beáll
  float hatter = olvas();
  digitalWrite(PIN_FENY_LED, HIGH);
  delay(150);
  float vilagos = olvas();
  digitalWrite(PIN_FENY_LED, LOW);

  float jel = vilagos - hatter;    // csak a LED fénye

  if (Serial.available()) {
    String sor = Serial.readStringUntil('\n');
    sor.trim();
    if (sor == "t" && jel > 0.01) {
      tisztaJel = jel;
      Serial.println(">>> Tiszta víz referencia elmentve");
    }
  }

  Serial.print(hatter, 3);
  Serial.print(';');
  Serial.print(vilagos, 3);
  Serial.print(';');
  Serial.print(jel, 3);
  Serial.print(';');
  if (tisztaJel > 0) {
    float elnyeles = 100.0 * (1.0 - jel / tisztaJel);
    if (elnyeles < 0) elnyeles = 0;
    Serial.println(elnyeles, 1);
  } else {
    Serial.println("(nincs referencia – írd be: t)");
  }
  delay(500);
}
