# 7. Összeszerelés lépésről lépésre

**Alapelv: soha ne kössünk össze mindent egyszerre!** Minden alkatrészt külön, a saját
tesztprogramjával próbálunk ki, és csak ha működik, lépünk tovább. Ha hiba van, így mindig
tudjuk, hogy az utoljára hozzáadott részben kell keresni.

Jelölések: 👧 diákok végezhetik (felügyelettel) · 🧑‍🔧 felnőtt végzi (diákok figyelik, segítenek)

## 0. Előkészületek

**Szerszámok:** dugaszolós próbapanel (breadboard), jumper vezetékek, multiméter, forrasztópáka
(ólommentes forrasztóón), csupaszító fogó, csavarhúzó készlet, fúrógép + lépcsős fúró (a dobozhoz),
melegragasztó pisztoly, zsugorcső + hőlégfúvó/öngyújtó, laptop Arduino IDE-vel.

**Szoftver:** lásd [firmware/README.md](../firmware/README.md) – IDE, alaplapcsomag, könyvtárak.

## 1. Ismerkedés az Arduinóval 👧

1. USB-C kábellel csatlakoztasd az Arduinót a laptophoz.
2. Töltsd fel a [`01_led_matrix`](../firmware/tesztek/01_led_matrix/) programot.
3. ✅ Siker: a LED mátrixon vízcsepp, hullám és szív váltakozik.
4. Rajzoljatok saját ikont!

## 2. Vízhőmérő 👧

1. Próbapanelen kösd be a DS18B20-at (piros 5 V, fekete GND, sárga D4 + 4,7 kΩ az 5 V-ra).
2. Töltsd fel a [`02_ds18b20_vizhomero`](../firmware/tesztek/02_ds18b20_vizhomero/) programot.
3. ✅ Siker: a soros monitoron a hőmérséklet jelenik meg; fogd meg a szenzort – nő az érték.

## 3. Analóg szenzorok – először tápkapcsolók NÉLKÜL 👧

1. Kösd be **egyszerre csak egy** szenzort: + → 5 V, − → GND, jel → A0 / A1 / A2.
2. A [`03_analog_szenzorok`](../firmware/tesztek/03_analog_szenzorok/) programban a tápláb most nem számít,
   csak a feszültséget figyeld.
3. ✅ Siker: pH szonda pH 7 pufferben ≈ 1,3–1,7 V; TDS desztillált vízben ≈ 0 V, sós vízben több;
   zavarosság tiszta vízben ≈ 4,0–4,5 V.
4. Konyhai kísérletek (lásd [11_oktatasi_segedlet.md](11_oktatasi_segedlet.md)) – ehhez
   érdemes az olcsó oktatási szenzorokat használni, a terepi szondákat kímélve
   ([12_oktatasi_szenzorok.md](12_oktatasi_szenzorok.md)).

## 4. Doboz szenzor (BME280) 👧

1. Qwiic kábellel dugd be a BME280-at.
2. [`04_bme280_doboz`](../firmware/tesztek/04_bme280_doboz/) → ✅ hőmérséklet, pára, légnyomás.

## 5. Tápkapcsolók építése 🧑‍🔧 (👧 segíthet)

1. Építsd meg a [bekotes.md](../hardware/bekotes.md) 3. pontjában lévő kapcsolót **egy példányban**
   próbapanelen. Kapcsold a D5-öt HIGH-ra (pl. a 03-as tesztprogrammal), és mérd multiméterrel a kimenetet:
   HIGH → kb. 5 V, LOW → 0 V.
2. Ha működik, építsd meg mind a 3 (4) szenzorkapcsolót egy **forrasztható próbapanelen** (perfboard).
3. Kösd rájuk a szenzorokat; a 03-as teszttel ellenőrizd, hogy mindig csak a kiválasztott szenzor kap tápot.

## 6. WiFi + ThingSpeak 👧

1. Hozd létre a ThingSpeak csatornát ([05_kommunikacio.md](05_kommunikacio.md) 5.4).
2. [`06_wifi_thingspeak`](../firmware/tesztek/06_wifi_thingspeak/) – töltsd ki a WiFi adatokat és az API kulcsot.
3. ✅ Siker: a ThingSpeak csatorna grafikonján megjelennek a pontok.

## 7. A fő program, WiFi módban 👧🧑‍🔧

