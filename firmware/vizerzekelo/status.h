// =====================================================================
//  Állapotjelzés az UNO R4 WiFi beépített 12×8-as LED mátrixán.
//  Az ikonokat a status.cpp-ben bárki átrajzolhatja (1 = világít).
// =====================================================================
#pragma once
#include <Arduino.h>

enum StatusIcon {
  ICON_NONE,
  ICON_MEASURE,   // vízcsepp – mérés folyik
  ICON_SEND,      // felfelé nyíl – adatküldés
  ICON_OK,        // pipa – sikeres küldés
  ICON_ERROR,     // X – hiba
  ICON_SERVICE,   // "S" – szerviz mód
};

void statusBegin();
void statusShow(StatusIcon icon);
