# Interaktív bemutató weboldal – terv

> **Cél:** egy böngészőben futó, interaktív oldal, amely megmutatja, **miből áll** a Vízérzékelő
> doboz, és **hogyan működik** – úgy, hogy egy 10–14 éves diák kattintgatva megértse, egy szülő
> vagy egy másik iskola tanára pedig kedvet kapjon a saját példány megépítéséhez.
>
> **Állapot:** az első bemutatható változat (MVP) elkészült: kezdőlap, **Felépítés** (M2) és
> **Működés** (M4, forgatókönyvek nélkül). Megnyitás: `weboldal/index.html` duplakattintással,
> vagy bármilyen statikus webszerverrel. A számok és képletek forrása mindig a repó
> (`firmware/vizerzekelo/config.h`, `sensors.cpp`, `docs/`, `tools/energia_kalkulator.py`).

---

## 1. Célközönség és alapelvek

| Közönség | Mit akar? | Mit kap az oldaltól? |
|---|---|---|
| Diák (10–14 év) | látni, kipróbálni, „mi történik, ha…?” | csúszkák, animációk, rövid szövegek, szótár-buborékok |
| Tanár | órán kivetíteni, feladatot adni | teljes képernyős mód, lépésenkénti léptetés, feladatlap-linkek (11. fejezet) |
| Szülő, érdeklődő | gyors áttekintés | kezdőlap egyetlen képernyőn, élő adatok (ha már fut a doboz) |
| Másik iskola / építő | részletek | minden kártyáról link a megfelelő `docs/` fejezetre és a bekötésre |

**Alapelvek**

1. **Magyar nyelv, a projekt szóhasználatával** (a `docs/szotar.md` fogalmai buborékként).
2. **Egy igazságforrás:** a firmware konstansait és képleteit nem „kitaláljuk”, hanem átvesszük –
   és teszttel ellenőrizzük, hogy az oldal ugyanazt számolja, mint az Arduino (lásd 8. pont).
3. **Őszinteség:** a doboz még nincs megépítve – ahol becsült értéket mutatunk, azt jelöljük
   („becslés”, „hardveren még nem mértük”), ugyanúgy, ahogy a dokumentáció teszi.
4. **Build nélkül futtatható:** egy mappa statikus fájl, ami duplakattintásra vagy GitHub Pages-en
   is működik, internet nélkül is (osztályteremben nem mindig van jó net).
5. **Akadálymentesség:** billentyűzettel bejárható, minden animáció megállítható,
   `prefers-reduced-motion` esetén állóképek, színtévesztő-barát színek + ikonok/minták is,
   világos és sötét téma.

---

## 2. Technológiai döntés

**Javaslat: sima HTML + CSS + JavaScript + JavaScriptből rajzolt SVG, keretrendszer és build lépés nélkül.**

> Megvalósításkor: **sima `<script>` fájlok, nem ES modulok**, egy közös `window.VE` névtérrel –
> a Chrome a fájlból (`file://`) megnyitott oldalon nem tölti be a modulokat, így viszont
> duplakattintásra is működik. Ugyanezért az SVG ábrákat nem külön fájlból töltjük be, hanem a
> JavaScript rajzolja ki őket az adatfájlokból.

| Szempont | Miért ez? |
|---|---|
| Karbantartás | a projekt iskolai; egy tanár vagy idősebb diák is át tudja írni, nem kell npm, Node, build |
| Ábrák | az SVG elemei (alkatrészek, vezetékek) egyenként kiemelhetők, animálhatók, CSS-sel színezhetők |
| Méret, sebesség | néhány száz kB, régi iskolai gépeken és telefonon is fut |
| Hosztolás | GitHub Pages közvetlenül a repóból (a `weboldal/` mappa) – ingyenes, verziózott |
| Offline | nincs külső CDN függőség; egyetlen kivétel az opcionális élő ThingSpeak lekérdezés |

Grafikonhoz (energia, élő adatok) saját, egyszerű SVG vonaldiagram elég; ha mégis kell könyvtár,
akkor egy kicsi, letöltve a repóba tett fájl (pl. uPlot) – CDN-ről nem töltünk.

