# Változásnapló

A formátum: minden verziónál röviden, mi változott. Dátum: ÉÉÉÉ-HH-NN.

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
