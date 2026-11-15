# 5. Kommunikáció és adattárolás

## 5.1 Hogyan juthatnak el az adatok a folyóparttól az internetre?

| Technológia | Hatótáv | Fogyasztás | Költség | Megjegyzés |
|---|---|---|---|---|
| **WiFi** (az R4 beépített) | ~50 m | közepes | ingyenes | csak ha van WiFi a közelben – **iskolai teszteléshez ideális** |
| **2G GSM** (SIM800L) | km-ek | nagy csúcsáram (2 A) | olcsó modul | ⚠️ a 2G hálózatokat fokozatosan lekapcsolják – hosszú távra kockázatos |
| **LTE Cat-1** (A7670E, SIM7600) | km-ek | közepes | modul ~8–15 e Ft + SIM | ✅ **választott megoldás** – sima adatos SIM-mel működik |
| **LTE-M / NB-IoT** (SIM7080G) | km-ek | ✅ nagyon kicsi | olcsó modul, de IoT SIM kell | jó továbbfejlesztési irány, ha elérhető IoT SIM |
| **LoRaWAN** | 2–15 km | ✅ nagyon kicsi | olcsó, nincs havidíj | csak ha van a közelben átjáró (pl. The Things Network) |

**Választás:** terepen **LTE Cat-1 modem (SIMCom A7670E)**, iskolai tesztelésnél az Arduino
**saját WiFi**-je. A firmware-ben a `config.h` → `TRANSPORT_MODE` egy sorral vált a kettő között.

## 5.2 A modem kiválasztása, beszerzése

Az A7670E chip maga apró, forraszthatatlan – **kész modulpanelt** kell venni. Szempontok:

- ✅ **LTE + Európai sávok** (az „E” végződés: Európa; pl. A7670**E**, SIM7600**E**).
- ✅ **VBAT bemenet** (3,4–4,2 V), hogy közvetlenül az akkuról táplálhassuk.
- ✅ **PWRKEY láb** kivezetve.
- ✅ **UART szintillesztés**: a modem chip 1,8 V-os logikájú; a panelek többsége ezt 3,3 V-ra
  alakítja. Az UNO R4 5 V-os, ezért közé **kétirányú szintillesztő** (BSS138 alapú modul) kell –
  hacsak a panel nem 5 V-tűrő (pl. egyes Waveshare panelek 3,3/5 V választó jumperrel).
- ✅ **Antenna csatlakozó** (IPEX/u.FL vagy SMA) + LTE antenna.
- ✅ **SIM foglalat** (nano vagy micro SIM – figyelj a méretre!).

A firmware a SIMCom **A76xx** és **SIM7600** családdal működik (ugyanazok a HTTP AT parancsok).
SIM800 vagy SIM7080 esetén a `modem.cpp` HTTP részét át kell írni (más parancskészlet).

## 5.3 SIM kártya

- **Adatforgalom:** egy üzenet (HTTP kérés + válasz + TCP/IP kapcsolatfelépítés) kb. 1–2 kB.
  96 üzenet/nap × 30 nap ≈ **3–6 MB/hónap**. A legkisebb adatcsomag is bőven elég.
- **Feltöltőkártyás** (prepaid) SIM is jó, de figyelni kell, hogy **ne járjon le** (egyes
  szolgáltatóknál a kártya érvényessége feltöltéshez kötött). Az egyenleget érdemes naptárba írt
  emlékeztetővel figyelni.
- **Tesztelés előtt** tedd a SIM-et egy telefonba, és:
  1. **kapcsold ki a PIN kód kérését**,
  2. próbáld ki, hogy működik-e a mobilinternet,
  3. nézd meg a szolgáltató honlapján az **APN**-t (pl. „internet” – ez szolgáltatónként eltér),
     és írd be a `secrets.h`-ba.
- A SIM kártyához tartozó előfizetés legyen az **iskola vagy a felelős felnőtt nevén**.

## 5.4 ThingSpeak beállítása (lépésről lépésre)

1. Regisztrálj a <https://thingspeak.mathworks.com> oldalon (MathWorks fiók, ingyenes).
2. **Channels → New Channel**, töltsd ki:
   | Mező | Név | Mértékegység (Description-be) |
   |---|---|---|
   | Field 1 | Vízhőmérséklet | °C |
   | Field 2 | pH | – |
   | Field 3 | Vezetőképesség | µS/cm |
   | Field 4 | Zavarosság | NTU |
   | Field 5 | Oldott oxigén | mg/l |
   | Field 6 | Akkufeszültség | V |
   | Field 7 | Doboz páratartalom | % |
   | Field 8 | Jelerősség | dBm |
3. Pipáld be: **Show Status** (itt jelennek meg az állapotüzenetek).
4. Opcionálisan add meg a helyszínt (szélesség/hosszúság) – térképen is megjelenik.
5. **Save Channel**.
6. **API Keys** fül → másold ki a **Write API Key**-t → `secrets.h` → `THINGSPEAK_API_KEY`.
7. **Sharing** fül → „Share channel view with everyone” – így a diákok, szülők is láthatják.

