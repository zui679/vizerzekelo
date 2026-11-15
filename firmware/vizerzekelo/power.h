// =====================================================================
//  Tápellátás kezelése: szenzor- és modemkapcsolók, TPL5110 időzítő,
//  akkufeszültség, szerviz mód jumper.
// =====================================================================
#pragma once
#include <Arduino.h>

void  powerBegin();                     // minden kapcsoló KI, DONE láb alacsony
void  powerSwitch(int pin, bool on);    // egy tápkapcsoló be/ki (pin < 0: nincs ilyen)
void  powerDone();                      // jelzés a TPL5110-nek: lekapcsolhatsz
float readBatteryVoltage();             // akkufeszültség [V], NAN ha nincs bekötve
bool  serviceJumperSet();               // be van-e dugva a szerviz jumper
