# Firmware – fordítás, feltöltés, beállítás

## Tartalom

| Mappa / fájl | Mire való? |
|---|---|
| `vizerzekelo/` | A fő program. A mappa neve megegyezik a `.ino` fájl nevével (ezt az Arduino így kéri). |
| `vizerzekelo/config.h` | **Minden beállítás** (adatküldés módja, beépített szenzorok, lábak, időzítések). |
| `vizerzekelo/secrets_example.h` | Minta a titkos adatokhoz → másold `secrets.h` névre! |
| `tesztek/01…06` | Kis programok a terepi alkatrészek egyenkénti kipróbálásához (diákoknak is). |
| `tesztek/07…11` | Olcsó / barkács oktatási szenzorok programjai ([docs/12](../docs/12_oktatasi_szenzorok.md)). |

### Tesztprogramok

| # | Program | Mit próbál ki? | Extra könyvtár |
|---|---|---|---|
| 01 | `01_led_matrix` | Arduino + LED mátrix, első feltöltés | – |
| 02 | `02_ds18b20_vizhomero` | DS18B20 vízhőmérő | OneWire, DallasTemperature |
| 03 | `03_analog_szenzorok` | pH, EC, zavarosság, DO nyers feszültsége (klónokkal, PH-4502C-vel is) | – |
| 04 | `04_bme280_doboz` | BME280 doboz klíma | Adafruit BME280 |
| 05 | `05_modem_at_konzol` | modem kézi AT parancsokkal | – |
| 06 | `06_wifi_thingspeak` | első adatküldés WiFi-n | – |
| 07 | `07_ntc_homero` | NTC termisztor hőmérő | – |
| 08 | `08_diy_vezetokepesseg` | barkács vezetőképesség-mérő (2 csavar) | – |
| 09 | `09_diy_zavarossag` | LED + LDR zavarosságmérő | – |
| 10 | `10_kaposztas_ph` | vöröskáposzta + TCS34725 színérzékelő | Adafruit TCS34725 |
| 11 | `11_vizszint_ultrahang` | HC-SR04 / JSN-SR04T vízszint | – |

### A fő program moduljai

| Fájl | Feladat |
|---|---|
| `vizerzekelo.ino` | A fő ciklus: akku ellenőrzés → mérés → küldés → lekapcsolás |
| `sensors.*` | Szenzorok olvasása, zajszűrés, képletek (pH, EC, NTU, DO) |
| `calibration.*` | Kalibrációs adatok tárolása az EEPROM-ban |
| `power.*` | Tápkapcsolók, TPL5110, akkufeszültség, szerviz jumper |
| `transport.*` | Adatküldés ThingSpeakre (WiFi / GSM / semmi) |
| `modem.*` | LTE/GSM modem kezelése AT parancsokkal |
| `service.*` | Szerviz menü (kalibrálás, élő mérés, modem konzol) |
| `status.*` | Ikonok a LED mátrixon |
| `measurement.*` | A mérési eredmény adatszerkezete, kiírás |

## 1. Fejlesztőkörnyezet telepítése

1. Töltsd le az **Arduino IDE 2**-t: <https://www.arduino.cc/en/software>
2. *Eszközök → Alaplap → Alaplapkezelő*: telepítsd az **„Arduino UNO R4 Boards”** csomagot.
3. *Vázlat → Könyvtár beillesztése → Könyvtárak kezelése*: telepítsd:
   - **OneWire** (Paul Stoffregen)
   - **DallasTemperature** (Miles Burton)
   - **Adafruit BME280 Library** (a függőségeit is: Adafruit Unified Sensor, Adafruit BusIO)

   A `WiFiS3`, `EEPROM` és `Arduino_LED_Matrix` könyvtárak az alaplapcsomag részei.

## 2. Beállítás

