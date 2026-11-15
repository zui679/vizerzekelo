# 3. Szenzorok

Minden szenzornál leírjuk: **mit mér, miért fontos, hogyan működik, mire figyeljünk.**
A tipikus értékek tájékoztató jellegűek – egy adott folyóra a saját méréseink adják a
„normális” tartományt.

> Ez a fejezet a **terepi** szenzorokról szól. Tanuláshoz és kísérletezéshez olcsóbb
> alternatívák: [12_oktatasi_szenzorok.md](12_oktatasi_szenzorok.md).

> **Általános elv:** minden szenzor végül egy **feszültséget** ad (0–5 V), amit az Arduino
> analóg-digitális átalakítója (ADC) számmá alakít. Az UNO R4 ADC-je 14 bites: a 0–5 V-ot
> 16 384 lépésre osztja, egy lépés kb. 0,3 mV. Ebből a számból a programban lévő képletek
> számolják ki a valódi értéket (pH, µS/cm, NTU…).

---

## 3.1 Vízhőmérséklet – DS18B20 (vízálló kivitel)

**Mit mér?** A víz hőmérsékletét °C-ban.

**Miért fontos?**
- A hőmérséklet meghatározza, mennyi oxigén oldódhat a vízben (hideg vízben több).
- A halak és vízi élőlények hőmérséklet-érzékenyek; a nyári felmelegedés stresszt okoz.
- **A többi szenzor kompenzációjához is kell:** a pH és a vezetőképesség mérése függ a hőmérséklettől.

**Hogyan működik?** A rozsdamentes acélcsőben egy digitális hőmérő chip van. A hőmérséklettől
függő félvezető-tulajdonságot belül számmá alakítja, és egyetlen adatvezetéken („1-Wire”)
küldi el. Pontosság: ±0,5 °C (−10…+85 °C), felbontás: 0,0625 °C.

**Bekötés:** piros = 5 V, fekete = GND, sárga = D4 + **4,7 kΩ felhúzó ellenállás** az 5 V-ra.

**Tipikus folyóvíz:** télen 0–5 °C, nyáron 18–26 °C.

**Karbantartás:** szinte nincs; a lerakódást néha le kell törölni.

---

## 3.2 pH – DFRobot Gravity analóg pH szenzor (V2) + ipari szonda

**Mit mér?** A víz savasságát vagy lúgosságát (0–14 skála; 7 = semleges).

**Miért fontos?** A legtöbb vízi élőlény a **6,5–8,5** tartományt kedveli. Ha a pH hirtelen
megváltozik, az szennyezésre utalhat (pl. ipari szennyvíz, műtrágya bemosódás). Napközben a
vízinövények fotoszintézise is emeli a pH-t – ezt a napi ingadozást is látni fogjuk!

**Hogyan működik?** A pH szonda üvegmembránja és a víz között a hidrogénionok koncentrációjától
függő, nagyon kicsi feszültség (pH egységenként kb. 59 mV 25 °C-on) keletkezik. Ezt a jelet a
kis erősítő panel felerősíti és eltolja, hogy az Arduino mérni tudja (pH 7 ≈ 1,5 V).

**A számítás (sensors.cpp → `phFromVoltage`):**
Két pontra kalibrálunk (pH 7,00 és pH 4,00 puffer), és a két pont közé egyenest húzunk.
A szonda érzékenysége az abszolút hőmérséklettel (K) arányos (Nernst-egyenlet), ezért:

```
meredekség(T) = meredekség(kalibráláskor) × (T + 273,15) / (T_kal + 273,15)
pH = 7 + (U − U_pH7) / meredekség(T)
```

**Fontos – szondaválasztás:** a „labor” (sima) pH szondák nem bírják a folyamatos vízben
tartást, néhány hét alatt tönkremennek. **Tartós merítéshez ipari kivitelű szonda kell**
(pl. DFRobot SEN0169-V2 vagy bármilyen BNC csatlakozós ipari pH elektróda).

**Korlátok, figyelmeztetések:**
- 2–4 hetente kalibrálni kell; a szonda élettartama kb. 1–2 év.
- A szonda **nem száradhat ki**! Szállításkor/tároláskor a védősapkába 3 mol/l KCl oldat kell.
- Nagyon érzékeny az elektromos zavarokra → ezért kap egyedül tápot (lásd 3.7).

**Tipikus folyóvíz:** 7,0–8,5 (a mészkő/dolomit vízgyűjtőjű folyók inkább lúgosak).

---

## 3.3 Vezetőképesség (EC) és TDS – DFRobot Gravity TDS (SEN0244)

**Mit mér?** Mennyire vezeti a víz az áramot (EC, µS/cm). Ebből becsüljük az oldott anyagok
mennyiségét (TDS, mg/l ≈ EC × 0,5).

