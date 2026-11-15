# 11. Oktatási segédlet

Ez a fejezet a projektet vezető pedagógusoknak / felnőtteknek szól: hogyan vonjuk be a
**felső tagozatos (10–14 éves)** diákokat úgy, hogy közben tanuljanak, élvezzék, és biztonságban legyenek.

## 11.1 Célok

A diákok a projekt végére:
- el tudják magyarázni, mit jelent a pH, a vezetőképesség, a zavarosság, az oldott oxigén, és miért fontosak a folyó élővilága szempontjából;
- megértik, hogyan alakít egy szenzor egy fizikai jellemzőt elektromos jellé, és a számítógép azt számmá;
- tudnak egyszerű Arduino programot módosítani és feltölteni;
- tudnak grafikont olvasni és készíteni, átlagot, minimumot, maximumot számolni, összefüggést keresni;
- megtapasztalják a mérnöki munkamódszert: tervezés → építés → tesztelés → hibakeresés → dokumentálás;
- csapatban dolgoznak, és bemutatják a munkájukat.

## 11.2 Tantárgyi kapcsolódások

| Tantárgy | Kapcsolódás |
|---|---|
| **Természettudomány / biológia** | vízi ökoszisztéma, a halak oxigénigénye, fotoszintézis (napi pH- és oxigén-ingadozás!), szennyezések hatása |
| **Kémia** | savak, bázisok, pH skála, oldatok, oldhatóság (hőmérséklet és oxigén), ionok és vezetés |
| **Fizika** | áram, feszültség, ellenállás, feszültségosztó, energia és teljesítmény (Wh), napelem, fény elnyelése (zavarosság) |
| **Földrajz** | vízgyűjtő terület, a folyó szakaszai, árvíz, a helyi folyó és települések, éghajlat és évszakok |
| **Matematika** | átlag, medián, kerekítés, mértékegység-átváltás, arányosság, egyenes egyenlete (kalibrációs egyenes!), grafikonok |
| **Digitális kultúra / informatika** | programozás (változók, elágazás, ciklus, függvény), adatok táblázatkezelőben, internet és adatátvitel |
| **Technika** | tervezés, méretarányos rajz, szerelés, vízállóság, anyagválasztás |
| **Magyar** | dokumentáció, műszaki leírás, beszámoló, prezentáció |

## 11.3 Javasolt foglalkozásterv (12 alkalom × 90 perc)

| # | Téma | Diákok tevékenysége | Felnőtt szerepe | Anyag |
|---|---|---|---|---|
| 1 | **Mi a projekt? Miért mérjük a vizet?** | ötletbörze: mi szennyezheti a folyót? csapatok és szerepek kialakítása; biztonsági szabályok | bemutatás, kérdések | 01, 09 fejezet |
| 2 | **Ismerkedés az Arduinóval** | első program feltöltése, LED mátrix ikon rajzolása | IDE telepítés előre | teszt 01 |
| 3 | **Hőmérséklet** | DS18B20 bekötése próbapanelen; hideg/meleg víz mérése, grafikon készítése | ellenőrzi a bekötést | teszt 02 |
| 4 | **Savas vagy lúgos?** | pH kísérletek háztartási anyagokkal; „pH skála” tabló készítése | pH szonda kezelése, pufferek | teszt 03, 03 fejezet |
| 5 | **Mi van a vízben?** | EC: desztillált víz, csapvíz, ásványvíz, sós víz összehasonlítása; zavarosság tejjel | | teszt 03 |
| 6 | **Adatok az interneten** | ThingSpeak csatorna, első adat küldése WiFi-n; grafikon a weben | fiók létrehozása | teszt 06, 05 fejezet |
| 7 | **Hogyan beszél a modem?** | AT parancsok kézi kipróbálása, jelerősség mérése az iskola különböző pontjain (térkép!) | modem bekötése | teszt 05 |
| 8 | **Energia** | napelem kipróbálása (napon/árnyékban/felhős időben mérve), energia kalkulátor futtatása, „mennyi ideig bírja?” | akku kezelése | 04 fejezet, kalkulátor |
| 9 | **Az egész együtt + kalibrálás** | fő program, szerviz menü, kalibráció pufferekkel, kalibrációs napló | integráció | 08 fejezet |
| 10 | **A doboz** | elrendezés megtervezése (méretarányos rajz), vízállósági próba papírtörlővel | fúrás, szerelés | 06, 07 fejezet |
| 11 | **Próbaüzem** | hordós teszt; „ügyeleti” beosztás az adatok napi ellenőrzésére | | |
| 12 | **Telepítés és bemutató** | a helyszínen: fotók, jegyzetek, GPS; később bemutató a szülőknek / iskolának | telepítés a vízben | |

Ezután **folyamatos adatelemzés**: havonta egy rövid foglalkozás az adatokkal (11.6).

## 11.4 Csapatszerepek

A diákok szerepeket vállalhatnak (forgóban, hogy mindenki mindent kipróbáljon):

| Szerep | Feladat |
|---|---|
| 🔧 **Mérnök** | bekötés, szerelés (felügyelettel), hibakeresés |
| 💻 **Programozó** | program feltöltése, módosítása, soros monitor figyelése |
| 🧪 **Kutató** | kísérletek végrehajtása, mérések, kalibrálás |
| 📊 **Adatelemző** | táblázatok, grafikonok, következtetések |
| 📝 **Dokumentáló** | fotók, jegyzőkönyv, kalibrációs napló, projektnapló |
| 📢 **Kommunikátor** | bemutató, plakát, iskolai honlap / újság cikk |

