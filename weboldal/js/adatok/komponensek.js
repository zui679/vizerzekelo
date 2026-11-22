// =====================================================================
//  Az alkatrészek adatai: kártyák (szöveg) + a belső ábra rajza.
//  Források: docs/02_rendszerterv.md, docs/03_szenzorok.md,
//  docs/04_energiaellatas.md, docs/05_kommunikacio.md, hardware/bekotes.md
// =====================================================================
window.VE = window.VE || {};

VE.retegek = {
  energia:      { nev: "Energia",      szin: "--r-energia-k" },
  vezerles:     { nev: "Vezérlés",     szin: "--r-vezerles-k" },
  kommunikacio: { nev: "Kommunikáció", szin: "--r-kommunikacio-k" },
  szenzor:      { nev: "Szenzorok",    szin: "--r-szenzor-k" },
};

VE.vezetekTipusok = {
  napelem:   { nev: "Napelem",            szin: "--v-napelem" },
  t5v:       { nev: "5 V táp",            szin: "--v-5v" },
  vbat:      { nev: "Akku (VBAT)",        szin: "--v-vbat" },
  analog:    { nev: "Analóg jel",         szin: "--v-analog" },
  digitalis: { nev: "Digitális / vezérlés", szin: "--v-digitalis" },
  uart:      { nev: "Soros (UART)",       szin: "--v-uart" },
  i2c:       { nev: "I2C (Qwiic)",        szin: "--v-i2c" },
  kabel:     { nev: "Szonda- / antennakábel", szin: "--szoveg-halvany" },
  radio:     { nev: "Rádió (LTE)",        szin: "--v-radio", szaggatott: true },
};