**Miért fontos?** A tiszta (desztillált) víz szinte szigetel. Minél több só, ásványi anyag van
benne, annál jobban vezet. Egy hirtelen EC-ugrás szennyezésre utalhat (pl. szennyvíz,
útsózás télen), egy hirtelen csökkenés pedig nagy esőre (a csapadékvíz „felhígítja” a folyót).

**Hogyan működik?** Két fémelektróda között váltakozó feszültséget kapcsolunk (hogy ne
bontsa a vizet, és ne rakódjon le semmi), és mérjük, mennyi áram folyik át. A panel ezt
feszültséggé alakítja.

**A számítás (`ecFromVoltage`):** a gyártó által megadott harmadfokú görbe, 25 °C-ra kompenzálva
(a víz vezetése kb. 2%-kal nő fokonként):

```
U_komp = U / (1 + 0,02 × (T − 25))
EC = (133,42·U³ − 255,86·U² + 857,39·U) × K        [µS/cm]
TDS = EC × 0,5                                      [mg/l]
```

A **K** értéket egy ismert kalibráló oldattal (1413 µS/cm) állítjuk be.

**Korlátok:** a szenzor mérési tartománya kb. 0–2000 µS/cm (0–1000 ppm TDS), ez folyóvízhez
elég. A szonda nem ipari kivitel – tartós merítésnél figyelni kell a korrózióra; ha gyorsan
romlik, érdemes ipari EC szondára (pl. DFRobot DFR0300 K=1) váltani.

**Tipikus folyóvíz:** 200–800 µS/cm.

---

## 3.4 Zavarosság – DFRobot Gravity zavarosság szenzor (SEN0189)

**Mit mér?** Mennyire „homályos” a víz – vagyis mennyi lebegő részecske (iszap, agyag, alga) van
benne. Mértékegység: NTU (nefelometrikus zavarossági egység).

**Miért fontos?** Esőzés, árhullám, partomlás, kotrás után megnő a zavarosság. A zavaros víz
kevesebb fényt enged a mélybe (kevesebb fotoszintézis), és az iszap betemetheti a halak ívóhelyeit.

**Hogyan működik?** A szenzor egyik oldalán egy infravörös LED világít, a másik oldalán egy
fényérzékelő méri, mennyi fény jut át a vízen. Minél zavarosabb a víz, annál kevesebb fény
érkezik → annál kisebb a kimenő feszültség (tiszta víz ≈ 4,2 V).

**A számítás (`turbidityFromVoltage`):** a gyártó közelítő görbéje 2,5–4,2 V között:

```
NTU = −1120,4·U² + 5742,3·U − 4352,9
```

Kalibrációként tiszta vízben megmérjük a feszültséget, és ezzel „normalizálunk”.

**⚠️ Fontos korlátok:**
- A szenzor **felső része NEM vízálló** – csak a két „fül” közötti mérőrész mehet a vízbe.
  A felső részt és a kábel kivezetését **műgyantával / melegragasztóval ki kell önteni** (felnőtt feladata).
- A **napfény zavarja** – a szenzort árnyékolt, sötét csőben kell elhelyezni.
- Közelítő, „hobbi” pontosságú. Az értékeket **viszonyításra** használjuk („tegnaphoz képest
  hatszor zavarosabb”), nem abszolút értékként.
- Az algásodás, lerakódás a mérőablakon gyorsan „zavarosnak” mutatja a vizet → hetente tisztítani.

**Tipikus folyóvíz:** tiszta időben 5–50 NTU, árhullámkor több száz, akár 1000+ NTU.

---

## 3.5 Oldott oxigén (DO) – DFRobot Gravity DO szenzor (SEN0237) – *opcionális*

**Mit mér?** Mennyi oxigén van oldva a vízben (mg/l).

**Miért fontos?** Ez az egyik **legfontosabb** vízminőségi jellemző: a halak és vízi rovarok ezt
lélegzik. 5 mg/l alatt a halak stresszbe kerülnek, 2 mg/l alatt halpusztulás is előfordulhat.
Szerves szennyezés (pl. szennyvíz) bomlása elhasználja az oxigént. Nyári melegben és éjjel
(nincs fotoszintézis) a legalacsonyabb.

**Hogyan működik?** Galvanikus elv: a membránon átdiffundáló oxigén a szonda belsejében egy
kémiai reakcióban áramot termel – minél több az oxigén, annál nagyobb az áram (feszültség).

**A számítás (`doFromVoltage`):** egypontos kalibráció telített állapotban, és egy táblázat,
ami megadja, hogy adott hőmérsékleten mennyi a telítési oxigéntartalom (0 °C: 14,5 mg/l;
20 °C: 9,1 mg/l; 30 °C: 7,6 mg/l).