## 11.5 Kísérletek (biztonságos, háztartási anyagokkal)

> A kísérletekhez nem kell a drága terepi szenzorokat használni. A
> [12. fejezet](12_oktatasi_szenzorok.md) olcsó, „elronthatónak” szánt alternatívákat ad
> (NTC hőmérő, barkács vezetőképesség-mérő, LED+LDR zavarosságmérő, vöröskáposztás pH
> mérés színérzékelővel, ultrahangos vízszintmérő), saját tesztprogramokkal (07–11).

### 1. kísérlet – pH skála a konyhából
**Anyagok:** citromlé, ecet, kóla, csapvíz, ásványvíz, szódabikarbónás víz, szappanos víz.
**Feladat:** becsüld meg előre a sorrendet savastól lúgosig, aztán mérd meg! Hasonlítsd össze a
tippeket és a mérést. Melyik meglepő?
*(Minden mérés után öblítsd le a szondát desztillált vízzel! Erős lúgot – pl. lefolyótisztítót – NEM mérünk.)*

### 2. kísérlet – Mennyi só van benne?
**Anyagok:** desztillált víz, csapvíz, ásványvíz, 1 l víz + 1, 2, 3, 4 csipet só.
**Feladat:** mérd meg az EC-t! Rajzolj grafikont: vízszintesen a csipetek száma, függőlegesen az
EC. Egyenes lesz? *(Arányosság!)* Hasonlítsd össze az ásványvizek címkéjén lévő „összes oldott
ásványi anyag” értékkel!

### 3. kísérlet – Zavaros lesz?
**Anyagok:** 1 l víz, tej, cseppentő.
**Feladat:** cseppenként adj tejet a vízhez, és minden csepp után mérd a zavarosságot. Hány csepp
után látod szemmel, hogy zavaros? És a szenzor?

### 4. kísérlet – Hideg víz, meleg víz
**Feladat:** a vízhőmérőt tedd jeges vízből langyos vízbe, és jegyezd fel a hőmérsékletet
másodpercenként (a soros monitor kiírja, táblázatkezelőbe másolható). Mennyi idő alatt éri el a
végső hőmérsékletet? Miért nem azonnal?

### 5. kísérlet – Napelem
**Feladat:** mérd meg a napelem feszültségét (multiméterrel, felnőtt segítségével) napon, árnyékban,
felhős időben, a nappal szembe és attól elfordítva. Mikor termel a legtöbbet?

### 6. kísérlet – Térerő-térkép
**Feladat:** a modem konzollal (`AT+CSQ`) mérjétek meg a jelerősséget az iskola különböző pontjain,
és rajzoljátok be az iskola alaprajzába! Hol a legjobb a jel? Miért?

## 11.6 Adatelemzési feladatok (a telepítés után)

1. **Napi ritmus:** nézzétek meg egy napsütéses nyári nap vízhőmérséklet-, pH- és (ha van) oxigén-
   görbéjét. Mikor a legmagasabb? Miért? *(Tipp: fotoszintézis!)*
2. **Eső után:** keressetek egy nagy esőt (pl. a meteorológiai adatokból). Mi történt a zavarossággal
   és a vezetőképességgel? Mennyi idő múlva tértek vissza?
3. **Évszakok:** havi átlag, minimum, maximum a vízhőmérsékletre – táblázat és oszlopdiagram.
4. **Összefüggés:** pontdiagram a vízhőmérséklet és az oldott oxigén között. Milyen a kapcsolat?
5. **Rendellenesség-vadászat:** keressetek a grafikonon „furcsa” pontokat. Valódi esemény vagy
   mérési hiba? Hogyan lehet eldönteni?
6. **Összehasonlítás:** a saját vízhőmérséklet-mérésünk és a hivatalos vízügyi adatok – mennyire
   egyeznek?

Az adatokat a [`tools/thingspeak_letoltes.py`](../tools/thingspeak_letoltes.py) programmal CSV-be
lehet tölteni, ami táblázatkezelőben (Excel, LibreOffice, Google Táblázatok) megnyitható.

## 11.7 Értékelés (javaslat)

Nem a „hibátlan működés” a cél, hanem a folyamat. Értékelhető:
- **projektnapló** (minden foglalkozásról néhány mondat + fotó, mit csináltunk, mi nem sikerült és miért);
- **kísérleti jegyzőkönyvek** (hipotézis → mérés → eredmény → következtetés);
- **egy önálló kis feladat** (pl. saját LED ikon, egy grafikon elemzése, egy fejezet egyszerűsített
  változatának megírása fiatalabbaknak);
- **záró bemutató** csapatban.

## 11.8 Tippek a foglalkozásokhoz

- **A hiba nem kudarc**, hanem a munka része. Ha valami nem működik, tegyük fel közösen a kérdést:
  „Mi az utolsó dolog, ami még működött?” – ez a hibakeresés legfontosabb módszere.
- Mindig **előre kérjük a tippet** („Szerintetek mit fog mérni?”) – a meglepetés tanít a legjobban.
- Az alkatrészekből érdemes **tartalékot** venni (különösen DS18B20, jumper kábelek) – a diákkezek
  néha elrontanak dolgokat, ez rendben van.
- A drága, sérülékeny eszközöket (pH szonda, DO szonda, modem) **felnőtt** kezelje, a diákok figyelhetik és irányíthatják („most tedd a pH 4-be”).
- Készítsünk **plakátot** a doboz felépítéséről – a szótár ([szotar.md](szotar.md)) segít a fogalmakban.
