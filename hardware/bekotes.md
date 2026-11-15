# Bekötési terv

> **Mielőtt bármit bekötsz:** áramtalaníts (USB ki, akku leválasztva), és bekapcsolás előtt
> kérj meg valakit, hogy ellenőrizze a bekötést. **Minden GND legyen összekötve!**
>
> Színkód javaslat: **piros** = +5 V · **narancs** = akku + (VBAT) · **fekete** = GND ·
> **sárga** = analóg jel · **kék** = digitális jel · **zöld/fehér** = UART.

## 1. Lábkiosztás – Arduino UNO R4 WiFi

| Láb | Irány | Bekötés | Megjegyzés |
|---|---|---|---|
| **D0** (RX) | be | szintillesztő ← modem **TX** | Serial1 |
| **D1** (TX) | ki | szintillesztő → modem **RX** | Serial1 |
| **D2** | be | szerviz jumper / reed relé → GND | belső felhúzó; GND = szerviz mód |
| **D3** | ki | TPL5110 **DONE** | felfutó él = lekapcsolás |
| **D4** | be/ki | DS18B20 adat (sárga) | + 4,7 kΩ az 5 V-ra |
| **D5** | ki | pH tápkapcsoló | HIGH = BE |
| **D6** | ki | EC/TDS tápkapcsoló | HIGH = BE |
| **D7** | ki | zavarosság tápkapcsoló | HIGH = BE |
| **D8** | ki | modem tápkapcsoló | HIGH = BE |
| **D9** | ki | modem PWRKEY – **NPN tranzisztoron át**, nem közvetlenül | lásd 4. pont |
| **D10** | ki | DO tápkapcsoló (opcionális) | HIGH = BE |
| D11–D13, A5 | – | szabad | bővítéshez |
| **A0** | be | pH panel jelkimenet | |
| **A1** | be | TDS panel jelkimenet | |
| **A2** | be | zavarosság panel jelkimenet | a panel kapcsolója „A” (analóg) állásban! |
| **A3** | be | akkufeszültség osztó közepe | |
| **A4** | be | DO panel jelkimenet (opcionális) | |
| **Qwiic** | I2C | BME280 | Wire1, 3,3 V |
| **5V** | táp ki | szenzor tápkapcsolók bemenete, DS18B20 | |
| **GND** | | közös föld | |
| **USB-C** | táp be | TPL5110 → USB-A aljzat → kábel | terepi táp |

## 2. Tápellátás

```
   NAPELEM (a töltőhöz illő!)                        ┌──────────────────────┐
   (+)───────────────────────► SOLAR IN              │                      │
   (−)───────────────────────► GND                   │  TÖLTÉSVEZÉRLŐ       │
                                                     │  (1S Li-ion, MPPT)   │
   AKKU 2×18650 párhuzamosan                         │                      │
   (+)──[ BIZTOSÍTÉK 3 A ]──┬─► BAT+                 │      5V OUT ─────────┼──┐
   (−)──────────────────────┼─► BAT−                 │      GND    ─────────┼──┼──┐
                            │                        └──────────────────────┘  │  │
                            │  VBAT (3,4–4,2 V)                                │  │
                            ├──────────► MODEM TÁPKAPCSOLÓ (3. pont, D8)       │  │
                            │                                                  │  │
                            │   470 kΩ                                         │  │
                            └──/\/\/──┬──────────► A3                          │  │
                                      │                                        │  │
                                     ─┴─ 470 kΩ  ║ 100 nF                      │  │
                                      │          ║                             │  │
                                     GND        GND                            │  │
                                                                               │  │
      ┌────────────────────────────────────────────────────────────────────────┘  │
      │                                                                           │
      │      ┌──────────────┐            ┌──────────────┐                         │
      └─────►│ VDD  TPL5110 │            │  USB-A       │   USB A–C kábel         │
             │       DRV/OUT├───────────►│  aljzat  VBUS├════════════════► ARDUINO│
         ┌──►│ DONE         │      ┌────►│          GND │                   USB-C │
         │   │ GND          │◄─────┤     └──────────────┘                         │
         │   └──────────────┘      │                                              │
         │                         └────────────────── GND ◄──────────────────────┘
         └─────────── D3 (Arduino)
```

