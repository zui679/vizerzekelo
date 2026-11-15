// =====================================================================
//  Vízérzékelő doboz – BEÁLLÍTÁSOK (config.h)
//
//  Ebben a fájlban található minden, amit a doboz működésén állítani
//  szeretnénk. A többi fájlhoz általában nem kell hozzányúlni.
//  A titkos adatok (WiFi jelszó, API kulcs, SIM PIN) NEM itt vannak,
//  hanem a secrets.h fájlban (lásd: secrets_example.h).
// =====================================================================
#pragma once
#include <Arduino.h>

#define FIRMWARE_VERSION "0.2.0"

// ---------------------------------------------------------------------
// 1. ADATKÜLDÉS MÓDJA
// ---------------------------------------------------------------------
#define TRANSPORT_NONE 0   // nem küld semmit, csak a soros monitorra ír
#define TRANSPORT_WIFI 1   // az Arduino saját WiFi-je (iskolai teszteléshez)
#define TRANSPORT_GSM  2   // mobilhálózat LTE/GSM modemmel (terepi működés)

#define TRANSPORT_MODE TRANSPORT_WIFI

// ---------------------------------------------------------------------
// 2. MELY ESZKÖZÖK VANNAK BEÉPÍTVE?  (1 = igen, 0 = nem)
// ---------------------------------------------------------------------
#define USE_DS18B20      1   // vízhőmérő (DS18B20, vízálló kivitel)
#define USE_PH           1   // pH szenzor (analóg)
#define USE_EC           1   // vezetőképesség / TDS szenzor (analóg)
#define USE_TURBIDITY    1   // zavarosság szenzor (analóg)
#define USE_DO           0   // oldott oxigén szenzor (drága, opcionális)
#define USE_BME280       1   // doboz belső hőmérséklet + páratartalom (Qwiic)
#define USE_BATTERY_MON  1   // akkufeszültség mérése feszültségosztóval
#define USE_LED_MATRIX   1   // állapotjelzés az R4 beépített LED mátrixán

// A pH erősítő panel típusa. Csak a "gyári" (kalibrálás előtti) alapértékeket
// határozza meg – kalibrálás után bármelyik panel jól mér.
//   PH_BOARD_DFROBOT_V2: DFRobot Gravity pH V2 (terepi és tanuló készlet)
//   PH_BOARD_PH4502C:    olcsó PH-4502C panel (oktatási alternatíva, docs/12)
#define PH_BOARD_DFROBOT_V2  1
#define PH_BOARD_PH4502C     2
#define PH_BOARD             PH_BOARD_DFROBOT_V2

// ---------------------------------------------------------------------
// 3. LÁBKIOSZTÁS  (részletesen: hardware/bekotes.md)
//    A tápkapcsolóknál -1 (PIN_NONE) = nincs kapcsoló, a szenzor
//    folyamatosan kap tápot.
// ---------------------------------------------------------------------
#define PIN_NONE            -1

// D0 / D1: Serial1 – a modem soros portja (szintillesztőn keresztül!)
#define PIN_SERVICE          2   // szerviz mód jumper / reed relé (GND-re húzva = szerviz)
#define PIN_TPL_DONE         3   // TPL5110 DONE láb: "kész vagyok, kapcsolj le"
#define PIN_ONEWIRE          4   // DS18B20 adatvonal (4,7 kΩ felhúzó ellenállás 5V-ra)
#define PIN_PWR_PH           5   // pH szenzor tápkapcsoló
#define PIN_PWR_EC           6   // EC/TDS szenzor tápkapcsoló
#define PIN_PWR_TURBIDITY    7   // zavarosság szenzor tápkapcsoló
#define PIN_MODEM_POWER      8   // modem tápkapcsoló (akku → modem)
#define PIN_MODEM_PWRKEY     9   // modem bekapcsoló gomb (PWRKEY)
#define PIN_PWR_DO          10   // oldott oxigén szenzor tápkapcsoló

#define PIN_ADC_PH          A0
#define PIN_ADC_EC          A1
#define PIN_ADC_TURBIDITY   A2
#define PIN_ADC_BATTERY     A3
#define PIN_ADC_DO          A4

