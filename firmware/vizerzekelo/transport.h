// =====================================================================
//  Adatküldés a szerverre (ThingSpeak) – WiFi-n vagy mobilhálózaton.
//  A mezők kiosztása: docs/05_kommunikacio.md
// =====================================================================
#pragma once
#include <Arduino.h>
#include "measurement.h"

void   transportPrepare();               // pl. modem korai bekapcsolása
bool   transportSend(Measurement& m);    // true = sikeres küldés
void   transportShutdown();              // modem / WiFi kikapcsolása
String buildThingSpeakPath(const Measurement& m);
