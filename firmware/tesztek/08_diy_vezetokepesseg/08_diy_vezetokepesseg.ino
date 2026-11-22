// =====================================================================
//  TESZT 08 – Saját építésű vezetőképesség-mérő (oktatási alternatíva)
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  Két fém elektróda között megmérjük a víz ellenállását. Minél több só
//  (ion) van a vízben, annál kisebb az ellenállás, annál jobban vezet.
//
//  Elektróda: 2 db ROZSDAMENTES csavar (M3/M4) egy műanyag kupakba csavarva,
//  egymástól kb. 1 cm-re – vagy egy olcsó rezisztív talajnedvesség-mérő "villa".
//  (Horganyzott szöget és rezet NE használj – fém oldódik a vízbe!)
//
//  Bekötés (mindhárom lapon ugyanígy):
//      D11 ──[ 10 kΩ ]──┬──── elektróda "A"
//                       │          ~~~ víz ~~~
//                       A3         elektróda "B" ──── D12
//
//  Trükk: ha mindig ugyanabba az irányba folyna az áram (egyenáram), a víz
//  bomlani kezdene (elektrolízis), az elektródákon buborékok és lerakódás
//  keletkezne, és a mérés "elmászna". Ezért az áramot mindig ugyanannyi ideig
//  ODA és VISSZA is átfolyatjuk – ez lényegében váltakozó áram.
//
//  Használat (soros monitor 115200, "Új sor"):
//    - Folyamatosan kiírja a vezetést (µS) és – kalibrálás után – az EC-t.
//    - Kalibrálás: tedd az elektródát ismert oldatba (pl. 1413 µS/cm), és írd be:
//         k 1413
//
//  Kísérletek:
//   - Desztillált víz → csapvíz → csapvíz + 1, 2, 3, 4 csipet só. Grafikon!
//   - Mi történik, ha közelebb / távolabb teszed az elektródákat? Miért?
//   - Ugyanaz a víz hidegen és melegen – melyik vezet jobban?
// =====================================================================

// ---------------------------------------------------------------------
//  Lapfelismerés – a program magától beállítja magát a laphoz
//  (A VREF itt a digitális láb HIGH feszültsége is: 5 V vagy 3,3 V.)
// ---------------------------------------------------------------------
#if defined(ARDUINO_UNOWIFIR4)
  const float VREF    = 5.0;
  const int   ADC_BIT = 14;
#elif defined(ARDUINO_SAMD_NANO_33_IOT) || defined(ARDUINO_NANO_RP2040_CONNECT)
  const float VREF    = 3.3;
  const int   ADC_BIT = 12;
#else
  #error "Ismeretlen lap! Ez a program UNO R4 WiFi, Nano 33 IoT és Nano RP2040 Connect lapra készült."
#endif
const float ADC_MAX = (float)((1UL << ADC_BIT) - 1);

const int   PIN_A     = 11;
const int   PIN_B     = 12;
const int   PIN_MERES = A3;       // mindhárom lapon saját analóg bemenet
const float R_SOROS   = 10000.0;  // a soros ellenállás [Ω]

float kCella = 0;                 // cellaállandó – kalibrálás után lesz értéke

// Visszaadja a víz ellenállását ohmban (vagy -1, ha nincs vezetés)
float vizEllenallas() {
  pinMode(PIN_A, OUTPUT);
  pinMode(PIN_B, OUTPUT);
  long osszeg = 0;
  const int N = 64;
  for (int i = 0; i < N; i++) {
    // ODA: A = HIGH, B = 0 V → mérünk
    uint32_t t0 = micros();
    digitalWrite(PIN_A, HIGH);
    digitalWrite(PIN_B, LOW);
    delayMicroseconds(100);
    osszeg += analogRead(PIN_MERES);
    uint32_t ido = micros() - t0;
    // VISSZA: ugyanannyi ideig fordított irányban → kiegyenlítjük
    digitalWrite(PIN_A, LOW);
    digitalWrite(PIN_B, HIGH);
    delayMicroseconds(ido);
  }
  // Szünet: az elektródák ne kapjanak feszültséget
  digitalWrite(PIN_B, LOW);
  pinMode(PIN_A, INPUT);
  pinMode(PIN_B, INPUT);

  float u = (osszeg / (float)N) * VREF / ADC_MAX;
  if (u > VREF - 0.02) return -1;           // nem vezet (levegőben van)
  if (u < 0.001) u = 0.001;
  // Feszültségosztó: u = VREF * R_viz / (R_SOROS + R_viz)
  return R_SOROS * u / (VREF - u);
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  analogReadResolution(ADC_BIT);
  pinMode(PIN_A, INPUT);
  pinMode(PIN_B, INPUT);
  Serial.println("Kalibrálás: ismert oldatba téve írd be pl.:  k 1413");
}

void loop() {
  float r = vizEllenallas();
  float g = (r > 0) ? 1e6 / r : 0;     // vezetés mikrosiemensben (µS) = 1 / R

  if (Serial.available()) {
    String sor = Serial.readStringUntil('\n');
    sor.trim();
    if (sor.startsWith("k") && g > 0) {
      float ref = sor.substring(1).toFloat();
      if (ref > 0) {
        kCella = ref / g;
        Serial.print(">>> Kalibrálva, cellaállandó: ");
        Serial.println(kCella, 3);
      }
    }
  }

  if (r < 0) {
    Serial.println("Nincs vezetés – az elektróda levegőben van?");
  } else {
    Serial.print("R_víz = ");
    Serial.print(r, 0);
    Serial.print(" Ω   vezetés = ");
    Serial.print(g, 1);
    Serial.print(" µS");
    if (kCella > 0) {
      Serial.print("   EC ≈ ");
      Serial.print(g * kCella, 0);
      Serial.print(" µS/cm   TDS ≈ ");
      Serial.print(g * kCella * 0.5, 0);
      Serial.print(" mg/l");
    }
    Serial.println();
  }
  delay(1000);
}
