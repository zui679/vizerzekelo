// =====================================================================
//  Mobil modem kezelése AT parancsokkal.
//  Támogatott: SIMCom A76xx (pl. A7670E) és SIM7600 család.
//  (A SIM800 és SIM7080 HTTP parancsai eltérnek – lásd docs/05_kommunikacio.md)
// =====================================================================
#pragma once
#include <Arduino.h>

bool modemPowerOn();                  // táp + bekapcsolás, vár amíg válaszol
bool modemConnect();                  // SIM, APN, hálózatra csatlakozás
int  modemSignalDbm();                // jelerősség dBm-ben (0 = ismeretlen)
int  modemHttpGet(const String& url); // HTTP státuszkód (pl. 200), negatív = hiba
void modemPowerOff();                 // szabályos leállítás + táp KI
bool modemIsOn();

// Szerviz módhoz: a soros monitor és a modem "összekötése".
// Kilépés a KILEP szóval (true), vagy ha idleTimeoutMs ideig nem írunk be semmit (false).
bool modemPassthrough(uint32_t idleTimeoutMs);
