# 8. Kalibráció és karbantartás

## 8.1 Mi az a kalibráció, és miért kell?

Minden szenzor egy kicsit másképp „lát”: két ugyanolyan típusú pH szonda ugyanabban a vízben
eltérő feszültséget ad, és egy szonda jele idővel el is „mászik” (öregszik, szennyeződik).
**Kalibráláskor ismert értékű oldatba tesszük a szenzort**, és megjegyezzük, mekkora feszültséget
ad – így a program ki tudja számolni, mit jelent a többi feszültség.

> Hasonlat: ha egy vonalzón elcsúsztak a számok, két ismert hosszúságú tárggyal (pl. 4 cm és 7 cm)
> újra be tudjuk jelölni a skálát.

A kalibrációs értékek az Arduino **EEPROM**-jába kerülnek, így áramtalanítás után is megmaradnak.

## 8.2 Szükséges anyagok

| Anyag | Mire? | Megjegyzés |
|---|---|---|
| pH 7,00 pufferoldat | pH kalibráció 1. pont | por (tasakos) vagy kész oldat |
| pH 4,00 pufferoldat | pH kalibráció 2. pont | |
| (pH 10,01 puffer) | ellenőrzéshez, opcionális | |
| 1413 µS/cm EC kalibráló oldat | EC/TDS kalibráció | |
| Desztillált víz | öblítés, zavarosság „0 NTU” | flakonos, boltban kapható |
| 3 mol/l KCl oldat | pH szonda tárolása | a szondához gyakran adnak |
| Tiszta műanyag poharak | | szenzoronként külön! |
| Papírtörlő (puha) | leitatás | |
| Fekete pohár / alufólia | zavarosság kalibráció sötétben | |

**A pufferoldatok nem veszélyesek**, de ne igyuk meg, ne kerüljön szembe; munka után kezet mosunk.
A felbontott oldatok néhány hét alatt romlanak – mindig friss adagot használjunk, a használtat ne öntsük vissza.

## 8.3 Belépés a szerviz módba

1. Csatlakoztasd a laptopot USB-n (terepen: a TPL5110 felőli USB kábelt húzd ki, és a laptopot dugd a helyére).
2. Soros monitor: **115200 baud**, **„Új sor”** (Newline).
3. Nyomd meg az Arduino RESET gombját, és **3 másodpercen belül nyomj Entert** (vagy a D2 lábat
   jumperrel GND-re kötve indítsd).
4. Megjelenik a menü, a LED mátrixon „S” betű.

## 8.4 pH kalibráció (2 pontos) – menü 2, majd 3

1. Öblítsd le a szondát desztillált vízzel, és **itasd le** (ne dörzsöld – az üvegmembrán érzékeny!).
2. **Menü 2:** tedd a szondát **és a vízhőmérőt** a **pH 7,00** pufferbe. A program élőben mutatja a feszültséget.
3. Várj, amíg az érték 1–2 percig nem változik (a 3. tizedesjegy már alig mozog), majd **Enter**.
4. Öblítés, leitatás.
5. **Menü 3:** **pH 4,00** puffer, várakozás, **Enter**.
6. A program kiírja a **meredekséget** (mV/pH). Ha nagyon eltér a többi kalibrációtól (vagy a
   kezdeti értéktől 20%-nál jobban), a szonda öregszik / szennyezett → tisztítás vagy csere.
7. **Ellenőrzés:** menü 1 (élő mérés) a pH 7 pufferben → 7,0 ± 0,1-et kell mutatnia.

> A pufferek névleges értéke 25 °C-ra vonatkozik. A pH 7,00 puffer 10 °C-on kb. 7,07,
> a pH 4,00 kb. 4,00 – iskolai pontosságnál ez elhanyagolható.

## 8.5 EC/TDS kalibráció – menü 4

1. Öblítsd le a szondát desztillált vízzel, itasd le.
2. Tedd a szondát és a vízhőmérőt a **1413 µS/cm** oldatba.
3. Menü 4 → Enter (vagy írd be az oldat értékét, ha más) → várakozás → Enter.
4. A program kiírja az új **K** értéket (általában 0,8–1,2 között). 0,5–2,0 közötti érték elfogadható.

