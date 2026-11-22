# Változásnapló

A formátum: minden verziónál röviden, mi változott. Dátum: ÉÉÉÉ-HH-NN.

## [Nem kiadott]
### Interaktív bemutató weboldal (első változat)
- Új [weboldal/](weboldal/) mappa: böngészőben futó, build nélküli oldal
  ([terv](weboldal/TERV.md)). Fájlból megnyitva is működik, világos/sötét témával, mobilon is.
- **Felépítés:** kattintható belső ábra (alkatrészek, színkódolt vezetékek, Arduino lábak) és
  külső nézet (parti állomás, vízszint-csúszkával). Alkatrész-kártyák, rétegszűrő,
  lábkiosztás-táblázat, `USE_DO` kapcsoló.
- **Működés:** a mérési ciklus lejátszása lépésenként – mi kap éppen áramot, LED mátrix,
  soros monitor (a firmware kiírásaival), AT parancsok, az összeálló ThingSpeak üzenet.
- **Szenzorok:** 7 szimulátor (vízhő, pH, vezetőképesség, zavarosság, oldott oxigén, doboz
  páratartalma, akku) csúszkákkal és animált ábrával. Mindegyiknél végigkövethető a jel útja:
  víz → szenzor → feszültség → ADC (31 minta, nyesett átlag) → képlet → elküldött érték.
  pH kalibráló mini-játék (a 6,86-os puffer hibájával), és bemutató arról, miért kap egyszerre
  csak egy szenzor áramot.
- A `sensors.cpp` képletei JavaScriptben (`weboldal/js/fizika/kepletek.js`), böngészőben futó
  tesztekkel (`weboldal/tesztek/kepletek.test.html`, 29 teszt).
- A számok a `config.h`-ból és a dokumentációból származnak (`weboldal/js/adatok/`); a
  `config.h` vagy a `sensors.cpp` változásakor a `konstansok.js`-t, illetve a `kepletek.js`-t
  is frissíteni kell.

### Tesztprogramok három lapra
- A 11 tesztprogram mostantól az **UNO R4 WiFi**, a **Nano 33 IoT** és a **Nano RP2040 Connect**
  lapon is fut: a program felismeri a lapot, és beállítja az ADC-t (14 bit / 5 V vagy
  12 bit / 3,3 V), az I2C buszt (Qwiic `Wire1` vagy `Wire`) és a WiFi könyvtárat (WiFiS3 / WiFiNINA).
- 01: a LED mátrix nélküli lapokon Morse-kódot villog a beépített LED.
- 08: a mérőbemenet A5 helyett A3 (a Nano RP2040 Connecten az A5 nem analóg bemenet).
- Bekötési figyelmeztetések a 3,3 V-os lapokhoz minden érintett programban.
- Lefordítva mind a négy célra (Nano RP2040 Connect: két fejlesztőkörnyezet); valódi lapon nem tesztelt.

### Dokumentáció
- Új [docs/13_vezerlok_osszehasonlitasa.md](docs/13_vezerlok_osszehasonlitasa.md): az UNO R4 WiFi,
  a Nano 33 IoT és a Nano RP2040 Connect összehasonlítása, fordítási próbával.
- Új [hardware/beszerzes.md](hardware/beszerzes.md): magyarországi beszerzési források az
  oktatási készlethez (HESTORE, Hanna Instruments, mindenitt.hu), termékkódokkal, árakkal
  (≈ 81 500 Ft, 4 csoport + tartalék). Megjegyzés a pH pufferről: a HESTORE 6,86-os pora
  ~0,15 pH eltérést okoz, mert a program 7,00-ra kalibrál.

## [0.2.2] – 2026-11-15
### Javítások (átnézés alapján, 2. kör)
- **Akkuküszöbök:** GSM módban magasabbak (figyelmeztetés 3,65 V, kritikus 3,50 V), mert a
  modemnek legalább 3,4 V kell, és adás közben a feszültség beesik. Kiinduló értékek, hardveren hangolandók.
- **Modem kapcsoló:** lágy indítás (1 µF gate–source, 100 kΩ felhúzó, 10 kΩ soros), az
  1000 µF puffer az akku oldalára került – a bekapcsolási áramlökés ne indítsa újra az Arduinót.
  Számított értékek, hardveren még nem próbáltuk ki.
