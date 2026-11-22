# 13. Vezérlők összehasonlítása: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect

Az iskolában az Arduino UNO R4 WiFi mellett **Arduino Nano 33 IoT** és **Arduino Nano RP2040
Connect** lapok is vannak. Ez a fejezet azt vizsgálja meg, hogy ezek mennyire illeszkednek a
projekthez: jobbak-e a terepi dobozba, és hol érdemes őket használni.

> **Röviden:** a terepi dobozba az **UNO R4 WiFi marad** a vezérlő. A két Nano lap
> használható alternatíva lenne, de mindkettő 3,3 V-os, ezért átírást és plusz alkatrészeket
> igényel, érdemi előnyük pedig nálunk nincs. A Nano RP2040 Connecten ráadásul csak 4 saját
> analóg bemenet van, és az RP2040 ADC-je ismert hibás. **Oktatásra viszont mindkettő nagyon
> jó:** így több csoport dolgozhat párhuzamosan, és az UNO R4 WiFi lapok a terepi dobozé maradhatnak.

## 13.1 A lapok fő adatai

| | **UNO R4 WiFi** | **Nano 33 IoT** | **Nano RP2040 Connect** |
|---|---|---|---|
| Processzor | Renesas RA4M1, 48 MHz | Microchip SAMD21, 48 MHz | Raspberry Pi RP2040, 2 mag, 133 MHz |
| WiFi | ESP32-S3 | u-blox NINA-W102 | u-blox NINA-W102 |
| **Logikai szint** | **5 V** | **3,3 V (nem 5 V-tűrő!)** | **3,3 V (nem 5 V-tűrő!)** |
| **Analóg bemenetek** | 6 (A0–A5), 14 bit, **0–5 V** | 8 (A0–A7), 12 bit, **0–3,3 V** | **4 saját** (A0–A3), 12 bit, 0–3,3 V; + A6/A7 a WiFi modulon át (lásd 13.2 d) |
| ADC megbízhatósága | jó | jó | **ismert hardverhiba** (lásd 13.4) |
| Kalibráció tárolása | EEPROM-emuláció | **nincs EEPROM**; a flash-emuláció **minden programfeltöltéskor törlődik** | fejlesztőkörnyezettől függ (lásd 13.2 c) |
| 5 V a szenzoroknak | igen (5V láb) | csak USB-táp és átforrasztott jumper esetén | a lapról nem biztos – külső 5 V-ról kell |
| Tápbemenet | USB-C 5 V / VIN 6–24 V | USB 5 V / VIN 4,5–21 V | USB 5 V / VIN (lásd az adatlapot) |
| Natív USB (a `Serial` tudja, van-e gép) | **nem** | igen | igen |
| Qwiic csatlakozó | van | nincs | nincs |
| LED mátrix | van (12×8) | nincs | nincs |
| Egyéb | – | mozgásérzékelő (IMU) | mozgásérzékelő (IMU), mikrofon, RGB LED |
| Python (MicroPython) | nem | nem jellemző | **igen**, az Arduino is támogatja |
| Méret | nagy (UNO) | kicsi (Nano) | kicsi (Nano) |

*Az adatok a gyártói dokumentációból és a fejezet végén felsorolt forrásokból származnak.*

## 13.2 Mi múlik a vezérlőn ebben a projektben?

### a) 5 V vagy 3,3 V – a legfontosabb különbség
A szenzorok egy része 5 V-os jelet ad, ami egy 3,3 V-os lap bemenetét **tönkreteheti**:

| Szenzor | Táp | Kimenet | 3,3 V-os lapon |
|---|---|---|---|
| pH panel (DFRobot V2) | 3,3–5,5 V | 0–3,0 V | ✅ közvetlenül megy |
| TDS/EC szenzor (DFRobot, TDS-M klón) | 3,3–5,5 V | 0–2,3 V | ✅ közvetlenül megy |
| **Zavarosság szenzor (SEN0189)** | **csak 5 V** | **0–4,5 V** | ⚠️ külső 5 V táp + **feszültségosztó** kell a jelre |
| **PH-4502C (oktatási pH panel)** | 5 V | 0–5 V | ⚠️ **feszültségosztó** kell |
| DS18B20, BME280, TCS34725 | 3,3–5 V | digitális | ✅ 3,3 V-ról táplálva megy |
| HC-SR04**+** (3,3–5 V-os változat) | 3,3 V | digitális | ✅ 3,3 V-ról táplálva megy |
| Modem UART (A7670E panel) | – | 1,8 V / 3,3 V | ✅ **egyszerűbb**: 3,3 V-os panelnél nem kell szintillesztő |

