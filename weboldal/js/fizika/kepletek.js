// =====================================================================
//  A firmware képletei JavaScriptben – 1:1-ben a
//  firmware/vizerzekelo/sensors.cpp és calibration.cpp alapján.
//  HA A FIRMWARE KÉPLETE VÁLTOZIK, EZT IS FRISSÍTENI KELL!
//  Ellenőrzés: weboldal/tesztek/kepletek.test.html
//
//  A „…Fesz” (fordított) függvények nincsenek a firmware-ben: a
//  szimulátor ezekkel számolja ki, mekkora feszültséget adna a szenzor
//  egy adott vízben – utána a firmware képlete számol vissza belőle.
// =====================================================================
window.VE = window.VE || {};

VE.kepletek = (function () {
  const K = VE.konstansok;
  const ADC_MAX = Math.pow(2, K.ADC_RESOLUTION_BITS) - 1;   // 16383

  // calibration.cpp: calibrationReset() – „gyári” értékek (DFRobot pH V2)
  const GYARI = Object.freeze({
    phV7: 1.500, phV4: 2.032, phCalTempC: 25.0,
    ecK: 1.0,
    turbClearV: 4.20,
    doSatV: 1.60, doCalTempC: 25.0,
  });

  // sensors.cpp: DO_TABLE – telítési oxigéntartalom 0..40 °C (µg/l)
  const DO_TABLE = [
    14460, 14220, 13820, 13440, 13090, 12740, 12420, 12110, 11810, 11530,
    11260, 11010, 10770, 10530, 10300, 10080, 9860, 9660, 9460, 9270,
    9080, 8900, 8730, 8570, 8410, 8250, 8110, 7960, 7820, 7690,
    7560, 7430, 7300, 7180, 7070, 6950, 6840, 6730, 6630, 6530, 6410,
  ];

  // ---------------- ADC (14 bit, 0–5 V) ----------------
  function adcSzam(v) { return Math.max(0, Math.min(ADC_MAX, Math.round((v / K.ADC_VREF) * ADC_MAX))); }
  function adcFesz(n) { return (n * K.ADC_VREF) / ADC_MAX; }

  // sensors.cpp: readVoltage() – rendezés, a legkisebb és legnagyobb harmad eldobása, átlag
  function nyesettAtlag(mintak) {
    const r = mintak.slice().sort((a, b) => a - b);
    const tol = Math.floor(r.length / 3), ig = r.length - Math.floor(r.length / 3);
    let s = 0;
    for (let i = tol; i < ig; i++) s += r[i];
    return { atlag: s / (ig - tol), rendezett: r, tol: tol, ig: ig };
  }

  // sensors.cpp: voltageLooksDisconnected()
  function levaltNakTunik(v) { return isNaN(v) || v < 0.02 || v > K.ADC_VREF - 0.02; }

  // ---------------- pH ----------------
  function phMeredekseg(T, cal) {
    const dv = cal.phV4 - cal.phV7;
    if (Math.abs(dv) < 0.01) return NaN;
    const slopeCal = dv / (4 - 7);                                   // V / pH a kalibráláskor
    return slopeCal * (T + 273.15) / (cal.phCalTempC + 273.15);      // Nernst: ∝ abszolút hőmérséklet
  }
  function phFromVoltage(v, T, cal) {
    cal = cal || GYARI;
    if (isNaN(v)) return NaN;
    const s = phMeredekseg(T, cal);
    return isNaN(s) ? NaN : 7 + (v - cal.phV7) / s;
  }
  function phFesz(ph, T, cal) {
    cal = cal || GYARI;
    return cal.phV7 + (ph - 7) * phMeredekseg(T, cal);
  }

  // ---------------- vezetőképesség (EC) ----------------
  function ecPolinom(vc) { return 133.42 * vc * vc * vc - 255.86 * vc * vc + 857.39 * vc; }
  function ecFromVoltage(v, T, k) {
    if (k === undefined) k = GYARI.ecK;
    if (isNaN(v)) return NaN;
    const coeff = 1 + 0.02 * (T - 25);
    const ec = ecPolinom(v / coeff) * k;
    return ec < 0 ? 0 : ec;
  }
  // A polinom 0 V fölött szigorúan nő, ezért felezéssel visszakereshető
  function ecFesz(ec, T, k) {
    if (k === undefined) k = GYARI.ecK;
    const coeff = 1 + 0.02 * (T - 25);
    const vMax = K.ADC_VREF;
    if (ec <= 0) return 0;
    if (ecPolinom(vMax / coeff) * k <= ec) return vMax;   // a mérési tartomány felett: telítés
    let lo = 0, hi = vMax / coeff;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (ecPolinom(mid) * k < ec) lo = mid; else hi = mid;
    }
    return ((lo + hi) / 2) * coeff;
  }

  // ---------------- zavarosság ----------------
  function turbidityFromVoltage(v, cal) {
    cal = cal || GYARI;
    if (isNaN(v) || cal.turbClearV < 1) return NaN;
    const va = v * (4.2 / cal.turbClearV);
    if (va >= 4.2) return 0;
    if (va < 2.5) return 3000;   // a görbe érvényességi tartománya alatt: „nagyon zavaros”
    const ntu = -1120.4 * va * va + 5742.3 * va - 4352.9;
    return ntu < 0 ? 0 : ntu;
  }
  // A görbe 2,56 V és 4,2 V között csökkenő: a másodfokú egyenlet nagyobbik gyöke
  function zavarossagFesz(ntu, cal) {
    cal = cal || GYARI;
    const D = 5742.3 * 5742.3 - 4 * 1120.4 * (4352.9 + Math.max(0, ntu));
    const va = D < 0 ? 2.4 : Math.min(4.2, (5742.3 + Math.sqrt(D)) / (2 * 1120.4));
    return va * (cal.turbClearV / 4.2);
  }

  // ---------------- oldott oxigén ----------------
  function doIndex(T) { return Math.max(0, Math.min(40, Math.round(T))); }
  function doTelitett(T) { return DO_TABLE[doIndex(T)] / 1000; }   // mg/l
  function doTelitesiFesz(T, cal) { return cal.doSatV + 0.035 * (T - cal.doCalTempC); }
  function doFromVoltage(v, T, cal) {
    cal = cal || GYARI;
    if (isNaN(v)) return NaN;
    const vSat = doTelitesiFesz(T, cal);
    if (vSat < 0.05) return NaN;
    return (v * DO_TABLE[doIndex(T)]) / vSat / 1000;
  }
  function doFesz(mgL, T, cal) {
    cal = cal || GYARI;
    return (mgL * 1000 * doTelitesiFesz(T, cal)) / DO_TABLE[doIndex(T)];
  }

  // ---------------- DS18B20 (digitális) ----------------
  // 12 bites felbontás: 1 lépés = 1/16 °C, 16 bites kettes komplemens szám
  function ds18b20Nyers(T) { return Math.round(T * 16) & 0xffff; }
  function ds18b20Hom(nyers) { return (nyers & 0x8000 ? nyers - 0x10000 : nyers) / 16; }

  // ---------------- akku ----------------
  function akkuFromA3(v) { return v * K.BATTERY_DIVIDER_RATIO; }

  return {
    ADC_MAX, GYARI, DO_TABLE,
    adcSzam, adcFesz, nyesettAtlag, levaltNakTunik,
    phMeredekseg, phFromVoltage, phFesz,
    ecFromVoltage, ecFesz,
    turbidityFromVoltage, zavarossagFesz,
    doTelitett, doFromVoltage, doFesz,
    ds18b20Nyers, ds18b20Hom,
    akkuFromA3,
  };
})();
