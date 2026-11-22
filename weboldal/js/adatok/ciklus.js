// =====================================================================
//  A MÉRÉSI CIKLUS lépései (docs/02_rendszerterv.md 2.2, vizerzekelo.ino)
//  GSM mód, MODEM_EARLY_START = 1.
//
//  Egy lépés:
//    ido_s     – kb. ennyi ideig tart a valóságban (másodperc)
//    tap       – mely alkatrészek kapnak áramot (kártya-azonosítók)
//    dolgozik  – melyik alkatrész „dolgozik” éppen (erősebb kiemelés)
//    aram      – mely vezetékeken folyik áram / jel
//    ikon      – a LED mátrix ikonja (status.h: ICON_…)
//    soros     – a soros monitorra kerülő sorok [szöveg, osztály]
//    csakDO    – csak akkor van, ha az oldott oxigén szenzor be van építve
//
//  Az ido_s értékek a config.h időzítéseiből és becslésből jönnek –
//  a valódi doboznál a hálózatkeresés 10–60 s is lehet.
// =====================================================================
window.VE = window.VE || {};

(function () {
  const K = VE.konstansok;

  // A szimulált mérés értékei (példa – egy őszi nap egy dombvidéki folyón)
  VE.mintaMeres = {
    vizHo: 11.94, ph: 7.86, phFesz: 1.3542, ec: 412, tds: 206, zav: 37, do: 9.8,
    akku: 3.98, dobozHo: 18.3, dobozPara: 41, csq: 17,
  };
  const M = VE.mintaMeres;
  const dbm = -113 + 2 * M.csq;   // modem.cpp: modemSignalDbm()

  // Energia + időzítő: mindig van áramuk, amíg süt a nap / van akku
  const ALAP = ["napelem", "tolto", "akku", "tpl", "oszto"];
  const ALAP_ARAM = ["v-napelem", "v-tolto-akku", "v-5v-tpl", "v-oszto"];
  const ARDUINO = ALAP.concat(["arduino", "ds18b20", "bme280"]);
  const ARDUINO_ARAM = ALAP_ARAM.concat(["v-usb"]);
  const MODEM = ["kapcsolo", "modem", "szint", "antenna"];
  const MODEM_ARAM = ["v-vbat", "v-kapcs-modem"];

  function f(x, tizedes) { return x.toFixed(tizedes); }

  VE.ciklusLepesek = function (useDO) {
    const lepesek = [
      {
        id: "alvas", fazis: "Alvás", rovid: "Alvás", ido_s: K.MERESI_IDOKOZ_PERC * 60, gyorsitott: true,
        cim: "Alvás – csak a TPL5110 ketyeg",
        leiras: "Az Arduino teljesen ki van kapcsolva, nincs rajta áram. Csak a TPL5110 időzítő számolja a perceket, kb. 35 nA fogyasztással. Nappal közben a napelem tölti az akkut.",
        miert: "Az Arduino „alvó” módban is több tíz mA-t fogyasztana. Így a 15 percből kb. 14 percen át gyakorlatilag nulla a fogyasztás. (A lejátszás ezt a részt felgyorsítja.)",
        tap: ALAP, dolgozik: ["tpl"], aram: ALAP_ARAM, ikon: "NONE",
        soros: [["— az Arduino ki van kapcsolva, a soros monitor néma —", "valasz"]],
      },
      {
        id: "ebredes", fazis: "Indulás", rovid: "Ébredés", ido_s: 1.5,
        cim: "Ébredés",
        leiras: "Letelt a 15 perc: a TPL5110 rákapcsolja az 5 V-ot az USB-kábelre. Az Arduino elindul, először minden kapcsolót KI állásba tesz, betölti a kalibrációt az EEPROM-ból, és megnézi a szerviz jumpert (D2).",
        miert: "Az Arduino minden ébredéskor „tiszta lappal” indul – semmire sem emlékszik az előző mérésből.",
        tap: ARDUINO.concat(["jumper"]), dolgozik: ["arduino"], aram: ARDUINO_ARAM.concat(["v-d2"]), ikon: "NONE",
        soros: [
          ["", ""],
          ["=============================================", ""],
          ["  VÍZÉRZÉKELŐ DOBOZ  v" + K.FIRMWARE_VERSION, ""],
          ["  Adatküldés: mobilhálózat (GSM/LTE)", ""],
          ["=============================================", ""],
        ],
      },
      {
        id: "akku", fazis: "Indulás", rovid: "Akku", ido_s: 0.7,
        cim: "Akku ellenőrzés",
        leiras: "Az A3 lábon, a feszültségosztón át megméri az akku feszültségét: " + f(M.akku, 2).replace(".", ",") + " V – rendben van.",
        miert: "Ha " + f(K.BATTERY_CRITICAL_V_GSM, 2).replace(".", ",") + " V alatt lenne, a doboz itt azonnal leállna – mérés és küldés nélkül –, hogy az akku ne merüljön le túlságosan. " + f(K.BATTERY_LOW_V_GSM, 2).replace(".", ",") + " V alatt mérne, de AKKU_GYENGE figyelmeztetést küldene.",
        tap: ARDUINO, dolgozik: ["oszto", "arduino"], aram: ARDUINO_ARAM.concat(["v-a3"]), ikon: "NONE",
        soros: [],
      },
      {
        id: "modem-be", fazis: "Indulás", rovid: "Modem be", ido_s: 5,
        cim: "A modem korai indítása",
        leiras: "Még mérés előtt az Arduino a D8 lábbal áramot ad a modemnek (közvetlenül az akkuról), majd a D9-cel „megnyomja” a bekapcsoló gombját (PWRKEY). Az „AT” kérdésre a modem „OK”-val jelzi, hogy él.",
        miert: "Korai indítás: amíg az Arduino mér, a modem a háttérben már keresi a hálózatot. Így rövidebb ideig van minden bekapcsolva.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["kapcsolo", "modem"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d8", "v-d9", "v-d0", "v-d1", "v-uart-modem"]), ikon: "NONE",
        soros: [
          ["[modem] Táp bekapcsolása...", ""],
          [">> AT", "at"], [">> AT", "at"], [">> AT", "at"],
          ["[modem] PWRKEY megnyomása...", ""],
          [">> AT", "at"], ["OK", "valasz"],
          [">> ATE0", "at"], ["OK", "valasz"],
          [">> AT+CMEE=2", "at"], ["OK", "valasz"],
        ],
      },
      {
        id: "vizho", fazis: "Mérés", rovid: "Vízhő", ido_s: 0.8,
        cim: "Vízhőmérséklet",
        leiras: "Elsőként a vízhőmérő: a D4 lábon, egyetlen vezetéken (1-Wire) érkezik a digitális érték: " + f(M.vizHo, 2).replace(".", ",") + " °C.",
        miert: "Azért ez az első, mert a pH és a vezetőképesség kiszámolásához is kell: mindkettő függ a hőmérséklettől.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["ds18b20"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d4", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "doboz", fazis: "Mérés", rovid: "Doboz", ido_s: 0.3,
        cim: "A doboz belseje",
        leiras: "A BME280 a Qwiic (I2C) kábelen megméri a doboz belsejét: " + f(M.dobozHo, 1).replace(".", ",") + " °C, " + M.dobozPara + "% páratartalom – nincs beázás.",
        miert: "80% fölött SZIVARGAS üzenet menne, még mielőtt a víz kárt tenne az elektronikában.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["bme280"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-qwiic", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "ph", fazis: "Mérés", rovid: "pH", ido_s: (K.WARMUP_PH_MS + K.ADC_SAMPLES * K.ADC_SAMPLE_DELAY_MS) / 1000,
        cim: "pH mérés",
        leiras: "A D5 lábbal bekapcsolja a pH szenzor tápját, vár " + K.WARMUP_PH_MS / 1000 + " másodpercet (bemelegedés), majd " + K.ADC_SAMPLES + " mintát vesz az A0 lábon, és kikapcsolja. " + f(M.phFesz, 4).replace(".", ",") + " V → pH " + f(M.ph, 2).replace(".", ",") + ".",
        miert: "Figyeld: az analóg szondák közül most CSAK a pH kap áramot. A víz vezeti az áramot, és a többi analóg szonda megzavarná ezt a nagyon érzékeny mérést. (A digitális vízhőmérő mindig kap áramot, de nem zavar.)",
        tap: ARDUINO.concat(MODEM, ["ph"]), dolgozik: ["ph"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d5", "v-a0", "v-k-ph", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "ec", fazis: "Mérés", rovid: "EC", ido_s: (K.WARMUP_EC_MS + K.ADC_SAMPLES * K.ADC_SAMPLE_DELAY_MS) / 1000,
        cim: "Vezetőképesség (EC)",
        leiras: "Most a D6-tal az EC szenzor kap áramot, a leválasztó modulon át. " + K.WARMUP_EC_MS / 1000 + " s bemelegedés, " + K.ADC_SAMPLES + " minta az A1-en → " + M.ec + " µS/cm (TDS ≈ " + M.tds + " mg/l).",
        miert: "Az EC szenzor váltakozó feszültséget ad a vízre. Ezért van leválasztva, és ezért kapcsoltuk már ki a pH szenzort.",
        tap: ARDUINO.concat(MODEM, ["levalaszto", "ec"]), dolgozik: ["ec", "levalaszto"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d6", "v-a1", "v-lev-tap", "v-lev-jel", "v-k-ec", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "zavarossag", fazis: "Mérés", rovid: "Zavaros.", ido_s: (K.WARMUP_TURBIDITY_MS + K.ADC_SAMPLES * K.ADC_SAMPLE_DELAY_MS) / 1000,
        cim: "Zavarosság",
        leiras: "D7: bekapcsol a szenzor infravörös LED-je, " + K.WARMUP_TURBIDITY_MS / 1000 + " s múlva " + K.ADC_SAMPLES + " minta az A2-n → " + M.zav + " NTU.",
        miert: "Tiszta vízben kb. 4,2 V jön a szenzorból. Minél zavarosabb a víz, annál kevesebb fény jut át, annál kisebb a feszültség.",
        tap: ARDUINO.concat(MODEM, ["zavarossag"]), dolgozik: ["zavarossag"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d7", "v-a2", "v-k-zavarossag", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "do", fazis: "Mérés", rovid: "O₂", ido_s: (K.WARMUP_DO_MS + K.ADC_SAMPLES * K.ADC_SAMPLE_DELAY_MS) / 1000, csakDO: true,
        cim: "Oldott oxigén",
        leiras: "D10: az oldott oxigén szonda " + K.WARMUP_DO_MS / 1000 + " s bemelegedés után " + K.ADC_SAMPLES + " mintát ad az A4-en → " + f(M.do, 1).replace(".", ",") + " mg/l.",
        miert: "A program a vízhőmérséklettel együtt számol: hideg vízben több oxigén oldódhat (0 °C-on 14,5 mg/l, 20 °C-on csak 9,1 mg/l).",
        tap: ARDUINO.concat(MODEM, ["do"]), dolgozik: ["do"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d10", "v-a4", "v-k-do", "v-antenna"]), ikon: "MEASURE",
        soros: [],
      },
      {
        id: "eredmeny", fazis: "Mérés", rovid: "Számol", ido_s: 0.3,
        cim: "Eredmények",
        leiras: "Az Arduino kiírja a végleges értékeket, és összerakja az állapotot. Minden rendben, ezért az állapot: „OK”.",
        miert: "Ha valamelyik szenzor értelmetlen jelet adna (pl. leesett a kábel), itt kerülne be egy hibaüzenet, például PH_HIBA – és a hibás érték nem menne el.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["arduino"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-antenna"]), ikon: "MEASURE",
        soros: function () {
          const sor = (cimke, ertek) => [cimke + ertek, ""];
          return [
            ["------------- MÉRÉSI EREDMÉNYEK -------------", ""],
            sor("Vízhőmérséklet:     ", f(M.vizHo, 2) + " °C"),
            sor("pH:                 ", f(M.ph, 2) + " "),
            sor("  pH nyers feszültség:", f(M.phFesz, 4) + " V"),
            sor("Vezetőképesség (EC):", M.ec + " µS/cm"),
            sor("TDS (oldott anyag): ", M.tds + " mg/l"),
            sor("Zavarosság:         ", M.zav + " NTU"),
            sor("Oldott oxigén:      ", useDO ? f(M.do, 2) + " mg/l" : "--- (nincs adat)"),
            sor("Akkufeszültség:     ", f(M.akku, 2) + " V"),
            sor("Doboz hőmérséklet:  ", f(M.dobozHo, 1) + " °C"),
            sor("Doboz páratartalom: ", M.dobozPara + " %"),
            ["Állapot:             OK", "ok"],
            ["---------------------------------------------", ""],
          ];
        },
      },
      {
        id: "halozat", fazis: "Küldés", rovid: "Hálózat", ido_s: 22,
        cim: "Csatlakozás a mobilhálózatra",
        leiras: "A modem ellenőrzi a SIM kártyát, beállítja a szolgáltató „internet-kapuját” (APN), és megvárja, hogy felcsatlakozzon az LTE hálózatra. Végül bekapcsolja az adatkapcsolatot.",
        miert: "Ez a ciklus leghosszabb része: a térerőtől függően 10–60 másodperc is lehet. A doboz legfeljebb " + K.MODEM_REG_TIMEOUT_MS / 60000 + " percig próbálkozik, utána feladja, és a következő ébredéskor újra próbálja.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["modem", "antenna"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d0", "v-d1", "v-uart-modem", "v-antenna"]), ikon: "SEND",
        soros: [
          [">> AT+CPIN?", "at"], ["+CPIN: READY", "valasz"], ["OK", "valasz"],
          [">> AT+CGDCONT=1,\"IP\",\"internet\"", "at"], ["OK", "valasz"],
          ["[modem] Hálózat keresése...", ""],
          [">> AT+CEREG?", "at"], ["+CEREG: 0,2", "valasz"], ["OK", "valasz"],
          [">> AT+CREG?", "at"], ["+CREG: 0,2", "valasz"], ["OK", "valasz"],
          [">> AT+CEREG?", "at"], ["+CEREG: 0,1", "valasz"], ["OK", "valasz"],
          ["[modem] Hálózaton vagyunk, 14 mp alatt.", "ok"],
          [">> AT+CGACT=1,1", "at"], ["OK", "valasz"],
        ],
      },
      {
        id: "jel", fazis: "Küldés", rovid: "Térerő", ido_s: 0.5,
        cim: "Térerő lekérdezése",
        leiras: "AT+CSQ: a modem " + M.csq + "-es értéket ad. Átszámolva: −113 + 2 × " + M.csq + " = " + dbm + " dBm. Ez is elmegy, a 8. mezőben.",
        miert: "Ebből távolról is látszik, ha romlik a vétel – például elfordult az antenna, vagy kinőtt egy lombos ág.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["modem"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d0", "v-d1", "v-uart-modem", "v-antenna"]), ikon: "SEND",
        soros: [[">> AT+CSQ", "at"], ["+CSQ: " + M.csq + ",99", "valasz"], ["OK", "valasz"]],
      },
      {
        id: "kuldes", fazis: "Küldés", rovid: "Küldés", ido_s: 4, uzenet: true,
        cim: "Az adatok elküldése",
        leiras: "A modem beépített HTTP kliensével egyetlen GET kérést küld a ThingSpeak szerverre – a mért értékek az URL-ben utaznak (lent látod). A szerver 200-as kóddal válaszol: megérkezett!",
        miert: "Titkosítatlan HTTP: egyszerűbb, és kevesebb energiát fogyaszt. Az adatok amúgy is nyilvánosak; az írási kulcsot viszont titokban tartjuk.",
        tap: ARDUINO.concat(MODEM, ["felho"]), dolgozik: ["modem", "felho"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d0", "v-d1", "v-uart-modem", "v-antenna", "v-radio"]), ikon: "SEND",
        soros: function (url) {
          return [
            [">> AT+HTTPTERM", "at"], ["ERROR", "valasz"],
            [">> AT+HTTPINIT", "at"], ["OK", "valasz"],
            [">> AT+HTTPPARA=\"URL\",\"" + url + "\"", "at"], ["OK", "valasz"],
            [">> AT+HTTPACTION=0", "at"], ["OK", "valasz"],
            ["+HTTPACTION: 0,200,2", "valasz"],
            [">> AT+HTTPTERM", "at"], ["OK", "valasz"],
            ["[GSM] HTTP válasz: 200", "ok"],
          ];
        },
      },
      {
        id: "modem-ki", fazis: "Befejezés", rovid: "Modem ki", ido_s: 3.5,
        cim: "A modem leállítása",
        leiras: "Szabályos leállítás: az AT+CPOF paranccsal a modem kijelentkezik a hálózatról. 3 másodperc múlva a D8 elveszi az áramát.",
        miert: "A modem a doboz egyik legnagyobb fogyasztója (átlagosan kb. 150 mA, becslés), ezért csak addig kap áramot, amíg tényleg szükség van rá.",
        tap: ARDUINO.concat(MODEM), dolgozik: ["modem", "kapcsolo"],
        aram: ARDUINO_ARAM.concat(MODEM_ARAM, ["v-d0", "v-d1", "v-uart-modem", "v-d8"]), ikon: "SEND",
        soros: [["[modem] Leállítás...", ""], [">> AT+CPOF", "at"], ["OK", "valasz"]],
      },
      {
        id: "kesz", fazis: "Befejezés", rovid: "Siker", ido_s: K.STATUS_SHOW_MS / 1000,
        cim: "Siker!",
        leiras: "Az adatok megérkeztek. A LED mátrixon " + (K.STATUS_SHOW_MS / 1000).toString().replace(".", ",") + " másodpercig pipa látszik – ha valaki épp a doboznál áll, láthatja.",
        miert: "Hiba esetén itt X jelenne meg, és a soros monitoron „Adatküldés SIKERTELEN”. A következő ébredéskor a doboz újra próbálkozik.",
        tap: ARDUINO, dolgozik: ["arduino"], aram: ARDUINO_ARAM, ikon: "OK",
        soros: [[">>> Adatküldés SIKERES", "ok"]],
      },
      {
        id: "done", fazis: "Befejezés", rovid: "DONE", ido_s: 0.2,
        cim: "Lekapcsolás",
        leiras: "Az Arduino a D3 lábon jelez a TPL5110-nek („DONE”), ami azonnal elveszi az áramát. Kezdődik a következő " + K.MERESI_IDOKOZ_PERC + " perc alvás.",
        miert: "Egy teljes ciklus tipikusan 40–90 másodperc – ebből a leghosszabb a hálózatra csatlakozás.",
        tap: ARDUINO, dolgozik: ["tpl", "arduino"], aram: ARDUINO_ARAM.concat(["v-d3"]), ikon: "NONE",
        soros: [],
      },
    ];
    return lepesek.filter((l) => !l.csakDO || useDO);
  };

  // Az elküldött üzenet mezői (transport.cpp: buildThingSpeakPath)
  VE.uzenetMezok = function (useDO) {
    return [
      { mezo: 1, nev: "Vízhőmérséklet", ertek: f(M.vizHo, 2), egyseg: "°C", kartya: "ds18b20" },
      { mezo: 2, nev: "pH", ertek: f(M.ph, 2), egyseg: "", kartya: "ph" },
      { mezo: 3, nev: "Vezetőképesség", ertek: String(M.ec), egyseg: "µS/cm", kartya: "ec" },
      { mezo: 4, nev: "Zavarosság", ertek: String(M.zav), egyseg: "NTU", kartya: "zavarossag" },
      { mezo: 5, nev: "Oldott oxigén", ertek: useDO ? f(M.do, 2) : null, egyseg: "mg/l", kartya: "do",
        hianyMiert: "nincs beépítve – a hiányzó mező egyszerűen kimarad" },
      { mezo: 6, nev: "Akkufeszültség", ertek: f(M.akku, 2), egyseg: "V", kartya: "akku" },
      { mezo: 7, nev: "Doboz páratartalom", ertek: String(M.dobozPara), egyseg: "%", kartya: "bme280" },
      { mezo: 8, nev: "Jelerősség", ertek: String(dbm), egyseg: "dBm", kartya: "modem" },
    ];
  };

  VE.uzenetUrl = function (useDO) {
    let p = "http://api.thingspeak.com/update?api_key=ÍRÁSI_KULCS";
    VE.uzenetMezok(useDO).forEach((m) => { if (m.ertek !== null) p += "&field" + m.mezo + "=" + m.ertek; });
    return p + "&status=OK";
  };
})();
