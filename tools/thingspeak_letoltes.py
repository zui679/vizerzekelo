#!/usr/bin/env python3
"""
ThingSpeak adatletöltő a Vízérzékelő dobozhoz.

Letölti egy ThingSpeak csatorna utolsó N mérését, CSV fájlba menti (táblázatkezelőben
megnyitható), és kiír egy egyszerű statisztikát (darab, minimum, maximum, átlag, medián).
Ha telepítve van a matplotlib, grafikont is rajzol (--grafikon).

Használat:
  python3 tools/thingspeak_letoltes.py --csatorna 1234567
  python3 tools/thingspeak_letoltes.py --csatorna 1234567 --db 5000 --kimenet adatok/meresek.csv
  python3 tools/thingspeak_letoltes.py --csatorna 1234567 --kulcs READKEY   (privát csatornához)
  python3 tools/thingspeak_letoltes.py --csatorna 1234567 --grafikon

Csak a Python alapkönyvtárát használja (a grafikonhoz kell: pip install matplotlib).
"""
import argparse
import csv
import json
import statistics
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

# A firmware mezőkiosztása (transport.cpp)
MEZOK = {
    "field1": ("vizhomerseklet_C", 2),
    "field2": ("pH", 2),
    "field3": ("EC_uS_cm", 0),
    "field4": ("zavarossag_NTU", 0),
    "field5": ("oldott_oxigen_mg_l", 2),
    "field6": ("akku_V", 2),
    "field7": ("doboz_para_szazalek", 0),
    "field8": ("jelerosseg_dBm", 0),
}


def letolt(csatorna: int, db: int, kulcs: str | None) -> dict:
    params = {"results": min(db, 8000), "status": "true"}
    if kulcs:
        params["api_key"] = kulcs
    url = (f"https://api.thingspeak.com/channels/{csatorna}/feeds.json?"
           + urllib.parse.urlencode(params))
    with urllib.request.urlopen(url, timeout=30) as valasz:
        return json.load(valasz)


def szam(ertek):
    try:
        return float(ertek)
    except (TypeError, ValueError):
        return None


def helyi_ido(utc_szoveg: str) -> str:
    """A ThingSpeak UTC időt ad – átváltjuk a gép helyi idejére."""
    t = datetime.strptime(utc_szoveg, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    return t.astimezone().strftime("%Y-%m-%d %H:%M:%S")


def main() -> None:
    p = argparse.ArgumentParser(description="ThingSpeak adatletöltő")
    p.add_argument("--csatorna", type=int, required=True, help="ThingSpeak Channel ID")
    p.add_argument("--db", type=int, default=2000, help="letöltendő mérések száma (max. 8000)")
    p.add_argument("--kulcs", help="Read API Key (csak privát csatornához kell)")
    p.add_argument("--kimenet", default="adatok/meresek.csv", help="CSV fájl neve")
    p.add_argument("--grafikon", action="store_true", help="grafikon rajzolása (matplotlib)")
    a = p.parse_args()

    try:
        adat = letolt(a.csatorna, a.db, a.kulcs)
    except Exception as e:  # hálózati hiba, rossz csatorna, privát csatorna kulcs nélkül
        sys.exit(f"Hiba a letöltésnél: {e}")

    sorok = adat.get("feeds", [])
    if not sorok:
        sys.exit("Nincs adat a csatornában (vagy privát, és kell a --kulcs).")

    # CSV mentés – pontosvessző és tizedesvessző, hogy a magyar Excel jól nyissa meg
    fejlec = ["ido"] + [nev for nev, _ in MEZOK.values()] + ["allapot"]
    with open(a.kimenet, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(fejlec)
        for s in sorok:
            sor = [helyi_ido(s["created_at"])]
            for mezo in MEZOK:
                v = szam(s.get(mezo))
                sor.append("" if v is None else str(v).replace(".", ","))
            sor.append(s.get("status") or "")
            w.writerow(sor)
    print(f"{len(sorok)} mérés mentve: {a.kimenet}")
    print(f"Időszak: {helyi_ido(sorok[0]['created_at'])} – {helyi_ido(sorok[-1]['created_at'])}\n")

    # Statisztika
    print(f"{'Mennyiség':<22}{'db':>6}{'min':>10}{'max':>10}{'átlag':>10}{'medián':>10}")
    print("-" * 68)
    for mezo, (nev, tizedes) in MEZOK.items():
        ertekek = [v for v in (szam(s.get(mezo)) for s in sorok) if v is not None]
        if not ertekek:
            continue
        f = f"{{:>10.{tizedes}f}}"
        print(f"{nev:<22}{len(ertekek):>6}"
              + f.format(min(ertekek)) + f.format(max(ertekek))
              + f.format(statistics.mean(ertekek)) + f.format(statistics.median(ertekek)))

    hibak = [s.get("status") for s in sorok if s.get("status") not in (None, "", "OK")]
    if hibak:
        print(f"\nFigyelem: {len(hibak)} mérésnél volt hibaüzenet, pl.: {hibak[-1]}")

    if a.grafikon:
        rajzol(sorok, a.kimenet.rsplit(".", 1)[0] + ".png")


def rajzol(sorok: list, fajlnev: str) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("\nA grafikonhoz telepítsd a matplotlib-et:  pip install matplotlib")
        return
    idok = [datetime.strptime(s["created_at"], "%Y-%m-%dT%H:%M:%SZ")
            .replace(tzinfo=timezone.utc).astimezone() for s in sorok]
    mezok = [m for m in MEZOK if any(szam(s.get(m)) is not None for s in sorok)]
    fig, tengelyek = plt.subplots(len(mezok), 1, figsize=(10, 2.2 * len(mezok)), sharex=True)
    if len(mezok) == 1:
        tengelyek = [tengelyek]
    for ax, mezo in zip(tengelyek, mezok):
        pontok = [(t, szam(s.get(mezo))) for t, s in zip(idok, sorok) if szam(s.get(mezo)) is not None]
        ax.plot([t for t, _ in pontok], [v for _, v in pontok], linewidth=1)
        ax.set_ylabel(MEZOK[mezo][0], fontsize=8)
        ax.grid(True, alpha=0.3)
    fig.suptitle("Vízérzékelő – mért adatok")
    fig.tight_layout()
    fig.savefig(fajlnev, dpi=120)
    print(f"\nGrafikon mentve: {fajlnev}")


if __name__ == "__main__":
    main()
