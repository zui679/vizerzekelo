// =====================================================================
//  TITKOS ADATOK – MINTA
//
//  1. Másold le ezt a fájlt ugyanebbe a mappába  secrets.h  néven.
//  2. Töltsd ki a saját adataiddal.
//  3. A secrets.h NEM kerül fel a git repóba (.gitignore), így a jelszavak
//     nem lesznek nyilvánosak. Ezt a mintafájlt viszont NE írd át!
// =====================================================================
#pragma once

// --- WiFi (TRANSPORT_WIFI módhoz) ---
#define WIFI_SSID            "iskola-wifi-neve"
#define WIFI_PASS            "wifi-jelszo"

// --- ThingSpeak csatorna "Write API Key" (API Keys fül) ---
#define THINGSPEAK_API_KEY   "XXXXXXXXXXXXXXXX"

// --- Mobilhálózat (TRANSPORT_GSM módhoz) ---
// Az APN-t a szolgáltató honlapján találod ("APN beállítások").
#define GSM_APN              "internet"
#define GSM_APN_USER         ""
#define GSM_APN_PASS         ""
// Ha a SIM kártyán van PIN kód, írd ide. Jobb megoldás: telefonban
// kikapcsolni a PIN kérést, és üresen hagyni.
#define SIM_PIN              ""