- **A napelem feszültségét a töltésvezérlőhöz kell választani** (pl. DFR0559-hez 5 V-os,
  Waveshare (C)-hez 6–12 V-os panel). Túl nagy feszültségű panel tönkreteszi a töltőt – lásd
  [04_energiaellatas.md](../docs/04_energiaellatas.md) 4.1.1. Bekötés előtt mérd meg multiméterrel
  a panel üresjárási feszültségét a napon!
- Az Adafruit TPL5110 panelen a lábak neve: **VDD** (be), **DRV** vagy **OUT** (kapcsolt kimenet –
  a panel feliratát nézd!), **DONE**, **GND**, **DELAY** (kézi ébresztés). Időköz: a panelen lévő
  trimmerrel.
- A feszültségosztó két 470 kΩ-os ellenállása az akku feszültségét felezi (4,2 V → 2,1 V).
  Ha más arányt használsz, írd át a `config.h`-ban: `BATTERY_DIVIDER_RATIO = (R1 + R2) / R2`.
- **A biztosíték az akku + pólusánál** legyen, minden más utána!

## 3. Tápkapcsoló (high-side kapcsoló) – szenzorokhoz és modemhez

Egy Arduino láb közvetlenül nem tud elég áramot adni (max. ~8 mA) – ezért egy tranzisztor és egy
MOSFET kapcsolja a tápot. **Arduino láb HIGH → a fogyasztó BE.** Ha az Arduino ki van kapcsolva,
a felhúzó ellenállás miatt a fogyasztó biztosan KI van kapcsolva.

### 3.1 Szenzor tápkapcsoló (pH, EC, zavarosság, DO)

```
   +5 V ─────────┬──────────────────┐
                 │                  │ S (source)
              [10 kΩ]           ┌───┴────┐
                 │         G    │P-MOSFET│   pl. AO3401A / DMG2305UX
                 ├──────────────┤        │
                 │              └───┬────┘
                 │ C                │ D (drain)
   Dx ─[1 kΩ]──B  NPN               └────────────► a szenzor "+" lába
                 │ E   (BC547 / 2N2222)
                GND
```

### 3.2 Modem tápkapcsoló – lágy indítással

A modem panelen nagy kondenzátorok vannak. Ha a kapcsoló hirtelen kapcsolna be, ezek egy
pillanatra nagyon nagy áramot vennének fel, ami **megrántaná az akku feszültségét** – arról
pedig az Arduino 5 V-ja is készül, tehát az Arduino újraindulhatna. Két dolgot teszünk ez ellen:

1. A nagy, **1000 µF-os puffer kondenzátor a kapcsoló ELŐTT**, az akku oldalán van (nem utána):
   így nem a kapcsolón át töltődik fel, és a modem áramcsúcsait is ő szolgálja ki.
2. **Lágy indítás:** a MOSFET gate-je és source-a közé tett 1 µF-os kondenzátor miatt a
   kapcsoló nem egy pillanat alatt, hanem néhány ezredmásodperc alatt nyit ki.

```
   VBAT ──┬─────────┬───────────┬───────────────┐
  (akku,  │         │           │               │ S (source)
  bizt.   │      [100 kΩ]     [1 µF]        ┌───┴────┐
  után) [1000 µF]   │           │      G    │P-MOSFET│  kis ellenállású típus
          │         ├───────────┴───────────┤        │  (R_DS(on) < 60 mΩ)
         GND        │                       └───┬────┘
                 [10 kΩ]                        │ D (drain)
                    │ C                         └────────► modem VBAT
   D8 ─[1 kΩ]────B  NPN                                    (rövid, vastag vezeték)
                    │ E
                   GND
```

