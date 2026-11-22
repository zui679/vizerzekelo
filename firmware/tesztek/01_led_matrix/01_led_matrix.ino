// =====================================================================
//  TESZT 01 – Ismerkedés az Arduinóval: LED mátrix / beépített LED
//
//  Cél: megnézni, hogy működik-e a lap, és fel tudunk-e tölteni programot.
//  Lapok:
//   - UNO R4 WiFi: saját képet rajzolunk a 12×8-as LED mátrixra.
//   - Nano 33 IoT, Nano RP2040 Connect: ezeken nincs LED mátrix, ezért a
//     beépített LED-del Morse-kódot villogtatunk: "V I Z".
//  A program magától felismeri, melyik lapon fut.
//
//  Feladat diákoknak:
//   UNO R4 WiFi:  rajzold át a "sajat" képet (1 = világít, 0 = sötét)!
//                 Tipp: az Arduino "LED Matrix Editor" webes eszközzel is lehet rajzolni.
//   Nano lapok:   írd át az UZENET szöveget (pl. a neved), és fejtsd meg
//                 a villogásból a társad üzenetét!
// =====================================================================

#if defined(ARDUINO_UNOWIFIR4)
// ======================= UNO R4 WiFi: LED mátrix ======================
#include "Arduino_LED_Matrix.h"

ArduinoLEDMatrix matrix;

uint8_t csepp[8][12] = {
  {0,0,0,0,0,1,0,0,0,0,0,0},
  {0,0,0,0,1,1,1,0,0,0,0,0},
  {0,0,0,1,1,1,1,1,0,0,0,0},
  {0,0,1,1,1,1,1,1,1,0,0,0},
  {0,0,1,1,0,1,1,1,1,0,0,0},
  {0,0,1,1,0,1,1,1,1,0,0,0},
  {0,0,0,1,1,1,1,1,0,0,0,0},
  {0,0,0,0,1,1,1,0,0,0,0,0},
};

uint8_t hullam[8][12] = {
  {0,0,0,0,0,0,0,0,0,0,0,0},
  {0,0,0,0,0,0,0,0,0,0,0,0},
  {0,1,1,0,0,0,1,1,0,0,0,0},
  {1,0,0,1,0,1,0,0,1,0,0,1},
  {0,0,0,0,1,0,0,0,0,1,1,0},
  {0,0,0,0,0,0,0,0,0,0,0,0},
  {1,1,1,1,1,1,1,1,1,1,1,1},
  {1,1,1,1,1,1,1,1,1,1,1,1},
};

// Ezt rajzold át!
uint8_t sajat[8][12] = {
  {0,0,0,0,0,0,0,0,0,0,0,0},
  {0,0,1,1,0,0,0,1,1,0,0,0},
  {0,1,1,1,1,0,1,1,1,1,0,0},
  {0,1,1,1,1,1,1,1,1,1,0,0},
  {0,0,1,1,1,1,1,1,1,0,0,0},
  {0,0,0,1,1,1,1,1,0,0,0,0},
  {0,0,0,0,1,1,1,0,0,0,0,0},
  {0,0,0,0,0,1,0,0,0,0,0,0},
};

void setup() {
  Serial.begin(115200);
  matrix.begin();
  Serial.println("Szia! Az UNO R4 WiFi működik.");
}

void loop() {
  matrix.renderBitmap(csepp, 8, 12);
  delay(1000);
  matrix.renderBitmap(hullam, 8, 12);
  delay(1000);
  matrix.renderBitmap(sajat, 8, 12);
  delay(1000);
}

#elif defined(ARDUINO_SAMD_NANO_33_IOT) || defined(ARDUINO_NANO_RP2040_CONNECT)
// ============ Nano 33 IoT / Nano RP2040 Connect: Morse-kód ============

// Ezt írd át! (Csak az angol ábécé betűi és szóköz – ékezet nélkül.)
const char* UZENET = "VIZ";

const int PONT = 200;   // egy "pont" hossza ms-ban; a "vonás" ennek háromszorosa

// A betűk Morse-kódja A-tól Z-ig
const char* MORSE[26] = {
  ".-",   "-...", "-.-.", "-..",  ".",    "..-.", "--.",  "....", "..",   ".---",
  "-.-",  ".-..", "--",   "-.",   "---",  ".--.", "--.-", ".-.",  "...",  "-",
  "..-",  "...-", ".--",  "-..-", "-.--", "--.."
};

void villan(int hossz) {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(hossz);
  digitalWrite(LED_BUILTIN, LOW);
  delay(PONT);                       // szünet a jelek között
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("Szia! A lap működik. Ezen a lapon nincs LED mátrix,");
  Serial.println("ezért a beépített LED Morse-kódban villogja az üzenetet.");
}

void loop() {
  for (const char* p = UZENET; *p; p++) {
    char betu = toupper(*p);
    if (betu >= 'A' && betu <= 'Z') {
      const char* kod = MORSE[betu - 'A'];
      Serial.print(betu);
      Serial.print(' ');
      Serial.println(kod);
      for (const char* k = kod; *k; k++) {
        villan(*k == '.' ? PONT : 3 * PONT);
      }
    }
    delay(2 * PONT);                 // szünet a betűk között (összesen 3 pont)
  }
  delay(7 * PONT);                   // hosszú szünet, aztán újra
}

#else
  #error "Ismeretlen lap! Ez a program UNO R4 WiFi, Nano 33 IoT és Nano RP2040 Connect lapra készült."
#endif
