// =====================================================================
//  Szimulátor: OLDOTT OXIGÉN – DFRobot SEN0237 galvanikus szonda (A4)
//  opcionális szenzor
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;

  function halAllapot(mg) {
    if (mg < 2) return { ikon: "☠", szoveg: "halpusztulás veszélye!", osztaly: "rossz" };
    if (mg < 5) return { ikon: "😟", szoveg: "a halak stresszben vannak", osztaly: "figyel" };
    return { ikon: "🐟", szoveg: "a halak jól érzik magukat", osztaly: "jo" };
  }

  VE.szimulatorok.push({
    id: "oxigen", ful: "Oldott O₂", ikon: "🐟", kartya: "do",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "Oldott oxigén – ezt lélegzik a halak", opcionalis: true,
        bevezeto: "A szonda membránján átjutó oxigén a szonda belsejében kémiai reakcióban áramot termel: több oxigén → nagyobb áram → nagyobb feszültség. Hogy mennyi oxigén fér el a vízben, az a hőmérséklettől függ.",
      });
      const st = { telites: 88, T: 11.9 };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 250", class: "szim-svg", role: "img", "aria-label": "Oxigénmolekulák a vízben, egy hal és a membrános szonda" });
      svg.appendChild(S("rect", { x: 20, y: 50, width: 380, height: 180, rx: 10, class: "viz-test" }));
      const o2 = VE.reszecskek(svg, { x: 40, y: 64, w: 230, h: 152, r: 9, osztaly: "molekula-o2", felirat: "O₂" });
      svg.appendChild(S("rect", { x: 312, y: 14, width: 26, height: 150, rx: 8, class: "szonda-test" }));
      svg.appendChild(S("rect", { x: 312, y: 160, width: 26, height: 10, rx: 2, class: "membran" }));
      svg.appendChild(S("text", { x: 325, y: 188, "text-anchor": "middle", class: "szim-felirat", text: "membrán" }));
      const hal = S("text", { x: 365, y: 226, "text-anchor": "middle", "font-size": 30 });
      const halSzoveg = S("text", { x: 210, y: 245, "text-anchor": "middle", class: "szim-felirat vastag" });
      svg.append(hal, halSzoveg);
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const csS = VE.csuszka({ cim: "Oxigén-telítettség", min: 0, max: 130, lepes: 1, ertek: st.telites, formaz: (v) => v + " %", onInput: (v) => { st.telites = v; frissit(); } });
      const csT = VE.csuszka({ cim: "Vízhőmérséklet", min: 0, max: 35, lepes: 0.1, ertek: st.T, formaz: (v) => VE.szam(v, 1) + " °C", onInput: (v) => { st.T = v; frissit(); } });
      const be = (s, T) => { csT.beallit(T, false); st.T = T; csS.beallit(s); };
      r.vezerlok.append(
        csS.el, csT.el,
        VE.gombsor("Példák:", [
          ["Téli, hideg víz", () => be(95, 2)],
          ["Nyári délután, sok alga", () => be(120, 24)],
          ["Nyári hajnal", () => be(60, 23)],
          ["Szennyvíz-bevezetés alatt", () => be(25, 20)],
        ])
      );

      // ---- info ----
      const sav = VE.tartomanySav({
        min: 0, max: 16, jelek: [0, 2, 5, 8, 12, 16], formaz: (v) => v + "",
        zonak: [
          { tol: 0, ig: 2, osztaly: "rossz", cim: "< 2 mg/l: halpusztulás" },
          { tol: 2, ig: 5, osztaly: "figyel", cim: "2–5: stressz" },
          { tol: 7, ig: 12, osztaly: "jo", cim: "egészséges folyó (7–12)" },
        ],
      });
      const tabla = el("table", { class: "kis-tabla" }, [
        el("thead", null, el("tr", null, [el("th", { text: "Vízhő" }), el("th", { text: "Telítéskor legfeljebb" })])),
        el("tbody", null, [0, 10, 20, 30].map((t) => el("tr", null, [el("td", { text: t + " °C" }), el("td", { text: VE.szam(F.doTelitett(t), 1) + " mg/l" })]))),
      ]);
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "Az egyik legfontosabb vízminőségi jellemző: a halak és a vízi rovarok ezt lélegzik." }),
          el("li", { text: "A szerves szennyezés (pl. szennyvíz) bomlása elhasználja az oxigént." }),
          el("li", { text: "Nyári melegben és éjjel (nincs fotoszintézis) a legalacsonyabb. Napos délután az algák 100% fölé is „feltölthetik”." }),
        ])),
        VE.infoBlokk("Hol tart most? (mg/l)", sav.el),
        VE.infoBlokk("Hideg vízben több fér el", tabla),
        VE.infoBlokk("Miért opcionális?", "Drága (kb. 60–80 ezer Ft), 1–2 havonta membránt kell cserélni, és a lúgos, maró elektrolitot csak felnőtt kezelheti.", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { cim: "Az oldott oxigén jelútja" });

      function frissit() {
        const telitett = F.doTelitett(st.T);
        const mg = (st.telites / 100) * telitett;
        o2.darab(Math.min(36, mg * 2.4));
        const h = halAllapot(mg);
        hal.textContent = h.ikon;
        halSzoveg.textContent = VE.szam(mg, 1) + " mg/l – " + h.szoveg;
        sav.mutat(mg);

        const m = VE.adcMeres(F.doFesz(mg, st.T));
        const mert = F.doFromVoltage(m.volt, st.T);
        const vSat = F.GYARI.doSatV + 0.035 * (st.T - F.GYARI.doCalTempC);
        const hm = halAllapot(mert);
        ut.frissit({
          bemenet: { nagy: VE.szam(mg, 2) + " mg/l", al: st.telites + "% telítettség, " + VE.szam(st.T, 1) + " °C" },
          szenzor: { nagy: "galvanikus szonda + panel", al: "táp: D10 · a membránon átjutó O₂ áramot termel" },
          lab: "A4", fesz: m.volt, adc: m.adc, mintak: m.mintak,
          keplet: [
            "telítési feszültség most:",
            "U_tel = " + VE.szam(F.GYARI.doSatV, 2) + " + 0,035·(T − 25) = " + VE.szam(vSat, 3) + " V",
            "telítéskor " + Math.round(st.T) + " °C-on: " + VE.szam(F.doTelitett(st.T), 2) + " mg/l (táblázat)",
            "DO = U ÷ U_tel × telített",
            "  = " + VE.szam(m.volt, 3) + " ÷ " + VE.szam(vSat, 3) + " × " + VE.szam(F.doTelitett(st.T), 2),
            "  = " + VE.szam(mert, 2) + " mg/l",
          ],
          eredmeny: { nagy: VE.szam(mert, 2) + " mg/l", al: "field5 – " + hm.szoveg, jelzes: "OK", allapot: hm.osztaly === "jo" ? "ok" : "figyelem" },
        });
      }
      frissit();
      return { tick(dt) { o2.tick(dt); } };
    },
  });
})();
