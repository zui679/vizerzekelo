# 12. Olcsó szenzorok tanuláshoz, kísérletezéshez, bemutatáshoz

A terepi doboz szenzorai drágák és érzékenyek: egy ipari pH szonda kb. 30 ezer Ft, és
kiszáradva vagy leejtve tönkremegy. **Tanuláshoz nincs szükség ipari minőségre.** Elég,
ha egy szenzor megmutatja a mérés elvét, néhány órát vagy hetet kibír, és nem nagy baj,
ha egy diák elrontja.

Ebben a fejezetben minden mért jellemzőhöz adunk egy vagy több **olcsó alternatívát**.
Ezek kiválóak a foglalkozásokra, és megkímélik a drága eszközöket.

> **Szabály:** az oktatási szenzorok csak **pohárban, vödörben, akváriumban** dolgoznak.
> **A folyóba nem tesszük őket tartósan**: gyorsan tönkremennek, és a pontosságuk sem
> elég a valódi adatgyűjtéshez.

Jelölések az „Illeszkedés” oszlopban:
- 🔌 **beépíthető**: ugyanúgy köthető be, mint a terepi szenzor, a fő program kalibrálás után kezeli.
- 🧪 **saját tesztprogram**: más az elve, külön tesztprogram tartozik hozzá a `firmware/tesztek/` mappában.
- ✋ **elektronika nélküli**: kézi módszer, összehasonlításra és ellenőrzésre.

## 12.1 Áttekintés

| Mit mér? | Terepi szenzor | Oktatási alternatíva | Kb. ár | Illeszkedés | Program |
|---|---|---|---|---|---|
| **Hőmérséklet** | DS18B20 vízálló | NTC termisztor szonda (10 kΩ) | 300–800 Ft | 🧪 | [07](../firmware/tesztek/07_ntc_homero/) |
| **pH** | DFRobot pH V2 + ipari szonda | **PH-4502C** panel + E-201-C szonda | 6–10 e Ft | 🔌 | fő program / [03](../firmware/tesztek/03_analog_szenzorok/) |
| | | DFRobot SEN0161-V2 (labor szonda) | ~15 e Ft | 🔌 | fő program / 03 |
| | | **Vöröskáposzta + színérzékelő** (TCS34725) | 1,5–4 e Ft | 🧪 | [10](../firmware/tesztek/10_kaposztas_ph/) |
| | | pH tesztcsík, univerzális indikátor | 1–2 e Ft | ✋ | – |
| **Vezetőképesség (EC/TDS)** | DFRobot TDS (SEN0244) | TDS szenzor „klón” (pl. CQRobot, Keyestudio) | 2–3 e Ft | 🔌 | fő program / 03 |
| | | **Barkács elektróda:** 2 rozsdamentes csavar | ~100 Ft | 🧪 | [08](../firmware/tesztek/08_diy_vezetokepesseg/) |
| | | Rezisztív talajnedvesség-mérő „villa” | 300–600 Ft | 🧪 | 08 |
| | | Kézi TDS mérő „toll” | 2–4 e Ft | ✋ | – |
| **Zavarosság** | DFRobot SEN0189 | SEN0189 klón | 2,5–4 e Ft | 🔌 | fő program / 03 |
| | | **LED + fényérzékelő (LDR)** | 100–300 Ft | 🧪 | [09](../firmware/tesztek/09_diy_zavarossag/) |
| | | Secchi-korong | házi készítés | ✋ | – |
| **Oldott oxigén** | DFRobot SEN0237 | *nincs olcsó elektronikus változat* | – | ✋ | lásd 12.6 |
| | | Akvarisztikai O₂ csepp-teszt | 3–5 e Ft | ✋ | – |
| **Doboz klíma** | BME280 (Qwiic) | GY-BME280 olcsó panel / DHT22 / DHT11 | 0,5–2 e Ft | 🔌 / 🧪 | [04](../firmware/tesztek/04_bme280_doboz/) |
| **Vízszint** *(bónusz)* | – | HC-SR04 ultrahangos távolságmérő | 0,5–1 e Ft | 🧪 | [11](../firmware/tesztek/11_vizszint_ultrahang/) |
| **Szivárgás** *(bónusz)* | – | „Water level sensor” vízérzékelő panel | 200–500 Ft | 🧪 | 03 |