**Elvetett alternatívák:** React/Vue + Vite (build lépés, nehezebb karbantartás), 3D (Three.js)
modell (látványos, de nagy munka, gyenge gépeken lassú, és a lényeget – a jelutat – nem mutatja jobban).
A 3D a 10. pontban továbbfejlesztési lehetőségként szerepel.

---

## 3. Az oldal szerkezete

Egyoldalas (single page) felépítés, felül rögzített menüvel; minden szakasznak saját horgonya
(`#felepites`, `#szenzorok`, …), így a tanár közvetlen linket adhat egy-egy részre.

```
┌──────────────────────────────────────────────────────────────┐
│ 💧 Vízérzékelő   Felépítés · Szenzorok · Működés · Energia · Adatok │
├──────────────────────────────────────────────────────────────┤
│ 1. Kezdőlap        – mi ez, mit mér, egy animált áttekintő ábra │
│ 2. Felépítés       – kattintható parti állomás + doboz belseje  │
│ 3. Szenzorok       – szenzoronként „jelút” szimulátor           │
│ 4. Működés         – a 15 perces mérési ciklus lejátszása       │
│ 5. Energia         – napelem / akku szimulátor                  │
│ 6. Adatút          – doboz → LTE → ThingSpeak → grafikon        │
│ 7. Szótár, források, „Építsd meg te is!”                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. A szakaszok részletesen

### 4.1 Kezdőlap

- Egy mondat: *„Napelemes doboz a folyóparton, ami negyedóránként megméri a vizet, és elküldi az internetre.”*
- A README áttekintő ábrája animálva (folyó → szondák → doboz → antenna → felhő → grafikon),
  hullámzó víz, a napelemen „sütő” nap; egy kis „buborék” végigfut az adatúton.
- Hat csempe a mért értékekkel (hőmérséklet, pH, vezetőképesség, zavarosság, oldott oxigén*,
  doboz páratartalma) – kattintásra a megfelelő szenzorkártyára ugrik.
- „Állapot: tervezési fázis” címke, a CHANGELOG verziójával.

### 4.2 Felépítés – interaktív „robbantott” ábra

**Két nagyítási szint, egy ábrán belül átváltva (zoom-animációval):**

**a) Külső nézet – a parti állomás** (a `06_mechanika_es_telepites.md` ASCII-rajza SVG-ben):
napelem, IP67 doboz a cölöpön, tömszelencék alul, gégecső, perforált PVC védőcső a szondákkal,
vízszint, meder. Megjelöljük az „1 m-rel a vízszint felett” és „20–30 cm-rel a felszín alatt” méreteket.
A csúszkával emelhető a vízszint (árhullám) – megmutatja, miért kell a doboz magasan.

**b) Belső nézet – a doboz és a vezetékek** (a `02_rendszerterv.md` blokkdiagramja alapján):

| Csoport | Elemek |
|---|---|
| Energia | napelem, MPPT töltésvezérlő, 2× 18650 akku, TPL5110, modem tápkapcsoló (P-MOSFET), biztosíték, 1000 µF puffer |
| Vezérlés | Arduino UNO R4 WiFi (LED mátrixszal), szerviz jumper (D2) |
| Kommunikáció | A7670E LTE modem, szintillesztő, antenna, SIM |
| Szenzorok | DS18B20, pH szonda + erősítő, TDS/EC + DFR0504 leválasztó, zavarosság, DO (opcionális, szaggatott keret), BME280, feszültségosztó |

**Interakciók**

- **Rámutatás / kattintás** egy alkatrészre → oldalsó **alkatrész-kártya**:
  név, egy mondat „mire jó?”, kép/ikon, láb(ak), jeltípus, áram/fogyasztás, ár-nagyságrend,
  „Miért ezt választottuk?” (a rendszerterv 2.3 pontjából), linkek: `docs/03…`, `bekotes.md`, `beszerzes.md`.
- **Rétegszűrő gombok:** Energia · Vezérlés · Kommunikáció · Szenzorok – a többi elhalványul.
- **Vezeték-színkód** (jelmagyarázattal): 5 V, VBAT, GND, analóg jel, digitális/1-Wire, I2C (Qwiic), UART.
- **Lábkiosztás-táblázat** (a 2.5 pont szerint) az ábra alatt: egy sorra mutatva kigyullad a hozzá tartozó vezeték, és fordítva.
- **„Mi van, ha kihagyom?” kapcsolók** a `USE_…` beállításokhoz (pl. `USE_DO 0`) – az alkatrész
  eltűnik, és megjelenik a magyarázat, hogy a firmware ezt hiba nélkül kezeli.

### 4.3 Szenzorok – „jelút” szimulátor szenzoronként

Minden szenzor ugyanazt a **közös jelút-sávot** kapja, így a diák látja az általános elvet
(a `03_szenzorok.md` bevezetője):

```
 fizikai mennyiség ─▶ szenzor ─▶ feszültség (V) ─▶ ADC (14 bit, 0–16383) ─▶ képlet ─▶ érték
   [csúszka]        [animáció]     [mutatós műszer]   [bináris szám]        [kiemelve]  [nagy szám]
