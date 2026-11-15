#!/usr/bin/env python3
"""
Energia kalkulátor a Vízérzékelő dobozhoz.

Kiszámolja:
  - mennyi energiát fogyaszt a doboz naponta,
  - hány napig bírja az akku napsütés nélkül,
  - havonta mennyi energiát termel a napelem, és elég-e.

Használat (példák):
  python3 tools/energia_kalkulator.py
  python3 tools/energia_kalkulator.py --intervallum 30
  python3 tools/energia_kalkulator.py --napelem 10 --akku 6800

Minden alapérték becslés – ha megépült a doboz, MÉRD MEG a valódi áramfelvételt
(multiméter / USB árammérő), és írd át az alábbi számokat!
Csak a Python alapkönyvtárát használja.
"""
import argparse

# ---------------------------------------------------------------------------
# Becsült fogyasztási adatok egy mérési ciklusra
# ---------------------------------------------------------------------------
ARDUINO_V = 5.0           # V
ARDUINO_MA = 90           # mA – UNO R4 WiFi működés közben (WiFi rádió nélkül)
ARDUINO_AKTIV_S = 75      # s – ennyi ideig van bekapcsolva ciklusonként (GSM mód)

SZENZOR_MA = 30           # mA – átlagos szenzor áram (egyszerre csak egy működik)
SZENZOR_AKTIV_S = 15      # s – összes szenzor bemelegedés + mérés

MODEM_V = 3.8             # V – közvetlenül az akkuról
MODEM_MA = 150            # mA – átlagos áram csatlakozás + küldés alatt (LTE Cat-1)
MODEM_AKTIV_S = 60        # s – hálózatra csatlakozás + HTTP küldés

ALVO_MA = 0.3             # mA – nyugalmi fogyasztás (töltésvezérlő, osztó, TPL5110)
AKKU_V = 3.7              # V – Li-ion névleges feszültség
HATASFOK_5V = 0.85        # akku → 5 V feszültségnövelő hatásfoka

# Napelem rendszer hatásfoka: töltésvezérlő, akku töltési veszteség, kosz,
# nem ideális dőlésszög, hőmérséklet. 0,6 = óvatos becslés.
NAPELEM_RENDSZER_HATASFOK = 0.6

# Csúcsnapsütéses órák (kWh/m²/nap) Magyarországon, kb. 35°-os dőlésszögű,
# déli tájolású panelre, havi átlag. Közelítő értékek – pontos adat a helyszínre:
# PVGIS (https://re.jrc.ec.europa.eu/pvg_tools/)
CSUCSNAPORAK = {
    "január": 1.6, "február": 2.6, "március": 3.7, "április": 4.6,
    "május": 5.3, "június": 5.6, "július": 5.8, "augusztus": 5.3,
    "szeptember": 4.3, "október": 3.0, "november": 1.7, "december": 1.3,
}


def ciklus_energia_wh(gsm: bool) -> dict:
    """Egy mérési ciklus energiája Wh-ban, összetevőnként."""
    arduino_s = ARDUINO_AKTIV_S if gsm else 45  # WiFi-vel gyorsabb a csatlakozás
    arduino = ARDUINO_V * ARDUINO_MA / 1000 * arduino_s / HATASFOK_5V / 3600
    szenzor = ARDUINO_V * SZENZOR_MA / 1000 * SZENZOR_AKTIV_S / HATASFOK_5V / 3600
    if gsm:
        modem = MODEM_V * MODEM_MA / 1000 * MODEM_AKTIV_S / 3600
    else:
        # WiFi módban a rádió az Arduinón van: kb. +80 mA, 20 s
        modem = ARDUINO_V * 80 / 1000 * 20 / HATASFOK_5V / 3600
    return {"Arduino": arduino, "Szenzorok": szenzor, "Modem/WiFi": modem}


def main() -> None:
    p = argparse.ArgumentParser(description="Vízérzékelő energia kalkulátor")
    p.add_argument("--intervallum", type=float, default=15, help="mérési időköz percben (alap: 15)")
    p.add_argument("--akku", type=float, default=6800, help="akku kapacitás mAh-ban (alap: 2×3400)")
    p.add_argument("--napelem", type=float, default=6, help="napelem teljesítménye W-ban (alap: 6)")
    p.add_argument("--wifi", action="store_true", help="WiFi mód GSM helyett")
    p.add_argument("--hasznalhato", type=float, default=0.8,
                   help="az akku kapacitásának használható része (alap: 0,8)")
    a = p.parse_args()

    ciklus = ciklus_energia_wh(gsm=not a.wifi)
    ciklus_ossz = sum(ciklus.values())
    ciklus_per_nap = 24 * 60 / a.intervallum
    alvo_wh = AKKU_V * ALVO_MA / 1000 * 24
    napi_wh = ciklus_ossz * ciklus_per_nap + alvo_wh
    akku_wh = AKKU_V * a.akku / 1000 * a.hasznalhato

    print("=" * 62)
    print(" VÍZÉRZÉKELŐ – ENERGIAMÉRLEG")
    print("=" * 62)
    print(f" Mérési időköz:        {a.intervallum:.0f} perc ({ciklus_per_nap:.0f} mérés/nap)")
    print(f" Adatküldés:           {'WiFi' if a.wifi else 'mobilhálózat (LTE)'}")
    print(f" Akku:                 {a.akku:.0f} mAh → {akku_wh:.1f} Wh használható")
    print(f" Napelem:              {a.napelem:.0f} W")
    print("-" * 62)
    print(" Egy ciklus energiája:")
    for nev, wh in ciklus.items():
        print(f"   {nev:<12} {wh * 1000:6.2f} mWh  ({wh / ciklus_ossz * 100:4.0f}%)")
    print(f"   {'Összesen':<12} {ciklus_ossz * 1000:6.2f} mWh")
    print(f" Alvás naponta:        {alvo_wh:.2f} Wh")
    print(f" NAPI FOGYASZTÁS:      {napi_wh:.2f} Wh")
    print(f" Kibírja napfény nélkül: {akku_wh / napi_wh:.1f} napig")
    print("-" * 62)
    print(f" {'Hónap':<11}{'Napelem Wh/nap':>15}{'Mérleg Wh/nap':>15}   Értékelés")
    for honap, psh in CSUCSNAPORAK.items():
        termeles = a.napelem * psh * NAPELEM_RENDSZER_HATASFOK
        merleg = termeles - napi_wh
        if termeles >= 1.5 * napi_wh:
            ertek = "bőven elég"
        elif termeles >= napi_wh:
            ertek = "elég (kevés tartalék)"
        else:
            ertek = "KEVÉS – az akku fogy"
        print(f" {honap:<11}{termeles:>15.1f}{merleg:>+15.1f}   {ertek}")
    print("=" * 62)
    print(" Megjegyzés: Li-ion akkut 0 °C alatt NEM szabad tölteni!")
    print(" Fagyos napokon a töltés leállhat – ezt az akku tartaléka fedezi.")


if __name__ == "__main__":
    main()