// ---------------------------------------------------------------------
// KÁRTYÁK – amit egy alkatrészre kattintva látunk
//   labak:   [láb, vezetéktípus]
//   tenyek:  rövid adatok, számok
//   miert:   „Miért ezt választottuk?”
// ---------------------------------------------------------------------
VE.kartyak = {
  napelem: {
    nev: "Napelem", reteg: "energia",
    tipus: "kb. 6 W (vagy 10 W) monokristályos, kültéri, UV-álló panel",
    mire: "Napfényből áramot termel, ezzel töltjük az akkut. Déli tájolással, 35–60°-os dőlésszögben szereljük fel.",
    tenyek: [
      "15 perces méréssel a doboz kb. 2,1 Wh-t fogyaszt naponta (becslés).",
      "Egy 6 W-os panel decemberben kb. 4,7 Wh-t, júliusban kb. 21 Wh-t termel naponta.",
    ],
    miert: ["Havi átlagban egész évben fedezi a fogyasztást; a hosszú, ködös téli napokat az akku hidalja át."],
    figyelem: "A panel üresjárási feszültsége (Voc) legyen kisebb, mint amit a töltésvezérlő elvisel – különben a töltő tönkremegy! Egy „6 V-os” panel napon 7 V fölé is mehet.",
    linkek: [["Energiaellátás", "docs/04_energiaellatas.md"]],
  },
  tolto: {
    nev: "Töltésvezérlő", reteg: "energia",
    tipus: "1 cellás Li-ion napelemes töltő MPPT-vel, 5 V ≥ 1 A kimenettel (pl. DFRobot DFR0559 vagy Waveshare Solar Power Manager)",
    mire: "Tölti és védi az akkut, és 5 V-ot állít elő a TPL5110-en át az Arduinónak.",
    tenyek: ["Az MPPT („legnagyobb teljesítményű pont követése”) borús időben is a lehető legtöbb energiát hozza ki a panelből."],
    miert: ["Kész modul: nem kell tápegységet tervezni, és van benne mélykisütés-védelem."],
    figyelem: "Li-ion akkut 0 °C alatt tilos tölteni – vásárlás előtt nézd meg az adatlapon, figyeli-e a töltő a hőmérsékletet.",
    linkek: [["Napelem és töltő párosítása", "docs/04_energiaellatas.md"]],
  },
  akku: {
    nev: "Li-ion akku", reteg: "energia",
    tipus: "2 db védett (PCB-s) 18650 cella párhuzamosan – 3,7 V, kb. 6800 mAh",
    mire: "Tárolja az energiát éjszakára és borús napokra. Teljesen feltöltve 4,2 V.",
    tenyek: [
      "Napfény nélkül kb. 10 napig bírja 15 perces méréssel, mobilhálózattal (becslés).",
      "A + pólusánál 3 A-es biztosíték van – minden más utána jön.",
    ],
    miert: [
      "Olcsó, mindenhol kapható, és a hobbi napelemes töltők erre készülnek.",
      "A modem közvetlenül az akkuról kap áramot: adáskor akár 2 A-es csúcsot vesz fel, és eleve Li-ion akkuról való működésre tervezték.",
    ],
    figyelem: "Az akkuval csak felnőtt dolgozik. Párhuzamos kötés előtt a cellákat külön fel kell tölteni, és legfeljebb 0,05 V lehet köztük a különbség.",
    linkek: [["Akku választás", "docs/04_energiaellatas.md"], ["Biztonság", "docs/09_biztonsag.md"]],
  },
  tpl: {
    nev: "TPL5110 időzítő", reteg: "energia",
    tipus: "Adafruit TPL5110 Low Power Timer – apró időzítő-kapcsoló",
    mire: "15 percenként bekapcsolja az Arduinót, a mérés végén pedig TELJESEN elveszi tőle az áramot.",
    labak: [["D3 (DONE)", "digitalis"], ["USB 5 V ki", "t5v"]],
    tenyek: [
      "Ő maga csak kb. 35 nA-t fogyaszt – két mérés között a doboz gyakorlatilag semmit sem fogyaszt.",
      "Ha az Arduino végzett, a D3 lábon jelez („DONE”), és a TPL5110 lekapcsol. Az időközt egy trimmer-ellenállás állítja.",
      "A kimenete egy USB-A aljzatba megy, onnan szabványos kábel az Arduinóba – szervizeléskor egyszerűen a laptopot dugjuk a helyére.",
    ],
    miert: ["Az UNO R4 WiFi „alvó” módban is több tíz mA-t fogyasztana – ez néhány nap alatt lemerítené az akkut."],
    figyelem: "Az Arduino minden ébredéskor újraindul, és semmire sem emlékszik: ezért van a kalibráció az EEPROM-ban, az időbélyeget pedig a ThingSpeak adja.",
    linkek: [["Rendszerterv", "docs/02_rendszerterv.md"]],
  },
  oszto: {
    nev: "Feszültségosztó", reteg: "energia",
    tipus: "2 × 470 kΩ ellenállás + 100 nF kondenzátor",
    mire: "Megfelezi az akku feszültségét (4,2 V → 2,1 V), hogy az Arduino A3 lába meg tudja mérni.",
    labak: [["A3", "analog"]],
    tenyek: [
      "GSM módban 3,65 V alatt AKKU_GYENGE figyelmeztetést küld a doboz.",
      "3,50 V alatt nem mér és nem küld – így védi az akkut a túlzott lemerüléstől.",
    ],
    miert: ["Nagy ellenállásokat használunk: az osztó folyamatosan az akkun lóg, ezért szinte semmit sem fogyaszthat."],
    linkek: [["Szenzorok – 3.6", "docs/03_szenzorok.md"]],
  },
  arduino: {
    nev: "Arduino UNO R4 WiFi", reteg: "vezerles",
    tipus: "Renesas RA4M1 processzor + ESP32-S3 WiFi chip, 14 bites ADC, 12×8-as LED mátrix",
    mire: "A doboz „agya”: sorban bekapcsolja a szenzorokat, kiszámolja a mért értékeket, és utasítja a modemet a küldésre.",
    tenyek: [
      "A 14 bites analóg-digitális átalakító (ADC) a 0–5 V-ot 16 384 lépésre osztja – egy lépés kb. 0,3 mV.",
      "Minden szenzorból 31 mintát vesz, és a szélsőségeseket eldobja.",
      "A beépített LED mátrix ikonokkal mutatja, mit csinál (mérés, küldés, siker, hiba).",
    ],
    miert: [
      "Az iskolákban jól ismert, rengeteg leírás van hozzá.",
      "A beépített WiFi-vel az iskolai teszteléshez modem sem kell.",
    ],
    linkek: [["A program (firmware)", "firmware/README.md"], ["Bekötés", "hardware/bekotes.md"]],
  },
  bme280: {
    nev: "BME280 dobozszenzor", reteg: "szenzor",
    tipus: "hőmérséklet + páratartalom, Qwiic (I2C) csatlakozóval",
    mire: "A doboz belsejét figyeli. Ha a páratartalom 80% fölé megy, valahol beázik – a doboz SZIVARGAS üzenetet küld, még mielőtt az elektronika tönkremenne.",
    labak: [["Qwiic", "i2c"]],
    tenyek: ["Egy jól lezárt, szilikagéllel szárított dobozban a páratartalom 20–50% körül van."],
    miert: ["Forrasztás nélkül, egyszerűen bedugható a Qwiic aljzatba."],
    linkek: [["Szenzorok – 3.6", "docs/03_szenzorok.md"]],
  },
  jumper: {
    nev: "Szerviz jumper", reteg: "vezerles",
    tipus: "jumper vagy reed relé a D2 láb és a GND között",
    mire: "Ha induláskor bent van, a doboz szerviz módba lép: itt lehet kalibrálni, és a modemet kézzel kipróbálni.",
    labak: [["D2", "digitalis"]],
    tenyek: ["A szerviz menü 10 perc tétlenség után magától kilép, hogy ne merüljön le az akku."],
    figyelem: "Ha a jumper bent felejtődik, a doboz mér, de SZERVIZ_JUMPER figyelmeztetést küld.",
    linkek: [["Kalibráció és karbantartás", "docs/08_kalibracio_es_karbantartas.md"]],
  },
  kapcsolo: {
    nev: "Modem tápkapcsoló", reteg: "energia",
    tipus: "P-csatornás MOSFET + NPN tranzisztor, lágy indítással",
    mire: "A D8 lábbal az Arduino ki-be kapcsolja a modem áramát, amely közvetlenül az akkuról jön.",
    labak: [["D8", "digitalis"]],
    tenyek: [
      "A modem csak a küldés idejére kap áramot.",
      "Lágy indítás: egy 1 µF-os kondenzátor miatt a kapcsoló néhány ezredmásodperc alatt nyit ki, így a bekapcsolási áramlökés nem indítja újra az Arduinót.",
      "Az 1000 µF-os puffer kondenzátor az akku oldalán szolgálja ki a modem áramcsúcsait.",
    ],
    figyelem: "Számított kiinduló értékek – hardveren még nem próbáltuk ki.",
    linkek: [["Bekötés – 3.2", "hardware/bekotes.md"]],
  },
  szint: {
    nev: "Szintillesztő", reteg: "kommunikacio",
    tipus: "kétirányú, BSS138 alapú modul",
    mire: "Átalakítja a jeleket az Arduino 5 V-os és a modem 3,3 V-os logikája között.",
    labak: [["D0 (RX)", "uart"], ["D1 (TX)", "uart"]],
    miert: ["Az Arduino 5 V-os jele tönkretehetné a modemet."],
    figyelem: "TX → RX, RX → TX: a két vezetéket keresztbe kell kötni!",
    linkek: [["Bekötés – 4. pont", "hardware/bekotes.md"]],
  },
  modem: {
    nev: "LTE modem", reteg: "kommunikacio",
    tipus: "SIMCom A7670E – LTE Cat-1, ahol még van, 2G-re is visszalép",
    mire: "Mobilhálózaton küldi el a mért adatokat az internetre, egyetlen rövid HTTP kéréssel.",
    labak: [["D0 / D1 (UART)", "uart"], ["D9 (PWRKEY)", "digitalis"]],
    tenyek: [
      "Az Arduino szöveges „AT parancsokkal” beszélget vele – pl. AT+CSQ = „mekkora a térerő?”.",
      "Egy üzenet kb. 1–2 kB, havonta kb. 3–6 MB adat – a legkisebb adatcsomag is elég.",
    ],
    miert: ["A 2G és 3G hálózatokat fokozatosan lekapcsolják, az LTE hosszú távra is biztonságos, és sima adatos SIM-mel működik."],
    figyelem: "Antenna nélkül ne kapcsold be! A PWRKEY-t (D9) csak NPN tranzisztoron át szabad vezérelni, közvetlenül soha.",
    linkek: [["Kommunikáció", "docs/05_kommunikacio.md"]],
  },
  antenna: {
    nev: "LTE antenna", reteg: "kommunikacio",
    tipus: "IPEX/u.FL vagy SMA csatlakozóval",
    mire: "A modem rádiójelét sugározza a legközelebbi mobil-bázisállomás felé.",
    miert: ["A dobozon kívül, felfelé állítva jobb a vétel (bár a műanyag doboz átengedi a jelet)."],
    linkek: [["Mechanika", "docs/06_mechanika_es_telepites.md"]],
  },
  felho: {
    nev: "ThingSpeak felhő", reteg: "kommunikacio",
    tipus: "ingyenes IoT adatgyűjtő szolgáltatás (MathWorks)",
    mire: "Fogadja és tárolja az adatokat, és nyilvános grafikonokat rajzol belőlük – bárki megnézheti.",
    tenyek: ["8 adatmező + 1 szöveges állapotmező csatornánként.", "CSV-ben letölthető, elemezhető."],
    miert: ["Ingyenes kis, nem kereskedelmi projekteknek, és egyetlen egyszerű HTTP kéréssel lehet adatot küldeni."],
    figyelem: "Időbélyeget nem küldünk: a ThingSpeak a beérkezés idejét rögzíti, UTC-ben (nyáron 2, télen 1 órával kevesebbet mutat).",
    linkek: [["ThingSpeak beállítása", "docs/05_kommunikacio.md"]],
  },
  ds18b20: {
    nev: "Vízhőmérő", reteg: "szenzor",
    tipus: "DS18B20, vízálló, rozsdamentes acél kivitel",
    mire: "A víz hőmérsékletét méri °C-ban.",
    labak: [["D4 (1-Wire)", "digitalis"]],
    hogyan: "Digitális szenzor: a chip maga alakítja számmá a hőmérsékletet, és egyetlen adatvezetéken (1-Wire) küldi. Pontosság ±0,5 °C.",
    tenyek: ["Tipikus folyóvíz: télen 0–5 °C, nyáron 18–26 °C."],
    miert: [
      "A hőmérséklet meghatározza, mennyi oxigén oldódhat a vízben.",
      "A pH és a vezetőképesség kiszámolásához is kell (hőkompenzáció). Ha hiányzik, a program 25 °C-kal számol.",
    ],
    figyelem: "A D4 és az 5 V közé 4,7 kΩ-os felhúzó ellenállás kell.",
    linkek: [["Szenzorok – 3.1", "docs/03_szenzorok.md"]],
  },
  ph: {
    nev: "pH szenzor", reteg: "szenzor",
    tipus: "DFRobot Gravity analóg pH (V2) erősítő + ipari pH szonda",
    mire: "Megmutatja, mennyire savas vagy lúgos a víz (0–14-es skála, 7 = semleges).",
    labak: [["A0 (jel)", "analog"], ["D5 (táp be/ki)", "digitalis"]],
    hogyan: "A szonda üvegmembránján pH-egységenként kb. 59 mV feszültség keletkezik. Az erősítő panel ezt felerősíti és eltolja (pH 7 ≈ 1,5 V), hogy az Arduino mérni tudja.",
    tenyek: ["Tipikus folyóvíz: 7,0–8,5.", "2–4 hetente kalibrálni kell (pH 7 és pH 4 pufferrel)."],
    miert: ["Tartós merítéshez ipari szonda kell – a sima labor szonda néhány hét alatt tönkremegy."],
    figyelem: "Nagyon érzékeny az elektromos zavarokra, ezért egyszerre mindig csak egy szenzor kap áramot (a D5-ös tápkapcsolón át). A szonda nem száradhat ki!",
    linkek: [["Szenzorok – 3.2", "docs/03_szenzorok.md"]],
  },
  levalaszto: {
    nev: "Leválasztó modul", reteg: "szenzor",
    tipus: "DFRobot Gravity Analog Signal Isolator (DFR0504)",
    mire: "Elektromosan elválasztja az EC szenzort az Arduinótól – és így a vízen keresztül a többi szondától is.",
    labak: [["D6 (táp be/ki)", "digitalis"], ["A1 (jel)", "analog"]],
    miert: [
      "Az EC szenzor váltakozó feszültsége a vízen át „áthallatszana” a nagyon érzékeny pH szondába.",
      "Ez a gyártó által ajánlott megoldás, folyamatos mérésnél megbízhatóbb, mint önmagában a táp váltogatása.",
    ],
    figyelem: "Az EC kalibrálást a beépített modullal együtt kell elvégezni.",
    linkek: [["Bekötés – 5. pont", "hardware/bekotes.md"]],
  },
  ec: {
    nev: "Vezetőképesség (EC / TDS)", reteg: "szenzor",
    tipus: "DFRobot Gravity TDS szenzor (SEN0244)",
    mire: "Megméri, mennyire vezeti a víz az áramot (µS/cm). Ebből becsüljük az oldott sók mennyiségét: TDS ≈ EC × 0,5 mg/l.",
    labak: [["A1 (jel, leválasztón át)", "analog"], ["D6 (táp be/ki)", "digitalis"]],
    hogyan: "Két fémelektróda közé váltakozó feszültséget kapcsol (hogy ne bontsa a vizet), és méri, mennyi áram folyik át.",
    tenyek: ["Tipikus folyóvíz: 200–800 µS/cm.", "Mérési tartomány kb. 0–2000 µS/cm."],
    miert: ["Hirtelen EC-ugrás szennyezésre (szennyvíz, útsózás), hirtelen csökkenés nagy esőre utalhat."],
    linkek: [["Szenzorok – 3.3", "docs/03_szenzorok.md"]],
  },
  zavarossag: {
    nev: "Zavarosság", reteg: "szenzor",
    tipus: "DFRobot Gravity zavarosság szenzor (SEN0189)",
    mire: "Megméri, mennyire homályos a víz – mennyi iszap, agyag, alga lebeg benne (NTU).",
    labak: [["A2 (jel)", "analog"], ["D7 (táp be/ki)", "digitalis"]],
    hogyan: "Az egyik oldalon infravörös LED világít, a másikon fényérzékelő méri az átjutó fényt. Zavarosabb víz → kevesebb fény → kisebb feszültség (tiszta víz ≈ 4,2 V).",
    tenyek: ["Tiszta időben 5–50 NTU, árhullámkor több száz, akár 1000 fölött.", "Közelítő pontosságú: viszonyításra jó („hatszor zavarosabb, mint tegnap”)."],
    figyelem: "A szenzor felső része nem vízálló, és a napfény zavarja – árnyékolt csőbe kell tenni. A mérőablakot hetente tisztítani kell!",
    linkek: [["Szenzorok – 3.4", "docs/03_szenzorok.md"]],
  },
  do: {
    nev: "Oldott oxigén (opcionális)", reteg: "szenzor", opcionalis: true,
    tipus: "DFRobot Gravity DO szenzor (SEN0237), galvanikus szonda",
    mire: "Megméri, mennyi oxigén van oldva a vízben (mg/l) – ezt lélegzik a halak.",
    labak: [["A4 (jel)", "analog"], ["D10 (táp be/ki)", "digitalis"]],
    hogyan: "A membránon átjutó oxigén a szonda belsejében kémiai reakcióban áramot termel: több oxigén → nagyobb áram.",
    tenyek: ["Egészséges folyóvíz: 7–12 mg/l.", "5 mg/l alatt a halak stresszbe kerülnek, 2 mg/l alatt halpusztulás is előfordulhat."],
    miert: ["Azért opcionális, mert drága (kb. 60–80 ezer Ft), és 1–2 havonta membránt kell cserélni."],
    figyelem: "Az elektrolit lúgos, maró hatású – csak felnőtt kezelheti, védőkesztyűben és védőszemüvegben!",
    linkek: [["Szenzorok – 3.5", "docs/03_szenzorok.md"]],
  },

  // ---- csak a külső nézetben ----
  doboz: {
    nev: "IP67 elektronikai doboz", reteg: "vezerles",
    tipus: "ABS vagy polikarbonát kötődoboz, kb. 200 × 150 × 100 mm, világos színű",
    mire: "Ebben van az Arduino, az akku, a modem és a töltő – legalább 1 m-rel a megszokott vízszint FELETT.",
    tenyek: [
      "Kábelek csak alul jönnek ki, tömszelencéken át, „csepegtető ívvel”.",
      "2–3 tasak szilikagél szárítja, egy nyomáskiegyenlítő szelep hagyja „lélegezni”.",
      "Világos szín: kevésbé melegszik a napon.",
    ],
    belulrol: true,
    linkek: [["Mechanika és telepítés", "docs/06_mechanika_es_telepites.md"]],
  },
  vedocso: {
    nev: "Perforált védőcső", reteg: "szenzor",
    tipus: "PVC cső, Ø 75–110 mm, lyukacsos fal, nyitott/rácsos alj",
    mire: "Ebben lógnak a szondák a vízben. A víz átáramlik rajta, de az uszadék nem fér be, és a napfény sem éri a zavarosság-szenzort.",
    tenyek: [
      "A szondák vége legalább 20–30 cm-rel a felszín alatt, de a mederfenék felett legyen.",
      "A szondák között legalább 5–10 cm távolság kell, hogy ne zavarják egymást.",
    ],
    linkek: [["Mechanika – szenzortartó cső", "docs/06_mechanika_es_telepites.md"]],
  },
  colop: {
    nev: "Cölöp / korlát", reteg: "energia",
    tipus: "parti rögzítés – ezt javasoljuk az iskolai projekthez",
    mire: "Ezen áll a doboz és a napelem. A parti változatnál a diákok vízbe menés nélkül, biztonságosan részt vehetnek a karbantartásban.",
    tenyek: ["Árvízbiztonság: a dobozt az árvízszintet is figyelembe véve kell magasra szerelni."],
    figyelem: "Folyóba eszközt helyezni engedélyköteles lehet – a telepítés előtt a felnőttek intézik.",
    linkek: [["Engedélyek", "docs/06_mechanika_es_telepites.md"]],
  },
  gegecso: {
    nev: "Kábelvédő gégecső", reteg: "szenzor",
    tipus: "flexibilis védőcső a doboz és a szondák között",
    mire: "Védi a szondák kábeleit a doboztól a vízig. A kábel teljes hossza kb. 2 m – a gyári kábelek egy részét hosszabbítani kell.",
    linkek: [["Kábelterv", "hardware/bekotes.md"]],
  },
};

