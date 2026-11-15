# 9. Biztonság

> A projekt **felnőtt felügyelete mellett** zajlik. Ez a fejezet a felügyelő felnőtteknek
> szól elsősorban, de a diákokkal is érdemes átbeszélni az első foglalkozáson.

## 9.1 Vízparti munka – a legfontosabb szabályok

1. **Diák soha nem megy a víz közelébe felnőtt nélkül**, és a vízbe diák nem lép be.
2. A vízparton dolgozó felnőtt mellett **mindig legyen még valaki** (soha ne egyedül).
3. Vízhez közel (meredek part, stég) **mentőmellény**.
4. Csúszós, omladozó, meredek part, áradó, gyors víz, jég, vihar esetén **nem dolgozunk**.
5. Előtte nézzük meg a **vízállás-előrejelzést** (pl. az országos vízügyi honlapon).
6. Legyen **elsősegélycsomag** és feltöltött telefon; mindenki tudja, hol vagyunk.
7. A folyóvíz nem tiszta: munka után **kézmosás**, sebet vízzel ne érjen; a kezünket ne vegyük a szánkba.
8. A diákok a helyszínen biztonságos távolságból figyelhetnek, fotózhatnak, jegyzetelhetnek,
   adatokat olvashatnak le a laptopról – a vízhez közeli munkát felnőtt végzi.

## 9.2 Elektromos biztonság

A teljes rendszer **törpefeszültségű** (a napelemről a választott típustól függően kb. 6–22 V, 4,2 V az akkuról, 5 V az
Arduinón) – áramütés veszélye nincs. A veszélyt az **akku** jelenti:

### Li-ion akku – csak felnőtt kezeli
- **Rövidzárlat** esetén a cella nagyon gyorsan felmelegszik, kigyulladhat. Az akku + pólusához
  közvetlenül **biztosíték** kerüljön. Fém tárgyat (csipesz, csavarhúzó) ne tegyünk a pólusok közé.
- Csak **védett (PCB-s), márkás** cellát használjunk, jó minőségű tartóban.
- **Cellákat párhuzamosan kötni csak akkor szabad, ha azonos típusúak, azonos korúak és azonos
  feszültségűek.** Összekötés előtt mindegyiket külön teljesen fel kell tölteni, és multiméterrel
  megmérni: legfeljebb kb. 0,05 V lehet köztük a különbség. Eltérő feszültségű cellák között
  nagy kiegyenlítő áram indul – melegedés, tűzveszély. Cellacsere után ugyanez érvényes.
- **Sérült, felfúvódott, horpadt, melegedő** cellát azonnal ki kell venni, fém dobozban / homokban
  tárolni, és a veszélyes hulladék gyűjtőbe vinni.
- Ne töltsük felügyelet nélkül éjszakára az épületben (laborpadon).
- **0 °C alatt nem tölthető** (lásd [04_energiaellatas.md](04_energiaellatas.md)).
- Az elhasznált akkut ne dobjuk a kukába – elemgyűjtőbe!

### Forrasztás – felnőtt, vagy közvetlen felügyelet mellett idősebb diák
- **Ólommentes** forrasztóón.
- **Szellőzés** / füstelszívó – a gyanta füstje irritáló.
- **Védőszemüveg** (a fröccsenő ón és a levágott lábak miatt).
- A páka kb. 350 °C: mindig a tartójában legyen, a kábelét úgy vezessük, hogy ne lehessen beleakadni.
- Forrasztás után kézmosás.

### Általános
- Mindent **áramtalanítva** kötünk át (USB kihúzva, akku leválasztva).
- Bekapcsolás előtt valaki **ellenőrzi a bekötést** („négy szem elv”).
- Ha valami melegszik, furcsa szagot érzünk → azonnal áramtalanítani.
- A modemet **antenna nélkül nem kapcsoljuk be**.

## 9.3 Vegyszerek

| Anyag | Veszély | Ki kezelheti? |
|---|---|---|
| pH pufferoldatok (4, 7, 10) | enyhén irritáló lehet | diák is, felügyelettel (kesztyű, szemüveg ajánlott) |
| EC kalibráló oldat (KCl) | ártalmatlan (sós víz) | diák is |
| 3 mol/l KCl (pH szonda tároló) | enyhén irritáló | diák is, felügyelettel |
| Ecet, citromlé, szódabikarbóna (kísérletekhez) | háztartási | diák |
| **DO szonda elektrolit (NaOH oldat)** | **⚠️ maró, lúgos! Szemsérülést okozhat** | **csak felnőtt, kesztyű + védőszemüveg** |
| Sósav (vízkőoldáshoz) | maró | csak felnőtt |
| Műgyanta (kiöntéshez) | bőrirritáló, allergizáló | csak felnőtt, kesztyű, szellőzés |

A vegyszerek eredeti, felcímkézett tárolóedényben, gyerekek elől elzárva tárolandók.
A biztonsági adatlapokat (SDS) a gyártó/forgalmazó adja meg – ezeket érdemes kinyomtatni és a
projektmappában tartani.

## 9.4 Engedélyek, jogi kérdések

- Folyóba eszköz kihelyezése **engedélyhez / hozzájáruláshoz kötött lehet** – lásd
  [06_mechanika_es_telepites.md](06_mechanika_es_telepites.md) 6.4.
- A doboz rádióadót (mobilmodem) tartalmaz: csak **CE jelölésű, gyári modult** használjunk,
  és ne módosítsuk az antennarendszert (pl. erősítővel).
- A SIM kártya / előfizetés felnőtt (iskola) nevén legyen.
- A dobozon legyen egy **tájékoztató tábla**: mi ez, ki üzemelteti, elérhetőség (iskolai e-mail,
  ne magánszemély telefonszáma), „kérjük, ne mozdítsa el”.

## 9.5 Adatvédelem

- A doboz **személyes adatot nem gyűjt** (csak vízminőségi és technikai adatokat).
- A projekt dokumentálásakor (fotók, videók, iskolai honlap) a diákokról készült felvételekhez
  a szokásos **szülői hozzájárulás** szükséges.
- A ThingSpeak fiók jelszavát, az API kulcsot és a WiFi jelszót **ne tegyük nyilvánossá**
  (a `secrets.h` ezért nem kerül fel a git repóba).

## 9.6 Környezetvédelem

- A doboz **ne szennyezze** azt, amit mér: nincs a vízben akku, fém csak rozsdamentes,
  a vízbe kerülő részek stabilak.
- Projekt végén **minden alkatrészt** (cölöp, bilincs, kábel) távolítsunk el.
- Elhasznált akku, szondák, elektronika → elektronikai hulladékgyűjtő.
- A kalibrálóoldatok kis mennyiségben, bő vízzel hígítva a lefolyóba önthetők (a DO elektrolit
  és sósav kivétel – ezeket semlegesíteni kell, felnőtt feladata).
