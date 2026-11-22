// =====================================================================
//  Szimulátor: VÍZHŐMÉRSÉKLET – DS18B20 (digitális, 1-Wire)
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;

  // hideg: kék → hűvös: világoskék → meleg: narancs (RGB-ben keverve, hogy ne legyen zöld a közepe)
  const SZINEK = [[-5, [59, 130, 246]], [12, [90, 167, 224]], [35, [240, 140, 58]]];
  function vizSzin(T) {
    let i = 0;
    while (i < SZINEK.length - 2 && T > SZINEK[i + 1][0]) i++;
    const [t0, c0] = SZINEK[i], [t1, c1] = SZINEK[i + 1];
    const x = Math.max(0, Math.min(1, (T - t0) / (t1 - t0)));
    const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * x));
    return "rgb(" + c.join(" ") + " / .6)";
  }

  VE.szimulatorok.push({
    id: "vizho", ful: "Vízhő", ikon: "🌡", kartya: "ds18b20",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "Vízhőmérséklet – DS18B20",
        bevezeto: "Ez az egyetlen digitális vízi szenzor: nem feszültséget ad, hanem a chip maga méri meg a hőmérsékletet, és kész számot küld egyetlen vezetéken.",
      });
      let T = 11.9, kihuzva = false, csomagX = 0;

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 230", class: "szim-svg", role: "img", "aria-label": "Vízhőmérő a vízben, az adat egy vezetéken megy az Arduinóhoz" });
      const viz = S("rect", { x: 20, y: 80, width: 230, height: 135, rx: 10 });
      svg.appendChild(viz);
      svg.appendChild(S("path", { d: "M20 80 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t20 0", class: "viz-hullam-vonal" }));
      svg.appendChild(S("rect", { x: 118, y: 30, width: 20, height: 160, rx: 9, class: "acel" }));
      svg.appendChild(S("rect", { x: 121, y: 168, width: 14, height: 14, rx: 3, class: "chip" }));
      svg.appendChild(S("text", { x: 146, y: 180, class: "szim-felirat", text: "chip a cső végén" }));
      svg.appendChild(S("path", { d: "M128 30 V18 H405", class: "drot digitalis" }));
      svg.appendChild(S("text", { x: 405, y: 40, "text-anchor": "end", class: "szim-felirat", text: "D4 · 1-Wire → Arduino" }));
      const fokSzoveg = S("text", { x: 200, y: 130, "text-anchor": "middle", class: "szim-nagy" });
      svg.appendChild(fokSzoveg);
      const csomag = S("g", { class: "bitcsomag", transform: "translate(150 0)" });
      svg.appendChild(csomag);
      r.abra.appendChild(svg);

      function csomagRajz(nyers) {
        csomag.replaceChildren();
        if (kihuzva) return;
        const bitek = nyers.toString(2).padStart(16, "0");
        for (let i = 0; i < 16; i++) {
          csomag.appendChild(S("rect", { x: i * 11, y: 11, width: 10, height: 14, rx: 2, class: bitek[i] === "1" ? "bit-1" : "bit-0" }));
          csomag.appendChild(S("text", { x: i * 11 + 5, y: 22, "text-anchor": "middle", class: "bit-szoveg", text: bitek[i] }));
        }
      }

      // ---- vezérlők ----
      const cs = VE.csuszka({ cim: "Vízhőmérséklet", min: -5, max: 35, lepes: 0.1, ertek: T, formaz: (v) => VE.szam(v, 1) + " °C", onInput: (v) => { T = v; frissit(); } });
      const kabel = VE.kapcsolo("Kihúzott / elszakadt kábel", (b) => { kihuzva = b; frissit(); });
      r.vezerlok.append(
        cs.el,
        VE.gombsor("Példák:", [
          ["Jeges tél (1 °C)", () => cs.beallit(1)],
          ["Tavasz (9 °C)", () => cs.beallit(9)],
          ["Nyári kánikula (25 °C)", () => cs.beallit(25)],
        ]),
        kabel.el
      );

      // ---- info ----
      const sav = VE.tartomanySav({
        min: -5, max: 35, jelek: [-5, 0, 10, 20, 30, 35], formaz: (v) => v + " °C",
        zonak: [{ tol: 0, ig: 26, osztaly: "jo", cim: "tipikus folyóvíz (0–26 °C)" }, { tol: 26, ig: 35, osztaly: "figyel", cim: "meleg – kevés oxigén" }],
      });
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "Meghatározza, mennyi oxigén oldódhat a vízben: hideg vízben több." }),
          el("li", { text: "A halak és a vízi élőlények érzékenyek a nyári felmelegedésre." }),
          el("li", { text: "A pH, a vezetőképesség és az oxigén kiszámolásához is kell – ezért méri elsőként." }),
        ])),
        VE.infoBlokk("Hol tart most?", sav.el),
        VE.infoBlokk("Jó tudni", "Felbontás: 1/16 = 0,0625 °C – de a pontosság csak ±0,5 °C! A sok tizedesjegy még nem jelenti, hogy a mérés is ilyen pontos.", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { digitalis: true, cim: "A vízhőmérséklet jelútja" });

      function frissit() {
        viz.setAttribute("fill", vizSzin(T));
        fokSzoveg.textContent = kihuzva ? "?" : VE.szam(T, 1) + " °C";
        sav.mutat(T);
        const nyers = F.ds18b20Nyers(T);
        csomagRajz(nyers);
        if (kihuzva) {
          ut.frissit({
            bemenet: { nagy: VE.szam(T, 1) + " °C", al: "a víz hőmérséklete" },
            szenzor: { nagy: "DS18B20 chip", al: "nem érkezik válasz a vezetéken" },
            digit: { nagy: "nincs válasz", bitek: "", al: "a könyvtár ilyenkor −127 °C-ot ad vissza" },
            keplet: ["−127 °C → nem lehet valódi", "(a program csak −10 és", " 50 °C között fogadja el)"],
            eredmeny: { nagy: "—", al: "field1 kimarad; a pH, EC és O₂ 25 °C-kal számol", jelzes: "VIZHOMERO_HIBA", allapot: "hiba" },
          });
          return;
        }
        const hex = "0x" + nyers.toString(16).toUpperCase().padStart(4, "0");
        const elojeles = nyers & 0x8000 ? nyers - 0x10000 : nyers;
        const mert = F.ds18b20Hom(nyers);
        ut.frissit({
          bemenet: { nagy: VE.szam(T, 1) + " °C", al: "a víz hőmérséklete" },
          szenzor: { nagy: "DS18B20 chip", al: "a chip maga méri, és számmá alakítja" },
          digit: {
            nagy: "nyers érték: " + elojeles + " (" + hex + ")",
            bitek: nyers.toString(2).padStart(16, "0").replace(/(\d{4})(?=\d)/g, "$1 "),
            al: "16 bit a D4 lábon, egyetlen vezetéken (1-Wire)",
          },
          keplet: ["T = nyers ÷ 16", "  = " + elojeles + " ÷ 16", "  = " + VE.szam(mert, 4) + " °C"],
          eredmeny: { nagy: VE.szam(mert, 2) + " °C", al: "field1 – két tizedesre kerekítve", jelzes: "OK", allapot: "ok" },
        });
      }
      frissit();

      return {
        tick(dt) {
          csomagX = (csomagX + dt * 70) % 260;
          csomag.setAttribute("transform", "translate(" + (150 + csomagX - 20) + " 0)");
          csomag.setAttribute("opacity", csomagX > 225 ? (260 - csomagX) / 35 : 1);
        },
      };
    },
  });
})();