*Az árak tájékoztató becslések (2026), hobbi webáruházak és távol-keleti webshopok alapján.*

---

## 12.2 Hőmérséklet: NTC termisztor

**Mi ez?** Egy apró ellenállás, aminek az értéke melegben **csökken**. Kapható vízálló, fém
vagy epoxi fejű szondaként (gyakran „10K NTC B3950 waterproof probe” néven).

**Bekötés:** egy 10 kΩ-os fix ellenállással feszültségosztót építünk, a középpontja az A0
lábra megy. A részletek a tesztprogram elején vannak.

**Mit tanít?**
- A **feszültségosztót** (fizika: Ohm-törvény).
- Hogy a valóság **nem mindig lineáris**: az ellenállás–hőmérséklet grafikon görbe, ezért
  kell a „béta” képlet (matematika: logaritmus, haladóknak).
- **Összehasonlítást:** ugyanabban a pohárban az NTC és a DS18B20 mennyire mér egyformán?

**Korlátok:** a pontosság kb. ±1 °C, és függ a fix ellenállás pontosságától és az 5 V-os
táp ingadozásától. A szonda szigetelése hosszabb vízben tartásnál átázhat.

---

## 12.3 pH: négy olcsó lehetőség

### a) PH-4502C panel + E-201-C szonda 🔌
A legolcsóbb „igazi” elektronikus pH mérő készlet, nagyon elterjedt a hobbisták körében.

- **Bekötés:** `V+` → 5 V, a két `G` → GND, **`Po` → A0** (ez a pH jel). A `To` (hőmérséklet)
  és a `Do` (határérték-kapcsoló) kimenetet nem használjuk.
- **Beállítás (felnőtt):** a panelen két trimmer potenciométer van. Az egyik az **eltolás
  (offset)**, a másik a `Do` határértéke; hogy melyik melyik, azt a termék leírása mondja
  meg. Ha a BNC csatlakozó belső tüskéjét rövidre zárod a külső gyűrűvel (ez pH 7-nek felel
  meg), az offset trimmerrel állítsd a `Po` kimenetet **kb. 2,5 V-ra**.
- **Fő programmal:** a `config.h` fájlban állítsd be: `#define PH_BOARD PH_BOARD_PH4502C`, majd
  kalibrálj a szokásos módon (szerviz menü 2. és 3. pont). A program kalibrálás után
  bármelyik panellel jól számol.
- **Korlátok:** a mellékelt E-201-C labor szonda **nem bírja a tartós vízben tartást**, és
  **soha nem száradhat ki**: két mérés között a KCl oldatos védősapkában kell lennie.
  Élettartama gondos kezeléssel kb. fél–egy év. A panel minősége darabonként változó.

### b) DFRobot SEN0161-V2 (labor szondával) 🔌
Ugyanaz az erősítő panel, mint a terepi készletben, csak olcsóbb labor szondával.
**Előnye:** ha a terepi Pro Kit (SEN0169-V2) mellé ezt is megveszitek, a diákok a tanuló
szondával kísérleteznek, a drága ipari szonda pedig a dobozban marad. A két panel
felcserélhető, így az egyik tartaléknak is jó.

### c) Vöröskáposzta + TCS34725 színérzékelő 🧪 – a legjobb „wow” élmény!
A vöröskáposzta levében lévő festékanyagok (antocianinok) a pH-tól függően változtatják
a színüket:

| pH | 1–2 | 3–4 | 5–6 | 7 | 8 | 9–10 | 11–12 |
|---|---|---|---|---|---|---|---|
| Szín | piros | rózsaszín | lila | kékes-lila | kék | zöldeskék / zöld | sárgászöld |

