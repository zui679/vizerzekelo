// =====================================================================
//  TESZT 11 – Vízszintmérés ultrahanggal (HC-SR04 / JSN-SR04T)
//
//  Az érzékelő egy rövid hangimpulzust küld (40 kHz, emberi füllel nem
//  hallható), és megméri, mennyi idő múlva ér vissza a vízfelszínről
//  visszaverődött visszhang. Ebből a hangsebességgel kiszámolható a távolság,
//  abból pedig a vízszint – pont mint a denevérek!
//
//  Bekötés:  VCC → 5V,  GND → GND,  TRIG → D11,  ECHO → D12
//  Az érzékelőt egy vödör / akvárium fölé, FELÜLRŐL lefelé nézve rögzítsd.
//  A SZERELESI_MAGASSAG a szenzor és a vödör alja közti távolság (mérd meg!).
//
//  HC-SR04: olcsó, nem vízálló – csak bent, kísérletekhez.
//  JSN-SR04T: vízálló fejű változat – ugyanez a program működik vele, terepen
//  is használható (a minimális mérhető távolsága nagyobb, kb. 20–25 cm).
//
//  Kísérletek:
//   - Önts vizet a vödörbe pohárral – minden pohár után mennyit emelkedik?
//     Mennyi egy pohár térfogata? (vödör alapterülete × emelkedés)
//   - Hangsebesség: a LEVEGO_HOMERSEKLET átírásával mennyit változik a mért
//     távolság? Miért fontos ez nyáron és télen?
// =====================================================================

const int   PIN_TRIG = 11;
const int   PIN_ECHO = 12;
const float SZERELESI_MAGASSAG_CM = 50.0;  // szenzor → vödör alja [cm]
const float LEVEGO_HOMERSEKLET    = 20.0;  // [°C] – vagy mérd DS18B20/BME280-nal!

// Egy távolságmérés cm-ben (-1, ha nincs visszhang)
float tavolsagCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH);         // 10 µs-os indító impulzus
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long ido = pulseIn(PIN_ECHO, HIGH, 30000);   // max. 30 ms (~5 m)
  if (ido == 0) return -1;
  // Hangsebesség levegőben: kb. 331,3 + 0,606 × T  [m/s]
  float c = 331.3 + 0.606 * LEVEGO_HOMERSEKLET;
  // oda-vissza út → osztva 2-vel; µs és m/s → cm
  return ido * c / 2.0 / 10000.0;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 2000) {}
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("tavolsag_cm;vizszint_cm");
}

void loop() {
  // 5 mérés, ezek mediánja (a középső) – így egy-egy rossz visszhang nem zavar
  float m[5];
  int db = 0;
  for (int i = 0; i < 5; i++) {
    float d = tavolsagCm();
    if (d > 0) m[db++] = d;
    delay(60);                          // a visszhangok elhalására várunk
  }
  if (db == 0) {
    Serial.println("Nincs visszhang – túl közel/messze van, vagy ferde a felszín?");
    delay(1000);
    return;
  }
  // rendezés (kis tömb)
  for (int i = 1; i < db; i++) {
    float k = m[i]; int j = i - 1;
    while (j >= 0 && m[j] > k) { m[j + 1] = m[j]; j--; }
    m[j + 1] = k;
  }
  float d = m[db / 2];

  Serial.print(d, 1);
  Serial.print(';');
  Serial.println(SZERELESI_MAGASSAG_CM - d, 1);
  delay(1000);
}
