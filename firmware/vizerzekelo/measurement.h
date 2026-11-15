// =====================================================================
//  Egy mérési ciklus összes eredménye egy helyen.
//  A NAN ("Not A Number") érték azt jelenti: nincs adat / hibás mérés.
// =====================================================================
#pragma once
#include <Arduino.h>

// Állapotjelző bitek (egyszerre több is lehet bekapcsolva)
enum StatusFlag : uint16_t {
  FLAG_LEAK            = 1 << 0,  // magas páratartalom a dobozban – beázás?
  FLAG_BATT_LOW        = 1 << 1,
  FLAG_BATT_CRITICAL   = 1 << 2,
  FLAG_WATER_TEMP_ERR  = 1 << 3,
  FLAG_BOX_SENSOR_ERR  = 1 << 4,
  FLAG_PH_ERR          = 1 << 5,
  FLAG_EC_ERR          = 1 << 6,
  FLAG_TURBIDITY_ERR   = 1 << 7,
  FLAG_DO_ERR          = 1 << 8,
  FLAG_NOT_CALIBRATED  = 1 << 9,
};

struct Measurement {
  // Víz
  float waterTempC    = NAN;  // °C
  float ph            = NAN;  // 0..14
  float phVoltage     = NAN;  // V (nyers, kalibrációhoz)
  float ecUsCm        = NAN;  // µS/cm, 25 °C-ra kompenzálva
  float tdsPpm        = NAN;  // mg/l ≈ EC * 0.5
  float turbidityNtu  = NAN;  // NTU
  float doMgL         = NAN;  // mg/l oldott oxigén
  // Doboz
  float batteryV      = NAN;  // V
  float boxTempC      = NAN;  // °C
  float boxHumidity   = NAN;  // %
  // Kommunikáció
  int   signalDbm     = 0;    // jelerősség dBm-ben (0 = ismeretlen)
  uint16_t flags      = 0;
};

// Az állapotbitek szöveggé alakítása, pl. "SZIVARGAS AKKU_GYENGE" vagy "OK".
// A separator kerül a szavak közé.
String flagsToText(uint16_t flags, const char* separator = " ");

// Szépen kiírja a mérést a soros monitorra.
void printMeasurement(const Measurement& m);
