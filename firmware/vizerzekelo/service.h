// =====================================================================
//  Szerviz mód: kalibrálás, élő mérés, modem teszt a soros monitorból.
//  Belépés: szerviz jumper (D2–GND) bekötve, VAGY bekapcsolás után
//  3 mp-en belül Enter a soros monitorban (115200 baud, "Új sor" / Newline).
// =====================================================================
#pragma once

bool serviceModeRequested();   // kell-e szerviz módba lépni?
void serviceMenu();            // a menü (kilépésig fut)
