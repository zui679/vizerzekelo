// =====================================================================
//  Szimulátor: DOBOZ PÁRATARTALMA – BME280 (digitális, I2C / Qwiic)
//  A beázás korai jelzése.
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const K = VE.konstansok;

  // színváltós szilikagél: száraz → narancs, telített → sötétzöld
  function gelSzin(rh) {
    const x = Math.max(0, Math.min(1, (rh - 20) / 50));
    return "hsl(" + Math.round(32 + x * 98) + " " + Math.round(85 - x * 35) + "% " + Math.round(55 - x * 20) + "%)";
  }

  VE.szimulatorok.push({
    id: "doboz", ful: "Doboz pára", ikon: "💦", kartya: "bme280",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "A doboz páratartalma – beázásjelző",
        bevezeto: "A BME280 nem a vizet méri, hanem a doboz belsejét. Egy jól lezárt, szilikagéllel szárított dobozban száraz a levegő. Ha a páratartalom megugrik, valahol beázik – és ezt még azelőtt jelezni kell, hogy a víz kárt tenne az elektronikában.",
      });
      const st = { rh: 41 };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 250", class: "szim-svg", role: "img", "aria-label": "A doboz belseje szilikagél tasakkal és a BME280 szenzorral" });
      svg.appendChild(S("rect", { x: 40, y: 30, width: 340, height: 190, rx: 16, class: "doboz-fal" }));
      svg.appendChild(S("text", { x: 56, y: 52, class: "szim-felirat vastag", text: "IP67 doboz" }));
      svg.appendChild(S("rect", { x: 70, y: 70, width: 150, height: 90, rx: 8, class: "panel-doboz" }));
      svg.appendChild(S("text", { x: 145, y: 120, "text-anchor": "middle", class: "szim-felirat", text: "Arduino, modem…" }));
      svg.appendChild(S("rect", { x: 250, y: 80, width: 48, height: 30, rx: 4, class: "chip" }));
      svg.appendChild(S("text", { x: 274, y: 128, "text-anchor": "middle", class: "szim-felirat", text: "BME280" }));
      svg.appendChild(S("path", { d: "M250 95 H220", class: "drot i2c" }));
      const gel = S("rect", { x: 260, y: 160, width: 90, height: 44, rx: 10 });
      svg.appendChild(gel);
      svg.appendChild(S("text", { x: 305, y: 186, "text-anchor": "middle", class: "szim-felirat gel-felirat", text: "szilikagél" }));
      const cseppek = S("g", { class: "cseppek" });
      [[95, 196], [130, 204], [170, 192], [210, 206], [380, 120], [383, 150]].forEach(([x, y]) =>
        cseppek.appendChild(S("path", { d: "M" + x + " " + (y - 9) + " q-6 9 0 12 q6 -3 0 -12z", class: "csepp" })));
      svg.appendChild(cseppek);
      const repedes = S("path", { d: "M380 110 l6 10 l-5 8 l6 12", class: "repedes" });
      svg.appendChild(repedes);
      const paraSzoveg = S("text", { x: 364, y: 58, "text-anchor": "end", class: "szim-nagy kicsi" });
      svg.appendChild(paraSzoveg);
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const cs = VE.csuszka({ cim: "Páratartalom a dobozban", min: 10, max: 100, lepes: 1, ertek: st.rh, formaz: (v) => v + " %", onInput: (v) => { st.rh = v; frissit(); } });
      r.vezerlok.append(cs.el, VE.gombsor("Példák:", [
        ["Frissen lezárva, új szilikagél", () => cs.beallit(22)],
        ["Nyári hőség", () => cs.beallit(45)],
        ["Telített szilikagél", () => cs.beallit(68)],
        ["Beázás!", () => cs.beallit(88)],
      ]));

      // ---- info ----
      const sav = VE.tartomanySav({
        min: 0, max: 100, jelek: [0, 20, 50, 80, 100], formaz: (v) => v + "%",
        zonak: [
          { tol: 20, ig: 50, osztaly: "jo", cim: "jól lezárt doboz (20–50%)" },
          { tol: K.BOX_HUMIDITY_ALARM, ig: 100, osztaly: "rossz", cim: "beázás gyanú (> " + K.BOX_HUMIDITY_ALARM + "%)" },
        ],
      });
      r.info.append(
        VE.infoBlokk("Miért fontos?", "A víz és az elektronika nem barátok: a pára lecsapódik, korrodálja a csatlakozókat, zárlatot okozhat. A doboz SZIVARGAS üzenetet küld, így távolról is kiderül, ha baj van.", ""),
        VE.infoBlokk("Hol tart most?", sav.el),
        VE.infoBlokk("Mit tegyünk, ha SZIVARGAS jön?", el("ul", null, [
          el("li", { text: "Azonnal ellenőrizni a tömítést és a tömszelencéket." }),
          el("li", { text: "Kicserélni a szilikagélt (a színváltós fajtán látszik, ha telített)." }),
          el("li", { text: "Van-e nyomáskiegyenlítő szelep? Nélküle a doboz a napi hőingással nedvességet „szív be”." }),
        ]), "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { digitalis: true, bemenetCim: "A dobozban", cim: "A doboz páratartalmának jelútja" });

      function frissit() {
        gel.setAttribute("fill", gelSzin(st.rh));
        const alarm = st.rh > K.BOX_HUMIDITY_ALARM;
        cseppek.setAttribute("opacity", Math.max(0, Math.min(1, (st.rh - 65) / 20)).toFixed(2));
        repedes.setAttribute("visibility", alarm ? "visible" : "hidden");
        paraSzoveg.textContent = "pára: " + st.rh + " %";
        sav.mutat(st.rh);
        ut.frissit({
          bemenet: { nagy: st.rh + " %", al: "a doboz belső levegője, kb. 18 °C" },
          szenzor: { nagy: "BME280 chip", al: "a chip maga méri, és ki is számolja" },
          digit: { nagy: "I2C cím: 0x77 (vagy 0x76)", bitek: "", al: "Qwiic kábel: két adatvezeték (SDA, SCL), forrasztás nélkül" },
          keplet: [
            "ha páratartalom > " + K.BOX_HUMIDITY_ALARM + " %",
            "  → SZIVARGAS jelzés",
            "most: " + st.rh + " % " + (alarm ? "> " : "≤ ") + K.BOX_HUMIDITY_ALARM + " %",
          ],
          eredmeny: alarm
            ? { nagy: st.rh + " %", al: "field7 + a status mezőben: SZIVARGAS", jelzes: "SZIVARGAS", allapot: "hiba" }
            : { nagy: st.rh + " %", al: "field7", jelzes: "OK", allapot: st.rh > 60 ? "figyelem" : "ok" },
        });
      }
      frissit();
      return {};
    },
  });
})();
