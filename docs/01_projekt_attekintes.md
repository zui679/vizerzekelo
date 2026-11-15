# 1. Projekt áttekintés

## 1.1 Miről szól a projekt?

Egy olyan **önállóan működő mérőállomást** („dobozt”) építünk, amely egy folyó vizébe
helyezve folyamatosan méri a víz minőségét jelző legfontosabb tulajdonságokat, és a mért
adatokat mobilhálózaton keresztül az internetre küldi. Az adatok egy nyilvános weboldalon
grafikonokként jelennek meg, így a diákok – és bárki más – nyomon követhetik, hogyan változik
a folyó állapota napról napra, évszakról évszakra, egy-egy esőzés vagy szennyezés után.

## 1.2 Miért fontos a vízminőség mérése?

- A folyók élővilága (halak, rovarlárvák, növények) **érzékeny** a víz hőmérsékletére,
  savasságára, oxigéntartalmára és tisztaságára.
- A szennyezések (szennyvíz, mezőgazdasági bemosódás, ipari kibocsátás) gyakran
  **rövid ideig tartanak** – egy havonta egyszer vett vízmintával könnyen észrevétlenek
  maradnak, egy negyedóránként mérő automata viszont „elkapja” őket.
- A diákok saját szemükkel látják, hogyan függ össze az **időjárás, az évszak és a vízminőség** –
  ez a természettudományos gondolkodás alapja.

## 1.3 Követelmények

### Funkcionális követelmények (mit tudjon?)

| # | Követelmény | Megoldás |
|---|---|---|
| F1 | Mérje a víz több minőségi jellemzőjét | hőmérséklet, pH, EC/TDS, zavarosság, (oldott oxigén) |
| F2 | Rendszeresen, emberi beavatkozás nélkül mérjen | TPL5110 időzítő, alapból 15 percenként |
| F3 | Küldje el a mért adatokat | LTE Cat-1 mobilmodem (terep) vagy WiFi (iskola) |
| F4 | Az adatok legyenek bárki számára megtekinthetők | ThingSpeak nyilvános csatorna, grafikonok |
| F5 | Jelezze a saját hibáit | állapotbitek: beázás, gyenge akku, szenzorhiba |
| F6 | Lehessen kalibrálni | szerviz menü, kalibráció EEPROM-ban |

### Nem funkcionális követelmények (milyen legyen?)

| # | Követelmény | Megoldás |
|---|---|---|
| N1 | Akkuról működjön, lehetőleg önellátóan | Li-ion akku + 6 W napelem, mérések között teljes lekapcsolás |
| N2 | Bírja a kültéri körülményeket | IP67 doboz, tömszelencék, szilikagél, páratartalom-figyelés |
| N3 | Legyen megfizethető és beszerezhető | hobbi alkatrészek, kb. 140–200 ezer Ft (Arduino és DO szonda nélkül, lásd [alkatrészlista](../hardware/alkatreszlista.md)) |
| N4 | Legyen érthető diákoknak is | moduláris felépítés, magyar kommentek, tesztprogramok |
| N5 | Legyen bővíthető | konfigurálható szenzorok, szabad lábak, dokumentált interfészek |
| N6 | Legyen biztonságos | alacsony feszültség, felnőtt felügyelet, akkuvédelem |

## 1.4 A rendszer fő részei

| Rész | Feladat |
|---|---|
| **Arduino UNO R4 WiFi** | a „agy”: méri a szenzorokat, kiszámolja az értékeket, irányítja a modemet |
| **Szenzorok** | átalakítják a víz tulajdonságait elektromos jellé (feszültséggé) |
| **LTE modem** | mobilhálózaton keresztül elküldi az adatokat (mint egy mobiltelefon) |
| **Akku + napelem + töltésvezérlő** | energiaellátás |
| **TPL5110 időzítő** | a mérések között teljesen lekapcsolja az Arduinót (energiatakarékosság) |
| **Vízálló doboz + szenzortartó cső** | védi az elektronikát, rögzíti a szenzorokat |
| **ThingSpeak felhő** | tárolja és grafikonon megjeleníti az adatokat |

Részletesen: [02_rendszerterv.md](02_rendszerterv.md).

## 1.5 Képességek összefoglalója

- 5 vízminőségi paraméter (ebből 1 opcionális) + 3 belső állapotjellemző.
- Mérés 15 percenként (állítható 1 perc és 2 óra között).
- Hőmérséklet-kompenzált pH és vezetőképesség.
- Zajszűrt mérés: 31 minta, nyesett átlag.
- A szenzorok egymás után kapnak tápot, így nem zavarják egymást a vízen keresztül.
- Adatküldés mobilhálózaton (LTE, 2G tartalékkal) vagy WiFi-n.
- Kb. 7–10 nap működés napfény nélkül; napelemmel egész évben önellátó lehet (lásd [04_energiaellatas.md](04_energiaellatas.md)).
- Beázás korai jelzése a doboz páratartalmából.
- Kalibráció és diagnosztika USB-n, a soros monitorból.
- Állapotjelzés a beépített LED mátrixon (diákok saját ikonokat rajzolhatnak).

## 1.6 Korlátok – amit tudni kell

- **Ez nem hivatalos/hitelesített mérőműszer.** A hobbi szenzorok pontossága elmarad a
  laboratóriumi műszerekétől. A doboz elsősorban a **változások, trendek és események**
  kimutatására alkalmas, nem hatósági minősítésre.
- A pH és az oldott oxigén szonda **rendszeres karbantartást és kalibrálást** igényel
  (2–4 hetente), különben az értékek „elmásznak”.
- A zavarosság szenzor olcsó, közelítő eszköz – inkább viszonyításra jó (pl. „eső után
  háromszor zavarosabb lett”).
- Nitrát, foszfát, nehézfémek, baktériumok mérésére ez a változat **nem alkalmas** – ezek
  drága, speciális szenzorokat igényelnek (lásd [10_tovabbfejlesztes.md](10_tovabbfejlesztes.md)).

## 1.7 Projekt ütemterv (javaslat)

| Fázis | Tartalom | Becsült idő |
|---|---|---|
| 0. Előkészítés | dokumentáció átolvasása, beszerzés, ThingSpeak fiók, SIM kártya | 2–4 hét |
| 1. Ismerkedés | Arduino alapok, LED mátrix, első program (teszt 01) | 1–2 foglalkozás |
| 2. Szenzorok | egyenként kipróbálni (teszt 02–04), konyhai kísérletek | 3–4 foglalkozás |
| 3. Kommunikáció | WiFi + ThingSpeak (teszt 06), majd modem (teszt 05) | 2–3 foglalkozás |
| 4. Integráció | fő program, tápellátás, kalibrálás | 2–3 foglalkozás |
| 5. Mechanika | doboz, tömítés, szenzortartó cső, vízállósági próba | 2–3 foglalkozás |
| 6. Próbaüzem | 1–2 hét az iskolaudvaron egy vödör/hordó vízben | 2 hét |
| 7. Telepítés | kihelyezés a folyóra (felnőttek), adatgyűjtés indul | 1 alkalom |
| 8. Adatelemzés | grafikonok, összehasonlítás, bemutató | folyamatos |

A foglalkozások részletes terve: [11_oktatasi_segedlet.md](11_oktatasi_segedlet.md).
