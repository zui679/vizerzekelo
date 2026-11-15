# 6. Mechanika és telepítés

## 6.1 Két lehetséges kialakítás

| | **A) Parti rögzítés** ✅ ajánlott | B) Úszó bója |
|---|---|---|
| Elektronika | a parton, cölöpön / korláton, a víz felett | a vízen úszó dobozban |
| Szenzorok | perforált védőcsőben a vízbe lógatva | a bója alján |
| Árvízbiztonság | jó (magasra szerelve) | rossz – sodródás, uszadékfa |
| Karbantartás | partról elérhető, vízbe menni nem kell | csónak / vízbe menés kell |
| Napelem | stabil, jól tájolható | billeg, változó tájolás |
| Vandalizmus | jobban védhető | látványos, sérülékeny |
| Nehézség | könnyebb | nehezebb (felhajtóerő, horgonyzás) |

**Az iskolai projekthez az „A) Parti rögzítés” javasolt**, mert a diákok a vízbe menés nélkül,
biztonságosan részt vehetnek a karbantartásban.

## 6.2 A parti változat felépítése

```
                     ☀  Napelem (déli tájolás, ~35–60° dőlés)
                    ╱▔▔▔▔▔▔▔╲
                   ╱_________╲
                        │
                ┌───────┴───────┐
                │  IP67 DOBOZ   │   ← legalább 1 m-rel a megszokott vízszint
                │ Arduino, akku │     FELETT, az árvízszintet is figyelembe véve
                │ modem, töltő  │
                └──┬─────────┬──┘
                   │  tömszelencék (alul!)
     cölöp /       │  kábelek védőcsőben (gégecső)
     korlát ▐      │
            ▐      │
            ▐      │
    ~~~~~~~~▐~~~~~~│~~~~~~~~~~~~~~~~~~~~~~~  vízszint
            ▐   ┌──┴──┐
            ▐   │ ○ ○ │  ← perforált PVC védőcső (Ø 75–110 mm),
            ▐   │ ○ ○ │    benne a szondák, alja nyitott/rácsos
            ▐   │ ○ ○ │    → a víz átáramlik, de uszadék nem fér be
            ▐   └─────┘  ← a szondák végei legalább 20–30 cm-rel
            ▐               a víz felszíne alatt, a mederfenék felett
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  meder
```

### Az elektronikai doboz
- **IP67** védettségű ABS vagy polikarbonát kötődoboz, kb. 200 × 150 × 100 mm (vagy nagyobb – a
  szerelésnél jól jön a hely).
- **Világos színű** (kevésbé melegszik a napon).
- **Kábelátvezetés csak alul**, IP68-as **tömszelencéken** (PG7 / PG9 / M12) – így az esővíz
  nem folyik be a kábel mentén. Minden kábelnek legyen „csepegtető íve” (a kábel a tömszelence előtt
  lefelé lóg, így a víz lecsöpög róla, nem folyik a dobozba).
- **Páramentesítés:** 2–3 tasak szilikagél (lehetőleg színváltós, hogy látszódjon, mikor telített)
  + a BME280 figyeli a páratartalmat.
- **Nyomáskiegyenlítő szelep** (Gore-membrán, „breather vent”) – a napi hőingás miatt a doboz
  „lélegzik”, és a szelep nélkül nedvességet szív be a tömítéseken át. Olcsó, nagyon ajánlott.
- Belül: az elektronika egy **szerelőlapra** (plexi / rétegelt lemez) csavarozva, távtartókkal.
  Az akku külön rekeszben (szigetelve, rögzítve).
- **Antenna:** ha lehet, a dobozon kívül, felfelé (a műanyag doboz átengedi a rádiójelet, de a kívül
  elhelyezett antenna jobb jelet ad).

### A szenzortartó cső
- **PVC lefolyócső** (Ø 75–110 mm), kb. 1 m hosszú, oldalán sok **Ø 10–15 mm-es furattal**.
- A szondák **kábelei felülről** jönnek le, a szondák egy belső tartóba (pl. habszivacs vagy
  3D-nyomtatott tartó) rögzítve, egymástól 5–10 cm-re.
- A cső **alja**: rozsdamentes rács vagy furatos kupak – a víz és az iszap ki tud folyni.
- A zavarosság szenzor **ne kapjon közvetlen fényt** (sötét cső vagy fekete szigetelőszalaggal
  takart rész).