// ---------------------------------------------------------------------
// BELSŐ ÁBRA – koordináták a 0 0 1260 870-es rajzlapon
// ---------------------------------------------------------------------
VE.belsoAbra = {
  szelesseg: 1260, magassag: 870,
  doboz: { x: 15, y: 110, w: 1170, h: 540, felirat: "IP67 VÍZÁLLÓ DOBOZ" },
  viz: { y: 690 },
  cso: { x: 290, y: 700, w: 740, h: 160, felirat: "perforált védőcső" },
  tomszelencek: [330, 475, 700, 835, 985],

  // elemek: id, kartya, x, y, w, h, nev, al, alak ("doboz" | "szonda" | "felho" | "antenna")
  elemek: [
    { id: "e-napelem", kartya: "napelem", x: 40, y: 20, w: 190, h: 60, nev: "☀ Napelem", al: "kb. 6 W" },
    { id: "e-felho", kartya: "felho", x: 990, y: 18, w: 200, h: 58, nev: "ThingSpeak", al: "felhő, grafikonok", alak: "felho" },
    { id: "e-tolto", kartya: "tolto", x: 40, y: 140, w: 190, h: 64, nev: "Töltésvezérlő", al: "MPPT, 5 V ki" },
    { id: "e-akku", kartya: "akku", x: 40, y: 250, w: 190, h: 64, nev: "Li-ion akku", al: "2×18650 · 3,7 V" },
    { id: "e-tpl", kartya: "tpl", x: 40, y: 370, w: 190, h: 64, nev: "TPL5110", al: "időzítő kapcsoló" },
    { id: "e-oszto", kartya: "oszto", x: 270, y: 258, w: 100, h: 48, nev: "Osztó", al: "2×470 kΩ" },
    { id: "e-bme280", kartya: "bme280", x: 410, y: 140, w: 140, h: 44, nev: "BME280", al: "doboz pára/hő" },
    { id: "e-jumper", kartya: "jumper", x: 570, y: 140, w: 140, h: 44, nev: "Szerviz jumper", al: "" },
    { id: "e-arduino", kartya: "arduino", x: 400, y: 200, w: 320, h: 240, nev: "Arduino UNO R4 WiFi", al: "a doboz agya", alak: "arduino" },
    { id: "e-kapcsolo", kartya: "kapcsolo", x: 1000, y: 146, w: 150, h: 50, nev: "Modem kapcsoló", al: "MOSFET, lágy indítás" },
    { id: "e-szint", kartya: "szint", x: 770, y: 262, w: 140, h: 58, nev: "Szintillesztő", al: "5 V ↔ 3,3 V" },
    { id: "e-modem", kartya: "modem", x: 990, y: 240, w: 170, h: 175, nev: "LTE modem", al: "A7670E + SIM" },
    { id: "e-antenna", kartya: "antenna", x: 1196, y: 200, w: 56, h: 100, nev: "Ant.", al: "LTE", alak: "antenna" },
    { id: "e-ph", kartya: "ph", x: 420, y: 560, w: 110, h: 52, nev: "pH erősítő", al: "panel" },
    { id: "e-levalaszto", kartya: "levalaszto", x: 550, y: 560, w: 80, h: 52, nev: "Leválasztó", al: "DFR0504" },
    { id: "e-ec", kartya: "ec", x: 650, y: 560, w: 100, h: 52, nev: "TDS/EC", al: "panel" },
    { id: "e-zavarossag", kartya: "zavarossag", x: 775, y: 560, w: 120, h: 52, nev: "Zavarosság", al: "panel" },
    { id: "e-do", kartya: "do", x: 925, y: 560, w: 120, h: 52, nev: "Oldott O₂", al: "opcionális" },
    // szondák a vízben
    { id: "e-ds18b20-szonda", kartya: "ds18b20", x: 318, y: 716, w: 24, h: 84, nev: "Vízhőmérő", alak: "szonda" },
    { id: "e-ph-szonda", kartya: "ph", x: 463, y: 716, w: 24, h: 84, nev: "pH szonda", alak: "szonda" },
    { id: "e-ec-szonda", kartya: "ec", x: 688, y: 716, w: 24, h: 84, nev: "EC szonda", alak: "szonda" },
    { id: "e-zavarossag-szonda", kartya: "zavarossag", x: 815, y: 716, w: 40, h: 70, nev: "Zavarosság", alak: "szonda" },
    { id: "e-do-szonda", kartya: "do", x: 973, y: 716, w: 24, h: 84, nev: "DO szonda", alak: "szonda" },
  ],

  // Az Arduino lábai: felirat helye
  labak: [
    { lab: "A3", x: 400, y: 282, oldal: "bal" },
    { lab: "D3", x: 400, y: 350, oldal: "bal" },
    { lab: "USB", x: 400, y: 402, oldal: "bal" },
    { lab: "D8", x: 720, y: 215, oldal: "jobb" },
    { lab: "D0", x: 720, y: 280, oldal: "jobb" },
    { lab: "D1", x: 720, y: 305, oldal: "jobb" },
    { lab: "D9", x: 720, y: 370, oldal: "jobb" },
    { lab: "Qwiic", x: 480, y: 200, oldal: "fent" },
    { lab: "D2", x: 640, y: 200, oldal: "fent" },
    { lab: "D4", x: 415, y: 440, oldal: "lent" },
    { lab: "D5", x: 450, y: 440, oldal: "lent" },
    { lab: "A0", x: 475, y: 440, oldal: "lent" },
    { lab: "D6", x: 520, y: 440, oldal: "lent" },
    { lab: "A1", x: 545, y: 440, oldal: "lent" },
    { lab: "D7", x: 615, y: 440, oldal: "lent" },
    { lab: "A2", x: 640, y: 440, oldal: "lent" },
    { lab: "D10", x: 675, y: 440, oldal: "lent" },
    { lab: "A4", x: 700, y: 440, oldal: "lent" },
  ],

  // vezetékek: id, tipus, d (SVG útvonal), kartyak (melyik alkatrészhez tartozik), opcionalis
  vezetekek: [
    { id: "v-napelem", tipus: "napelem", d: "M135 80 V140", kartyak: ["napelem", "tolto"] },
    { id: "v-tolto-akku", tipus: "vbat", d: "M135 204 V250", kartyak: ["tolto", "akku"] },
    { id: "v-5v-tpl", tipus: "t5v", d: "M40 180 H26 V402 H40", kartyak: ["tolto", "tpl"] },
    { id: "v-usb", tipus: "t5v", d: "M230 402 H400", kartyak: ["tpl", "arduino"], cimke: { x: 300, y: 395, szoveg: "USB 5 V" } },
    { id: "v-d3", tipus: "digitalis", d: "M400 350 H180 V370", kartyak: ["tpl", "arduino"], cimke: { x: 300, y: 343, szoveg: "DONE" } },
    { id: "v-vbat", tipus: "vbat", d: "M230 282 H250 V124 H1075 V146", kartyak: ["akku", "kapcsolo"], cimke: { x: 640, y: 118, szoveg: "akku (VBAT) → modem" }, csomopont: [250, 282] },
    { id: "v-oszto", tipus: "vbat", d: "M250 282 H270", kartyak: ["akku", "oszto"] },
    { id: "v-a3", tipus: "analog", d: "M370 282 H400", kartyak: ["oszto", "arduino"] },
    { id: "v-d8", tipus: "digitalis", d: "M720 215 H960 V171 H1000", kartyak: ["kapcsolo", "arduino"], cimke: { x: 840, y: 208, szoveg: "modem táp BE/KI" } },
    { id: "v-kapcs-modem", tipus: "vbat", d: "M1075 196 V240", kartyak: ["kapcsolo", "modem"] },
    { id: "v-d0", tipus: "uart", d: "M720 280 H770", kartyak: ["szint", "arduino"] },
    { id: "v-d1", tipus: "uart", d: "M720 305 H770", kartyak: ["szint", "arduino"] },
    { id: "v-uart-modem", tipus: "uart", d: "M910 280 H990 M910 305 H990", kartyak: ["szint", "modem"] },
    { id: "v-d9", tipus: "digitalis", d: "M720 370 H990", kartyak: ["modem", "arduino"], cimke: { x: 850, y: 363, szoveg: "PWRKEY (NPN-en át)" } },
    { id: "v-antenna", tipus: "kabel", d: "M1160 300 H1196", kartyak: ["modem", "antenna"] },
    { id: "v-radio", tipus: "radio", d: "M1224 200 C1224 140 1205 100 1170 78", kartyak: ["antenna", "felho"] },
    { id: "v-qwiic", tipus: "i2c", d: "M480 184 V200", kartyak: ["bme280", "arduino"] },
    { id: "v-d2", tipus: "digitalis", d: "M640 184 V200", kartyak: ["jumper", "arduino"] },
    { id: "v-d4", tipus: "digitalis", d: "M415 440 V455 H330 V716", kartyak: ["ds18b20", "arduino"], cimke: { x: 372, y: 470, szoveg: "1-Wire" } },
    { id: "v-d5", tipus: "digitalis", d: "M450 440 V560", kartyak: ["ph", "arduino"] },
    { id: "v-a0", tipus: "analog", d: "M475 440 V560", kartyak: ["ph", "arduino"] },
    { id: "v-d6", tipus: "digitalis", d: "M520 440 V510 H572 V560", kartyak: ["levalaszto", "ec", "arduino"] },
    { id: "v-a1", tipus: "analog", d: "M545 440 V500 H605 V560", kartyak: ["levalaszto", "ec", "arduino"] },
    { id: "v-lev-tap", tipus: "t5v", d: "M630 578 H650", kartyak: ["levalaszto", "ec"] },
    { id: "v-lev-jel", tipus: "analog", d: "M650 596 H630", kartyak: ["levalaszto", "ec"] },
    { id: "v-d7", tipus: "digitalis", d: "M615 440 V490 H805 V560", kartyak: ["zavarossag", "arduino"] },
    { id: "v-a2", tipus: "analog", d: "M640 440 V480 H850 V560", kartyak: ["zavarossag", "arduino"] },
    { id: "v-d10", tipus: "digitalis", d: "M675 440 V470 H955 V560", kartyak: ["do", "arduino"], opcionalis: true },
    { id: "v-a4", tipus: "analog", d: "M700 440 V460 H1000 V560", kartyak: ["do", "arduino"], opcionalis: true },
    { id: "v-k-ph", tipus: "kabel", d: "M475 612 V716", kartyak: ["ph"] },
    { id: "v-k-ec", tipus: "kabel", d: "M700 612 V716", kartyak: ["ec"] },
    { id: "v-k-zavarossag", tipus: "kabel", d: "M835 612 V716", kartyak: ["zavarossag"] },
    { id: "v-k-do", tipus: "kabel", d: "M985 612 V716", kartyak: ["do"], opcionalis: true },
  ],
};

