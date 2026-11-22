// =====================================================================
//  Szimulátor: pH – üvegmembrános szonda + erősítő (analóg, A0)
//  Extra: kalibráló mini-játék, és a „miért csak egy szenzor kap
//  áramot egyszerre?” bemutató.
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;

  // A „valódi” szonda tulajdonságai (a szimulátor titka – a program nem tudja!)
  // V7: feszültség pH 7-nél; m25: V/pH 25 °C-on, az erősítő kimenetén
  const SZONDAK = {
    uj:      { nev: "új szonda",   V7: 1.52, m25: -0.172 },
    egyeves: { nev: "1 éves",      V7: 1.55, m25: -0.160 },
    oreg:    { nev: "öreg szonda", V7: 1.60, m25: -0.135 },
  };
  const PELDAK = [
    ["Citromlé (2)", 2], ["Ecet (3)", 3], ["Esővíz (5,6)", 5.6], ["Tiszta víz (7)", 7],
    ["Folyóvíz (7,9)", 7.9], ["Szódabikarbóna (8,3)", 8.3], ["Szappanos víz (10)", 10],
  ];

  // univerzális indikátor-szerű szín: piros (savas) → zöld (semleges) → lila (lúgos)
  function indikatorSzin(ph) {
    const h = ph <= 7 ? (ph / 7) * 120 : 120 + ((ph - 7) / 7) * 160;
    return "hsl(" + Math.round(h) + " 70% 52% / .5)";
  }

  VE.szimulatorok.push({
    id: "ph", ful: "pH", ikon: "⚗", kartya: "ph",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "pH – savas vagy lúgos?",
        bevezeto: "A szonda üvegmembránján a hidrogénionok (H⁺) mennyiségétől függő, nagyon kicsi feszültség keletkezik. Az erősítő panel ezt felnagyítja, az Arduino megméri, és egy kalibrált egyenessel visszaszámolja belőle a pH-t.",
      });
      const st = {
        ph: 7.86, T: 11.9, szonda: "uj",
        cal: Object.assign({}, F.GYARI), calAllapot: "gyari", puffer686: false,
        ecBe: false, levalaszto: false, zavarIdo: 0,
      };

      const valodiFesz = (ph, T) => {
        const s = SZONDAK[st.szonda];
        return s.V7 + (ph - 7) * s.m25 * (T + 273.15) / 298.15;
      };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 260", class: "szim-svg", role: "img", "aria-label": "pH szonda egy főzőpohárban" });
      const folyadek = S("rect", { x: 44, y: 92, width: 212, height: 134, rx: 4 });
      svg.appendChild(folyadek);
      svg.appendChild(S("path", { d: "M40 40 V222 q0 8 8 8 H252 q8 0 8 -8 V40", class: "pohar" }));
      const hIonok = VE.reszecskek(svg, { x: 52, y: 100, w: 196, h: 118, r: 8, osztaly: "ion-h", felirat: "H⁺" });
      const ohIonok = VE.reszecskek(svg, { x: 52, y: 100, w: 196, h: 118, r: 10, osztaly: "ion-oh", felirat: "OH⁻" });
      // pH szonda
      svg.appendChild(S("rect", { x: 108, y: 14, width: 16, height: 172, rx: 6, class: "szonda-test" }));
      svg.appendChild(S("circle", { cx: 116, cy: 196, r: 15, class: "uveg" }));
      svg.appendChild(S("text", { x: 116, y: 248, "text-anchor": "middle", class: "szim-felirat", text: "üvegmembrán" }));
      // EC szonda (a zavarás bemutatóhoz)
      const ecSzonda = S("g", { visibility: "hidden" }, [
        S("rect", { x: 196, y: 14, width: 14, height: 184, rx: 5, class: "szonda-test" }),
        S("text", { x: 203, y: 248, "text-anchor": "middle", class: "szim-felirat", text: "EC szonda" }),
      ]);
      const hullamok = S("path", { d: "M190 150 q-12 -10 -24 0 t-24 0 M190 170 q-12 -10 -24 0 t-24 0", class: "zavar-hullam", visibility: "hidden" });
      svg.append(ecSzonda, hullamok);
      // kábel az erősítőhöz
      svg.appendChild(S("path", { d: "M116 14 V6 H300 V30", class: "drot kabel" }));
      svg.appendChild(S("rect", { x: 280, y: 30, width: 120, height: 48, rx: 8, class: "panel-doboz" }));
      svg.appendChild(S("text", { x: 340, y: 52, "text-anchor": "middle", class: "szim-felirat vastag", text: "erősítő panel" }));
      svg.appendChild(S("text", { x: 340, y: 68, "text-anchor": "middle", class: "szim-felirat", text: "táp: D5" }));
      svg.appendChild(S("path", { d: "M340 78 V120 H405", class: "drot analog" }));
      svg.appendChild(S("text", { x: 405, y: 112, "text-anchor": "end", class: "szim-felirat", text: "A0 →" }));
      const phSzoveg = S("text", { x: 340, y: 175, "text-anchor": "middle", class: "szim-nagy" });
      svg.appendChild(phSzoveg);
      svg.appendChild(S("text", { x: 340, y: 198, "text-anchor": "middle", class: "szim-felirat", text: "a víz valódi pH-ja" }));
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const csPh = VE.csuszka({ cim: "A víz pH-ja", min: 0, max: 14, lepes: 0.01, ertek: st.ph, formaz: (v) => VE.szam(v, 2), onInput: (v) => { st.ph = v; frissit(); } });
      const csT = VE.csuszka({ cim: "Vízhőmérséklet", min: 0, max: 35, lepes: 0.1, ertek: st.T, formaz: (v) => VE.szam(v, 1) + " °C", onInput: (v) => { st.T = v; frissit(); } });
      const szondaValto = el("div", { class: "valto kicsi", role: "group", "aria-label": "A szonda kora" },
        Object.entries(SZONDAK).map(([id, s]) => el("button", {
          type: "button", class: "valto-gomb", "aria-pressed": String(id === st.szonda), "data-szonda": id, text: s.nev,
          onclick: () => {
            st.szonda = id;
            szondaValto.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.szonda === id)));
            frissit();
          },
        })));
      r.vezerlok.append(csPh.el, VE.gombsor("Példák:", PELDAK.map(([f, v]) => [f, () => csPh.beallit(v)])), csT.el,
        el("div", { class: "sor-cimkevel" }, [el("span", { class: "gombsor-cim", text: "A szonda:" }), szondaValto]));

      // ---- info ----
      const sav = VE.tartomanySav({
        min: 0, max: 14, jelek: [0, 2, 4, 6, 7, 8, 10, 12, 14], formaz: (v) => String(v),
        zonak: [
          { tol: 0, ig: 6.5, osztaly: "rossz", cim: "savas" },
          { tol: 6.5, ig: 8.5, osztaly: "jo", cim: "a legtöbb vízi élőlénynek jó (6,5–8,5)" },
          { tol: 8.5, ig: 14, osztaly: "figyel", cim: "lúgos" },
        ],
      });
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "A legtöbb vízi élőlény a 6,5–8,5 tartományt kedveli." }),
          el("li", { text: "Egy hirtelen változás szennyezésre utalhat (ipari szennyvíz, műtrágya)." }),
          el("li", { text: "Napközben a vízinövények fotoszintézise is emeli a pH-t – ezt a napi ingadozást is látni fogjuk." }),
        ])),
        VE.infoBlokk("Hol tart most?", sav.el),
        VE.infoBlokk("Mire figyeljünk?", "2–4 hetente kalibrálni kell, a szonda kb. 1–2 évig bírja, és soha nem száradhat ki. Ha a kalibráláskor kiírt meredekség egyre kisebb, a szonda öregszik.", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { cim: "A pH jelútja" });

      // ---- extra 1: kalibrálás ----
      const kalAllapot = el("p", { class: "kal-allapot" });
      const kalErtekek = el("ul", { class: "kal-ertekek" });
      const kalDiagram = S("svg", { viewBox: "0 0 300 190", class: "kal-diagram", role: "img", "aria-label": "Feszültség a pH függvényében: a valódi szonda és a kalibrált egyenes" });
      const eltErtekek = el("div", { class: "elteres" });
      const p686 = VE.kapcsolo("pH 7,00 helyett 6,86-os puffert használok (pl. a HESTORE pufferpora)", (b) => { st.puffer686 = b; });
      r.extra.appendChild(el("div", { class: "panel extra-doboz" }, [
        el("h4", { text: "🎯 Kalibráld a szondát!" }),
        el("p", { class: "halvany", text: "A program nem tudja, pontosan mekkora feszültséget ad a te szondád. Ezért két ismert oldatba (pufferbe) mártjuk, és a két pont közé egyenest húz. Próbáld ki: először nézd meg, mennyit téved a gyári értékekkel, aztán kalibrálj!" }),
        el("div", { class: "kal-racs" }, [
          el("div", null, [
            el("div", { class: "gombsor" }, [
              el("button", { type: "button", class: "gomb", text: "1. Mártsd a pH 7 pufferbe", onclick: () => kalibral(7) }),
              el("button", { type: "button", class: "gomb", text: "2. Mártsd a pH 4 pufferbe", onclick: () => kalibral(4) }),
              el("button", { type: "button", class: "gomb", text: "↺ Gyári értékek", onclick: () => { st.cal = Object.assign({}, F.GYARI); st.calAllapot = "gyari"; frissit(); } }),
            ]),
            p686.el, kalAllapot, kalErtekek, eltErtekek,
          ]),
          kalDiagram,
        ]),
      ]));

      function kalibral(melyik) {
        const puffer = melyik === 7 && st.puffer686 ? 6.86 : melyik;
        const v = valodiFesz(puffer, st.T);
        if (melyik === 7) { st.cal.phV7 = v; st.calAllapot = st.calAllapot === "ph4" || st.calAllapot === "kesz" ? "kesz" : "ph7"; }
        else { st.cal.phV4 = v; st.calAllapot = st.calAllapot === "ph7" || st.calAllapot === "kesz" ? "kesz" : "ph4"; }
        st.cal.phCalTempC = st.T;
        if (melyik === 7) st.cal.puffer = puffer;   // a diagram feliratához: melyik pufferben mértük
        frissit();
      }

      // ---- extra 2: zavarás ----
      const zavarSzoveg = el("p", { class: "halvany" });
      const levKapcs = VE.kapcsolo("…de a leválasztó modulon át (DFR0504)", (b) => { st.levalaszto = b; frissit(); });
      const ecKapcs = VE.kapcsolo("Az EC szenzor is kap áramot a pH mérés alatt", (b) => {
        st.ecBe = b; levKapcs.input.disabled = !b; frissit();
      });
      levKapcs.input.disabled = true;
      r.extra.appendChild(el("div", { class: "panel extra-doboz" }, [
        el("h4", { text: "⚡ Miért kap egyszerre csak egy szenzor áramot?" }),
        el("p", { class: "halvany", text: "A szondák ugyanabban a vízben vannak, és a víz vezeti az áramot. Az EC szenzor váltakozó feszültséget ad a vízre – kapcsold be, és figyeld a pH értéket és az ADC mintákat!" }),
        ecKapcs.el, levKapcs.el, zavarSzoveg,
        el("p", { class: "megjegyzes", text: "Szemléltetés, nem valódi mérésből: hogy a valódi dobozban mekkora a zavarás, azt az összeszereléskor a „zavarás-próba” mutatja meg." }),
      ]));

      function zaj() {
        if (st.ecBe && !st.levalaszto) return { szoras: 110, tuskek: 0.12, eltolas: (Math.random() - 0.5) * 160 };
        if (st.ecBe) return { szoras: 3, tuskek: 0 };
        return { szoras: 1.5, tuskek: 0 };
      }

      function diagramRajz(vMert, phMert) {
        // x: pH 0..14, y: 0.5 V .. 3.0 V
        const X = (ph) => 30 + (ph / 14) * 255, Y = (v) => 170 - ((v - 0.4) / 2.6) * 160;
        kalDiagram.replaceChildren(
          S("line", { x1: 30, y1: 170, x2: 285, y2: 170, class: "tengely" }),
          S("line", { x1: 30, y1: 10, x2: 30, y2: 170, class: "tengely" }),
          S("text", { x: 285, y: 186, "text-anchor": "end", class: "szim-felirat", text: "pH →" }),
          S("text", { x: 34, y: 18, class: "szim-felirat", text: "feszültség (V)" })
        );
        [0, 4, 7, 10].forEach((p) => kalDiagram.appendChild(S("text", { x: X(p), y: 182, "text-anchor": "middle", class: "szim-felirat", text: String(p) })));
        [1, 2, 3].forEach((v) => kalDiagram.appendChild(S("text", { x: 26, y: Y(v) + 4, "text-anchor": "end", class: "szim-felirat", text: v + "" })));
        // valódi szonda
        kalDiagram.appendChild(S("line", { x1: X(0), y1: Y(valodiFesz(0, st.T)), x2: X(14), y2: Y(valodiFesz(14, st.T)), class: "vonal-valodi" }));
        // a program egyenese
        kalDiagram.appendChild(S("line", { x1: X(0), y1: Y(F.phFesz(0, st.T, st.cal)), x2: X(14), y2: Y(F.phFesz(14, st.T, st.cal)), class: "vonal-kal" }));
        // kalibrációs pontok
        kalDiagram.appendChild(S("circle", { cx: X(7), cy: Y(st.cal.phV7), r: 4, class: "pont-kal" }));
        kalDiagram.appendChild(S("circle", { cx: X(4), cy: Y(st.cal.phV4), r: 4, class: "pont-kal" }));
        // a mostani mérés
        kalDiagram.appendChild(S("line", { x1: X(st.ph), y1: Y(vMert), x2: X(Math.max(0, Math.min(14, phMert))), y2: Y(vMert), class: "vonal-hiba" }));
        kalDiagram.appendChild(S("circle", { cx: X(st.ph), cy: Y(vMert), r: 5, class: "pont-most" }));
        const jm = S("g", { class: "szim-felirat" });
        jm.append(
          S("line", { x1: 40, y1: 136, x2: 60, y2: 136, class: "vonal-valodi" }), S("text", { x: 64, y: 140, text: "a valódi szonda" }),
          S("line", { x1: 40, y1: 152, x2: 60, y2: 152, class: "vonal-kal" }), S("text", { x: 64, y: 156, text: "amit a program hisz" })
        );
        kalDiagram.appendChild(jm);
      }

      function frissit() {
        // ábra
        folyadek.setAttribute("fill", indikatorSzin(st.ph));
        hIonok.darab(Math.max(0, Math.min(26, 3 + (7 - st.ph) * 2.2)));
        ohIonok.darab(Math.max(0, Math.min(26, 3 + (st.ph - 7) * 2.2)));
        phSzoveg.textContent = "pH " + VE.szam(st.ph, 2);
        ecSzonda.setAttribute("visibility", st.ecBe ? "visible" : "hidden");
        hullamok.setAttribute("visibility", st.ecBe && !st.levalaszto ? "visible" : "hidden");
        sav.mutat(st.ph);

        // mérés
        const z = zaj();
        const vValodi = valodiFesz(st.ph, st.T) + (z.eltolas ? (z.eltolas / F.ADC_MAX) * 5 : 0);
        const m = VE.adcMeres(vValodi, z);
        const phMert = F.phFromVoltage(m.volt, st.T, st.cal);
        const sCal = (st.cal.phV4 - st.cal.phV7) / (4 - 7);
        const sMost = F.phMeredekseg(st.T, st.cal);
        const hibas = isNaN(phMert) || phMert < 0 || phMert > 14 || F.levaltNakTunik(m.volt);
        const tartomanyon = phMert >= 6.5 && phMert <= 8.5;
        const s = SZONDAK[st.szonda];

        ut.frissit({
          bemenet: { nagy: "pH " + VE.szam(st.ph, 2), al: "a víz valódi pH-ja, " + VE.szam(st.T, 1) + " °C" },
          szenzor: { nagy: "üvegmembrán + erősítő", al: "táp: D5 · kb. " + Math.round(Math.abs(s.m25) * 1000) + " mV / pH az erősítő után" },
          lab: "A0", fesz: m.volt, adc: m.adc, mintak: m.mintak,
          keplet: [
            "meredekség = (U4 − U7) ÷ (4 − 7)",
            "  = (" + VE.szam(st.cal.phV4, 3) + " − " + VE.szam(st.cal.phV7, 3) + ") ÷ (−3)",
            "  = " + VE.szam(sCal * 1000, 1) + " mV/pH (" + VE.szam(st.cal.phCalTempC, 1) + " °C-on)",
            "most, " + VE.szam(st.T, 1) + " °C-on: " + VE.szam(sMost * 1000, 1) + " mV/pH",
            "pH = 7 + (U − U7) ÷ meredekség",
            "  = 7 + (" + VE.szam(m.volt, 4) + " − " + VE.szam(st.cal.phV7, 3) + ") ÷ " + VE.szam(sMost, 4),
            "  = " + (isNaN(phMert) ? "?" : VE.szam(phMert, 2)),
          ],
          eredmeny: hibas
            ? { nagy: "—", al: "értelmetlen érték, nem küldi el", jelzes: "PH_HIBA", allapot: "hiba" }
            : { nagy: "pH " + VE.szam(phMert, 2), al: tartomanyon ? "field2" : "field2 – a halaknak ez már nem ideális", jelzes: "OK", allapot: tartomanyon ? "ok" : "figyelem" },
        });

        // kalibrálás
        const ALLAPOT = {
          gyari: "Most a gyári (tipikus) értékekkel számol – nincs kalibrálva. A doboz ilyenkor NINCS_KALIBRALVA jelzést küld.",
          ph7: "Az 1. pont kész (pH 7). Most mártsd a pH 4 pufferbe!",
          ph4: "A 2. pont kész (pH 4). Most mártsd a pH 7 pufferbe!",
          kesz: "Kész a kalibrálás! A program most a te szondádhoz illő egyenest használja.",
        };
        kalAllapot.textContent = ALLAPOT[st.calAllapot];
        const meredMv = Math.abs(st.cal.phV4 - st.cal.phV7) / 3 * 1000;
        const jo = meredMv >= 150 && meredMv <= 190;
        kalErtekek.replaceChildren(
          el("li", { text: "pH 7 feszültség: " + VE.szam(st.cal.phV7, 4) + " V" + (st.cal.puffer === 6.86 ? " (valójában 6,86-os pufferben mérve!)" : "") }),
          el("li", { text: "pH 4 feszültség: " + VE.szam(st.cal.phV4, 4) + " V" }),
          el("li", { class: jo ? "" : "figyel", text: "Meredekség: " + VE.szam(meredMv, 1) + " mV/pH " + (jo ? "(jó szonda: kb. 150–190)" : "– kevés! A szonda öregszik, cserélni kell") })
        );
        const elteres = Math.abs(phMert - st.ph) < 0.005 ? 0 : phMert - st.ph;
        eltErtekek.replaceChildren(
          el("span", null, ["Valódi: ", el("strong", { text: VE.szam(st.ph, 2) })]),
          el("span", null, ["Mért: ", el("strong", { text: isNaN(phMert) ? "—" : VE.szam(phMert, 2) })]),
          el("span", { class: Math.abs(elteres) > 0.1 ? "figyel" : "jo" }, ["Eltérés: ", el("strong", { text: isNaN(elteres) ? "—" : (elteres >= 0 ? "+" : "") + VE.szam(elteres, 2) })])
        );
        diagramRajz(m.volt, phMert);

        // zavarás
        zavarSzoveg.textContent = !st.ecBe
          ? "Most csak a pH szenzor kap áramot: a mért érték nyugodt, az ADC minták szorosan együtt vannak."
          : st.levalaszto
            ? "A leválasztó modul elektromosan elválasztja az EC szenzort: a zavarás eltűnik. A terepi dobozban ezért van leválasztó, ÉS a firmware is egyszerre csak egy szenzornak ad áramot."
            : "Az EC szenzor váltakozó feszültsége „áthallatszik” a vízen: a pH ugrál, a minták szétszóródnak. A nyesett átlag a tüskéket eldobja, de a folyamatos zavarást nem tudja kiszűrni.";
      }
      frissit();

      return {
        tick(dt) {
          hIonok.tick(dt); ohIonok.tick(dt);
          if (st.ecBe && !st.levalaszto) {
            st.zavarIdo += dt;
            if (st.zavarIdo > 0.6) { st.zavarIdo = 0; frissit(); }
          }
        },
      };
    },
  });
})();