*(A pontos színek a káposztától és a hígítástól függenek, ezért a táblázat csak tájékoztató.)*

A TCS34725 színérzékelő megméri a színt, a program pedig a **színárnyalatból** (hue) becsli a pH-t.

**Mit tanít?**
- **Kémia:** mi az indikátor, és miért változik a színe.
- **Informatika:** hogyan írja le a számítógép a színeket (RGB és színárnyalat).
- **Matematika:** a diákok **maguk készítik el a kalibrációs táblázatot** ismert oldatokkal
  (ecet, csapvíz, szódabikarbóna, szappanos víz), a program pedig a pontok között
  **lineáris interpolációval** számol.

**Korlátok:** pontossága kb. ±1 pH. Csak színtelen, átlátszó mintán működik. A
káposztalé néhány nap alatt megromlik, a mérésnél pedig a szoba fényét ki kell zárni.

### d) pH tesztcsík, univerzális indikátorpapír ✋
Olcsó és gyors **összehasonlító** módszer: a diákok ellenőrizhetik vele az elektronikus
mérést, és terepbejáráskor is jól jön.

---

## 12.4 Vezetőképesség (EC/TDS)

### a) TDS szenzor klónok 🔌
Több gyártó (pl. CQRobot, Keyestudio) is árul a DFRobot TDS szenzorral szinte azonos
felépítésű panelt. Általában ugyanaz a kapcsolás és a képlet, így bekötés és EC kalibrálás
után a fő programmal is mérnek. *(Vásárlás előtt érdemes a leírásban ellenőrizni.)*

### b) Barkács elektróda két rozsdamentes csavarból 🧪 – a legtanulságosabb!
**Elkészítés:** egy műanyag kupakba (vagy hungarocell darabba) két rozsdamentes M3/M4
csavart teszünk egymástól kb. 1 cm-re, és a fejükre vezetéket forrasztunk vagy csavarunk.

**Elv:** a víz ellenállását mérjük egy soros ellenálláson át (feszültségosztó). A program
**oda-vissza váltogatja az áram irányát**, hogy a víz ne bomoljon (elektrolízis), és az
elektródákon ne keletkezzen buborék vagy lerakódás. A drága szenzorok is így működnek,
csak gyárilag.

**Mit tanít?**
- **Fizika:** Ohm-törvény, vezetés és ellenállás (G = 1/R), és miért kell váltakozó áram.
- **Kémia:** ionok a vízben, elektrolízis.
- **Kísérletezés:** mi történik, ha közelebb vagy távolabb tesszük az elektródákat? Ebből
  érthető meg, mi a **cellaállandó** (ezért kell kalibrálni).

**Fontos:** **horganyzott szöget, rezet, alumíniumot ne használjunk**, mert ezekből fém
oldódik a vízbe, és gyorsan korrodálnak. Csak rozsdamentes acél vagy grafit (ceruzabél)
való erre.

### c) Rezisztív talajnedvesség-mérő „villa” 🧪
A boltban kapható kétágú, fémbevonatos nyákvilla (pl. „YL-69”) ugyanezzel a programmal
használható elektródaként. Néhány óra–nap alatt korrodál, de demonstrációhoz tökéletes.
A hozzá adott kis panelt nem használjuk, a villát közvetlenül kötjük be.

### d) Kézi TDS mérő „toll” ✋
Olcsó kézi műszer, **referenciának** kiváló: a diákok összevethetik vele a saját építésű
mérőjük eredményét.

---

## 12.5 Zavarosság

### a) SEN0189 klónok 🔌
A terepi szenzor olcsóbb másolatai. Kísérletezéshez teljesen jók, és itt a felső
részüket sem kell kiönteni, mert úgysem kerülnek tartósan vízbe.

### b) LED + fényérzékelő ellenállás (LDR) 🧪
**Elkészítés:** egy átlátszó pohár vagy kémcső egyik oldalára LED-et, a szemközti oldalára
LDR-t (fényérzékelő ellenállást) rögzítünk, például gyurmával vagy egy kivágott kartondobozban.
Az egészet letakarjuk, hogy a szoba fénye ne zavarjon.