// ---------------------------------------------------------------------
// LÁBKIOSZTÁS (hardware/bekotes.md 1. pont)
// ---------------------------------------------------------------------
VE.labkiosztas = [
  { lab: "D0 / D1", mire: "Modem soros port (RX / TX)", tipus: "uart", megj: "szintillesztőn át, keresztbe kötve", vezetekek: ["v-d0", "v-d1", "v-uart-modem"], kartya: "szint" },
  { lab: "D2", mire: "Szerviz jumper", tipus: "digitalis", megj: "GND-re húzva = szerviz mód", vezetekek: ["v-d2"], kartya: "jumper" },
  { lab: "D3", mire: "TPL5110 DONE", tipus: "digitalis", megj: "„kész vagyok, kapcsolj le”", vezetekek: ["v-d3"], kartya: "tpl" },
  { lab: "D4", mire: "Vízhőmérő (DS18B20)", tipus: "digitalis", megj: "1-Wire, 4,7 kΩ felhúzó az 5 V-ra", vezetekek: ["v-d4"], kartya: "ds18b20" },
  { lab: "D5", mire: "pH szenzor tápkapcsoló", tipus: "digitalis", megj: "HIGH = BE", vezetekek: ["v-d5"], kartya: "ph" },
  { lab: "D6", mire: "EC/TDS tápkapcsoló", tipus: "digitalis", megj: "HIGH = BE, a leválasztó modult is ez táplálja", vezetekek: ["v-d6", "v-lev-tap"], kartya: "ec" },
  { lab: "D7", mire: "Zavarosság tápkapcsoló", tipus: "digitalis", megj: "HIGH = BE", vezetekek: ["v-d7"], kartya: "zavarossag" },
  { lab: "D8", mire: "Modem tápkapcsoló", tipus: "digitalis", megj: "HIGH = BE (akku → modem)", vezetekek: ["v-d8"], kartya: "kapcsolo" },
  { lab: "D9", mire: "Modem PWRKEY", tipus: "digitalis", megj: "csak NPN tranzisztoron át!", vezetekek: ["v-d9"], kartya: "modem" },
  { lab: "D10", mire: "Oldott oxigén tápkapcsoló", tipus: "digitalis", megj: "opcionális", vezetekek: ["v-d10"], kartya: "do" },
  { lab: "A0", mire: "pH jel", tipus: "analog", megj: "pH 7 ≈ 1,5 V", vezetekek: ["v-a0"], kartya: "ph" },
  { lab: "A1", mire: "EC/TDS jel", tipus: "analog", megj: "a leválasztó modulon át", vezetekek: ["v-a1", "v-lev-jel"], kartya: "ec" },
  { lab: "A2", mire: "Zavarosság jel", tipus: "analog", megj: "a panel kapcsolója „A” állásban!", vezetekek: ["v-a2"], kartya: "zavarossag" },
  { lab: "A3", mire: "Akkufeszültség", tipus: "analog", megj: "feszültségosztó közepe (fél akkufeszültség)", vezetekek: ["v-a3"], kartya: "oszto" },
  { lab: "A4", mire: "Oldott oxigén jel", tipus: "analog", megj: "opcionális", vezetekek: ["v-a4"], kartya: "do" },
  { lab: "Qwiic", mire: "BME280 dobozszenzor", tipus: "i2c", megj: "I2C, 3,3 V, forrasztás nélkül", vezetekek: ["v-qwiic"], kartya: "bme280" },
  { lab: "USB-C", mire: "Tápellátás", tipus: "t5v", megj: "TPL5110 → USB-A aljzat → kábel", vezetekek: ["v-usb"], kartya: "tpl" },
];

// ---------------------------------------------------------------------
// A kezdőlap csempéi (README táblázata)
// ---------------------------------------------------------------------
VE.csempek = [
  { nev: "Vízhőmérséklet", ikon: "🌡", ertek: "0–26 °C", mivel: "DS18B20 vízálló hőmérő", kartya: "ds18b20" },
  { nev: "pH", ikon: "⚗", ertek: "7,0–8,5", mivel: "analóg pH szonda + erősítő", kartya: "ph" },
  { nev: "Vezetőképesség", ikon: "⚡", ertek: "200–800 µS/cm", mivel: "TDS/EC szenzor", kartya: "ec" },
  { nev: "Zavarosság", ikon: "🌫", ertek: "5–50 NTU", mivel: "optikai szenzor", kartya: "zavarossag" },
  { nev: "Oldott oxigén", ikon: "🐟", ertek: "7–12 mg/l", mivel: "galvanikus szonda – opcionális", kartya: "do", opcionalis: true },
  { nev: "Doboz páratartalma", ikon: "💦", ertek: "20–50 %", mivel: "BME280 – beázásjelző", kartya: "bme280" },
];
