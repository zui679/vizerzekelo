// =====================================================================
//  A külső nézet: a parti állomás a folyóparton
//  (docs/06_mechanika_es_telepites.md 6.2 rajza alapján)
// =====================================================================
window.VE = window.VE || {};

(function () {
  const S = (t, a, g) => VE.svg(t, a, g);
  const SZ = 1000, M = 620;

  // vízszint csúszka (0–100) → a víz felszínének y koordinátája
  const vizY = (v) => 430 - v * 2.6;
  const DOBOZ_ALJA = 270;

  VE.allomasRajz = function (tarolo, opciok) {
    opciok = opciok || {};
    const svg = S("svg", { viewBox: "0 0 " + SZ + " " + M, class: "abra-svg", role: "group", "aria-label": "A parti állomás kívülről" });

    // ---- víz (a part később rárajzolódik) ----
    const vizGrp = S("g", { "aria-hidden": "true" });
    const vizTest = S("rect", { class: "viz", x: 0, y: 0, width: SZ, height: M });
    let hd = "M0 0";
    for (let x = 0; x < SZ + 60; x += 60) hd += " q15 -7 30 0 t30 0";
    const vizFelszin = S("path", { class: "viz-hullam", d: hd });
    vizGrp.appendChild(vizTest);
    vizGrp.appendChild(vizFelszin);
    svg.appendChild(vizGrp);

    // ---- part és meder ----
    svg.appendChild(S("path", {
      d: "M0 360 H300 C380 380 420 520 540 590 H" + SZ + " V" + M + " H0 Z",
      fill: "var(--meder)", "aria-hidden": "true",
    }));
    svg.appendChild(S("text", { class: "felirat-kicsi", x: 30, y: 395, text: "part" }));
    svg.appendChild(S("text", { class: "felirat-kicsi", x: 960, y: 610, "text-anchor": "end", text: "meder" }));

    // nap
    svg.appendChild(S("g", { "aria-hidden": "true" }, [
      S("circle", { cx: 90, cy: 80, r: 30, fill: "#ffc83d" }),
      S("path", { d: "M90 30v-14M90 144v-14M40 80h-14M154 80h-14M55 45l-10-10M135 125l-10-10M55 115l-10 10M135 35l-10 10", stroke: "#ffc83d", "stroke-width": 4, "stroke-linecap": "round" }),
    ]));

    // ---- kattintható részek ----
    const elemek = [];
    function resz(kartya, cimke, gyerekek) {
      const g = S("g", { class: "komp", "data-kartya": kartya, "data-reteg": VE.kartyak[kartya].reteg, tabindex: 0, role: "button", "aria-label": cimke }, gyerekek);
      g.addEventListener("click", () => opciok.onKartya && opciok.onKartya(kartya));
      g.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); opciok.onKartya && opciok.onKartya(kartya); }
      });
      elemek.push({ el: g, kartya: kartya });
      return g;
    }

    // cölöp
    svg.appendChild(resz("colop", "Cölöp", [
      S("rect", { class: "komp-test", x: 420, y: 125, width: 16, height: 440, rx: 3 }),
    ]));
    // gégecső a doboztól a védőcsőig
    svg.appendChild(resz("gegecso", "Kábelvédő gégecső", [
      S("path", { class: "komp-test cso-vonal", d: "M452 270 C452 330 490 330 490 402" }),
    ]));
    // védőcső a szondákkal
    const cso = [S("rect", { class: "komp-test", x: 466, y: 400, width: 48, height: 152, rx: 8 })];
    for (let y = 418; y < 545; y += 22) {
      cso.push(S("circle", { cx: 480, cy: y, r: 3.2, fill: "var(--szoveg-halvany)" }));
      cso.push(S("circle", { cx: 500, cy: y + 11, r: 3.2, fill: "var(--szoveg-halvany)" }));
    }
    cso.push(S("path", { d: "M478 420 V530 M490 420 V540 M502 420 V525", stroke: "var(--szoveg)", "stroke-width": 3, "stroke-linecap": "round", opacity: .55 }));
    svg.appendChild(resz("vedocso", "Perforált védőcső a szondákkal", cso));
    // doboz
    svg.appendChild(resz("doboz", "IP67 elektronikai doboz", [
      S("rect", { class: "komp-test", x: 370, y: 180, width: 116, height: 90 }),
      S("text", { class: "komp-nev", x: 428, y: 222, "text-anchor": "middle", text: "Doboz" }),
      S("text", { class: "komp-al", x: 428, y: 240, "text-anchor": "middle", text: "IP67" }),
      S("rect", { x: 404, y: 266, width: 10, height: 9, fill: "var(--szoveg-halvany)" }),
      S("rect", { x: 442, y: 266, width: 10, height: 9, fill: "var(--szoveg-halvany)" }),
    ]));
    // antenna
    svg.appendChild(resz("antenna", "LTE antenna", [
      S("path", { d: "M476 180 V138", stroke: "var(--r-kommunikacio-k)", "stroke-width": 5, "stroke-linecap": "round" }),
      S("circle", { class: "komp-test", cx: 476, cy: 134, r: 7 }),
    ]));
    // napelem a cölöp tetején
    svg.appendChild(S("path", { d: "M428 128 L436 92", stroke: "var(--szoveg-halvany)", "stroke-width": 5, "aria-hidden": "true" }));
    svg.appendChild(resz("napelem", "Napelem", [
      S("path", { class: "komp-test", d: "M330 104 L520 58 L530 80 L340 126 Z" }),
      S("path", { d: "M378 93 L388 115 M425 81 L435 104 M473 70 L483 92", stroke: "var(--r-energia-k)", "stroke-width": 1.5 }),
    ]));

    // ---- méretek, magyarázó feliratok ----
    const normalY = vizY(20);
    svg.appendChild(S("g", { "aria-hidden": "true" }, [
      S("path", { d: "M330 " + DOBOZ_ALJA + " V" + normalY + " M322 " + DOBOZ_ALJA + " h16 M322 " + normalY + " h16", stroke: "var(--szoveg)", "stroke-width": 1.5 }),
      S("text", { class: "felirat-kicsi", x: 316, y: (DOBOZ_ALJA + normalY) / 2 - 4, "text-anchor": "end", text: "legalább 1 m a" }),
      S("text", { class: "felirat-kicsi", x: 316, y: (DOBOZ_ALJA + normalY) / 2 + 10, "text-anchor": "end", text: "megszokott vízszint felett" }),
      S("text", { class: "felirat-kicsi", x: 530, y: 470, text: "szondák: 20–30 cm-rel a felszín alatt," }),
      S("text", { class: "felirat-kicsi", x: 530, y: 484, text: "de a mederfenék felett" }),
      S("text", { class: "felirat-kicsi", x: 520, y: 52, text: "déli tájolás, 35–60° dőlés" }),
    ]));
    const figyelmeztetes = S("text", { x: 600, y: 230, fill: "var(--hiba)", "font-weight": 700, "font-size": 18, text: "⚠ A víz elérte a dobozt!", visibility: "hidden" });
    svg.appendChild(figyelmeztetes);

    tarolo.innerHTML = "";
    tarolo.appendChild(svg);

    const api = {
      svg: svg,
      vizszint(v) {
        const y = vizY(v);
        vizTest.setAttribute("y", y);
        vizFelszin.setAttribute("transform", "translate(0 " + y + ")");
        figyelmeztetes.setAttribute("visibility", y < DOBOZ_ALJA ? "visible" : "hidden");
        if (v < 12) return "alacsony";
        if (v < 35) return "normál";
        if (v < 55) return "magas víz";
        if (y >= DOBOZ_ALJA) return "árhullám – a doboz még épp szárazon";
        return "árvíz – víz alatt a doboz!";
      },
      kivalaszt(kartya) { elemek.forEach((e) => e.el.classList.toggle("kivalasztott", e.kartya === kartya)); },
      reteg(nev) {
        svg.classList.toggle("szurt", !!nev);
        elemek.forEach((e) => e.el.classList.toggle("reteg-latszik", VE.kartyak[e.kartya].reteg === nev));
      },
    };
    api.vizszint(20);
    return api;
  };
})();