- **PWRKEY:** az Arduino 5 V-os lába nem mehet közvetlenül a modemre; NPN tranzisztoros meghajtás.
- **pH ↔ EC zavarás:** a terepi dobozba leválasztó modul (DFR0504) került a TDS/EC szenzorhoz;
  új „Zavarás-próba” lépés az összeszerelési útmutatóban.
- **Biztonság:** cellákat párhuzamosan kötni csak azonos feszültségen szabad.
- **Apróságok:** elavult verziószámok a README-kben, elírás a 10. fejezetben; az `AKKU_KRITIKUS`
  állapot leírása pontosítva (a doboz ilyenkor nem küld, ezért a ThingSpeaken nem jelenik meg).
- Alkatrészlista és költségbecslés frissítve (≈ 140–200 ezer Ft).

## [0.2.1] – 2026-11-15
### Javítások (átnézés alapján)
- **Napelem–töltő párosítás:** a dokumentáció 6 V-os panelt írt a DFRobot DFR0559 töltő mellé,
  ami 6,5 V fölött károsodhat. Új 4.1.1 pont a párosítás szabályával (a panel üresjárási
  feszültsége a töltő max. bemenete alatt), két ellenőrzött példapárral; alkatrészlista és
  bekötési terv javítva.
- **Szerviz mód felismerése:** az UNO R4 WiFi-n az `if (Serial)` mindig igaz, ezért az Enter-várakozás
  minden ébredéskor lefutott. A hamis feltétel törölve; `SERVICE_PROMPT_MS 0` = terepi beállítás
  (csak jumper). Telepítési ellenőrzőlista kiegészítve.
- **Szerviz menü időtúllépés:** `SERVICE_TIMEOUT_S` (10 perc) tétlenség után a menü kilép. A bent
  felejtett jumpert a doboz megjegyzi (EEPROM), nem lép újra szerviz módba, és új
  `SZERVIZ_JUMPER` állapotot küld. Időtúllépéskor félbehagyott kalibráció nem mentődik.
- **Kábelterv:** a TDS szonda gyári hossza 83 cm, a zavarosság szenzoré is rövid – a terv most
  hosszabbítással számol (módja leírva), a DS18B20-ból ≥ 3 m-es kell, a pH szonda nem toldható.

## [0.2.0] – 2026-11-15
### Oktatási szenzorok
- Új fejezet: `docs/12_oktatasi_szenzorok.md` – olcsó alternatívák tanuláshoz, kísérletezéshez,
  bemutatáshoz (NTC, PH-4502C, vöröskáposzta + színérzékelő, TDS klón, barkács EC elektróda,
  LED+LDR zavarosság, Secchi-korong, HC-SR04 vízszint, összehasonlító kísérlet).
- 5 új tesztprogram (07–11) a barkács / olcsó szenzorokhoz.
- Firmware: `PH_BOARD` beállítás (DFRobot V2 / PH-4502C gyári alapértékek); a pH kalibráció
  ellenőrzése panelfüggetlen lett (a pH 7 és 4 közti feszültségkülönbséget vizsgálja).
- Alkatrészlista: pH készletek szétválasztva (terepi Pro Kit / tanuló készlet), új
  „Oktatási / bemutató szenzorok” szakasz, frissített költségbecslés.

## [0.1.0] – 2026-11-15
### Első terv
- Projekt mappaszerkezet, teljes dokumentáció (`docs/`).
- Alkatrészlista és bekötési terv (`hardware/`).
- Fő firmware (`firmware/vizerzekelo/`): mérés, kalibráció EEPROM-ban,
  WiFi / GSM (SIMCom A76xx, SIM7600) adatküldés ThingSpeakre, szerviz menü,
  TPL5110 alapú energiatakarékos működés, LED mátrix állapotjelzés.
- 6 tesztprogram az alkatrészek egyenkénti kipróbálásához.
- Segédeszközök: energia kalkulátor, ThingSpeak adatletöltő.
- A firmware lefordul (arduino-cli, arduino:renesas_uno 1.6.0), **hardveren még nem tesztelt.**