```

A csúszka mozgatására minden lépés élőben frissül. Alatta rövid „Miért fontos?”, „Tipikus folyóvíz”
sáv (zölden a jó tartomány) és „Mire figyeljünk?” (karbantartás, korlátok).

| Szenzor | Bemenet (csúszkák) | Animáció | Számítás (a firmware-ből) | Extra |
|---|---|---|---|---|
| **DS18B20** | vízhőmérséklet −5…35 °C | hőmérő + a digitális 1-Wire bitfolyam „vonatként” fut a D4 vezetéken | nincs képlet, digitális (0,0625 °C lépés) | megmutatja, hogy a többi szenzor kompenzációja ebből jön |
| **pH** | pH 0–14, hőmérséklet | H⁺ ionok sűrűsége az üvegmembrán körül; feszültség ~59 mV/pH | `phFromVoltage`: kétpontos egyenes + Nernst hőkorrekció | **kalibráló mini-játék:** „mártsd” a szondát pH 7 és pH 4 pufferbe, a két pontra húzott egyenes kirajzolódik; a 6,86-os puffer hibájának bemutatása |
| **EC / TDS** | sótartalom (pl. „csipet só” gomb), hőmérséklet | ionok vándorolnak a két elektróda között, a polaritás váltakozik (AC) | `ecFromVoltage`: hőkompenzáció + harmadfokú görbe × K; TDS = EC × 0,5 | „desztillált víz / csapvíz / folyó / tengervíz” gombok; a mérési tartomány (≈2000 µS/cm) túllépése figyelmeztetést ad |
| **Zavarosság** | lebegő részecskék mennyisége, algás ablak, napfény be/ki | IR LED sugara a részecskéken szóródik, a vevőhöz kevesebb fény jut | `turbidityFromVoltage` (2,5–4,2 V közötti görbe) | a napfény kapcsolóval látszik, miért kell árnyékoló cső; „viszonyításra jó, nem abszolút” üzenet |
| **Oldott oxigén** *(opc.)* | hőmérséklet, oxigén telítettség | O₂ molekulák a membránon át, áram | `doFromVoltage`: egypontos kalibráció + telítési táblázat | 5 és 2 mg/l határvonal („halak stresszben”, „halpusztulás veszélye”); napszak kapcsoló (fotoszintézis nappal, légzés éjjel) |
| **BME280** | doboz páratartalma | szilikagél tasak elszíneződik, vízcsepp a tömítésnél | küszöb: > 80% → `SZIVARGAS` | link a 4.4 „Szivárgás” forgatókönyvre |
| **Akkufeszültség** | akku töltöttség 3,0–4,2 V | feszültségosztó két ellenállással, felezés | × `BATTERY_DIVIDER_RATIO` (2,00) | GSM/WiFi küszöbök (3,65/3,50 V ill. 3,50/3,30 V) színsávként |

**Kiegészítő modul – „Miért egyszerre csak egy szenzor kap tápot?”** (3.7 pont)
Egy kapcsoló: *„Mindhárom szonda egyszerre bekapcsolva”*. Bekapcsolva a pH kijelző zajosan ugrál,
és látszik az EC szonda váltakozó feszültsége „áthallatszani” a vízen. Kikapcsolva, illetve a
DFR0504 leválasztóval stabil. (Szemléltetés, nem valós mérésből – ezt az oldal jelzi.)

**Kiegészítő modul – oktatási szenzorok** (12. fejezet): egy „Drága vagy olcsó?” fül, ahol
ugyanaz a mennyiség a terepi és a barkács szenzorral is „mérhető” (NTC, csavaros EC-elektróda,
vöröskáposzta-színskála, LED+LDR zavarosság), a pontosság különbségével együtt.

### 4.4 Működés – a mérési ciklus lejátszása (az oldal fő attrakciója)

A `02_rendszerterv.md` 2.2 szekvenciadiagramja **időzítő-vezérelt animációként**, a 4.2-ben
már megismert belső ábrán:

```
 Idővonal:  0 s ──── 5 s ──────── 20 s ──────────────── 60 s ──── 75 s ─┐
            ébredés  akku-check   mérés (pH→EC→zav.)    hálózat+küldés  DONE → alvás 15 perc
