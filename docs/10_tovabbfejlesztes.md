# 10. Továbbfejlesztési lehetőségek

A lehetőségek nehézség szerint csoportosítva. ⭐ = kezdő, ⭐⭐ = haladó, ⭐⭐⭐ = nagyon haladó.
Sok közülük önálló diákprojekt (vagy szakköri év) témája lehet.

## 10.1 Szoftver

| Ötlet | Leírás | Nehézség |
|---|---|---|
| Saját ikonok, animációk | a LED mátrixon pl. a pH értéktől függő arc 🙂😐🙁 szerviz módban | ⭐ |
| Riasztás | ha a pH < 6,5 vagy > 9, a ThingSpeak **React** funkciója e-mailt küld | ⭐ |
| Grafikonok, elemzés | ThingSpeak **MATLAB Visualization**: napi átlag, min/max, korreláció a hőmérséklet és az oxigén között | ⭐⭐ |
| Saját weboldal | az iskolai honlapra beágyazott ThingSpeak grafikonok (iframe) | ⭐ |
| Adatok összevetése | a saját mérések összehasonlítása a hivatalos vízügyi adatokkal (vízállás, vízhőmérséklet) | ⭐⭐ |
| Pontos időbélyeg | a modem hálózati idejének (`AT+CCLK?`) elküldése (ThingSpeak `created_at` mező) | ⭐⭐ |
| Pufferelés | ha nincs térerő, az adatok mentése, és később együtt küldés (ThingSpeak bulk update) | ⭐⭐ |
| SMS riasztás | a modemről közvetlenül SMS a felelős tanárnak, ha beázás vagy akkuhiba van | ⭐⭐ |
| Távoli beállítás | a mérési időköz / kalibráció módosítása a szerverről (ThingSpeak TalkBack) | ⭐⭐⭐ |
| Saját szerver | InfluxDB + Grafana egy iskolai Raspberry Pi-n, ThingSpeak helyett | ⭐⭐⭐ |
| Anomália-felismerés | egyszerű statisztika (pl. mozgó átlag ± 3 szórás) vagy gépi tanulás a szokatlan események jelzésére | ⭐⭐⭐ |
| HTTPS / MQTT | titkosított adatküldés (a modem támogatja) | ⭐⭐⭐ |

## 10.2 Új szenzorok

| Szenzor | Mit ad hozzá? | Kb. ár | Nehézség |
|---|---|---|---|
| **Vízszint** (ultrahangos, pl. JSN-SR04T, felülről mérve; vagy nyomásszenzor a mederben) | árhullámok követése – nagyon látványos! | 3–15 e Ft | ⭐⭐ |
| **ORP** (redoxpotenciál) | a víz „öntisztító képessége”, szerves szennyezés | 25–40 e Ft | ⭐⭐ |
| **Nitrát / ammónium** ionszelektív elektróda | mezőgazdasági szennyezés | 50–150 e Ft | ⭐⭐⭐ |
| **Levegő hőmérséklet, csapadék** | az időjárás és a vízminőség összefüggése | 3–10 e Ft | ⭐ |
| **Fényerősség** a víz felett | napsütés és pH/oxigén napi ingadozása | 1–3 e Ft | ⭐ |
| **Klorofill / algák** (fluoreszcencia) | algavirágzás | drága | ⭐⭐⭐ |
| **Áramlási sebesség** (forgólapátos) | vízhozam becslése | 5–20 e Ft | ⭐⭐ |
| **Kamera** (ESP32-CAM, naponta 1 kép) | vízszín, uszadék, jég, áradás képen | 3–5 e Ft | ⭐⭐ |

Az UNO R4-en szabad lábak: A5, D11, D12, D13, valamint a Qwiic / I2C busz (sok szenzor csatlakoztatható rá).

## 10.3 Hardver és mérési pontosság

| Ötlet | Miért jó? | Nehézség |
|---|---|---|
| **ADS1115** 16 bites külső ADC (I2C) | pontosabb, a tápfeszültség ingadozásától független feszültségmérés | ⭐⭐ |
| **Galvanikus leválasztás** (pl. DFRobot Gravity Analog Signal Isolator) | a pH és EC szonda egyáltalán nem zavarja egymást | ⭐⭐ |
| **Ipari EC szonda** (K=1) | tartósabb, pontosabb vezetőképesség-mérés | ⭐ |
| **Akku hőmérséklet-figyelés** (NTC / második DS18B20) | fagyban ne töltsön, lássuk a doboz hőmérsékletét | ⭐⭐ |
| **LiFePO4 akku** megfelelő töltővel | biztonságosabb, tartósabb (2000+ ciklus) | ⭐⭐ |
| **microSD kártya** helyi mentés | ha a mobilnet kiesik, sem vész el adat | ⭐⭐ |
| **Saját nyomtatott áramkör** (KiCad) | a próbapanel helyett megbízható, kompakt kivitel | ⭐⭐⭐ |
| **3D nyomtatott** szondatartó, dobozbelső | pontos illesztés, szép kivitel | ⭐⭐ |
| **Víz alatti csatlakozók** (M12 / IP68) | szondacsere a doboz kinyitása nélkül | ⭐⭐ |

## 10.4 Energia

| Ötlet | Hatás | Nehézság |
|---|---|---|
| A mérési időköz automatikus növelése alacsony akkunál | télen tovább bírja | ⭐⭐ (TPL5110 helyett pl. RTC alapú ébresztés kell) |
| Kisebb fogyasztású vezérlő (pl. Arduino Nano / ESP32 mély alvással) | 2–3× kevesebb energia | ⭐⭐⭐ |
| **LTE-M / NB-IoT modem** (pl. SIM7080G) + IoT SIM | a modem energiaigénye a töredékére csökken | ⭐⭐ |
| Adatok kötegelt küldése (pl. 4 mérés óránként egyszer) | a modem ritkábban kapcsol be → kb. 40% megtakarítás | ⭐⭐ |

## 10.5 Kommunikáció

- **LoRaWAN** (pl. The Things Network) – ha van a közelben átjáró, nincs havidíj, és nagyon kicsi a fogyasztás.
  Akár saját átjárót is telepíthet az iskola a tetőre (⭐⭐⭐).
- **Több doboz hálózata** – a folyó több pontján (pl. egy település / szennyvíztisztító felett és alatt)
  mérve látszik, hol változik a vízminőség. Partneriskolákkal közös projekt! (⭐⭐)

## 10.6 Oktatási, közösségi irány

- **Partneriskolák:** ugyanazt a dobozt más iskolák is megépítik a saját folyójukon, és közös
  térképen jelennek meg az adatok.
- **Állampolgári tudomány (citizen science):** az adatok megosztása természetvédelmi szervezetekkel,
  vízügyi igazgatósággal.
- **Pályázatok, versenyek:** természettudományos / informatikai / környezetvédelmi diákversenyek,
  ökoiskola programok.
- **Nyílt forráskód:** a git repó publikálása, hogy más iskolák is használhassák, és a hibákat jelezhessék.