- A 100 kΩ és az 1 µF **mindkettő a VBAT (source) és a gate között** van; a 10 kΩ a gate és
  az NPN tranzisztor kollektora között.
- Bekapcsolás: kb. 5–20 ms alatt nyit ki. Kikapcsolás: kb. 0,1–0,2 s (a firmware a modem
  leállítása után 3 másodpercet vár, ez bőven elég).
- **Ezek számított kiinduló értékek, hardveren még nem próbáltuk ki.** Az első
  összeépítéskor ellenőrizd: a modem bekapcsolásakor (D8 HIGH) az Arduino nem indulhat újra,
  és a modem VBAT lábán meg kell jelennie az akkufeszültségnek. Ha az Arduino mégis újraindul,
  növeld az 1 µF-ot (pl. 2,2 µF-ra); ha a modem nem kap teljes feszültséget, ellenőrizd a
  MOSFET típusát és a bekötést.

| Kapcsoló | Kapcsolás | Vezérlő láb | Bemenet | Terhelés |
|---|---|---|---|---|
| pH | 3.1 | D5 | +5 V | ~10 mA |
| EC/TDS (+ leválasztó modul) | 3.1 | D6 | +5 V | ~5 mA + a leválasztó modul |
| Zavarosság | 3.1 | D7 | +5 V | ~40 mA |
| DO (opc.) | 3.1 | D10 | +5 V | ~5 mA |
| **Modem** | **3.2** | D8 | **VBAT** | **csúcsban 2 A!** – kis R<sub>DS(on)</sub> MOSFET, vastag vezeték |

> **Tápkapcsolók nélkül is működik** (pl. az első kísérleteknél): ekkor a szenzorok + lábát
> közvetlenül az 5 V-ra kötjük. A firmware ugyanúgy fut, csak a pH és az EC zavarhatják egymást.
> A modemet viszont kapcsolóval érdemes táplálni, különben folyamatosan fogyaszt.

## 4. Modem bekötése

```
  ARDUINO                SZINTILLESZTŐ (BSS138)             MODEM PANEL (A7670E)
                        HV (5 V oldal) │ LV (3,3 V oldal)
   5V  ──────────────►  HV             │ LV  ◄────────────  VDD_EXT / 3V3 (a modem panel
                                       │                    logikai feszültsége!)
   GND ──────────────►  GND            │ GND ◄────────────  GND
   D1 (TX) ──────────►  HV1            │ LV1 ─────────────► RXD
   D0 (RX) ◄──────────  HV2            │ LV2 ◄───────────── TXD
                                                              
   D9  ──[1 kΩ]── NPN tranzisztor ─────────────────────────► PWRKEY (vagy "PWR", "K")
                  (lásd lent – SOHA ne közvetlenül!)
   D8  ───► MODEM TÁPKAPCSOLÓ (3.2 pont) ──────────────────► VBAT
            (az 1000 µF az akku oldalán)
   GND ────────────────────────────────────────────────────► GND
                                                              ANT ◄── LTE antenna
                                                              SIM ◄── nano/micro SIM
```

### A PWRKEY bekötése – az Arduino 5 V-ja nem mehet rá közvetlenül!

A PWRKEY a modem „bekapcsoló gombja”: ha egy ideig a GND-re húzzuk, a modem elindul.
A modem chip alacsony feszültségű logikával működik, ezért **az Arduino 5 V-os lábát soha
nem kötjük közvetlenül a PWRKEY-re** – tönkretehetné a modemet. Helyette egy NPN tranzisztor
„nyomja meg a gombot” (csak lehúzni tud a GND-re, feszültséget nem ad rá):

```
                          modem PWRKEY
                               │
                               │ C
   D9 ──[1 kΩ]──────────────B  NPN  (BC547 / 2N2222)
                               │ E
                              GND
```