```

**Egyszerre látható elemek**

1. **Belső ábra** – ami épp tápot kap, az kigyullad; az áram „csíkként” folyik a vezetékeken,
   a nem használt részek szürkék. Látszik, hogy a TPL5110 a teljes Arduinót lekapcsolja.
2. **Idővonal** lépésekkel, lejátszás / szünet / léptetés / sebesség (1×, 5×, 20×) gombokkal;
   az alvó 15 perc „átugorható” (gyorsítva pörgő óra).
3. **LED mátrix emuláció** (12×8 pont, mint az R4-en): vízcsepp – mérés, felfelé nyíl – küldés,
   pipa – siker, X – hiba, S – szerviz (`status.h` ikonjai).
4. **Soros monitor emuláció**: a firmware valódi kiírásai sorról sorra (banner, mért értékek,
   `>>> Adatküldés SIKERES`), monospace dobozban.
5. **Modem párbeszéd**: az AT parancsok és válaszaik (`05_kommunikacio.md` 5.6) buborékokban.
6. **Az elküldött üzenet**: a ThingSpeak URL a végén összeáll a szimulált értékekből,
   a mezők színkóddal a szenzorokhoz kötve; a hiányzó mező (pl. `field5`) áthúzva, magyarázattal.
7. **Áramfelvétel-mérő**: kis grafikon a ciklus alatt (mA az idő függvényében), alatta az
   összesített mWh – átvezet az Energia szakaszhoz.

**Forgatókönyv-választó** (a „mi lesz, ha…?” kérdésekhez, az állapotbitek táblázata alapján):

| Forgatókönyv | Mi történik az animációban? |
|---|---|
| Minden rendben | `status=OK`, pipa |
| Gyenge akku | mér és küld, `AKKU_GYENGE` |
| Kritikus akku | rögtön X, nem mér, nem küld – és elmagyarázzuk, miért nem látszik ez a ThingSpeaken |
| Szivárgás | `SZIVARGAS`, a doboz ábrán vízcsepp |
| Leesett a vízhőmérő | `VIZHOMERO_HIBA`, a pH/EC kompenzáció 25 °C-kal számol (`sensors.cpp`), a hőmérséklet mező kimarad |
| Nincs térerő | a modem nem regisztrál, időtúllépés, X; a következő ciklus újra próbálja |
| Bent maradt a szerviz jumper | `SZERVIZ_JUMPER` |
| WiFi mód (iskolai teszt) | modem helyett a beépített WiFi, rövidebb ciklus |

> A forgatókönyvek viselkedését a `vizerzekelo.ino` / `transport.cpp` / `sensors.cpp` alapján kell
> pontosan leírni; ahol bizonytalan, ott a kódot olvassuk, nem találgatunk.

### 4.5 Energia – napelem és akku szimulátor

A `tools/energia_kalkulator.py` logikájának JavaScript változata (azonos konstansokkal).

- **Bemenetek:** mérési időköz (5–60 perc), GSM / WiFi, napelem (5 / 6 / 10 W), akku (1–4 cella),
  hónap, „ködös napok száma egymás után”.
- **Kimenetek:**
  - kördiagram / sáv: egy ciklus energiája (Arduino 52%, modem 45%, szenzorok 3%) – rámutatva a magyarázat;
  - napi fogyasztás vs. napi termelés havonta (oszlopdiagram, decemberi „veszélyzóna” kiemelve);
  - **akku töltöttség napokra lebontva** (vonaldiagram): nappal tölt, éjjel merül, a ködös
    időszakban lefelé tart – mikor éri el az `AKKU_GYENGE`, majd a kritikus küszöböt?
- **„Miért kell a TPL5110?” összehasonlítás:** ugyanez a grafikon, ha az Arduino csak „alszik”
  (több tíz mA) – az akku néhány nap alatt lemerül.
- Jól látható „becslés” címke: *„Ha megépült a doboz, a mért értékeket írjuk be a kalkulátorba és ide is.”*
- A napelem–töltő párosítás (4.1.1) mint mini-kvíz: „Jó-e ez a panel ehhez a töltőhöz?” (Voc vs. max. bemenet).

### 4.6 Adatút – a folyóparttól a grafikonig

- Animált út: doboz → antenna → bázisállomás → internet → ThingSpeak → böngésző.
  Rámutatva: adatmennyiség (1–2 kB/üzenet, 3–6 MB/hó), miért HTTP és nem HTTPS, miért nincs időbélyeg (UTC!).
- **Technológia-összehasonlító** (WiFi, 2G, LTE Cat-1, LTE-M/NB-IoT, LoRaWAN) hatótáv/fogyasztás
  szerint egy kétdimenziós ábrán, a választott megoldás kiemelve, a 2G „lekapcsolás alatt” jelöléssel.
- **Élő adatok (opcionális, ha már működik a csatorna):** a nyilvános ThingSpeak csatorna JSON
  API-jából (`/channels/<ID>/feeds.json`) az utolsó napok grafikonja. A csatornaszám egy
  konfigurációs fájlban van. Hálózati hiba vagy hiányzó csatorna esetén **mintaadatokra** vált,
  és ezt kiírja. (Csak olvasási hozzáférés – a Write API kulcs soha nem kerül az oldalra.)
- Kapcsolódó adatelemzési feladatok a `11_oktatasi_segedlet.md` 11.6 pontjából, linkkel.

### 4.7 Szótár, források, „Építsd meg te is!”

- A `docs/szotar.md` fogalmai: az oldal szövegében szaggatott aláhúzás, rámutatva / koppintva buborék.
- Linkek a repó fejezeteihez, az alkatrészlistához és a beszerzési forrásokhoz, licenc.
- Biztonsági doboz (09. fejezet röviden): vízparton csak felnőttel, Li-ion és vegyszer csak felnőtt.

---

## 5. Fájlszerkezet

Ami **már elkészült** (✅), és ami a későbbi mérföldkövekben jön (⏳):

```
weboldal/
├── TERV.md                    ← ez a fájl
├── index.html                 ✅ az egész oldal váza, szakaszonként <section>
├── css/
│   ├── alap.css               ✅ színek (változók), tipográfia, világos/sötét téma
│   └── szakaszok.css          ✅ ábra, kártya, lejátszó, mobil nézet
└── js/
    ├── segedek.js             ✅ elem-készítő, számformázás, eseménybusz, közös állapot
    ├── main.js                ✅ téma, menü, kezdőlap csempéi, indítás
    ├── adatok/
    │   ├── konstansok.js      ✅ config.h-ból átvett számok (küszöbök, ADC, időzítések)
    │   ├── komponensek.js     ✅ alkatrész-kártyák + a belső ábra koordinátái + lábkiosztás
    │   ├── ciklus.js          ✅ a mérési ciklus lépései, soros kiírások, ThingSpeak mezők
    │   └── szotar.js          ⏳ szótár bejegyzések
    ├── fizika/                ⏳ kepletek.js (sensors.cpp), energia.js (energia_kalkulator.py)
    ├── komponensek/
    │   ├── abra.js            ✅ a belső ábra kirajzolása (Felépítés és Működés közös)
    │   ├── allomas.js         ✅ a külső nézet (parti állomás, vízszint csúszka)
    │   ├── ledmatrix.js       ✅ 12×8 LED mátrix, ikonok a status.cpp-ből
    │   └── jelut.js, grafikon.js, buborek.js   ⏳
    └── szakaszok/
        ├── felepites.js       ✅ kártyák, rétegszűrő, lábkiosztás, USE_DO kapcsoló
        ├── mukodes.js         ✅ ciklus-lejátszó (idővonal, soros monitor, üzenet)
        └── szenzorok.js, energia.js, adatut.js  ⏳
