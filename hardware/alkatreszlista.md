# Alkatrészlista (BOM)

> **Az árak durva becslések (2026, bruttó, Ft)**, és forgalmazótól, árfolyamtól függően jelentősen
> eltérhetnek. A típusok példák – egyenértékű alkatrész is megfelel, de vásárlás előtt mindig
> ellenőrizd az adatlapon a feszültségeket és csatlakozókat!
>
> **K** = kötelező · **O** = opcionális / ajánlott · **T** = tartalék (diákprojektnél jól jön)

## 1. Vezérlés

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 1.1 | Mikrovezérlő | **Arduino UNO R4 WiFi** | 1 | megvan | K | |
| 1.2 | USB-C kábel | adat + táp | 1 | 1 500 | K | programozáshoz |
| 1.3 | Próbapanel + jumper kábelek | 830 pólusú breadboard + M-M, M-F kábelek | 1 | 3 000 | K | teszteléshez |
| 1.4 | Forrasztható próbapanel | perfboard / „Proto Shield” UNO-hoz | 1–2 | 2 000 | K | végleges kivitelhez |

## 2. Szenzorok

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 2.1 | Vízhőmérő | DS18B20, vízálló, **legalább 3 m** kábellel | 1 (+1 T) | 1 500 | K | |
| 2.2 | 4,7 kΩ ellenállás | | 1 | – | K | DS18B20 felhúzó |
| 2.3 | pH készlet **terepre** | DFRobot Gravity Analog pH Sensor/Meter **Pro Kit V2** (SEN0169-V2): erősítő panel + **ipari** szonda | 1 | 25 000–35 000 | K | tartós merítéshez. Vásárláskor ellenőrizd, hogy az erősítő panel is benne van-e a csomagban! |
| 2.4 | pH készlet **tanuláshoz** | DFRobot SEN0161-V2 (panel + labor szonda) **vagy** PH-4502C + E-201-C | 1 | 6 000–15 000 | O | kísérletekhez, hogy a drága ipari szonda megmaradjon a terepre. Lásd [12. fejezet](../docs/12_oktatasi_szenzorok.md) |
| 2.5 | TDS/EC szenzor | DFRobot Gravity Analog TDS Sensor (SEN0244) | 1 | 5 000 | K | alternatíva: DFR0300 ipari EC (drágább) |
| 2.6 | Zavarosság szenzor | DFRobot Gravity Analog Turbidity Sensor (SEN0189) | 1 | 4 000 | K | felső része kiöntendő! |
| 2.7 | Oldott oxigén szenzor | DFRobot Gravity Analog Dissolved Oxygen Sensor (SEN0237) | 1 | 60 000–80 000 | O | karbantartásigényes |
| 2.8 | Doboz klíma szenzor | BME280 Qwiic panel (pl. SparkFun / Adafruit) + Qwiic kábel | 1 | 4 000–8 000 | K | beázásjelzés |

## 3. Kommunikáció

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 3.1 | LTE modem modul | **SIMCom A7670E** alapú panel, VBAT bemenettel, PWRKEY kivezetéssel | 1 | 8 000–15 000 | K | alternatíva: SIM7600E panel (a firmware ezzel is megy) |
| 3.2 | LTE antenna | a modul csatlakozójához illő (IPEX/SMA), lehetőleg kültéri | 1 | 1 500–4 000 | K | |
| 3.3 | Szintillesztő | 4 csatornás, kétirányú, BSS138 alapú | 1 (+1 T) | 500 | K | ha a modem panel nem 5 V-tűrő |
| 3.4 | SIM kártya | adatcsomaggal (~10 MB/hó elég) | 1 | havi 500–2 000 | K | PIN kérés kikapcsolva |

