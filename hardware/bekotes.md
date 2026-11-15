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
| **D9** | ki | modem PWRKEY (a panel bemenetére) | lásd 4. pont |
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
   NAPELEM (6 V)                                     ┌──────────────────────┐
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

- Az Adafruit TPL5110 panelen a lábak neve: **VDD** (be), **DRV** vagy **OUT** (kapcsolt kimenet –
  a panel feliratát nézd!), **DONE**, **GND**, **DELAY** (kézi ébresztés). Időköz: a panelen lévő
  trimmerrel.
- A feszültségosztó két 470 kΩ-os ellenállása az akku feszültségét felezi (4,2 V → 2,1 V).
  Ha más arányt használsz, írd át a `config.h`-ban: `BATTERY_DIVIDER_RATIO = (R1 + R2) / R2`.
- **A biztosíték az akku + pólusánál** legyen, minden más utána!

## 3. Tápkapcsoló (high-side kapcsoló) – szenzorokhoz és modemhez

Egy Arduino láb közvetlenül nem tud elég áramot adni (max. ~8 mA) – ezért egy tranzisztor és egy
MOSFET kapcsolja a tápot. **Arduino láb HIGH → a fogyasztó BE.** Ha az Arduino ki van kapcsolva,
a 10 kΩ-os felhúzó ellenállás miatt a fogyasztó biztosan KI van kapcsolva.

```
        Bemenet: +5 V (szenzoroknál)  vagy  VBAT (modemnél)
                    │
                    ├───────────────┐
                    │               │
                  ┌─┴─┐             │ S (source)
                  │10k│         ┌───┴───┐
                  └─┬─┘    G    │P-MOSFET│  pl. AO3401A / DMG2305UX
                    ├───────────┤       │
                    │           └───┬───┘
                    │               │ D (drain)
                    │ C             └──────────► KIMENET a szenzor/modem "+" lábára
                  ┌─┴─┐                          (modemnél: + 1000 µF a GND felé,
   Arduino Dx ──┤1k├──┤ B  NPN (BC547)            közvetlenül a modem mellett)
                  └───┘ │
                        │ E
                        │
                       GND
```

| Kapcsoló | Vezérlő láb | Bemenet | Terhelés |
|---|---|---|---|
| pH | D5 | +5 V | ~10 mA |
| EC/TDS | D6 | +5 V | ~5 mA |
| Zavarosság | D7 | +5 V | ~40 mA |
| DO (opc.) | D10 | +5 V | ~5 mA |
| **Modem** | D8 | **VBAT** | **csúcsban 2 A!** – kis R<sub>DS(on)</sub> MOSFET, vastag vezeték |

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
                                                              
   D9  ───────────────────────────────────────────────────► PWRKEY (vagy "PWR", "K")
   D8  ───► MODEM TÁPKAPCSOLÓ (3. pont) ──┬────────────────► VBAT
                                          │
                                       1000 µF  (+ a VBAT-on, − a GND-n)
                                          │
                                         GND ──────────────► GND
                                                              ANT ◄── LTE antenna
                                                              SIM ◄── nano/micro SIM
```

Figyelem:
- **TX → RX, RX → TX** (keresztben)!
- A szintillesztő LV oldalát a modem panel **saját logikai feszültségéről** tápláld (gyakran
  „VDD_EXT”, „VCCIO” vagy „3V3” felirat). Ha a panel 5 V-os logikát is elfogad (pl. jumperrel
  választható), a szintillesztő elhagyható.
- **PWRKEY:** a legtöbb panelen a PWRKEY bemenet egy tranzisztorra megy, és **HIGH impulzus** kapcsolja be
  (`MODEM_PWRKEY_ACTIVE_HIGH 1`). Ha a panelen a PWRKEY közvetlenül a modemre megy (alacsony aktív),
  akkor egy NPN tranzisztorral kell GND-re húzni, és a beállítás ugyanígy 1 marad; ha fordított a logika, 0.
  Egyes panelek tápra maguktól bekapcsolnak – a firmware ezt is kezeli.
- A modem tápvezetéke legyen **rövid** és **vastag** (≥ 0,5 mm²).
- **Antenna nélkül ne kapcsold be!**

## 5. Szenzorok bekötése

| Szenzor | Piros (+) | Fekete (−) | Jel | Megjegyzés |
|---|---|---|---|---|
| DS18B20 | 5 V | GND | D4 (sárga) | 4,7 kΩ D4 ↔ 5 V |
| pH panel | pH tápkapcsoló kimenet | GND | A0 (kék) | a szonda BNC-vel a panelhez |
| TDS panel | EC tápkapcsoló kimenet | GND | A1 | |
| Zavarosság panel | zavarosság tápkapcsoló kimenet | GND | A2 | **kapcsoló „A” állásban** (analóg) |
| DO panel (opc.) | DO tápkapcsoló kimenet | GND | A4 | |
| BME280 | Qwiic | Qwiic | Qwiic | |

A DFRobot Gravity szenzorok 3 tűs csatlakozóval jönnek: **piros = +, fekete = −, kék/zöld = jel**
(a színek gyártónként eltérhetnek – nézd meg a panel feliratát!).

## 6. Kábelterv (dobozon kívülre menő kábelek)

| Kábel | Erek | Tömszelence | Hossz |
|---|---|---|---|
| Napelem | 2 (+, −) | PG7 | a tartótól függ |
| DS18B20 | 3 | PG7 | 2–3 m |
| pH szonda (koax/BNC) | 1 koax | PG7 | 3–5 m (gyári kábel!) |
| TDS szonda | 2 | PG7 | 2–3 m |
| Zavarosság szenzor | 3 | PG7 | 2–3 m (hosszabbítva) |
| DO szonda (opc.) | 1 koax | PG7 | gyári |
| LTE antenna (ha kívül) | koax | PG7 / SMA átvezető | |

> A **pH szonda kábelét ne hosszabbítsd és ne vágd el** – nagyon nagy impedanciájú jelet visz, a
> toldás tönkreteszi a mérést. Ha hosszabb kell, hosszabb kábelű szondát kell venni.
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