```

**Fontos ábra-szabály:** az ábrák elemei nem kézzel rajzolt SVG-fájlok, hanem a
`komponensek.js` adataiból készülnek. Minden alkatrész `data-kartya` és `data-reteg`, minden
vezeték `data-vezetek` attribútumot kap – a JavaScript ezekkel emel ki, szűr és animál.
Új alkatrész vagy vezeték = egy új sor az adatfájlban (koordinátákkal).

---

## 6. Adatmodell (példa)

```js
// js/adatok/komponensek.js
export const komponensek = {
  ph: {
    nev: "pH szenzor",
    tipus: "DFRobot Gravity analóg pH (V2) + ipari szonda",
    reteg: "szenzor",
    labak: [{ lab: "A0", jel: "analóg" }, { lab: "D5", jel: "táp kapcsolás" }],
    mireJo: "Megmutatja, mennyire savas vagy lúgos a víz.",
    miertEzt: "Tartós merítéshez ipari szonda kell, a labor szonda hetek alatt tönkremegy.",
    tipikus: { min: 7.0, max: 8.5, egyseg: "" },
    linkek: { leiras: "../docs/03_szenzorok.md#32-ph", bekotes: "../hardware/bekotes.md" },
    opcionalis: false,
  },
  // …
};
```

A mérési ciklust **állapotgép** írja le, adatként (lépés, időtartam, mi kap tápot, LED ikon,
soros kiírás, AT parancs), így új forgatókönyv hozzáadása csak egy új lista, nem új kód:

```js
{ lepes: "ph", ido_s: 5, tap: ["arduino", "ph", "modem"], ikon: "MEASURE",
  soros: "pH mérés: bemelegedés…", magyarazat: "Egyszerre csak egy szonda kap tápot." }
