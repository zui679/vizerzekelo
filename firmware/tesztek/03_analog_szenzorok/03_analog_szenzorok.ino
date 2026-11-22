// =====================================================================
//  TESZT 03 – Analóg szenzorok (pH, EC/TDS, zavarosság, oldott oxigén)
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  A program a kiválasztott szenzor NYERS FESZÜLTSÉGÉT írja ki.
//  Egyszerre mindig csak egy szenzor kap tápot (a tápkapcsolókon át),
//  mert a vízben egymást zavarnák.
//
//  Használat: Soros monitor 115200 baud, "Új sor" (Newline) beállítással.
//    1 = pH   2 = EC/TDS   3 = zavarosság   4 = oldott oxigén   0 = mind KI
//
//  ⚠️ 3,3 V-os lapon (Nano 33 IoT, Nano RP2040 Connect):
//   - a pH és a TDS panelt 3,3 V-ról táplálva közvetlenül bekötheted;
//   - a ZAVAROSSÁG szenzor (SEN0189) és a PH-4502C 5 V-os jelet ad – ezeket
//     csak feszültségosztón át szabad bekötni, különben tönkreteszik a lapot!
//     (Pl. 10 kΩ + 20 kΩ: 4,5 V → 3,0 V. Ilyenkor a kiírt érték az osztott feszültség.)
//
//  Kísérletek diákoknak (felnőtt felügyelettel!):
//   pH:         ecet, citromlé, csapvíz, szódabikarbónás víz – hogyan
//               változik a feszültség? Melyik savas, melyik lúgos?
//   EC:         desztillált víz → csapvíz → csapvíz + 1 csipet só → + 2 csipet só
//   Zavarosság: tiszta víz, majd cseppenként tej – rajzolj grafikont!
// =====================================================================

// ---------------------------------------------------------------------
//  Lapfelismerés – a program magától beállítja magát a laphoz
// ---------------------------------------------------------------------
#if defined(ARDUINO_UNOWIFIR4)
  const char* LAP_NEVE = "UNO R4 WiFi";
  const float VREF     = 5.0;   // az 5V láb feszültsége – mérd meg multiméterrel!
  const int   ADC_BIT  = 14;    // 0..16383
  const int   ADC_PIN[] = {A0, A1, A2, A4};
#elif defined(ARDUINO_SAMD_NANO_33_IOT)
  const char* LAP_NEVE = "Nano 33 IoT";
  const float VREF     = 3.3;   // a 3V3 láb feszültsége – mérd meg multiméterrel!
  const int   ADC_BIT  = 12;    // 0..4095
  const int   ADC_PIN[] = {A0, A1, A2, A4};
#elif defined(ARDUINO_NANO_RP2040_CONNECT)
  const char* LAP_NEVE = "Nano RP2040 Connect";
  const float VREF     = 3.3;
  const int   ADC_BIT  = 12;
  // Ezen a lapon csak az A0–A3 saját analóg bemenet, ezért a DO az A3-ra kerül.
  const int   ADC_PIN[] = {A0, A1, A2, A3};
#else
  #error "Ismeretlen lap! Ez a program UNO R4 WiFi, Nano 33 IoT és Nano RP2040 Connect lapra készült."
#endif
const float ADC_MAX = (float)((1UL << ADC_BIT) - 1);

// Tápkapcsolók – ugyanaz a kiosztás, mint a fő programban (config.h)
const int PWR_PIN[] = {5, 6, 7, 10};
const char* NEV[]   = {"pH", "EC/TDS", "Zavarossag", "Oldott oxigen"};

int aktiv = -1;           // melyik szenzor van bekapcsolva (-1 = egyik sem)

float feszultseg(int pin) {
  long osszeg = 0;
  for (int i = 0; i < 20; i++) {
    osszeg += analogRead(pin);
    delay(10);
  }
  return (osszeg / 20.0) * VREF / ADC_MAX;
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
  analogReadResolution(ADC_BIT);
  for (int i = 0; i < 4; i++) {
    pinMode(PWR_PIN[i], OUTPUT);
    digitalWrite(PWR_PIN[i], LOW);
  }
  Serial.print("Lap: ");
  Serial.print(LAP_NEVE);
  Serial.print("  (mérési tartomány: 0–");
  Serial.print(VREF, 1);
  Serial.println(" V)");
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