**Elv:** minél zavarosabb a víz, annál kevesebb fény jut át rajta. A program **két
mérést végez**, egyet kikapcsolt és egyet bekapcsolt LED-del, és a kettő különbségét veszi.
Így kiszűri a háttérfényt (ez a „differenciális mérés”).

**Mit tanít?**
- **Fizika:** fényelnyelés és fényszórás (Beer–Lambert-törvény), különböző színű LED-ekkel kipróbálva.
- **Méréstechnika:** zavaró hatások kiszűrése a mérésből.
- **Kísérletezés:** tejcseppekkel egyszerűen „gyártható” zavarosság.

**Megjegyzés:** az LDR-ek többsége kadmiumot tartalmaz. Kézbe venni nem veszélyes, de
elektronikai hulladékként kell leadni. Kadmiummentes alternatíva a fototranzisztor
(pl. TEMT6000 modul), vagy egy digitális fénymérő (BH1750). Ezekkel a program kis módosítással működik.

### c) Secchi-korong ✋
A vízminőség-mérés klasszikus, több mint 150 éves eszköze. Egy kb. 20 cm átmérőjű,
negyedenként fekete-fehérre festett korongot kötélen lassan leengedünk a vízbe. Az a
mélység, ahol a korong eltűnik a szem elől, a **látótávolság**. Elkészítése egy órás
technikafoglalkozás (régi tányér vagy lemez, festék, nehezék, centiméteres jelölésű kötél).
**Csak felnőtt használhatja a vízparton, stégről vagy hídról!**

---

## 12.6 Oldott oxigén: nincs olcsó elektronikus megoldás

Az oldott oxigén mérésére nincs megbízható, olcsó hobbi szenzor. Oktatási alternatívák:

1. **Akvarisztikai O₂ csepp-teszt** ✋: kémiai reagensek, színskála. A reagensek egy része
   irritáló, ezért **felnőtt kezelje**, a diákok olvassák le a színt.
2. **Számolt telítettség** ✋: a [03_szenzorok.md](03_szenzorok.md) 3.5 pontjában lévő
   táblázatból a vízhőmérséklet alapján kiszámolható, **legfeljebb** mennyi oxigén lehet a
   vízben. Jó matekfeladat: „Nyáron 24 °C, télen 4 °C a víz. Mennyivel több oxigén fér el
   télen?”
3. **Biológiai kísérlet** 🌱: tegyünk egy szál átokhínárt (akváriumi növény) egy pohár vízbe,
   és világítsuk meg erős lámpával. Számoljuk a felszálló oxigénbuborékokat percenként
   különböző fényerőnél vagy távolságnál. Ebből látszik, honnan jön a folyó oxigénje nappal,
   és miért fogy el éjjel.

---

## 12.7 Doboz klíma és bónusz szenzorok

| Szenzor | Megjegyzés |
|---|---|
| **GY-BME280** (olcsó panel) 🔌 | Ugyanaz a chip, csak Qwiic csatlakozó nélkül: négy vezetékkel kell bekötni (VIN, GND, SDA, SCL). Az **5 V-os Arduino SDA/SCL lábakra** csak olyan panelt köss, amelyen van feszültségszabályzó és szintillesztő. A **3,3 V-os változatot** a Qwiic aljzatba kell kötni (Qwiic–tüske átalakító kábellel). |
| **DHT22 / DHT11** 🧪 | Nagyon olcsó levegő hőmérséklet- és páratartalom-mérő, saját könyvtárral (pl. „DHT sensor library”). A DHT11 pontatlan, a DHT22 elfogadható. |
| **HC-SR04** ultrahangos távolságmérő 🧪 | Vízszintmérés felülről, vödör fölött. Tanítja a hangsebességet, a visszhangot (mint a denevéreknél) és a hőmérséklet hatását. A vízálló **JSN-SR04T** változat terepen is használható, és **ugyanaz a program** működik vele. Ez az árvízfigyelés első lépése lehet (lásd [10_tovabbfejlesztes.md](10_tovabbfejlesztes.md)). |
| **„Water level sensor”** panel 🧪 | Vezetősávos piros nyák, ami analóg jelet ad, ha víz éri. Gyorsan korrodál, de a dobozba téve kiváló **szivárgásjelző** demó. A 03-as tesztprogrammal kiolvasható. |
| **BH1750** fénymérő | Digitális (I2C), luxban mér. Jól jön a fotoszintézis-kísérletekhez és a napelemmérésekhez. |