```

---

## 7. Megjelenés

- **Vizuális nyelv:** tiszta, „műszaki rajz” jellegű SVG, kevés szín. Víz: kék árnyalatok,
  energia: sárga/narancs, kommunikáció: lila, szenzorjelek: zöld; hibák: piros + ikon.
- **Mobil:** a belső ábra telefonon függőlegesre rendeződik; a kártyák alulról felcsúszó panelként
  jelennek meg; a csúszkák ujjal is jól foghatók (min. 44 px).
- **Kivetítő mód:** nagyobb betű, teljes képernyő, a menü elrejtve, a lépések a nyilakkal léptethetők.
- Betűtípus: rendszerbetű (nincs külső font), a kódhoz/soros monitorhoz monospace.

---

## 8. Minőségbiztosítás

| Mit? | Hogyan? |
|---|---|
| A képletek egyeznek a firmware-rel | `tesztek/kepletek.test.html`: ugyanazokra a bemenetekre ugyanazt adja-e, mint a `sensors.cpp` (a referenciaértékeket egyszer a soros monitorról vagy a C kód kézi kiszámolásával vesszük) |
| A konstansok nem avulnak el | kis Python szkript (`tools/weboldal_konstans_ellenorzes.py`), ami a `config.h` `#define`-jait összeveti a `konstansok.js`-sel; a CHANGELOG-ba is bekerül, ha változik |
| Az energia kalkulátor egyezik | ugyanazokkal a paraméterekkel a `.py` és a `.js` kimenete egyezzen (a 4.2 táblázat értékei) |
| Böngészők | Chrome, Firefox, Safari (iPad!), Edge; egy régebbi iskolai gépen is kipróbálni |
| Akadálymentesség | billentyűzetes bejárás, képernyőolvasó-címkék az SVG elemeken (`<title>`, `aria-label`), kontraszt-ellenőrzés |
| Tartalom | a szakmai szövegeket egy tanár, az érthetőséget 2–3 diák nézze át (ők a célközönség!) |