- A csövet **két ponton** rögzítsük (pl. rozsdamentes csőbilincs a cölöpre) – a sodrás nagy erővel hat rá.
- A csövet úgy tervezzük, hogy **felhúzható** legyen (pl. kötél / sín mentén) – így a szondák
  tisztításához nem kell a vízbe menni.

## 6.3 Helyszín kiválasztása

| Szempont | Mire figyeljünk? |
|---|---|
| **Engedély** | Ki a terület / a part kezelője? Lásd 6.4! |
| **Biztonságos megközelítés** | Partról, lépcsőről, stégről elérhető legyen; ne meredek, csúszós partról. |
| **Áramló víz** | Ne holtág, öböl – ott a víz nem jellemző a folyóra. |
| **Mélység** | Kisvízkor is legyen a szonda legalább 20–30 cm-rel a víz alatt. |
| **Árvíz** | Az elektronika legyen a valaha mért legmagasabb vízszint fölött (vagy legyen gyorsan leszerelhető). |
| **Napfény** | A napelemet ne árnyékolja fa, híd, épület – főleg télen (alacsony nap!). |
| **Mobiltérerő** | Előtte telefonnal ellenőrizzük (legalább 2–3 „csík” LTE). |
| **Vandalizmus** | Feltűnésmentes kivitel, lakat, tájékoztató tábla (ki, mit, miért mér – elérhetőség). |
| **Szennyezőforrások** | Ha szennyvízbevezetés feletti és alatti szakaszt is figyelni akarunk – 2 doboz! |

## 6.4 Engedélyek – a telepítés előtt intézendő (felnőtt feladata)

Magyarországon a folyók medre és partja általában **állami tulajdon**, kezelőjük többnyire a
területileg illetékes **vízügyi igazgatóság**. Kisebb vízfolyásoknál lehet önkormányzati, vízitársulati
vagy magántulajdon is. Mérőeszköz kihelyezéséhez – még ideiglenesen is – szükség lehet:

- a **terület tulajdonosának / kezelőjének hozzájárulására**,
- egyes esetekben **vízjogi engedélyre** vagy bejelentésre (a vízügyi hatóság meg tudja mondani),
- **védett területen** (pl. Natura 2000, nemzeti park) a természetvédelmi kezelő hozzájárulására.

**Javaslat:** a projekt elején keressük meg levélben a helyi vízügyi igazgatóságot – iskolai,
oktatási célú projekteket gyakran szívesen támogatnak, adhatnak tanácsot a helyszínre, sőt
összehasonlító hivatalos mérési adatokat is. Hídra, stégre, kerítésre szereléshez a tulajdonos
írásos engedélye kell.

## 6.5 Telepítési ellenőrzőlista

**Indulás előtt (az iskolában):**
- [ ] Legalább 1 hetes próbaüzem hordóban / vödörben, hibátlan adatküldéssel
- [ ] Szenzorok frissen kalibrálva (dátum feljegyezve)
- [ ] Akku feltöltve, feszültség feljegyezve
- [ ] Tömszelencék meghúzva, tömítés ellenőrizve, friss szilikagél
- [ ] `config.h`: `TRANSPORT_MODE TRANSPORT_GSM`, SIM egyenleg rendben
- [ ] TPL5110 időköz beállítva és ellenőrizve
- [ ] Szerszámok: csavarhúzók, kulcsok, bilincsek, kábelkötegelők, multiméter, laptop + USB kábel
- [ ] Biztonsági felszerelés: mentőmellény (vízhez közel dolgozóknak), elsősegélycsomag, telefon

**A helyszínen:**
- [ ] Mobiltérerő ellenőrzése
- [ ] Cölöp / tartó rögzítése, a doboz felszerelése a víz fölé
- [ ] Szenzortartó cső rögzítése, szondák a vízben, megfelelő mélységben
- [ ] Napelem tájolása (dél), dőlésszög
- [ ] Szerviz mód → **10-es menüpont** (mérés + küldés teszt) → megjelent az adat a ThingSpeakben?
- [ ] Doboz lezárása, tájékoztató tábla kihelyezése
- [ ] Fotók a telepítésről (dokumentáció!), GPS koordináták feljegyzése

**Az első napokban:**
- [ ] Naponta ellenőrizni a ThingSpeak csatornát: jönnek-e az adatok 15 percenként?
- [ ] Akkufeszültség napi menete rendben van?
- [ ] A doboz páratartalma stabil?