> **Korlátok (ingyenes fiók):** legfeljebb 15 másodpercenként egy üzenet, évi kb. 3 millió üzenet
> (nekünk ~35 000 kell). Az aktuális feltételeket a ThingSpeak oldalán ellenőrizd.

**Adatok letöltése:** a csatorna oldalán *Data Import/Export → Export* (CSV), vagy a
[`tools/thingspeak_letoltes.py`](../tools/thingspeak_letoltes.py) programmal:

```bash
python3 tools/thingspeak_letoltes.py --csatorna 1234567 --db 2000 --kimenet adatok/meresek.csv
```

## 5.5 Az elküldött üzenet

A doboz egyetlen HTTP GET kérést küld:

```
http://api.thingspeak.com/update?api_key=ABCD1234&field1=11.94&field2=7.86
    &field3=412&field4=37&field6=3.98&field7=41&field8=-79&status=OK
```

- A hiányzó vagy hibás értékek mezője **kimarad** (pl. itt a field5, mert nincs DO szenzor).
- A `status` mezőben szóközzel elválasztva az állapotbitek (pl. `SZIVARGAS AKKU_GYENGE`).
- **Időbélyeget nem küldünk** – a ThingSpeak a beérkezés idejét rögzíti (UTC-ben!).
- Titkosítatlan HTTP-t használunk az egyszerűség (és energiatakarékosság) miatt. Az adatok
  amúgy is nyilvánosak; a Write API kulcs legrosszabb esetben „hamis adatbeírásra” jogosít –
  ezért ne tegyük közzé, és ha kiszivárogna, a ThingSpeakben egy kattintással újragenerálható.

## 5.6 AT parancsok – így „beszélget” az Arduino a modemmel

A modem szöveges parancsokat fogad („AT” = *attention*, figyelem). Ezt a
[`05_modem_at_konzol`](../firmware/tesztek/05_modem_at_konzol/) tesztprogrammal kézzel is ki
lehet próbálni – nagyon tanulságos!

| Parancs | Mit csinál? | Jó válasz |
|---|---|---|
| `AT` | Élsz? | `OK` |
| `ATE0` | Ne ismételd vissza, amit írok | `OK` |
| `ATI` | Milyen modem vagy? | típus, verzió |
| `AT+CPIN?` | Rendben van a SIM? | `+CPIN: READY` |
| `AT+CSQ` | Milyen erős a jel? (0–31; 99 = nincs) | `+CSQ: 18,99` |
| `AT+COPS?` | Melyik szolgáltató hálózatán vagy? | `+COPS: 0,0,"...",7` (7 = LTE) |
| `AT+CGDCONT=1,"IP","internet"` | Az APN beállítása | `OK` |
| `AT+CEREG?` | Csatlakoztál az LTE hálózatra? | `+CEREG: 0,1` (1 = igen, 5 = roaming) |
| `AT+CGACT=1,1` | Kapcsold be az adatkapcsolatot | `OK` |
| `AT+HTTPINIT` | HTTP kliens indítása | `OK` |
| `AT+HTTPPARA="URL","http://..."` | Mit kérjünk le? | `OK` |
| `AT+HTTPACTION=0` | Küldd el (GET) | `OK`, majd `+HTTPACTION: 0,200,2` |
| `AT+HTTPTERM` | HTTP kliens leállítása | `OK` |
| `AT+CCLK?` | Pontos idő a hálózattól | `+CCLK: "26/11/15,14:03:12+04"` |
| `AT+CPOF` | Kapcsolj ki | `OK` |

**A jelerősség értelmezése** (`+CSQ: x` → dBm = −113 + 2·x):

| CSQ | dBm | Minőség |
|---|---|---|
| < 10 | < −93 | gyenge – antenna áthelyezése, magasabbra! |
| 10–14 | −93…−85 | elfogadható |
| 15–19 | −83…−75 | jó |
| ≥ 20 | > −73 | kiváló |

## 5.7 Gyakori hibák

| Tünet | Lehetséges ok |
|---|---|
| Nincs válasz az `AT`-re | TX/RX felcserélve; nincs közös GND; rossz baud; a modem nincs bekapcsolva (PWRKEY); nincs szintillesztő |
| A modem újraindul küldéskor | gyenge táp: vékony vezeték, hiányzó 1000 µF-os kondenzátor, lemerült akku |
| `+CPIN: SIM PIN` | PIN kérés bekapcsolva → telefonban kikapcsolni |
| `+CEREG: 0,2` sokáig | keresi a hálózatot: antenna? lefedettség? |
| `+CEREG: 0,3` | a hálózat elutasította: SIM nincs aktiválva / lejárt |
| `+HTTPACTION: 0,7xx,0` | hálózati hiba (pl. nincs adatkapcsolat / rossz APN) |
| HTTP 200, de nincs adat a ThingSpeakben | rossz API kulcs, vagy 15 mp-en belül két üzenet |