## 8.6 Zavarosság referencia – menü 5

1. Töltsd a fekete poharat (vagy alufóliával körbetekert poharat) **desztillált vízzel**.
2. Tedd bele a szenzort (csak a mérőrészt!), takard le, hogy ne érje fény.
3. Menü 5 → várakozás → Enter. Elvárt érték: kb. 4,0–4,5 V.

## 8.7 Oldott oxigén – menü 6 (csak ha van DO szenzor)

1. A szonda legyen összeszerelve, friss elektrolittal (🧑‍🔧 felnőtt töltheti!) – utána legalább
   **15–30 percig** „polarizálódjon” bekapcsolva.
2. A membránt nedves állapotban, de lógó csepp nélkül **tartsd a levegőn** (a levegő 100%-ban
   „oxigéntelített”), a vízhőmérő legyen mellette.
3. Menü 6 → várakozás, amíg stabil → Enter.

## 8.8 Kalibrációs napló

Minden kalibrálást jegyezzünk fel (füzetbe vagy táblázatba) – ebből látszik a szondák öregedése!

| Dátum | Ki végezte | pH7 [V] | pH4 [V] | Meredekség [mV/pH] | EC K | Zav. tiszta [V] | DO telít. [V] | Megjegyzés |
|---|---|---|---|---|---|---|---|---|
| 2026-__-__ | | | | | | | | |

A szerviz menü **7-es pontja** kiírja az aktuális értékeket – ezt kell átmásolni.

## 8.9 Karbantartási ütemterv

| Gyakoriság | Teendő | Ki? |
|---|---|---|
| **Naponta** (távolról) | ThingSpeak: jönnek-e adatok, van-e hibaüzenet a status mezőben | 👧 „ügyeletes” diák |
| **Hetente** | szenzortartó cső felhúzása, szondák szemrevételezése, zavarosság szenzor ablakának tisztítása (puha kefe, víz) | 🧑‍🔧 + 👧 |
| **2 hetente** | pH és EC szonda tisztítása; DO kalibráció | 🧑‍🔧 + 👧 |
| **Havonta** | pH 2 pontos kalibráció, EC kalibráció, zavarosság referencia; szilikagél ellenőrzés; napelem tisztítása; SIM egyenleg | 🧑‍🔧 + 👧 |
| **2 havonta** | DO membrán és elektrolit csere | 🧑‍🔧 |
| **Évente** | tömítések, tömszelencék ellenőrzése/cseréje; akku állapot (kapacitás); pH szonda cseréje, ha lassú/meredekség rossz | 🧑‍🔧 |
| **Árhullám előtt** | a szenzortartó cső kiemelése, ha uszadék várható | 🧑‍🔧 |

### Szondák tisztítása
- **Lerakódás, algásodás:** puha fogkefe + csapvíz, majd desztillált víz.
- **Zsíros, olajos szennyeződés (pH):** langyos, mosogatószeres víz, alapos öblítés.
- **Vízkő (pH, EC):** néhány percre híg ecet (vagy 0,1 mol/l sósav – csak 🧑‍🔧!), majd alapos öblítés.
- Tisztítás után **mindig újrakalibrálás**!

## 8.10 Hogyan vegyük észre, ha egy szenzor „rossz adatot” mér?

| Jel a grafikonon | Lehetséges ok |
|---|---|
| A pH lassan, napról napra egy irányba „csúszik” | elszennyeződött / öregszik a szonda → tisztítás, kalibrálás |
| A zavarosság folyamatosan nő, eső nélkül | algásodik a mérőablak → tisztítás |
| Egy érték hirtelen 0 vagy maximális lesz | kábelszakadás, csatlakozó, beázás |
| Az EC hirtelen esik, és a hőmérséklet is „furcsa” | a szonda kiért a vízből (alacsony vízállás!) |
| Minden érték zajos, ugrál | a modem zavar (`MODEM_EARLY_START 0`), rossz földelés |

**Tipp:** érdemes időnként egy **kézi mérőműszerrel** (pl. kölcsönkért kézi pH/EC mérővel) vagy
tesztcsíkkal ugyanott mérni, és összehasonlítani – ez a legjobb minőségellenőrzés.