A 3,3 V-os lapok tehát a modemnél egyszerűsítenek, a zavarosság szenzornál bonyolítanak.

### b) A TPL5110 időzítő „kész” jele
A TPL5110 akkor kapcsol le, ha a DONE lábán a feszültség eléri a **tápfeszültsége 70%-át**.
Nálunk a TPL5110 5 V-ról megy, tehát legalább **3,5 V** kell. Egy 3,3 V-os lap ezt **nem
éri el biztosan**: a doboz nem kapcsolna le, és napok alatt lemerülne. Megoldás: a DONE
jelet a (már meglévő) szintillesztő egy szabad csatornáján kell átvezetni.

### c) Kalibráció tárolása
- **Nano 33 IoT:** nincs EEPROM. A szokásos megoldás (FlashStorage könyvtár) a program
  területén tárol, ezért **minden programfeltöltés törli a kalibrációt**, utána mindig újra
  kell kalibrálni. Megoldás lehet egy külső I2C EEPROM chip (pár száz forint), ez plusz munka.
- **Nano RP2040 Connect:** két fejlesztőkörnyezet közül lehet választani (13.5). Az Arduino
  saját csomagjában (mbed alapú) nincs EEPROM könyvtár, a közösségi „arduino-pico” csomagban van
  (a flash végén tárol). Hogy programfeltöltés után megmarad-e, azt ki kell próbálni.

### d) Analóg bemenetek száma
A terepi dobozhoz **4–5 analóg bemenet** kell: pH, EC, zavarosság, akkufeszültség (+ oldott oxigén).
- UNO R4 WiFi: 6 → ✅
- Nano 33 IoT: 8 → ✅
- Nano RP2040 Connect: **4 saját (A0–A3)** → oldott oxigén nélkül épp elég. Az A4/A5 az I2C-é
  (ide kell a BME280), az A6/A7 pedig a WiFi modulon keresztül mér, kisebb feszültségtartományban,
  és fórumokon sok a hibabejelentés róla. Oldott oxigén szenzorhoz külső ADC (ADS1115) kellene.

### e) Fogyasztás
A TPL5110 a mérések között **mindegyik lapot teljesen lekapcsolja**, ezért a lapok saját
alvó üzemmódja nálunk nem számít. Működés közben mindhárom lap fogyasztása hasonló nagyságrendű
(a WiFi modul a legnagyobb fogyasztó). Ebből a szempontból egyik sem jobb érdemben.

## 13.3 Nano 33 IoT a terepi dobozban

**Mit kellene átírni a programban?** (fordítási próbával ellenőrizve, lásd 13.5)
- Kalibráció tárolása: EEPROM helyett FlashStorage vagy külső EEPROM chip.
- I2C: `Wire1` helyett `Wire` (nincs Qwiic aljzat, a BME280 az A4/A5 lábra kerül).
- WiFi: `WiFiS3` helyett `WiFiNINA` (nagyon hasonló a használata).
- ADC: 12 bit, 3,3 V referencia (`config.h`).
- LED mátrix: nincs (`USE_LED_MATRIX 0`).

**Mit kellene a hardverben változtatni?**
- Feszültségosztó a zavarosság szenzor jelére (5 V → 3,3 V).
- A DONE jel a szintillesztőn át (13.2 b).
- 5 V a szenzoroknak a töltésvezérlő 5 V-os kimenetéről, a tápkapcsolókon át.

**Előnyei:** kisebb, a modemhez esetleg nem kell szintillesztő, 8 analóg bemenet, és a natív
USB miatt a szerviz mód Enter-várakozása csak akkor fut le, ha tényleg csatlakozik számítógép.

**Hátrányai:** átírás és újratesztelés, a kalibráció elveszik minden programfeltöltésnél, plusz
alkatrészek, nincs LED mátrix (ami a diákoknak látványos visszajelzés).

**Értékelés:** használható, de a mostani tervhez képest **nem jobb**. Akkor érdemes elővenni,
ha az UNO R4 WiFi valamiért nem elérhető, vagy egy második, kisebb mérőállomás készül.

## 13.4 Nano RP2040 Connect a terepi dobozban