- Arduino D9 HIGH → a tranzisztor lehúzza a PWRKEY-t → „gombnyomás”. A `config.h`-ban
  `MODEM_PWRKEY_ACTIVE_HIGH 1` (ez az alapérték).
- **Mindig ezzel a bekötéssel kezdj – ez minden modem panelnél biztonságos.**
- Egyes modem paneleken **már van** ilyen tranzisztor (a panel leírása vagy kapcsolási rajza
  mutatja; a bemenet neve gyakran „PWR” vagy „K”). Ezeknél a fenti kapcsolással a modem nem
  indul el – ilyenkor, **és csak ilyenkor**, a D9 egy 1 kΩ-os soros ellenálláson át köthető a
  panel bemenetére. A beállítás ekkor is 1 marad.
- Egyes panelek tápra maguktól bekapcsolnak – a firmware ezt is kezeli (ilyenkor a PWRKEY-t
  nem is kell bekötni).

Figyelem:
- **TX → RX, RX → TX** (keresztben)!
- A szintillesztő LV oldalát a modem panel **saját logikai feszültségéről** tápláld (gyakran
  „VDD_EXT”, „VCCIO” vagy „3V3” felirat). Ha a panel 5 V-os logikát is elfogad (pl. jumperrel
  választható), a szintillesztő elhagyható.
- A modem tápvezetéke legyen **rövid** és **vastag** (≥ 0,5 mm²).
- **Antenna nélkül ne kapcsold be!**

## 5. Szenzorok bekötése

| Szenzor | Piros (+) | Fekete (−) | Jel | Megjegyzés |
|---|---|---|---|---|
| DS18B20 | 5 V | GND | D4 (sárga) | 4,7 kΩ D4 ↔ 5 V |
| pH panel | pH tápkapcsoló kimenet | GND | A0 (kék) | a szonda BNC-vel a panelhez |
| TDS panel | a **leválasztó modul** szenzor oldali kimenete | a leválasztó modul szenzor oldala | a leválasztó modulon át → A1 | lásd lent |
| Zavarosság panel | zavarosság tápkapcsoló kimenet | GND | A2 | **kapcsoló „A” állásban** (analóg) |
| DO panel (opc.) | DO tápkapcsoló kimenet | GND | A4 | |
| BME280 | Qwiic | Qwiic | Qwiic | |

A DFRobot Gravity szenzorok 3 tűs csatlakozóval jönnek: **piros = +, fekete = −, kék/zöld = jel**
(a színek gyártónként eltérhetnek – nézd meg a panel feliratát!).

### Leválasztó modul a TDS/EC szenzorhoz (terepi dobozban)

A TDS szenzor váltakozó feszültséget ad a vízre, ami a vízen keresztül megzavarja a pH
mérést. A gyártó megoldása erre a **galvanikus leválasztó modul** (DFRobot Gravity Analog
Signal Isolator, DFR0504): a szenzor táplálását és jelét is elválasztja az Arduinótól, így a
víz felől nincs elektromos kapcsolat a többi szenzor felé.

```
   EC tápkapcsoló (D6) ──► ┌───────────────────────┐ ──► TDS panel "+"
   GND ──────────────────► │  LEVÁLASZTÓ MODUL     │ ──► TDS panel "−"
   A1  ◄────────────────── │  Arduino    │ szenzor │ ◄── TDS panel jel
                           │  oldal      │ oldal   │
                           └───────────────────────┘
```

- A modul két csatlakozója közül az egyik az Arduino, a másik a szenzor felé megy – a
  panel feliratát nézd meg; a Gravity kábelekkel forrasztás nélkül összedugható.
- A modult is az **EC tápkapcsoló** táplálja, így csak az EC mérés idejére kap áramot.
- A modul kimenete a tápfeszültség pontosságától is függ, ezért **az EC kalibrálást a
  beépített modullal együtt** kell elvégezni. Ha az EC érték a mérés alatt még „kúszik”,
  növeld a `WARMUP_EC_MS` értékét a `config.h`-ban.