1. Másold le a `vizerzekelo/secrets_example.h` fájlt **ugyanabba a mappába** `secrets.h` néven, és töltsd ki.
2. Nyisd meg a `config.h`-t, és állítsd be:
   - `TRANSPORT_MODE` – kezdetben `TRANSPORT_WIFI` (iskolai teszt), terepen `TRANSPORT_GSM`
   - `USE_...` – csak azokat hagyd 1-en, amelyik szenzor tényleg be van kötve
   - `ADC_VREF` – mérd meg multiméterrel az Arduino 5V lábát, és írd be
   - `PH_BOARD` – `PH_BOARD_DFROBOT_V2` vagy (olcsó oktatási panelhez) `PH_BOARD_PH4502C`

## 3. Feltöltés

1. Nyisd meg a `vizerzekelo/vizerzekelo.ino` fájlt az Arduino IDE-ben (a többi fájl automatikusan megnyílik füleken).
2. Alaplap: **Arduino UNO R4 WiFi**, port: amelyiken megjelenik.
3. **Feltöltés** (→ nyíl).
4. Soros monitor: **115200 baud**, sorvége: **„Új sor”** (Newline).

Parancssorból (`arduino-cli`):

```bash
arduino-cli compile -b arduino:renesas_uno:unor4wifi firmware/vizerzekelo
```

```bash
arduino-cli upload -b arduino:renesas_uno:unor4wifi -p /dev/ttyACM0 firmware/vizerzekelo
```

## 4. Szerviz mód

Két módon lehet belépni:

- a **D2 láb GND-re kötve** (szerviz jumper) bekapcsoláskor – terepen ez az egyetlen mód; vagy
- tesztpadon: bekapcsolás után **3 másodpercen belül Enter** a soros monitorban.

> **Terepi telepítés előtt állítsd `SERVICE_PROMPT_MS`-t 0-ra** a `config.h`-ban! Az UNO R4 WiFi
> nem tudja megállapítani, hogy van-e számítógép az USB-n (a `Serial` mindig „igaz”), ezért a
> 3 másodperces várakozás minden ébredéskor lefutna, és feleslegesen fogyasztana.

**Védelem a bent felejtett jumper ellen:** `SERVICE_TIMEOUT_S` (10 perc) tétlenség után a menü
kilép. Ha a jumper ekkor is bent van, a doboz a kivételéig nem lép újra szerviz módba, normálisan
mér, és `SZERVIZ_JUMPER` állapotot küld.

A menüből lehet kalibrálni, élőben nézni a mért értékeket, kézzel AT parancsokat küldeni a modemnek,
és kipróbálni egy teljes mérés + küldés ciklust. Részletek: [docs/08_kalibracio_es_karbantartas.md](../docs/08_kalibracio_es_karbantartas.md).

## 5. Egy normál ciklus kimenete (példa)

```
=============================================
  VÍZÉRZÉKELŐ DOBOZ  v0.1.0
  Adatküldés: WiFi
=============================================
Szerviz módhoz nyomj Entert 3 mp-en belül...
------------- MÉRÉSI EREDMÉNYEK -------------
Vízhőmérséklet:     11.94 °C
pH:                 7.86
  pH nyers feszültség:1.3721 V
Vezetőképesség (EC):412 µS/cm
TDS (oldott anyag): 206 mg/l
Zavarosság:         37 NTU
Oldott oxigén:      --- (nincs adat)
Akkufeszültség:     3.98 V
Doboz hőmérséklet:  9.8 °C
Doboz páratartalom: 41 %
Állapot:             OK
---------------------------------------------
[WiFi] Válasz: HTTP/1.1 200 OK
>>> Adatküldés SIKERES
```
*(Az értékek csak illusztrációk.)*

## 6. Ellenőrzött állapot

- ✅ Lefordul: `arduino:renesas_uno` 1.6.0, mindhárom `TRANSPORT_MODE`-ban, mindkét `PH_BOARD`
  beállítással, és mind a 11 tesztprogram.
- ⬜ Hardveren tesztelve – **még nem**. Az első összeépítésnél a `DEBUG_AT 1` beállítás és a
  tesztprogramok sokat segítenek a hibakeresésben.