## 4. Energiaellátás

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 4.1 | Napelem | kb. 6 W (vagy 10 W) monokristályos, kültéri. **Feszültség a 4.2 töltőhöz:** DFR0559-hez **5 V-os**, Waveshare (C)-hez 6 / 9 / 12 V-os | 1 | 5 000–9 000 | K | **a panel üresjárási feszültsége (Voc) legyen a töltő max. bemenete alatt**, különben a töltő tönkremegy – lásd [04_energiaellatas.md](../docs/04_energiaellatas.md) 4.1.1 |
| 4.2 | Napelemes töltésvezérlő | 1S Li-ion, MPPT, 5 V ≥1 A kimenet. Példák: DFRobot Solar Power Manager 5V (DFR0559; bemenet 4,5–6 V) **vagy** Waveshare Solar Power Manager (C) (bemenet 6–24 V, 3×18650 foglalat) | 1 | 6 000–12 000 | K | a napelemmel **párban** kell választani; előny: NTC (hőmérséklet) bemenet |
| 4.3 | Li-ion cella | 18650, **védett (PCB)**, márkás, 3000–3500 mAh | 2 | 2 × 3 000 | K | |
| 4.4 | Akkutartó | 2 × 18650, **párhuzamos** bekötésű | 1 | 800 | K | vagy forrfüles cellák, felnőtt szerelje. Nem kell, ha a töltő panelen van akkufoglalat (pl. Waveshare (C)) |
| 4.5 | Biztosíték + tartó | 3 A, autós mini lapos vagy üvegcsöves, vezetékbe köthető | 1 | 800 | K | az akku + pólusánál! |
| 4.6 | Időzítő | **Adafruit TPL5110** Low Power Timer Breakout | 1 | 2 500 | K | |
| 4.7 | USB-A aljzat panel | „USB-A female breakout” | 1 | 300 | K | TPL5110 → Arduino |
| 4.8 | USB-A – USB-C kábel | rövid, 20–30 cm | 1 | 1 000 | K | |
| 4.9 | Ellenállások feszültségosztóhoz | 470 kΩ | 2 | – | K | |
| 4.10 | Kondenzátor | 100 nF kerámia | 2 | – | K | A3 szűrés, tápszűrés |
| 4.11 | Elektrolit kondenzátor | 1000 µF / 10 V, low-ESR | 1–2 | 300 | K | a modem VBAT-jához |

## 5. Tápkapcsolók (szenzorok + modem)

Lásd [bekotes.md](bekotes.md) 3. pont. 4 db (pH, EC, zavarosság, modem) + 1 opcionális (DO).

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 5.1 | P-csatornás logikai MOSFET | AO3401A / DMG2305UX / IRLML6402 (SOT-23) – vagy TO-92 / TO-220 tokú, alacsony küszöbű P-FET | 5 (+3 T) | 2 000 | K | SOT-23-hoz átalakító panel kell; a modemhez kis R<sub>DS(on)</sub> fontos (< 60 mΩ) |
| 5.2 | NPN tranzisztor | BC547 / 2N2222 / 2N3904 | 5 (+3 T) | 500 | K | |
| 5.3 | Ellenállás | 1 kΩ (bázis) és 10 kΩ (gate felhúzó) | 5–5 | – | K | |
| 5.4 | Ellenállás-készlet | vegyes E12 | 1 | 2 000 | O | |

*Egyszerűsítés:* kész „high-side MOSFET switch” / „load switch” modulok is használhatók, ha 3,3–5 V-os vezérléssel működnek.

## 6. Mechanika

| # | Alkatrész | Példa típus | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|---|
| 6.1 | Vízálló doboz | IP67, ABS/PC, kb. 200 × 150 × 100 mm, világos színű | 1 | 4 000–8 000 | K | |
| 6.2 | Tömszelencék | PG7 / PG9 (M12/M16), IP68 | 6–8 | 2 000 | K | kábelátmérőhöz illő! |
| 6.3 | Nyomáskiegyenlítő szelep | M12 „breather vent” (Gore típusú) | 1 | 1 500 | O (ajánlott) | |
| 6.4 | Szilikagél | színváltós, tasakos | 5+ | 1 500 | K | |
| 6.5 | Szerelőlap | plexi / rétegelt lemez | 1 | 1 000 | K | |
| 6.6 | Távtartók, csavarok | M3 nylon/sárgaréz | készlet | 2 000 | K | |
| 6.7 | Szenzortartó cső | PVC lefolyócső Ø 75–110 mm, ~1 m + végzáró | 1 | 3 000 | K | furatokkal |
| 6.8 | Rögzítés | rozsdamentes csőbilincsek, csavarok, U-csavar | készlet | 4 000 | K | csak rozsdamentes! |
| 6.9 | Napelem tartó | szögvas / alu L-profil | 1 | 2 000 | K | |
| 6.10 | Kábelvédő gégecső | Ø 16–20 mm, UV-álló | 2–3 m | 1 500 | K | |
| 6.10b | Hosszabbító kábel + ragasztós zsugorcső | 2 és 3 eres, kültéri, lehetőleg árnyékolt kábel (2–3 m); belül olvadó (ragasztós) zsugorcső | 1–1 | 2 000 | K | a TDS szonda (83 cm) és a zavarosság szenzor rövid gyári kábeléhez – lásd [bekotes.md](bekotes.md) 6. pont |
| 6.11 | Vízálló csatlakozók | GX12 / M12, 3–4 pólusú | 4 | 4 000 | O | szondák cserélhetősége |
| 6.12 | Lakat / biztonsági csavarok | | 1 | 2 000 | O | vandalizmus ellen |
| 6.13 | Tájékoztató tábla | laminált, „Iskolai vízminőség-mérő…” | 1 | 1 000 | K | |

## 7. Fogyóeszközök, vegyszerek