**Az RP2040 ADC-je ismert hardverhibás:** bizonyos értékeknél (pl. 512, 1536, 2560, 3584
környékén) ugrik a mért érték. Ezt a gyártó is elismerte. A gyakorlatban olyan, mintha 12
helyett kb. 9 bites lenne az átalakító. A pH mérésnél ez már észrevehető hiba, ezért a terepi
dobozban ezzel a lappal **külső ADC-t** javasolunk:
- **ADS1115** (16 bites, 4 csatornás, I2C, kb. 1–3 ezer Ft): pontosabb, mint bármelyik lap
  saját ADC-je. A 4 csatorna épp elég: pH, EC, zavarosság, akkufeszültség.
- A program szenzorolvasó részét erre át kell írni (könyvtár: pl. Adafruit ADS1X15).

A többi teendő ugyanaz, mint a Nano 33 IoT-nál (3,3 V-os jelek, DONE jel, kalibráció tárolása).

**Fontos buktató:** a közösségi „arduino-pico” csomagban a második I2C busz (`Wire1`) az
**A0/A1 lábakon** van – éppen a pH és az EC bemenetén. A BME280-at ezért mindenképp az első
buszra (`Wire`, A4/A5) kell kötni.

**Értékelés:** terepre **nem javasoljuk** – ADS1115-tel működőképes, de ez jár a legtöbb
átírással és a legtöbb új hibalehetőséggel.

## 13.5 Fordítási próba: mennyi átírás kellene?

A mostani terepi firmware-t (v0.2.2) változtatás nélkül lefordítottuk mindkét lapra (csak a
LED mátrixot kapcsoltuk ki), majd a hibákat ideiglenesen áthidalva megnéztük, mi jön még elő.
A próba egy külön másolaton futott, a projekt kódját nem módosította.

| Lap / fejlesztőkörnyezet | Ami nem fordult le | Ideiglenes áthidalás után |
|---|---|---|
| **Nano 33 IoT** (Arduino SAMD csomag) | nincs `EEPROM.h`; nincs `Wire1` | ✅ lefordul mindhárom adatküldési módban (WiFi: `WiFiNINA`-val) |
| **Nano RP2040 Connect** (Arduino mbed csomag) | nincs `EEPROM.h`; nincs `Wire1` | ✅ lefordul (WiFi: `WiFiNINA`-val) |
| **Nano RP2040 Connect** („arduino-pico” közösségi csomag) | az oldott oxigén lába (A4) a WiFi modulé, nem használható | ✅ lefordul mindhárom adatküldési módban; EEPROM és `Wire1` van, de a `Wire1` az A0/A1-en ütközik (13.4) |

**Következtetés:** a kód nagy része változtatás nélkül megy, a lapfüggő rész kicsi (tárolás,
I2C, WiFi könyvtár, ADC beállítás). Egy közös, mindhárom lapon futó változat elkészíthető,
de a **valódi munka a hardveren** van (3,3 V-os illesztés, DONE jel, RP2040-nél ADS1115), és
ezt mind újra kellene tesztelni. *A sikeres fordítás nem jelenti, hogy a program a lapon jól is mér.*

## 13.6 Oktatásban – itt igazán hasznosak!

A [12. fejezet](12_oktatasi_szenzorok.md) kísérleteihez a Nano 33 IoT és a Nano RP2040 Connect
**kiválóan használható**. Így több csoport dolgozhat egyszerre, az UNO R4 WiFi lapok pedig
megmaradhatnak a terepi doboz fejlesztésére.

**A tesztprogramok (01–11) mindhárom lapon futnak:** a program elején egy rövid rész
felismeri, melyik lapra fordítjuk, és ehhez igazítja az ADC-t (14 bit / 5 V vagy 12 bit /
3,3 V), az I2C buszt és a WiFi könyvtárat. A programokon tehát nem kell változtatni –
**a bekötésre viszont figyelni kell**, mert a Nano lapok 3,3 V-osak:

| Kísérlet (tesztprogram) | Nano 33 IoT / Nano RP2040 Connect | Mire figyelj a bekötésnél? |
|---|---|---|
| 01 LED mátrix | ✅ (Morse-kód a beépített LED-en) | – (ezeken a lapokon nincs LED mátrix, helyette Morse-kódot villog) |
| 02 DS18B20 | ✅ | szenzor és 4,7 kΩ felhúzó a **3V3**-ra |
| 03 analóg szenzorok | ✅ | pH és TDS panel 3V3-ról; a **zavarosság szenzor és a PH-4502C csak feszültségosztón át**! A Nano RP2040 Connecten a DO bemenet az A3 (nincs saját A4) |
| 04 BME280, 10 vöröskáposzta (TCS34725) | ✅ | 3V3, SDA → A4, SCL → A5 |
| 05 modem konzol | ✅ | 3,3 V-os modem panelnél nem kell szintillesztő |
| 06 WiFi + ThingSpeak | ✅ | – (a **WiFiNINA** könyvtárat telepíteni kell) |
| 07 NTC, 09 LED+LDR | ✅ | az osztókat a **3V3**-ra kösd; a 09-ben piros/sárga/zöld LED (a fehér és kék alig világít 3,3 V-ról) |
| 08 barkács EC | ✅ | mindhárom lapon ugyanúgy: D11, D12, A3 |
| 11 HC-SR04 | ✅ a **HC-SR04+** (3,3–5 V-os) változattal, 3V3-ról | a régi, csak 5 V-os HC-SR04 ECHO jele tönkreteheti a lapot! |

