# Változásnapló

A formátum: minden verziónál röviden, mi változott. Dátum: ÉÉÉÉ-HH-NN.

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