1. `secrets.h` létrehozása, `config.h` → `TRANSPORT_MODE TRANSPORT_WIFI`, `ADC_VREF` beírása.
2. Feltöltés, soros monitor. Lépj szerviz módba (Enter 3 mp-en belül), **1-es menüpont**: élő mérés.
3. Kalibrálás (2–5. menüpont) – [08_kalibracio_es_karbantartas.md](08_kalibracio_es_karbantartas.md).
4. **10-es menüpont:** mérés + küldés → ✅ adatok a ThingSpeakben, minden mező kitöltve.
5. Kilépés (0) → a program 15 percenként mér (TPL5110 nélkül a beépített várakozással).

## 8. Modem 🧑‍🔧

1. Helyezd be a SIM kártyát (a PIN kérés előtte telefonban kikapcsolva!), csatlakoztasd az antennát.
   **Antenna nélkül soha ne kapcsold be a modemet** – a rádiós kimenet károsodhat.
2. Kösd be: akku → modem kapcsoló → 1000 µF → modem VBAT; szintillesztő; D0/D1; D8; D9 ([bekotes.md](../hardware/bekotes.md) 4. pont).
   A modem tápvezetéke legyen **rövid és vastag** (min. 0,5 mm², inkább 0,75 mm²).
3. [`05_modem_at_konzol`](../firmware/tesztek/05_modem_at_konzol/) → kézzel: `AT`, `AT+CPIN?`, `AT+CSQ`, `AT+CEREG?` 👧 (diákok gépelhetnek!)
4. Fő program: `TRANSPORT_MODE TRANSPORT_GSM` → szerviz mód **10-es menüpont** → ✅ adat a ThingSpeakben.

## 9. Energiaellátás 🧑‍🔧

1. Akku (biztosítékkal!) → töltésvezérlő. Napelem → töltésvezérlő. Ellenőrizd multiméterrel a
   töltésvezérlő 5 V-os kimenetét.
2. TPL5110 bekötése: töltésvezérlő 5 V → TPL5110 VDD; TPL5110 kimenet → USB-A aljzat → USB kábel →
   Arduino. TPL5110 DONE ← Arduino D3. Közös GND!
3. Az időközt állítsd először **rövidre** (kb. 2–3 perc) a teszteléshez.
4. Akkufeszültség osztó → A3. Szerviz módban hasonlítsd össze a kijelzett akkufeszültséget a
   multiméterrel mértel; ha eltér, finomítsd a `BATTERY_DIVIDER_RATIO`-t.
5. ✅ Siker: a doboz magától bekapcsol, mér, küld, kikapcsol, és ezt ismétli. A LED mátrix
   ikonjai mutatják, hol tart.
6. Végül állítsd be a 15 perces időközt.

## 10. Beépítés a dobozba 🧑‍🔧 (👧 tervezhet, mérhet, jelölhet)

1. **Tervezzétek meg papíron** a dobozon belüli elrendezést (méretarányos rajz!) 👧
2. Furatok a tömszelencéknek a doboz **alján** 🧑‍🔧
3. Szerelőlap, távtartók, alkatrészek felcsavarozása.
4. Kábelek: a szenzorkábelekre **csatlakozók** (pl. vízálló M12 / GX12 / JST), hogy a szondák
   cserélhetők legyenek forrasztás nélkül.
5. A zavarosság szenzor felső részének **kiöntése** (műgyanta / melegragasztó) 🧑‍🔧
6. Szilikagél, nyomáskiegyenlítő szelep, tömítések.

## 11. Vízállósági próba 👧🧑‍🔧

1. Az **üres** (elektronika nélküli) dobozba tegyetek egy papírtörlőt, zárjátok le, és
   30 percre merítsétek egy vödör vízbe (nehezékkel).
2. ✅ Siker: a papír száraz. Ha nedves – keressétek meg a szivárgást, javítsátok, ismételjétek.
3. Majd a teljes doboz „esőztetése” zuhanyrózsával / locsolókannával, működés közben.

## 12. Próbaüzem 👧🧑‍🔧

1–2 hétig az iskolaudvaron: a szenzortartó cső egy **nagy hordó / vödör vízben** (cseréljétek
benne néha a vizet – csapvíz, esővíz, kicsit sós víz), a napelem a napon.
- Folyamatosan jönnek az adatok?
- Bírja az akku az éjszakát, feltölt napközben?
- Stabil a doboz páratartalma?
- Látszanak-e a változások a víz cseréjekor?

Ha minden rendben: **telepítés a folyóra** – [06_mechanika_es_telepites.md](06_mechanika_es_telepites.md).
