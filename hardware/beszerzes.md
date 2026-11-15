# Beszerzési források

> **Állapot:** 2026. november 15-én ellenőrizve. Az árak és a készlet gyorsan változnak, ezért
> rendelés előtt mindig nézd meg a termékoldalt!
>
> A HESTORE **nettó** árakat mutat, ezeket 27 % áfával számoltuk át bruttóra (kerekítve).
> A szállítási díj sehol sincs benne.

Jelenleg az **iskolai (oktatási) készlet** forrásai vannak itt, vagyis az
[alkatrészlista 8. pontja](alkatreszlista.md#8-oktatási--bemutató-szenzorok-opcionális) és a
[12.8 fejezet](../docs/12_oktatasi_szenzorok.md#128-ajánlott-oktatási-készlet-csoportonként)
tételei. A terepi doboz forrásai később kerülnek ide.

## Összefoglaló: honnan mit?

| Bolt | Mit veszünk ott? | Kb. bruttó összeg |
|---|---|---|
| **[HESTORE](https://www.hestore.hu)** (magyar elektronikai webshop) | **minden elektronikai alkatrész**, pH panel és szonda, pH kalibráló porok, kézi TDS mérő | **≈ 65 500 Ft** (4 csoport + 1 tartalék készlet + közös eszközök) |
| **[Hanna Instruments Magyarország](https://hannainst.hu)** | pH szonda tárolóoldat; ajánlottan a 7,01 / 4,01 pH puffer is (lásd lent) | 4 300 – 13 000 Ft |
| **[mindenitt.hu](https://www.mindenitt.hu)** (Baja) | univerzális pH indikátorpapír 1–14 | ≈ 1 900 Ft |
| bármelyik bolt / drogéria | desztillált víz (5 l), vöröskáposzta 🙂 | ≈ 1 000 Ft |

A teljes készlet tehát **legfeljebb 3 webshopból** megvehető, és ebből a HESTORE adja a
tételek 90 %-át.

> **Tipp:** a HESTORE-ban az **5 db feletti ár** sokszor 20–40 %-kal olcsóbb. Ezért 4 csoport
> esetén is érdemes **5 készletet** venni: alig drágább, és lesz egy tartalék.

---

## 1. HESTORE: csoportonkénti készlet

Egy csoportnak egy-egy darab kell. Az ár az **5 db-os** egységár (bruttó).

| Alkatrész a listában | HESTORE termék | Ár / db | Megjegyzés |
|---|---|---|---|
| NTC vízálló szonda 10 kΩ, B3950 | [B3950-XH2.54-1M](https://www.hestore.hu/prod_10043571.html) | ≈ 350 Ft | 1 m kábel, XH2.54 csatlakozó: a végét le kell vágni, vagy jumper kábellel csatlakoztatni |
| DS18B20 vízálló hőmérő (összehasonlításhoz) | [DS18B20-1M](https://www.hestore.hu/prod_10035575.html) | ≈ 990 Ft | rozsdamentes hüvely, 1 m kábel. A terepi dobozhoz a [3 m-es változat](https://www.hestore.hu/prod_10051825.html) kell |
| TDS szenzor klón | [TDS-M](https://www.hestore.hu/prod_10041588.html) | ≈ 1 960 Ft | adatai (3,3–5,5 V, 0–2,3 V kimenet, 0–1000 ppm) megegyeznek a DFRobot SEN0244-ével. **A leírás nem írja, hogy a szonda benne van-e**, ezt rendelés előtt kérdezd meg! |
| TCS34725 színérzékelő | [TCS34725-RGB](https://www.hestore.hu/prod_10042169.html) | ≈ 1 950 Ft | I2C, 3,3–5 V. A leírás nem említ fehér LED-et, a fotón ellenőrizd (a káposztás méréshez kell megvilágítás) |
| HC-SR04 ultrahangos távolságmérő | [HC-SR04+](https://www.hestore.hu/prod_10048000.html) | ≈ 600 Ft | 3,3–5 V-os változat |
| „Water level sensor” panel | [WLD-75](https://www.hestore.hu/prod_10035547.html) | ≈ 200 Ft | analóg kimenet, 3–5 V |
| LDR (zavarosság barkácsváltozat) | [DS5-5528-LDR](https://www.hestore.hu/prod_10036399.html) (GL5528) | ≈ 55–90 Ft | 10 db felett olcsóbb; csoportonként 2 db |
| Próbapanel | [BB-102 (630/200)](https://www.hestore.hu/prod_10028527.html) | ≈ 1 630 Ft | a szokásos „830 pólusú” méret |
| Jumper kábel, apa–anya | [RC-40-20/MF](https://www.hestore.hu/prod_10035720.html) | ≈ 960 Ft | 40 eres szalag, a vezetékek széthúzhatók |
| Jumper kábel, apa–apa | [RC-40-20/MM](https://www.hestore.hu/prod_10035721.html) | ≈ 960 Ft | |
| | **Összesen / csoport** | **≈ 9 700 Ft** | |

## 2. HESTORE: osztályonként közös eszközök (1 db)

| Alkatrész a listában | HESTORE termék | Bruttó ár | Megjegyzés |
|---|---|---|---|
| PH-4502C panel | [EQV-PH-BRD](https://www.hestore.hu/prod_10047969.html) | ≈ 3 340 Ft | más néven árulják, de ugyanaz a panel: 5 V, analóg pH + hőmérséklet + digitális kimenet, offset és határérték trimmer |
| E-201-C pH szonda | [EQV-PH-E-201](https://www.hestore.hu/prod_10047971.html) | ≈ 4 630 Ft | BNC csatlakozó, külön kell megvenni a panelhez |
| pH 4,01 puffer (por) | [PH-TEST-401](https://www.hestore.hu/prod_10042230.html) | ≈ 320 Ft / tasak | 2 tasak |
| pH 6,86 puffer (por) | [PH-TEST-686](https://www.hestore.hu/prod_10042231.html) | ≈ 300 Ft / tasak | 2 tasak. **Figyelem: 6,86 és nem 7,00!** Lásd lent |
| Kézi TDS mérő „toll” | [TDS-3](https://www.hestore.hu/prod_10041853.html) | ≈ 2 550 Ft | TDS + hőmérséklet, 0–9990 ppm; jó referencia a TDS szenzor kalibrálásához is |
| Ellenállás-készlet | [RESISTOR-KIT-600](https://www.hestore.hu/prod_10052057.html) | ≈ 2 920 Ft | 30 érték × 20 db; benne van a 220 Ω, 1 kΩ, 4,7 kΩ, 10 kΩ, 470 kΩ is (a terepi dobozhoz is jó) |
| LED-ek | [RL-SET-LPSW](https://www.hestore.hu/prod_10036695.html) | ≈ 2 230 Ft | 15 LED (fehér, piros, sárga, zöld, kék), potméterek, nyomógombok. A színes LED-ekkel a zavarossági kísérlet is elvégezhető |
| | **Összesen** | **≈ 16 900 Ft** | |

## 3. Hanna Instruments Magyarország

| Tétel | Termék | Bruttó ár | Kell? |
|---|---|---|---|
| pH szonda tárolóoldat | [HI70300-012 GroLine, 120 ml](https://hannainst.hu/hu/product/elektrod-tarolooldat-groline-hi70300-012/termekek/oldatok-es-reagensek/elektrod-tarolo-oldatok) | 4 318 Ft | **igen**: az E-201-C szonda nem száradhat ki (a HESTORE-ban nincs ilyen) |
| pH 7,01 puffer | [HI7007-012 GroLine, 120 ml](https://hannainst.hu/hu/product/ph-kalibralo-oldat-groline-hi7007-012/termekek/oldatok-es-reagensek/kalibralo-oldatok) | 4 318 Ft | ajánlott (lásd lent) |
| pH 4,01 puffer | [HI7004-012 GroLine, 120 ml](https://hannainst.hu/hu/product/ph-kalibralo-oldat-groline-hi7004-012/termekek/oldatok-es-reagensek/kalibralo-oldatok) | 4 318 Ft | ajánlott (lásd lent) |
| EC kalibráló oldat 1413 µS/cm | [HI7031M, 230 ml](https://hannainst.hu/hu/product/termekek/oldatok-es-reagensek/kalibralo-oldatok/ec-kalibralo-oldat-hi7031m) | 9 176 Ft | nem kell: az oktatási készletnél a TDS-3 tollal is lehet kalibrálni. A terepi doboznál viszont kell |

### Melyik pH puffert vegyük?

A program (`firmware/vizerzekelo/sensors.cpp`) a kalibrálásnál **pH 7,00 és 4,00** pufferrel
számol. A HESTORE-ban csak **6,86-os** por van, és ha ezt „7-esnek” használjuk, a mért pH kb.
**0,15-tel eltér** (a szenzor meredeksége is kb. 5 %-kal hibás lesz).

- **A) Hanna 7,01 + 4,01 puffer** (≈ 8 600 Ft): pontosan illik a programhoz (0,01 eltérés). **Ezt ajánljuk.**
- **B) HESTORE 6,86 + 4,01 por** (≈ 1 200 Ft): sokkal olcsóbb, de vagy elfogadjuk a ~0,15 pH
  hibát (oktatási célra ez elég), vagy a programba be kell építeni, hogy a pufferek értéke
  beállítható legyen.

## 4. Egyéb

| Tétel | Forrás | Ár | Megjegyzés |
|---|---|---|---|
| Univerzális pH indikátorpapír 1–14 | [mindenitt.hu, 5 m tekercs](https://www.mindenitt.hu/ph-tesztcsik-5-meteres-tekercsben-ph-1-14-1265) | 1 890 Ft | más magyar forrásban 3 000–7 000 Ft (pl. vegyszerboltok, labor-webshopok) |
| Desztillált víz, 5 l | bármelyik szupermarket, drogéria, barkácsáruház | ≈ 500–1 000 Ft | |
| Rozsdamentes M3 / M4 csavarok (barkács EC elektróda) | barkácsáruház | ≈ 100 Ft / csoport | „A2” vagy „rozsdamentes” jelölésű, **nem horganyzott** |

## 5. Opcionális tételek

| Tétel | Forrás | Bruttó ár | Megjegyzés |
|---|---|---|---|
| DFRobot SEN0189 zavarosság szenzor (eredeti) | [RS Components Magyarország](https://hu.rs-online.com/web/p/arduino-kompatibilis-kartyak-es-keszletek/2163780) | ≈ 4 540 Ft | **SEN0189 klónt nem találtunk magyar boltban.** Csoportonként az LDR-es barkácsváltozat elég, ebből legfeljebb 1 db kell osztályonként. Az RS 15 000 Ft felett ingyen szállít. Az árat csak keresőből láttuk, a termékoldal nem volt elérhető |
| BME280 panel (doboz klíma) | [BME280-M](https://www.hestore.hu/prod_10039068.html) / [GY-BME280-3.3V](https://www.hestore.hu/prod_10047994.html) | ≈ 2 360 / 2 930 Ft | 3,3 V-os változatnál figyelj a bekötésre, lásd [12.7](../docs/12_oktatasi_szenzorok.md#127-doboz-klíma-és-bónusz-szenzorok) |
| DHT22 / DHT11 | [DHT22-M](https://www.hestore.hu/prod_10036812.html) / [DHT11](https://www.hestore.hu/prod_10035544.html) | ≈ 910 / 610 Ft | |
| Talajnedvesség-mérő modul | [SA-27](https://www.hestore.hu/prod_10035554.html) | ≈ 1 300 Ft | a leírásból nem derül ki, hogy rezisztív villa-e (a 08-as programhoz az kell); a két csavaros barkácsváltozat ingyen is megoldja |
| DS18B20, 3 m (terepi dobozhoz) | [DS18B20-3M](https://www.hestore.hu/prod_10051825.html) | ≈ 2 060 Ft | |
| Akvarisztikai O₂ csepp-teszt | akvarisztikai szaküzlet (pl. JBL ProAquaTest O2) | ≈ 5 000–8 000 Ft | magyar árat nem ellenőriztünk |

## Költségösszesítő (oktatási készlet)

| Tétel | Bruttó ár |
|---|---|
| 5 csoportos készlet (4 + 1 tartalék), HESTORE | ≈ 48 600 Ft |
| Közös eszközök, HESTORE | ≈ 16 900 Ft |
| Hanna: tárolóoldat + 7,01 és 4,01 puffer | ≈ 13 000 Ft |
| Indikátorpapír, desztillált víz | ≈ 3 000 Ft |
| **Összesen (szállítás nélkül)** | **≈ 81 500 Ft** |

*(Az Arduino UNO R4 WiFi lapok nincsenek benne, mert ezek az iskolában megvannak.)*
