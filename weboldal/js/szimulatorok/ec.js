// =====================================================================
//  Szimulátor: VEZETŐKÉPESSÉG (EC / TDS) – DFRobot SEN0244 (analóg, A1)
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;

  const PANEL_MAX_V = 2.3;      // a TDS panel kimenete legfeljebb kb. 2,3 V (gyártói adat)
  const EC_MAX = 60000;
  const logbol = (s) => Math.pow(10, (s / 1000) * Math.log10(EC_MAX + 1)) - 1;
  const logba = (ec) => (Math.log10(ec + 1) / Math.log10(EC_MAX + 1)) * 1000;
  const ecSzoveg = (ec) => (ec < 10 ? VE.szam(ec, 1) : Math.round(ec).toLocaleString("hu-HU"));

  VE.szimulatorok.push({
    id: "ec", ful: "Vezetőképesség", ikon: "⚡", kartya: "ec",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "Vezetőképesség (EC) – mennyi só van a vízben?",
        bevezeto: "A tiszta víz szinte szigetel. Minél több oldott só és ásványi anyag van benne, annál több ion szállítja az áramot a két elektróda között. A szenzor ezt az áramot alakítja feszültséggé.",
      });
      const st = { ec: 412, T: 11.9, polaritas: 1, ido: 0 };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 250", class: "szim-svg", role: "img", "aria-label": "Két elektróda a vízben, köztük ionok mozognak" });
      svg.appendChild(S("rect", { x: 20, y: 70, width: 380, height: 160, rx: 10, class: "viz-test" }));
      svg.appendChild(S("rect", { x: 70, y: 30, width: 14, height: 180, rx: 3, class: "elektroda" }));
      svg.appendChild(S("rect", { x: 336, y: 30, width: 14, height: 180, rx: 3, class: "elektroda" }));
      const balJel = S("text", { x: 77, y: 24, "text-anchor": "middle", class: "polaritas" });
      const jobbJel = S("text", { x: 343, y: 24, "text-anchor": "middle", class: "polaritas" });
      svg.append(balJel, jobbJel);
      const na = VE.reszecskek(svg, { x: 96, y: 84, w: 228, h: 134, r: 10, osztaly: "ion-na", felirat: "Na⁺" });
      const cl = VE.reszecskek(svg, { x: 96, y: 84, w: 228, h: 134, r: 10, osztaly: "ion-cl", felirat: "Cl⁻" });
      const aramNyil = S("path", { d: "M120 56 H300", class: "aram-nyil" });
      const aramSzoveg = S("text", { x: 210, y: 48, "text-anchor": "middle", class: "szim-felirat" });
      svg.append(aramNyil, aramSzoveg);
      svg.appendChild(S("text", { x: 210, y: 246, "text-anchor": "middle", class: "szim-felirat", text: "váltakozó feszültség: a + és a − másodpercenként sokszor helyet cserél" }));
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const csEc = VE.csuszka({
        cim: "Vezetőképesség (logaritmikus skála)", min: 0, max: 1000, lepes: 0.1, ertek: logba(st.ec),
        formaz: (s) => ecSzoveg(logbol(s)) + " µS/cm", onInput: (s) => { st.ec = logbol(s); frissit(); },
      });
      const csT = VE.csuszka({ cim: "Vízhőmérséklet", min: 0, max: 35, lepes: 0.1, ertek: st.T, formaz: (v) => VE.szam(v, 1) + " °C", onInput: (v) => { st.T = v; frissit(); } });
      const ecBeallit = (ec) => csEc.beallit(logba(ec));
      r.vezerlok.append(
        csEc.el,
        VE.gombsor("Példák:", [
          ["Desztillált víz (~1)", () => ecBeallit(1)],
          ["Esővíz (~20)", () => ecBeallit(20)],
          ["Folyóvíz (~400)", () => ecBeallit(412)],
          ["Útsózás után (~1800)", () => ecBeallit(1800)],
          ["Tengervíz (~50 000)", () => ecBeallit(50000)],
          ["+ egy csipet só", () => ecBeallit(st.ec + 150)],
        ]),
        csT.el
      );

      // ---- info ----
      const sav = VE.tartomanySav({
        min: 0, max: EC_MAX, log: true, jelek: [0, 10, 100, 1000, 10000], formaz: (v) => v.toLocaleString("hu-HU"),
        zonak: [
          { tol: 200, ig: 800, osztaly: "jo", cim: "tipikus folyóvíz (200–800 µS/cm)" },
          { tol: 2240, ig: EC_MAX, osztaly: "rossz", cim: "a szenzor tartománya felett" },
        ],
      });
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "Egy hirtelen EC-ugrás szennyezésre utalhat: szennyvíz, télen útsózás." }),
          el("li", { text: "Egy hirtelen csökkenés nagy esőre: a csapadékvíz „felhígítja” a folyót." }),
        ])),
        VE.infoBlokk("Hol tart most?", sav.el),
        VE.infoBlokk("Próbáld ki!", "Változtasd a hőmérsékletet: a feszültség változik (a melegebb víz kb. 2%-kal jobban vezet fokonként), de a kiszámolt EC alig – mert a program 25 °C-ra számolja át. Így a különböző napok mérései összehasonlíthatók.", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { cim: "A vezetőképesség jelútja" });

      function frissit() {
        // ábra
        const n = Math.max(0, Math.min(30, Math.log10(st.ec + 1) * 6.5));
        na.darab(n / 2); cl.darab(n / 2);
        aramNyil.style.strokeWidth = (1 + Math.min(10, Math.log10(st.ec + 1) * 2.4)).toFixed(1);
        aramSzoveg.textContent = st.ec < 5 ? "szinte nincs áram – nincs, ami szállítsa" : "áram: több ion → több áram";
        sav.mutat(st.ec);

        // mérés
        const vSzenzor = F.ecFesz(st.ec, st.T);
        const telitett = vSzenzor >= PANEL_MAX_V;
        const m = VE.adcMeres(Math.min(vSzenzor, PANEL_MAX_V));
        const ecMert = F.ecFromVoltage(m.volt, st.T);
        const coeff = 1 + 0.02 * (st.T - 25);

        ut.frissit({
          bemenet: { nagy: ecSzoveg(st.ec) + " µS/cm", al: "oldott sók, " + VE.szam(st.T, 1) + " °C" },
          szenzor: { nagy: "2 elektróda, váltakozó feszültség", al: "táp: D6, a leválasztó modulon át" },
          lab: "A1", fesz: m.volt, adc: m.adc, mintak: m.mintak,
          keplet: [
            "1) átszámolás 25 °C-ra:",
            "U25 = U ÷ (1 + 0,02·(T − 25))",
            "  = " + VE.szam(m.volt, 3) + " ÷ " + VE.szam(coeff, 3) + " = " + VE.szam(m.volt / coeff, 3) + " V",
            "2) a gyártó görbéje (K = 1):",
            "EC = 133,42·U³ − 255,86·U² + 857,39·U",
            "  = " + Math.round(ecMert).toLocaleString("hu-HU") + " µS/cm",
            "TDS = EC × 0,5 = " + Math.round(ecMert * 0.5).toLocaleString("hu-HU") + " mg/l",
          ],
          eredmeny: telitett
            ? { nagy: Math.round(ecMert).toLocaleString("hu-HU") + " µS/cm", al: "a szenzor a tartománya végén van: a valódi érték ennél sokkal több! A program ezt nem veszi észre.", jelzes: "OK?", allapot: "figyelem" }
            : { nagy: ecSzoveg(ecMert) + " µS/cm", al: "field3 · TDS ≈ " + Math.round(ecMert * 0.5).toLocaleString("hu-HU") + " mg/l", jelzes: "OK", allapot: "ok" },
        });
      }
      function polaritasRajz() {
        balJel.textContent = st.polaritas > 0 ? "+" : "−";
        jobbJel.textContent = st.polaritas > 0 ? "−" : "+";
        // a pozitív ionok a negatív elektróda felé sodródnak, a negatívak fordítva
        na.sodras(st.polaritas * 22);
        cl.sodras(-st.polaritas * 22);
      }
      polaritasRajz();
      frissit();

      return {
        tick(dt) {
          st.ido += dt;
          if (st.ido > 0.7) { st.ido = 0; st.polaritas *= -1; polaritasRajz(); }
          na.tick(dt); cl.tick(dt);
        },
      };
    },
  });
})();