**Miért opcionális?**
- Drága (a szonda kb. 60–80 ezer Ft).
- **Karbantartásigényes:** a membránt 1–2 havonta cserélni, az elektrolitot utántölteni kell.
- **Az elektrolit lúgos (NaOH), maró hatású – csak felnőtt kezelheti, védőkesztyűben és védőszemüvegben!**
- A galvanikus szonda folyamatos vízáramlást igényel a pontos méréshez (folyóban ez adott).

Bekapcsolása: `config.h` → `USE_DO 1`.

**Tipikus folyóvíz:** 7–12 mg/l (egészséges), < 5 mg/l problémás.

---

## 3.6 A doboz saját szenzorai

### BME280 – doboz belső hőmérséklet és páratartalom
A Qwiic aljzatba dugható, forrasztás nélkül. **Feladata a beázás korai jelzése:** egy jól
lezárt, szilikagéllel szárított dobozban a páratartalom 20–50% körül van. Ha 80% fölé emelkedik,
valahol víz jut be → `SZIVARGAS` állapotot küldünk, még mielőtt az elektronika tönkremenne.

### Akkufeszültség – feszültségosztó
Két egyforma ellenállás (pl. 470 kΩ + 470 kΩ) felezi az akku feszültségét (max. 4,2 V → 2,1 V),
amit az A3 láb mér. Nagy ellenállásokat használunk, hogy az osztó (ami folyamatosan az akkun
lóg) szinte ne fogyasszon; az A3 és GND közé tegyünk egy 100 nF-os kondenzátort, hogy a mérés
stabil legyen.

---

## 3.7 Szenzorok egymásra hatása

A szondák ugyanabban a vízben vannak, a víz pedig vezető. Ezért:
1. **Egyszerre csak egy analóg szenzor kap tápot** (a firmware így működik, ha a tápkapcsolók be vannak kötve).
2. A szondák között legyen **legalább 5–10 cm** távolság a tartócsőben.
3. A modem adása zavarhatja a pH mérést → ha zajos a pH, `MODEM_EARLY_START 0`.
4. A terepi dobozban a TDS/EC szenzor **galvanikus leválasztó modulon** (DFRobot Gravity Analog
   Signal Isolator, DFR0504) át csatlakozik. Ez a gyártó által ajánlott megoldás, és folyamatos
   mérésnél megbízhatóbb, mint önmagában a táp váltogatása. Bekötés: [bekotes.md](../hardware/bekotes.md) 5. pont.
5. Az összeszereléskor **zavarás-próbát** végzünk ([07_osszeszereles.md](07_osszeszereles.md)) –
   csak a mérés mutatja meg, hogy a szondák tényleg nem zavarják egymást.

## 3.8 Mit NEM mérünk – és miért?

| Paraméter | Miért nem? | Lehetőség |
|---|---|---|
| Nitrát, ammónium | ionszelektív elektródák drágák (50–150 ezer Ft), gyakran kell kalibrálni | továbbfejlesztés |
| Foszfát | csak kémiai (reagenses) módszerrel mérhető megbízhatóan | kézi tesztkészlet terepbejáráskor |
| Nehézfémek | laboratóriumi műszer kell | – |
| Baktériumok (E. coli) | laboratóriumi tenyésztés kell | – |
| Klorofill / algák | fluoreszcens szenzor, drága | továbbfejlesztés |
| Vízszint, áramlás | nem minőségi jellemző, de érdekes | ultrahangos / nyomásszenzor – továbbfejlesztés |

Részletek: [10_tovabbfejlesztes.md](10_tovabbfejlesztes.md).

## 3.9 Összefoglaló táblázat

| Szenzor | Jel | Láb | Pontosság (kb.) | Kalibrálás | Karbantartás |
|---|---|---|---|---|---|
| DS18B20 | digitális 1-Wire | D4 | ±0,5 °C | nem kell | ritkán törölni |
| pH (ipari szonda) | analóg | A0 | ±0,1 pH (frissen kalibrálva) | 2 pont, 2–4 hetente | tisztítás, KCl tárolás |
| TDS/EC | analóg | A1 | ±10% | 1 pont, havonta | tisztítás |
| Zavarosság | analóg | A2 | közelítő | tiszta víz, havonta | hetente tisztítás! |
| Oldott oxigén | analóg | A4 | ±0,3 mg/l | 1 pont, 2 hetente | membrán, elektrolit |
| BME280 | I2C (Qwiic) | Wire1 | ±3% RH | nem kell | – |
| Akkufeszültség | analóg | A3 | ±0,05 V | multiméterrel ellenőrizni | – |