---

## 9. Ütemezés (mérföldkövek)

| # | Mérföldkő | Tartalom | Becsült munka |
|---|---|---|---|
| M1 | **Váz** | `index.html`, menü, témák, kezdőlap statikus ábrával, GitHub Pages beállítás | 1–2 nap |
| M2 | **Felépítés** | `doboz.svg` + `allomas.svg`, alkatrész-kártyák, rétegszűrő, lábkiosztás-kiemelés | 3–4 nap |
| M3 | **Szenzorok** | közös jelút-komponens, `kepletek.js` + tesztek, a 7 szenzor szimulátora | 4–5 nap |
| M4 | **Működés** | ciklus-állapotgép, idővonal-lejátszó, LED mátrix, soros monitor, URL-összeállítás, forgatókönyvek | 4–5 nap |
| M5 | **Energia + Adatút** | energia szimulátor, technológia-összehasonlító, élő/minta ThingSpeak grafikon | 3 nap |
| M6 | **Csiszolás** | szótár-buborékok, mobil, kivetítő mód, akadálymentesség, diák-teszt, javítások | 2–3 nap |

**Legkisebb bemutatható változat (MVP) = M1 + M2 + M4 egyszerűsítve** (forgatókönyvek nélkül) –
ez már lefedi a két fő kérést: a felépítést és a vizualizált működést. **✅ Elkészült.**
Az M4-ből még hátravan: forgatókönyv-választó, WiFi mód, áramfelvétel-grafikon.

Az M3–M4 részei kiválóan alkalmasak **diák-feladatnak** is (pl. egy szenzor jelút-szimulátorát
egy csapat készíti el a közös komponens felhasználásával) – ez kapcsolódhat az oktatási segédlet
informatika-óráihoz.

---

## 10. Továbbfejlesztési ötletek (nem része az első változatnak)

- 3D modell (Three.js) a dobozról, forgatható, „szétszedhető”.
- Valódi fotók az összeszerelés lépéseiről, a `07_osszeszereles.md`-vel összekötve.
- Kvíz / kihívás mód („Állítsd be úgy a mérési időközt, hogy a doboz kibírjon 14 ködös napot!”).
- Több doboz (több folyó, több iskola) térképen.
- Angol nyelvű változat (nemzetközi iskolai együttműködéshez).

---

## 11. Nyitott kérdések (döntést igényel)

1. **Hol fusson az oldal?** GitHub Pages a repóból (javasolt), vagy az iskola saját tárhelyén?
2. **Van-e már ThingSpeak csatorna?** Ha nincs, az első változat csak mintaadatokkal dolgozik.
3. **Ki a fő felhasználó az első körben** – tanórai kivetítés vagy otthoni böngészés? Ettől függ, a kivetítő mód vagy a mobil nézet kerül előbbre.
4. **Diákok részt vesznek-e a fejlesztésben?** Ha igen, a fájlszerkezetet és a kódot még
   egyszerűbbre, bőven kommentezettre érdemes venni (mint a firmware-nél).
5. **Képek:** lesznek-e fotók a valódi alkatrészekről (a `docs/kepek/` jelenleg üres), vagy maradunk a rajzolt ábráknál?
