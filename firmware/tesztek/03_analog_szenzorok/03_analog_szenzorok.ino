// =====================================================================
//  TESZT 03 – Analóg szenzorok (pH, EC/TDS, zavarosság, oldott oxigén)
//
//  A program a kiválasztott szenzor NYERS FESZÜLTSÉGÉT írja ki.
//  Egyszerre mindig csak egy szenzor kap tápot (a tápkapcsolókon át),
//  mert a vízben egymást zavarnák.
//
//  Használat: Soros monitor 115200 baud, "Új sor" (Newline) beállítással.
//    1 = pH   2 = EC/TDS   3 = zavarosság   4 = oldott oxigén   0 = mind KI
//
//  Kísérletek diákoknak (felnőtt felügyelettel!):
//   pH:         ecet, citromlé, csapvíz, szódabikarbónás víz – hogyan
//               változik a feszültség? Melyik savas, melyik lúgos?
//   EC:         desztillált víz → csapvíz → csapvíz + 1 csipet só → + 2 csipet só
//   Zavarosság: tiszta víz, majd cseppenként tej – rajzolj grafikont!
// =====================================================================

// Ugyanaz a kiosztás, mint a fő programban (config.h)
const int ADC_PIN[] = {A0, A1, A2, A4};
const int PWR_PIN[] = {5, 6, 7, 10};
const char* NEV[]   = {"pH", "EC/TDS", "Zavarossag", "Oldott oxigen"};
const float VREF = 5.0;   // mérd meg az 5V lábat multiméterrel!

int aktiv = -1;           // melyik szenzor van bekapcsolva (-1 = egyik sem)

float feszultseg(int pin) {
  long osszeg = 0;
  for (int i = 0; i < 20; i++) {
    osszeg += analogRead(pin);
    delay(10);
  }
  return (osszeg / 20.0) * VREF / 16383.0;
}

void valt(int uj) {
  for (int i = 0; i < 4; i++) digitalWrite(PWR_PIN[i], LOW);
  aktiv = uj;
  if (aktiv >= 0) {
    digitalWrite(PWR_PIN[aktiv], HIGH);
    Serial.print("Bekapcsolva: ");
    Serial.println(NEV[aktiv]);
  } else {
    Serial.println("Minden szenzor kikapcsolva.");
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  analogReadResolution(14);   // 0..16383
  for (int i = 0; i < 4; i++) {
    pinMode(PWR_PIN[i], OUTPUT);
    digitalWrite(PWR_PIN[i], LOW);
  }
  Serial.println("Válassz: 1=pH 2=EC 3=zavarosság 4=DO 0=ki");
}

void loop() {
  if (Serial.available()) {
    int c = Serial.parseInt();
    while (Serial.available()) Serial.read();
    if (c >= 1 && c <= 4) valt(c - 1);
    else valt(-1);
  }
  if (aktiv >= 0) {
    Serial.print(NEV[aktiv]);
    Serial.print(": ");
    Serial.print(feszultseg(ADC_PIN[aktiv]), 4);
    Serial.println(" V");
  }
  delay(500);
}
