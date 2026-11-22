// =====================================================================
//  A firmware beállításaiból (firmware/vizerzekelo/config.h) átvett számok.
//  HA A config.h VÁLTOZIK, EZT IS FRISSÍTENI KELL!
//  (A forrás sorát mindenhol megjegyzésben jelöljük.)
// =====================================================================
window.VE = window.VE || {};

VE.konstansok = {
  FIRMWARE_VERSION: "0.2.2",           // config.h: FIRMWARE_VERSION

  // 4. Mérési beállítások
  WARMUP_PH_MS: 5000,                  // config.h: WARMUP_PH_MS
  WARMUP_EC_MS: 2000,                  // config.h: WARMUP_EC_MS
  WARMUP_TURBIDITY_MS: 1000,           // config.h: WARMUP_TURBIDITY_MS
  WARMUP_DO_MS: 3000,                  // config.h: WARMUP_DO_MS
  ADC_SAMPLES: 31,                     // config.h: ADC_SAMPLES
  ADC_SAMPLE_DELAY_MS: 20,             // config.h: ADC_SAMPLE_DELAY_MS
  ADC_RESOLUTION_BITS: 14,             // config.h: ADC_RESOLUTION_BITS
  ADC_VREF: 5.0,                       // config.h: ADC_VREF

  // 5. Akku és doboz (GSM mód)
  BATTERY_DIVIDER_RATIO: 2.0,          // config.h: BATTERY_DIVIDER_RATIO
  BATTERY_LOW_V_GSM: 3.65,             // config.h: BATTERY_LOW_V (GSM)
  BATTERY_CRITICAL_V_GSM: 3.50,        // config.h: BATTERY_CRITICAL_V (GSM)
  BATTERY_LOW_V_WIFI: 3.50,            // config.h: BATTERY_LOW_V (WiFi)
  BATTERY_CRITICAL_V_WIFI: 3.30,       // config.h: BATTERY_CRITICAL_V (WiFi)
  BOX_HUMIDITY_ALARM: 80,              // config.h: BOX_HUMIDITY_ALARM

  // 6. Időzítés
  MERESI_IDOKOZ_PERC: 15,              // TPL5110 trimmer (FALLBACK_INTERVAL_S = 900)
  STATUS_SHOW_MS: 1500,                // config.h: STATUS_SHOW_MS

  // 7. Modem
  MODEM_PWRKEY_PULSE_MS: 1200,         // config.h: MODEM_PWRKEY_PULSE_MS
  MODEM_REG_TIMEOUT_MS: 120000,        // config.h: MODEM_REG_TIMEOUT_MS
  MODEM_EARLY_START: true,             // config.h: MODEM_EARLY_START
};

// A projekt tárhelye – a kártyák és a „Tovább” rész linkjei ide mutatnak.
VE.REPO_URL = "https://github.com/zui679/vizerzekelo/blob/main/";
VE.repoLink = function (utvonal) { return VE.REPO_URL + utvonal; };
