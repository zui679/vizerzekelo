// =====================================================================
//  TESZT 01 – Ismerkedés az Arduinóval: LED mátrix
//
//  Cél: megnézni, hogy működik-e az Arduino, és fel tudunk-e tölteni
//  programot. Közben saját képet rajzolunk a 12×8-as LED mátrixra.
//
//  Feladat diákoknak:
//   1. Töltsd fel a programot – egy vízcsepp, egy hullám és egy szív váltakozik.
//   2. Rajzold át a "sajat" képet (1 = világít, 0 = sötét)!
//   3. Változtasd meg a várakozási időt (delay)!
//  Tipp: az Arduino "LED Matrix Editor" webes eszközzel is lehet rajzolni.
// =====================================================================
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
  Serial.println("Szia! Az Arduino működik.");
}

void loop() {
  matrix.renderBitmap(csepp, 8, 12);
  delay(1000);
  matrix.renderBitmap(hullam, 8, 12);
  delay(1000);
  matrix.renderBitmap(sajat, 8, 12);
  delay(1000);
}