| # | Alkatrész | Db | Kb. ár | | Megjegyzés |
|---|---|---|---|---|---|
| 7.1 | pH pufferek: 4,00 és 7,00 (+10,01) | 1–1 | 3 000 | K | tasakos por a legolcsóbb, tartós |
| 7.2 | EC kalibráló oldat 1413 µS/cm | 1 | 2 000 | K | |
| 7.3 | Desztillált víz | 5 l | 1 000 | K | |
| 7.4 | 3 mol/l KCl oldat (pH szonda tárolás) | 1 | 2 000 | K | |
| 7.5 | Zsugorcső-, kábel-, forrasztóón készlet | | 4 000 | K | ólommentes ón |
| 7.6 | Kétkomponensű műgyanta / kiöntő | 1 | 3 000 | K | zavarosság szenzor |
| 7.7 | Szilikon tömítő (kültéri) | 1 | 2 000 | O | |
| 7.8 | DO szonda membrán + elektrolit | 1 | 10 000 | O | csak DO szenzorral |

## 8. Oktatási / bemutató szenzorok (opcionális)

Olcsó alternatívák a foglalkozásokhoz. Ezek **nem kerülnek a folyóba**, csak pohárban vagy
vödörben dolgoznak. A részletek, a bekötés és a kísérletötletek a
[12. fejezetben](../docs/12_oktatasi_szenzorok.md) vannak.

| # | Alkatrész | Helyettesíti | Db | Kb. ár | Program |
|---|---|---|---|---|---|
| 8.1 | NTC vízálló szonda 10 kΩ (B3950) + 10 kΩ ellenállás | DS18B20 | csoportonként 1 | 600 | teszt 07 |
| 8.2 | PH-4502C panel + E-201-C szonda | ipari pH készlet | osztályonként 1 | 6 000–10 000 | fő program / teszt 03 |
| 8.3 | TCS34725 színérzékelő (+ vöröskáposzta 🙂) | pH szonda | csoportonként 1 | 1 500–4 000 | teszt 10 |
| 8.4 | pH tesztcsík / univerzális indikátorpapír | – (összehasonlítás) | 1 doboz | 1 000–2 000 | – |
| 8.5 | TDS szenzor klón (CQRobot, Keyestudio stb.) | DFRobot TDS | csoportonként 1 | 2 000–3 000 | fő program / teszt 03 |
| 8.6 | 2 rozsdamentes csavar + kupak, **vagy** rezisztív talajnedvesség-villa | TDS szenzor | csoportonként 1 | 100–600 | teszt 08 |
| 8.7 | Kézi TDS mérő toll | – (összehasonlítás) | 1 | 2 000–4 000 | – |
| 8.8 | SEN0189 klón **vagy** LED + LDR + 220 Ω + 10 kΩ | zavarosság szenzor | csoportonként 1 | 300–4 000 | fő program / teszt 09 |
| 8.9 | HC-SR04 ultrahangos távolságmérő | – (vízszint, bónusz) | csoportonként 1 | 500–1 000 | teszt 11 |
| 8.10 | „Water level sensor” vízérzékelő panel | – (szivárgásjelző demó) | csoportonként 1 | 200–500 | teszt 03 |
| 8.11 | Akvarisztikai O₂ csepp-teszt | DO szenzor | 1 | 3 000–5 000 | – |

## 9. Szerszámok (ha nincs az iskolában)

Multiméter, forrasztóállomás + elszívó, csupaszító fogó, oldalcsípő, csavarhúzókészlet, fúrógép +
lépcsős fúró, melegragasztó pisztoly, hőlégfúvó, védőszemüvegek, USB árammérő („USB doktor”).

## Költségösszesítő (becslés)

| Csoport | Kb. ár |
|---|---|
| Szenzorok (DO nélkül) | 45 000–60 000 |
| Kommunikáció | 10 000–20 000 |
| Energiaellátás | 25 000–35 000 |
| Kapcsolók, apró alkatrészek | 5 000 |
| Mechanika | 25 000–40 000 |
| Fogyóeszközök, vegyszerek | 15 000–20 000 |
| **Összesen (DO nélkül, Arduino nélkül)** | **≈ 125 000–180 000 Ft** |
| + oldott oxigén szenzor | + 70 000–90 000 |
| + oktatási szenzorkészlet (4 csoport + közös eszközök) | + 55 000–70 000 |
| Havi üzemeltetés (SIM) | 500–2 000 Ft/hó |

> **Spórolási tippek:** a pH szondánál ne spóroljunk (ez a legfontosabb és legsérülékenyebb), de a
> mechanikai részek nagy része barkácsáruházból vagy hulladékból (PVC cső, lemez) is megoldható;
> a doboz és a tömszelencék villanyszerelési boltban olcsóbbak, mint elektronikai webshopokban.
