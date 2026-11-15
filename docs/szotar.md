# Szótár – fogalmak egyszerűen

| Fogalom | Jelentés |
|---|---|
| **ADC** (analóg-digitális átalakító) | Az Arduino része, ami egy feszültséget (pl. 1,52 V) számmá alakít (pl. 4980). Az UNO R4 0–5 V-ot 0–16383 közötti számmá alakít. |
| **Akku (akkumulátor)** | Újratölthető elem. A miénk Li-ion (lítium-ion), mint a telefonokban. |
| **Analóg jel** | Folyamatosan változó feszültség (pl. 0 és 5 V között bármennyi lehet). |
| **API kulcs** | Egy titkos „jelszó”, amivel a doboz igazolja a ThingSpeak felé, hogy ő írhat a csatornába. |
| **APN** | A mobilszolgáltató „internet-kapujának” neve – a modemnek ezt meg kell adni, hogy internetezni tudjon. |
| **Arduino** | Kis számítógép (mikrovezérlő panel), amit egyszerűen lehet programozni. Nálunk: UNO R4 WiFi. |
| **AT parancs** | Szöveges utasítás a modemnek, pl. `AT+CSQ` = „mekkora a jelerősség?” |
| **Biztosíték** | Olyan alkatrész, ami túl nagy áram esetén „kiég”, és megszakítja az áramkört, hogy ne legyen tűz. |
| **BME280** | Kis szenzor, ami a hőmérsékletet, a páratartalmat és a légnyomást méri. |
| **Breadboard (próbapanel)** | Lyukacsos panel, amibe forrasztás nélkül dughatók az alkatrészek és vezetékek. |
| **dBm** | A rádiójel erősségének mértékegysége. Negatív szám: −70 dBm erős, −100 dBm gyenge jel. |
| **Digitális jel** | Csak két értéke van: 0 vagy 1 (ki vagy be, 0 V vagy 5 V). |
| **DO (oldott oxigén)** | Mennyi oxigén van feloldva a vízben (mg/l). A halak ezt lélegzik a kopoltyújukkal. |
| **DS18B20** | Digitális hőmérő chip; nálunk vízálló fém csőben. |
| **EC (elektromos vezetőképesség)** | Mennyire vezeti a víz az áramot. Minél több só és ásványi anyag van benne, annál jobban. Mértékegysége µS/cm (mikrosiemens per centiméter). |
| **EEPROM** | Az Arduino olyan memóriája, ami kikapcsolás után is megjegyzi az adatokat (nálunk a kalibrációt). |
| **Feszültség** | Az elektromos „nyomás”, ami az áramot hajtja. Mértékegysége a volt (V). |
| **Feszültségosztó** | Két ellenállás, ami egy feszültséget kisebbre „oszt” (pl. felére), hogy mérhető legyen. |
| **Firmware** | Az eszközön futó program (a mi esetünkben az Arduino programja). |
| **GND (föld)** | A 0 V-os pont, a közös „visszavezetés”. Minden résznek össze kell lennie kötve GND-vel. |
| **GSM / LTE / 2G / 4G** | Mobilhálózati technológiák. A 2G (GSM) régi, lassú, kezdik kikapcsolni; az LTE (4G) modern. |
| **I2C / Qwiic** | Egy kétvezetékes „busz”, amin több szenzor is beszélhet az Arduinóval. A Qwiic egy kis csatlakozó hozzá, forrasztás nélkül. |
| **Kalibrálás** | A szenzor „beállítása” ismert értékű oldat segítségével, hogy pontosan mérjen. |
| **Kompenzáció (hőmérséklet-)** | A mért érték kijavítása a hőmérséklet hatásával, hogy a különböző hőmérsékleten mért értékek összehasonlíthatók legyenek. |
| **LED mátrix** | Az Arduino UNO R4 WiFi lapján lévő 12 × 8 apró lámpából álló kijelző. |
| **Medián / nyesett átlag** | A sorba rendezett adatok közepe. Kevésbé zavarja egy-egy hibás, kiugró érték, mint a sima átlagot. |
| **Modem** | Eszköz, ami a mobilhálózaton keresztül adatot küld, mint egy telefon. |
| **MOSFET / tranzisztor** | Elektronikus kapcsoló: egy kis jellel (Arduino láb) egy nagyobb áramot lehet ki-be kapcsolni. |
| **MPPT** | A napelemes töltő „okos” üzemmódja, ami mindig a legtöbb energiát próbálja kinyerni a napelemből. |
| **NTU** | A zavarosság mértékegysége. 0 = kristálytiszta, 1000 felett = nagyon iszapos. |
| **Puffer(oldat)** | Pontosan ismert pH-jú oldat, amivel a pH szondát kalibráljuk. |
| **pH** | A savasság mérőszáma 0-tól 14-ig. 7 = semleges (tiszta víz), kisebb = savas (citrom ~2), nagyobb = lúgos (szappan ~10). |
| **Reed relé** | Mágnessel működtethető kapcsoló – kívülről, a doboz kinyitása nélkül kapcsolható. |
| **Soros monitor** | Az Arduino IDE ablaka, ahol az Arduino szöveges üzeneteit látjuk, és üzenhetünk neki. |
| **SIM kártya** | A mobilszolgáltató kártyája, ami azonosítja a modemet a hálózaton. |
| **Szenzor (érzékelő)** | Eszköz, ami egy fizikai jellemzőt (pl. hőmérséklet, fény) elektromos jellé alakít. |
| **Szintillesztő** | Áramkör, ami két eltérő feszültséggel működő eszköz (pl. 5 V-os Arduino és 3,3 V-os modem) jeleit „lefordítja” egymásnak. |
| **TDS** | Összes oldott szilárd anyag (mg/l) – az EC-ből becsüljük (kb. a fele). |
| **ThingSpeak** | Ingyenes internetes szolgáltatás, ahol az adatainkat tároljuk és grafikonon nézzük. |
| **Tömszelence** | Vízzáró kábelátvezető a doboz falán. |
| **TPL5110** | Kis időzítő chip, ami adott időközönként be-, majd kikapcsolja az Arduinót, hogy spóroljon az energiával. |
| **UART (soros port)** | Kétvezetékes (TX = adó, RX = vevő) adatkapcsolat két eszköz között. A TX-et mindig a másik RX-ére kötjük! |
| **Wh (wattóra)** | Energia mértékegysége. 1 Wh = 1 W teljesítmény 1 órán át. A doboz kb. 2 Wh-t fogyaszt naponta. |
| **Zavarosság** | Mennyire „homályos” a víz a benne lebegő részecskék (iszap, alga) miatt. |