---

## 12.8 Ajánlott oktatási készlet (csoportonként)

Négyfős csoportonként egy készlet, a drágább pH panelből elég egy az egész osztálynak.

| Alkatrész | Db / csoport | Kb. ár |
|---|---|---|
| NTC vízálló szonda 10 kΩ + 10 kΩ ellenállás | 1 | 600 |
| DS18B20 vízálló (összehasonlításhoz) | 1 | 1 200 |
| TDS szenzor klón | 1 | 2 500 |
| Rozsdamentes csavarok, kupak, 10 kΩ ellenállás | 1 | 200 |
| SEN0189 klón **vagy** LED + LDR + 220 Ω + 10 kΩ | 1 | 300–3 500 |
| TCS34725 színérzékelő | 1 | 2 500 |
| HC-SR04 | 1 | 700 |
| „Water level sensor” panel | 1 | 300 |
| Próbapanel, jumper kábelek | 1 | 2 000 |
| **Összesen / csoport** | | **≈ 10 000–14 000 Ft** |
| *Osztályonként közös:* PH-4502C készlet, pH tesztcsík, kézi TDS toll, pH 4/7 puffer, desztillált víz | 1 | ≈ 15 000 Ft |

Mivel az alkatrészek olcsók, nem baj, ha valami tönkremegy, így a diákok bátrabban kísérleteznek.
Érdemes a hibákból is tanulni: egy fordítva bekötött LED vagy egy ellenállás nélkül bekötött
LDR is jó tananyag.

---

## 12.9 Összehasonlító kísérlet: olcsó kontra drága

Az egyik legtanulságosabb foglalkozás, amikor **ugyanazt a vizet** több módszerrel is megmérjük:

| Minta | Tesztcsík pH | Káposzta pH | PH-4502C | DFRobot (ipari) | Barkács EC | TDS klón | TDS toll |
|---|---|---|---|---|---|---|---|
| csapvíz | | | | | | | |
| ásványvíz | | | | | | | |
| esővíz | | | | | | | |
| patak / folyó (felnőtt hozza!) | | | | | | | |

**Megbeszélendő kérdések:**
- Melyik módszer mennyire ért egyet a többivel? Melyiknek higgyünk, és miért?
- Mi a különbség a **pontosság** (mennyire közel van a valódi értékhez) és a **precizitás**
  (mennyire egyforma, ha többször mérünk) között? Mérjétek meg ugyanazt ötször!
- Mire elég az olcsó szenzor? *(Válasz: a változások, a „melyik nagyobb” kérdések
  megválaszolására és a mérési elv megértésére. Hivatalos mérésre egyik sem alkalmas.)*

---

## 12.10 Biztonság az oktatási szenzorokkal

- Minden kísérlet **törpefeszültségen** (5 V) zajlik, így áramütés veszélye nincs.
  **Hálózati (230 V) eszközt soha nem kötünk a kísérletekhez!**
- A vizes poharakat tartsuk távol a laptoptól, és tálcán dolgozzunk.
- A káposztalé főzése **forró vízzel jár**, ez felnőtt feladata.
- A mérésekhez használt anyagokat (ecet, szódabikarbóna, szappan) **ne kóstoljuk**, a
  kísérlet után öntsük ki őket, és mossunk kezet.
- Erős savat vagy lúgot (lefolyótisztító, vízkőoldó) **nem mérünk**.
- A tönkrement szenzorok, LDR-ek és elektródák elektronikai hulladékba kerülnek.
