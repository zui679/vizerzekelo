// =====================================================================
//  Szimulátor: ZAVAROSSÁG – DFRobot SEN0189 (analóg, A2)
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;

  const NTU_MAX = 3000;
  const logbol = (s) => Math.pow(10, (s / 1000) * Math.log10(NTU_MAX + 1)) - 1;
  const logba = (n) => (Math.log10(n + 1) / Math.log10(NTU_MAX + 1)) * 1000;
  const ntuSzoveg = (n) => (n < 10 ? VE.szam(n, 1) : Math.round(n).toLocaleString("hu-HU"));

  VE.szimulatorok.push({
    id: "zavarossag", ful: "Zavarosság", ikon: "🌫", kartya: "zavarossag",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "Zavarosság – mennyire homályos a víz?",
        bevezeto: "A szenzor két „füle” között fénysugár halad át a vízen. Az iszap, agyag és alga szórja és elnyeli a fényt: minél zavarosabb a víz, annál kevesebb fény ér át, annál kisebb a feszültség.",
      });
      const st = { ntu: 37, nap: false, alga: false };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 250", class: "szim-svg", role: "img", "aria-label": "Infravörös fénysugár halad át a vízen a szenzor két füle között" });
      const viz = S("rect", { x: 20, y: 40, width: 380, height: 190, rx: 10, class: "viz-test" });
      const iszap = S("rect", { x: 20, y: 40, width: 380, height: 190, rx: 10, fill: "#8a6a3a" });
      svg.append(viz, iszap);
      // a szenzor két füle
      svg.appendChild(S("path", { d: "M70 20 H350 V70 H310 V200 H270 V70 H150 V200 H110 V70 H70 Z", class: "szenzor-fej" }));
      svg.appendChild(S("text", { x: 210, y: 52, "text-anchor": "middle", class: "szim-felirat vastag", text: "SEN0189 – a felső része NEM vízálló!" }));
      const led = S("circle", { cx: 150, cy: 150, r: 9, class: "ir-led" });
      const vevo = S("circle", { cx: 270, cy: 150, r: 9, class: "vevo" });
      const sugar = S("rect", { x: 150, y: 140, width: 120, height: 20, class: "fenysugar" });
      const ablakB = S("rect", { x: 146, y: 128, width: 6, height: 44, class: "ablak" });
      const ablakJ = S("rect", { x: 268, y: 128, width: 6, height: 44, class: "ablak" });
      svg.append(sugar, ablakB, ablakJ, led, vevo);
      const reszecskek = VE.reszecskek(svg, { x: 158, y: 80, w: 104, h: 140, r: 3.2, osztaly: "iszap" });
      svg.appendChild(S("text", { x: 120, y: 244, "text-anchor": "middle", class: "szim-felirat", text: "infravörös LED" }));
      svg.appendChild(S("text", { x: 300, y: 244, "text-anchor": "middle", class: "szim-felirat", text: "fényérzékelő" }));
      const nap = S("g", { visibility: "hidden", "aria-hidden": "true" }, [
        S("circle", { cx: 388, cy: 18, r: 14, fill: "#ffc83d" }),
        S("path", { d: "M378 32 L282 140 M392 34 L286 150", stroke: "#ffc83d", "stroke-width": 3, "stroke-dasharray": "6 5" }),
      ]);
      svg.appendChild(nap);
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const cs = VE.csuszka({
        cim: "Zavarosság (logaritmikus skála)", min: 0, max: 1000, lepes: 0.1, ertek: logba(st.ntu),
        formaz: (s) => ntuSzoveg(logbol(s)) + " NTU", onInput: (s) => { st.ntu = logbol(s); frissit(); },
      });
      const be = (n) => cs.beallit(logba(n));
      r.vezerlok.append(
        cs.el,
        VE.gombsor("Példák:", [
          ["Forrásvíz (~1)", () => be(1)],
          ["Tiszta folyó (~10)", () => be(10)],
          ["Átlagos nap (~40)", () => be(37)],
          ["Nagy eső után (~200)", () => be(200)],
          ["Árhullám (~1000)", () => be(1000)],
        ]),
        VE.kapcsolo("Napfény éri a szenzort (nincs árnyékoló cső)", (b) => { st.nap = b; frissit(); }).el,
        VE.kapcsolo("Algás, koszos mérőablak (rég nem tisztították)", (b) => { st.alga = b; frissit(); }).el
      );

      // ---- info ----
      const sav = VE.tartomanySav({
        min: 0, max: NTU_MAX, log: true, jelek: [0, 10, 100, 1000, 3000], formaz: (v) => v.toLocaleString("hu-HU"),
        zonak: [
          { tol: 5, ig: 50, osztaly: "jo", cim: "tiszta időben (5–50 NTU)" },
          { tol: 200, ig: NTU_MAX, osztaly: "figyel", cim: "eső, árhullám után" },
        ],
      });
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "Esőzés, árhullám, partomlás, kotrás után megnő." }),
          el("li", { text: "A zavaros víz kevesebb fényt enged a mélybe – kevesebb a fotoszintézis." }),
          el("li", { text: "Az iszap betemetheti a halak ívóhelyeit." }),
        ])),
        VE.infoBlokk("Hol tart most?", sav.el),
        VE.infoBlokk("Mire figyeljünk?", "Ez egy „hobbi” pontosságú szenzor: viszonyításra jó („hatszor zavarosabb, mint tegnap”), abszolút értéknek nem. Kapcsold be a napfényt vagy az algát, és nézd meg, mennyit téved!", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { cim: "A zavarosság jelútja" });

      function frissit() {
        const vValodi = F.zavarossagFesz(st.ntu);
        let v = vValodi;
        if (st.nap) v += 0.35;      // plusz fény a vevőn → tisztábbnak látja
        if (st.alga) v -= 0.25;     // a koszos ablak elnyeli a fényt → zavarosabbnak látja
        v = Math.max(0.05, Math.min(4.9, v));

        // ábra
        const atjut = Math.max(0, Math.min(1, (v - 2.4) / 1.8));
        iszap.setAttribute("opacity", (Math.min(1, Math.log10(st.ntu + 1) / 3.5) * 0.75).toFixed(2));
        reszecskek.darab(Math.min(60, Math.log10(st.ntu + 1) * 16));
        sugar.setAttribute("opacity", (0.25 + atjut * 0.75).toFixed(2));
        vevo.setAttribute("opacity", (0.25 + atjut * 0.75).toFixed(2));
        ablakB.classList.toggle("algas", st.alga);
        ablakJ.classList.toggle("algas", st.alga);
        nap.setAttribute("visibility", st.nap ? "visible" : "hidden");
        sav.mutat(st.ntu);

        // mérés
        const m = VE.adcMeres(v);
        const ntu = F.turbidityFromVoltage(m.volt);
        const va = m.volt * (4.2 / F.GYARI.turbClearV);
        let keplet;
        if (va >= 4.2) keplet = ["U ≥ 4,2 V (tiszta víz szintje)", "→ 0 NTU"];
        else if (va < 2.5) keplet = ["U < 2,5 V: a görbe alatt", "→ 3000 NTU („nagyon zavaros”)"];
        else keplet = [
          "NTU = −1120,4·U² + 5742,3·U − 4352,9",
          "  U = " + VE.szam(va, 3) + " V",
          "  = " + VE.szam(ntu, 1) + " NTU",
        ];
        keplet.unshift("tiszta víz kalibrálva: " + VE.szam(F.GYARI.turbClearV, 2) + " V");
        const teved = st.nap || st.alga;
        const kerekitett = Math.round(ntu);
        ut.frissit({
          bemenet: { nagy: ntuSzoveg(st.ntu) + " NTU", al: "lebegő iszap, agyag, alga" },
          szenzor: { nagy: "IR LED + fényérzékelő", al: "táp: D7 · a panel kapcsolója „A” állásban" },
          lab: "A2", fesz: m.volt, adc: m.adc, mintak: m.mintak,
          keplet: keplet,
          eredmeny: {
            nagy: kerekitett.toLocaleString("hu-HU") + " NTU",
            al: teved ? "field4 – de téved: valójában " + ntuSzoveg(st.ntu) + " NTU!" : "field4",
            jelzes: "OK", allapot: teved ? "figyelem" : "ok",
          },
        });
      }
      frissit();

      return { tick(dt) { reszecskek.tick(dt); } };
    },
  });
})();