- Hogy tényleg megszűnt-e a zavarás, azt a [07_osszeszereles.md](../docs/07_osszeszereles.md)
  „zavarás-próbája” mutatja meg – ezt a modullal és nélküle is érdemes elvégezni.

## 6. Kábelterv (dobozon kívülre menő kábelek)

**Mekkora kábel kell?** Mérd le a tényleges kábelutat a szonda hegyétől az erősítő panelig:

```
  doboz magassága a víz felett (≥ 1 m)  +  merülési mélység (~0,3 m)
  +  vezetés a dobozon belül és a csepegtető ív (~0,5 m)   ≈   kb. 2 m
```

A gyári kábelek egy része ennél **rövidebb**, ezért ezeket hosszabbítani kell:

| Kábel | Erek | Gyári hossz | Teendő | Tömszelence |
|---|---|---|---|---|
| Napelem | 2 (+, −) | változó | a tartótól függően méretre vágni | PG7 |
| DS18B20 | 3 | 1 / 2 / 3 / 5 m-es kivitelben kapható | **eleve elég hosszút venni** (≥ 3 m) | PG7 |
| pH szonda, ipari (SEN0169-V2) | 1 koax (BNC) | 5 m | elég hosszú – **tilos toldani vagy elvágni!** | PG7 |
| TDS szonda (SEN0244) | 2 | **csak 83 cm** | **hosszabbítani kell** (lásd lent) | PG7 |
| Zavarosság szenzor (SEN0189) | 3 | rövid (vásárlás után mérd le!) | **hosszabbítani kell** a szonda és az adapter panel között | PG7 |
| DO szonda (opc.) | 1 koax (BNC) | gyári | ha rövid, a dobozt kell közelebb tenni – nem toldható | PG7 |
| LTE antenna (ha kívül) | koax | gyári | – | PG7 / SMA átvezető |

**Hosszabbítás (TDS és zavarosság szenzor) – felnőtt feladata:**
- A toldás mindig a **víz felett** legyen (a szenzortartó cső felső részén vagy a dobozban),
  soha ne merüljön víz alá.
- Vezeték: 2, illetve 3 eres, kültéri (UV-álló) kábel, lehetőleg árnyékolt; ereként legalább 0,25 mm².
- A toldást **forrasztani** kell, eresenként szigetelni, majd az egészre **ragasztós (belül
  olvadó) zsugorcsövet** húzni – a sima zsugorcső nem vízzáró.
- A kábel legyen olyan rövid, amilyen csak lehet (a szükségesnél ne hagyj rá métereket).
- **Hosszabbítás után a szenzort újra kell kalibrálni**, mert a hosszabb kábel kicsit
  megváltoztatja a jelet.
- Ha a terepi próbán a hosszabbított TDS szonda jele zajos, a megoldás egy hosszabb gyári
  kábelű (ipari) EC szonda.

> A **pH szonda kábelét ne hosszabbítsd és ne vágd el** – nagyon nagy impedanciájú jelet visz, a
> toldás tönkreteszi a mérést. Ha hosszabb kell, hosszabb kábelű szondát kell venni
> (a kísérleti labor szonda kábele rövidebb, terepre ezért sem alkalmas).
> Az analóg jeleket (A0–A2) a dobozon belül is minél rövidebben vezesd, távol a modemtől.

## 7. Szerviz jumper / reed relé

```
   D2 ─────┐
           │    jumper vagy reed relé (normál nyitott)
   GND ────┘
```

- **Jumper:** a dobozon belül, szervizeléshez.
- **Reed relé + mágnes (opcionális):** a dobozfal belső oldalára ragasztva; kívülről mágnessel
  aktiválható. Ha egy második reed relét a TPL5110 **DELAY** lábára kötsz (DELAY ↔ VDD), azzal
  kívülről azonnali ébresztést is kérhetsz.
