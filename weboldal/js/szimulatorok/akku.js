// =====================================================================
//  Szimulátor: AKKUFESZÜLTSÉG – feszültségosztó (analóg, A3)
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  const F = VE.kepletek;
  const K = VE.konstansok;

  VE.szimulatorok.push({
    id: "akku", ful: "Akku", ikon: "🔋", kartya: "oszto",
    epit(panel) {
      const r = VE.szimPanel(panel, {
        cim: "Akkufeszültség – mennyi energia maradt?",
        bevezeto: "Az akkut nem egy külön szenzor figyeli, hanem két egyforma ellenállás: megfelezik a feszültségét (teljesen feltöltve 4,2 V → 2,1 V), ezt méri az Arduino A3 lába, a program pedig visszaszorozza kettővel.",
      });
      const st = { v: 3.98, mod: "gsm" };
      const kuszob = () => st.mod === "gsm"
        ? { gyenge: K.BATTERY_LOW_V_GSM, kritikus: K.BATTERY_CRITICAL_V_GSM }
        : { gyenge: K.BATTERY_LOW_V_WIFI, kritikus: K.BATTERY_CRITICAL_V_WIFI };

      // ---- ábra ----
      const svg = S("svg", { viewBox: "0 0 420 250", class: "szim-svg", role: "img", "aria-label": "Akku és feszültségosztó két 470 kiloohmos ellenállással" });
      svg.appendChild(S("rect", { x: 40, y: 40, width: 90, height: 170, rx: 12, class: "akku-test" }));
      svg.appendChild(S("rect", { x: 70, y: 28, width: 30, height: 12, rx: 3, class: "akku-test" }));
      const tolt = S("rect", { x: 48, width: 74, rx: 7 });
      svg.appendChild(tolt);
      const akkuSzoveg = S("text", { x: 85, y: 232, "text-anchor": "middle", class: "szim-felirat vastag" });
      svg.appendChild(akkuSzoveg);
      // osztó: akku+ → R1 → A3 → R2 → GND
      svg.appendChild(S("path", { d: "M85 28 V14 H260 V40", class: "drot vbat" }));
      svg.appendChild(S("rect", { x: 248, y: 40, width: 24, height: 56, rx: 3, class: "ellenallas" }));
      svg.appendChild(S("text", { x: 280, y: 72, class: "szim-felirat", text: "470 kΩ" }));
      svg.appendChild(S("path", { d: "M260 96 V120", class: "drot vbat" }));
      svg.appendChild(S("circle", { cx: 260, cy: 120, r: 4, class: "csomopont-szim" }));
      svg.appendChild(S("path", { d: "M260 120 H400", class: "drot analog" }));
      svg.appendChild(S("text", { x: 400, y: 112, "text-anchor": "end", class: "szim-felirat", text: "A3 →" }));
      const a3Szoveg = S("text", { x: 330, y: 142, "text-anchor": "middle", class: "szim-felirat vastag" });
      svg.appendChild(a3Szoveg);
      svg.appendChild(S("rect", { x: 248, y: 144, width: 24, height: 56, rx: 3, class: "ellenallas" }));
      svg.appendChild(S("text", { x: 280, y: 176, class: "szim-felirat", text: "470 kΩ" }));
      svg.appendChild(S("path", { d: "M260 120 V144 M260 200 V222 M246 222 H274 M251 228 H269 M256 234 H264", class: "drot kabel" }));
      svg.appendChild(S("text", { x: 280, y: 232, class: "szim-felirat", text: "GND" }));
      r.abra.appendChild(svg);

      // ---- vezérlők ----
      const cs = VE.csuszka({ cim: "Akkufeszültség", min: 3.0, max: 4.2, lepes: 0.01, ertek: st.v, formaz: (v) => VE.szam(v, 2) + " V", onInput: (v) => { st.v = v; frissit(); } });
      const modValto = el("div", { class: "valto kicsi", role: "group", "aria-label": "Adatküldés módja" },
        [["gsm", "mobilhálózat (GSM)"], ["wifi", "WiFi (iskolai teszt)"]].map(([id, nev]) => el("button", {
          type: "button", class: "valto-gomb", "aria-pressed": String(id === st.mod), "data-mod": id, text: nev,
          onclick: () => { st.mod = id; modValto.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mod === id))); frissit(); },
        })));
      r.vezerlok.append(cs.el, VE.gombsor("Példák:", [
        ["Napos délután, tele", () => cs.beallit(4.15)],
        ["Hajnal", () => cs.beallit(3.85)],
        ["10 ködös nap után", () => cs.beallit(3.6)],
        ["Lemerülőben", () => cs.beallit(3.45)],
      ]), el("div", { class: "sor-cimkevel" }, [el("span", { class: "gombsor-cim", text: "Küldés módja:" }), modValto]));

      // ---- info ----
      const savKeret = el("div");
      let sav;
      function savEpit() {
        const k = kuszob();
        sav = VE.tartomanySav({
          min: 3.0, max: 4.2, jelek: [3.0, 3.3, 3.5, 3.7, 4.0, 4.2], formaz: (v) => VE.szam(v, 1),
          zonak: [
            { tol: 3.0, ig: k.kritikus, osztaly: "rossz", cim: "kritikus: nem mér, nem küld" },
            { tol: k.kritikus, ig: k.gyenge, osztaly: "figyel", cim: "AKKU_GYENGE" },
            { tol: k.gyenge, ig: 4.2, osztaly: "jo", cim: "rendben" },
          ],
        });
        savKeret.replaceChildren(sav.el);
      }
      savEpit();
      r.info.append(
        VE.infoBlokk("Miért fontos?", el("ul", null, [
          el("li", { text: "Távolról ebből látszik, hogy elég-e a napelem – pl. télen, árnyékban." }),
          el("li", { text: "Ha nagyon lemerült, a doboz nem mér és nem küld, hogy az akku ne károsodjon." }),
          el("li", { text: "Mobilhálózatnál magasabbak a küszöbök: a modemnek legalább 3,4 V kell, és adás közben a feszültség beesik." }),
        ])),
        VE.infoBlokk("Hol tart most?", savKeret),
        VE.infoBlokk("Jó tudni", "Az osztó folyamatosan az akkun lóg: 4,2 V ÷ 940 kΩ ≈ 4,5 µA. Ezért választottunk ilyen nagy ellenállásokat – így szinte semmit sem fogyaszt.", "halvany-blokk")
      );

      const ut = VE.jelut(r.jelut, { bemenetCim: "Az akkuban", cim: "Az akkufeszültség jelútja" });

      function frissit() {
        const k = kuszob();
        const x = Math.max(0, Math.min(1, (st.v - 3.0) / 1.2));
        const h = 154 * x;
        tolt.setAttribute("y", 48 + 154 - h);
        tolt.setAttribute("height", Math.max(2, h));
        tolt.setAttribute("class", st.v < k.kritikus ? "tolt-rossz" : st.v < k.gyenge ? "tolt-figyel" : "tolt-jo");
        akkuSzoveg.textContent = VE.szam(st.v, 2) + " V";
        a3Szoveg.textContent = VE.szam(st.v / K.BATTERY_DIVIDER_RATIO, 3) + " V (a fele)";
        savEpit();
        sav.mutat(st.v);

        const m = VE.adcMeres(st.v / K.BATTERY_DIVIDER_RATIO);
        const mert = F.akkuFromA3(m.volt);
        let eredmeny;
        if (mert < k.kritikus) eredmeny = { nagy: VE.szam(mert, 2) + " V", al: "a doboz azonnal lekapcsol: nem mér, nem küld (ezért a ThingSpeaken ez nem is látszik)", jelzes: "AKKU_KRITIKUS", allapot: "hiba" };
        else if (mert < k.gyenge) eredmeny = { nagy: VE.szam(mert, 2) + " V", al: "field6 – mér és küld, de figyelmeztet", jelzes: "AKKU_GYENGE", allapot: "figyelem" };
        else eredmeny = { nagy: VE.szam(mert, 2) + " V", al: "field6", jelzes: "OK", allapot: "ok" };
        ut.frissit({
          bemenet: { nagy: VE.szam(st.v, 2) + " V", al: "az akku feszültsége" },
          szenzor: { nagy: "feszültségosztó 2 × 470 kΩ", al: "felezi a feszültséget" },
          lab: "A3", fesz: m.volt, adc: m.adc, mintak: m.mintak,
          keplet: [
            "U_akku = U_A3 × " + VE.szam(K.BATTERY_DIVIDER_RATIO, 2),
            "  = " + VE.szam(m.volt, 3) + " × " + VE.szam(K.BATTERY_DIVIDER_RATIO, 2),
            "  = " + VE.szam(mert, 3) + " V",
            "küszöbök (" + (st.mod === "gsm" ? "GSM" : "WiFi") + "): " + VE.szam(k.gyenge, 2) + " V / " + VE.szam(k.kritikus, 2) + " V",
          ],
          eredmeny: eredmeny,
        });
      }
      frissit();
      return {};
    },
  });
})();