// ---------------------------------------------------------------------
// 4. MÉRÉSI BEÁLLÍTÁSOK
// ---------------------------------------------------------------------
// Bekapcsolás után ennyit várunk, mielőtt mérünk (a szenzor "bemelegszik").
#define WARMUP_PH_MS          5000
#define WARMUP_EC_MS          2000
#define WARMUP_TURBIDITY_MS   1000
#define WARMUP_DO_MS          3000

// Egy méréshez ennyi mintát veszünk, és a "szélsőségeseket" eldobjuk.
// Páratlan szám legyen!
#define ADC_SAMPLES           31
#define ADC_SAMPLE_DELAY_MS   20

// Az UNO R4 ADC-je 14 bites (0..16383).
#define ADC_RESOLUTION_BITS   14
// Az ADC referencia = az 5V-os tápfeszültség. Mérd meg multiméterrel
// az Arduino 5V és GND lába között, és írd ide a pontos értéket!
#define ADC_VREF              5.00f

// ---------------------------------------------------------------------
// 5. AKKUMULÁTOR ÉS DOBOZ FIGYELÉS
// ---------------------------------------------------------------------
// Feszültségosztó: akku+ ── R1 ── A3 ── R2 ── GND.  Arány = (R1+R2)/R2
#define BATTERY_DIVIDER_RATIO 2.00f
#define BATTERY_LOW_V         3.50f   // ez alatt: figyelmeztetés
#define BATTERY_CRITICAL_V    3.30f   // ez alatt: nem mérünk, nem küldünk (akkuvédelem)
#define BOX_HUMIDITY_ALARM    80.0f   // % – ha a dobozban ennél párásabb: beázás gyanú!

// ---------------------------------------------------------------------
// 6. IDŐZÍTÉS
// ---------------------------------------------------------------------
// A mérések közti időt TERMÉSZETESEN a TPL5110 időzítő ellenállása adja.
// Ha nincs TPL5110 (pl. USB-ről megy a tesztpadon), ennyit vár a program:
#define FALLBACK_INTERVAL_S   900     // 15 perc
// Bekapcsolás után ennyi ideig lehet Enterrel szerviz módba lépni
// (csak akkor, ha a soros monitor nyitva van).
#define SERVICE_PROMPT_MS     3000
// Az eredmény ikon ennyi ideig látszik a LED mátrixon a lekapcsolás előtt.
#define STATUS_SHOW_MS        1500

// ---------------------------------------------------------------------
// 7. MODEM (SIMCom A7670E / SIM7600 család)
// ---------------------------------------------------------------------
#define MODEM_SERIAL               Serial1
#define MODEM_BAUD                 115200
// A legtöbb modul-panelen a PWRKEY egy tranzisztoron keresztül megy:
// Arduino HIGH → PWRKEY alacsony (= gombnyomás). Ilyenkor 1.
#define MODEM_PWRKEY_ACTIVE_HIGH   1
#define MODEM_PWRKEY_PULSE_MS      1200
#define MODEM_BOOT_TIMEOUT_MS      20000UL
#define MODEM_REG_TIMEOUT_MS       120000UL   // hálózatra csatlakozás max. ideje
#define MODEM_HTTP_TIMEOUT_MS      60000UL
// 1 = a modemet már a mérés ELŐTT bekapcsoljuk, így amíg mérünk,
// párhuzamosan csatlakozik a hálózatra (gyorsabb, kevesebb energia).
// Ha a mérések zajosak lesznek modem mellett, állítsd 0-ra.
#define MODEM_EARLY_START          1
// 1 = az AT parancsokat és válaszokat kiírjuk a soros monitorra (tanuláshoz jó!)
#define DEBUG_AT                   1

// ---------------------------------------------------------------------
// 8. WIFI ÉS SZERVER
// ---------------------------------------------------------------------
#define WIFI_CONNECT_TIMEOUT_MS    20000UL
#define THINGSPEAK_HOST            "api.thingspeak.com"
#define THINGSPEAK_PORT            80

// ---------------------------------------------------------------------
// Titkos adatok betöltése
// ---------------------------------------------------------------------
#if __has_include("secrets.h")
  #include "secrets.h"
#else
  #warning "Nincs secrets.h! Masold le a secrets_example.h fajlt secrets.h neven, es toltsd ki."
  #include "secrets_example.h"
#endif