Mindegyik programot lefordítottuk mindhárom lapra (a Nano RP2040 Connecten mindkét
fejlesztőkörnyezettel), és ellenőriztük, hogy minden lap a neki szánt beállítást kapja.
Valódi lapokon még nem próbáltuk ki őket.

**Python a Nano RP2040 Connecten:** erre a lapra MicroPython is telepíthető (az Arduino
hivatalosan is támogatja). Így a diákok **Pythonban** is programozhatják a szenzorokat – a
szöveges programozás tanulására ez sok iskolában népszerűbb, mint a C++. Ehhez a
tesztprogramokat Pythonban is meg kellene írni (továbbfejlesztési lehetőség).

**⚠️ A legfontosabb szabály 3,3 V-os lapokkal:** soha ne kössünk 5 V-os jelet a lábaikra. A
csoportok lapjait érdemes felcímkézni („3,3 V – max. 3,3 V a lábakra!”), és a bekötést
bekapcsolás előtt felnőttel ellenőriztetni.

## 13.7 Összegzés

| Felhasználás | UNO R4 WiFi | Nano 33 IoT | Nano RP2040 Connect |
|---|---|---|---|
| **Terepi doboz** | ✅ **ajánlott** (kész, lefordított program) | 🟡 használható átírással, plusz alkatrészekkel | 🟠 csak külső ADC-vel (ADS1115), oldott oxigén nélkül |
| **Oktatási kísérletek** | ✅ | ✅ ugyanazokkal a tesztprogramokkal (3,3 V-ra figyelni) | ✅ ugyanazokkal a tesztprogramokkal (3,3 V-ra figyelni), Pythonban is |
| **Második / kisebb állomás** | ✅ | ✅ jó jelölt | 🟡 ADS1115-tel |

## Források
- [Arduino Nano 33 IoT – dokumentáció](https://docs.arduino.cc/hardware/nano-33-iot)
- [Introduction to the Nano 33 IoT (NYU ITP)](https://itp.nyu.edu/physcomp/introduction-to-the-nano-33-iot/)
- [Arduino fórum – Nano 33 IoT VIN tartomány](https://forum.arduino.cc/t/nano-33-iot-vin-voltage-range/599957)
- [FlashStorage_SAMD könyvtár](https://www.github.com/khoih-prog/FlashStorage_SAMD) és [Arduino fórum – EEPROM emuláció törlődése](https://forum.arduino.cc/t/eeprom-gets-overwritten-in-atsamd21-when-flashing/956716)
- [Arduino Nano RP2040 Connect – adatlap](https://docs.arduino.cc/resources/datasheets/ABX00053-datasheet.pdf)
- [Arduino support – a Nano RP2040 Connect analóg lábai](https://support.arduino.cc/hc/en-us/articles/7454007471004-About-the-analog-pins-on-Nano-RP2040-Connect)
- [Nano RP2040 Connect Cheat Sheet](https://docs.Arduino.cc/tutorials/nano-rp2040-connect/rp2040-01-technical-reference)
- [Hackster – az RP2040 ADC hibája](https://hackster.io/news/raspberry-pi-confirms-it-is-investigating-a-flaw-in-the-raspberry-pi-pico-rp2040-adc-95c393b55dfb)
- [RP2040 ADC nemlinearitás-korrekció](https://osrtos.com/projects/rp2040-rp2350-adc-non-linearity-correction/)
- [TI TPL5110 adatlap – elektromos jellemzők](https://www.ti.com/document-viewer/lit/html/SNAS650A/electrical-characteristics-snas650227)
- [DFRobot wiki – pH szenzor V2 (SEN0161-V2)](https://wiki.dfrobot.com/SEN0161-V2)
- [DFRobot wiki – zavarosság szenzor (SEN0189)](https://wiki.dfrobot.com/sen0189/)
