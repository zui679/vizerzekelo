// =====================================================================
//  A belső ábra (a doboz és a vezetékek) kirajzolása SVG-be.
//  Az adatok: VE.belsoAbra (js/adatok/komponensek.js).
//  Ugyanezt az ábrát használja a Felépítés és a Működés szakasz is.
// =====================================================================
window.VE = window.VE || {};

(function () {
  const S = (t, a, g) => VE.svg(t, a, g);

  // Hullámos vízfelszín egy adott magasságban
  function hullam(y, szelesseg) {
    let d = "M0 " + y;
    for (let x = 0; x < szelesseg; x += 60) d += " q15 -6 30 0 t30 0";
    return d;
  }

  VE.belsoAbraRajz = function (tarolo, opciok) {
    opciok = opciok || {};
    const A = VE.belsoAbra;
    const svg = S("svg", {
      viewBox: "0 0 " + A.szelesseg + " " + A.magassag,
      class: "abra-svg",
      role: "group",
      "aria-label": opciok.cim || "A doboz belső felépítése: alkatrészek és vezetékek",
    });

    // ---- háttér: víz, védőcső, doboz ----
    const hatter = S("g", { "aria-hidden": "true" });
    hatter.appendChild(S("rect", { class: "viz", x: 0, y: A.viz.y, width: A.szelesseg, height: A.magassag - A.viz.y }));
    hatter.appendChild(S("path", { class: "viz-hullam", d: hullam(A.viz.y, A.szelesseg) }));
    hatter.appendChild(S("text", { class: "felirat-kicsi", x: A.szelesseg - 12, y: A.viz.y - 8, "text-anchor": "end", text: "vízszint" }));
    hatter.appendChild(S("rect", { class: "cso", x: A.cso.x, y: A.cso.y, width: A.cso.w, height: A.cso.h, rx: 14 }));
    hatter.appendChild(S("text", { class: "felirat-kicsi", x: A.cso.x + A.cso.w - 10, y: A.cso.y + A.cso.h - 10, "text-anchor": "end", text: A.cso.felirat }));
    hatter.appendChild(S("rect", { class: "doboz-keret", x: A.doboz.x, y: A.doboz.y, width: A.doboz.w, height: A.doboz.h, rx: 18 }));
    hatter.appendChild(S("text", { class: "doboz-felirat", x: A.doboz.x + 16, y: A.doboz.y + A.doboz.h - 14, text: A.doboz.felirat }));
    svg.appendChild(hatter);

    // ---- vezetékek ----
    const vezetekGrp = S("g");
    const vezetekek = {};     // id → path
    A.vezetekek.forEach((v) => {
      const p = S("path", { class: "vezetek " + v.tipus, d: v.d, "data-vezetek": v.id });
      const fogo = S("path", { class: "vezetek-fogo", d: v.d, "data-vezetek": v.id });
      const tipus = VE.vezetekTipusok[v.tipus];
      fogo.appendChild(S("title", { text: tipus.nev + (v.cimke ? " – " + v.cimke.szoveg : "") }));
      fogo.addEventListener("mouseenter", () => opciok.onVezetek && opciok.onVezetek(v.id));
      fogo.addEventListener("mouseleave", () => opciok.onVezetek && opciok.onVezetek(null));
      fogo.addEventListener("click", () => opciok.onKartya && opciok.onKartya(v.kartyak[0]));
      vezetekGrp.appendChild(p);
      vezetekGrp.appendChild(fogo);
      vezetekek[v.id] = { el: p, adat: v };
      if (v.csomopont) vezetekGrp.appendChild(S("circle", { class: "csomopont", cx: v.csomopont[0], cy: v.csomopont[1], r: 4 }));
    });
    svg.appendChild(vezetekGrp);

    // tömszelencék a doboz alján (kábelátvezetés)
    const alja = A.doboz.y + A.doboz.h;
    A.tomszelencek.forEach((x) => svg.appendChild(S("rect", { class: "tomszelence", x: x - 8, y: alja - 5, width: 16, height: 10, rx: 2, "aria-hidden": "true" })));

    // ---- alkatrészek ----
    const elemek = [];   // { el, kartya }
    let matrixLedek = [];
    A.elemek.forEach((e) => {
      const k = VE.kartyak[e.kartya];
      const g = S("g", {
        class: "komp" + (k.opcionalis ? " opcionalis" : ""),
        "data-kartya": e.kartya,
        "data-reteg": k.reteg,
        tabindex: opciok.interaktiv === false ? null : 0,
        role: opciok.interaktiv === false ? null : "button",
        "aria-label": k.nev + (e.alak === "szonda" ? " (szonda a vízben)" : ""),
      });
      const cx = e.x + e.w / 2;
      if (e.alak === "szonda") {
        g.appendChild(S("rect", { class: "komp-test", x: e.x, y: e.y, width: e.w, height: e.h, rx: Math.min(12, e.w / 2) }));
        g.appendChild(S("text", { class: "komp-al", x: cx, y: e.y + e.h + 16, "text-anchor": "middle", text: e.nev }));
      } else if (e.alak === "felho") {
        g.appendChild(S("rect", { class: "komp-test", x: e.x, y: e.y, width: e.w, height: e.h, rx: e.h / 2 }));
        g.appendChild(S("text", { class: "komp-nev", x: cx, y: e.y + e.h / 2 - 3, "text-anchor": "middle", text: "☁ " + e.nev }));
        g.appendChild(S("text", { class: "komp-al", x: cx, y: e.y + e.h / 2 + 14, "text-anchor": "middle", text: e.al }));
      } else if (e.alak === "antenna") {
        g.appendChild(S("rect", { class: "komp-test", x: e.x, y: e.y, width: e.w, height: e.h, rx: 10 }));
        g.appendChild(S("path", { d: "M" + cx + " " + (e.y + 18) + " v40 M" + (cx - 12) + " " + (e.y + 18) + " l12 14 l12 -14", stroke: "currentColor", "stroke-width": 2, fill: "none", class: "komp-al", style: "stroke: var(--szoveg-halvany)" }));
        g.appendChild(S("text", { class: "komp-al", x: cx, y: e.y + e.h - 14, "text-anchor": "middle", text: e.al }));
      } else {
        g.appendChild(S("rect", { class: "komp-test", x: e.x, y: e.y, width: e.w, height: e.h }));
        if (e.alak === "arduino") {
          g.appendChild(S("text", { class: "komp-nev", x: cx, y: e.y + 38, "text-anchor": "middle", text: e.nev, style: "font-size:15px" }));
          g.appendChild(S("text", { class: "komp-al", x: cx, y: e.y + 56, "text-anchor": "middle", text: e.al }));
          // LED mátrix 12×8
          const mx = cx - 66 + 5.5, my = e.y + 82;
          const mg = S("g", { "aria-hidden": "true" });
          mg.appendChild(S("rect", { x: mx - 9, y: my - 9, width: 150, height: 106, rx: 6, fill: "#1b1f24" }));
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 12; c++) {
              const led = S("circle", { class: "matrix-led", cx: mx + c * 11, cy: my + r * 11, r: 3.8 });
              mg.appendChild(led);
              matrixLedek.push(led);
            }
          }
          g.appendChild(mg);
          g.appendChild(S("text", { class: "komp-al", x: cx, y: my + 114, "text-anchor": "middle", text: "LED mátrix" }));
        } else if (e.al) {
          g.appendChild(S("text", { class: "komp-nev", x: cx, y: e.y + e.h / 2 - 3, "text-anchor": "middle", text: e.nev }));
          g.appendChild(S("text", { class: "komp-al", x: cx, y: e.y + e.h / 2 + 14, "text-anchor": "middle", text: e.al }));
        } else {
          g.appendChild(S("text", { class: "komp-nev", x: cx, y: e.y + e.h / 2 + 5, "text-anchor": "middle", text: e.nev }));
        }
      }
      if (opciok.interaktiv !== false) {
        g.addEventListener("click", () => opciok.onKartya && opciok.onKartya(e.kartya));
        g.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); opciok.onKartya && opciok.onKartya(e.kartya); }
        });
      }
      svg.appendChild(g);
      elemek.push({ el: g, kartya: e.kartya });
    });

    // ---- az Arduino lábainak feliratai ----
    A.labak.forEach((l) => {
      svg.appendChild(S("circle", { class: "lab-pont", cx: l.x, cy: l.y, r: 2.6 }));
      let x = l.x, y = l.y, anchor = "middle";
      if (l.oldal === "bal") { x += 6; y += 4; anchor = "start"; }
      if (l.oldal === "jobb") { x -= 6; y += 4; anchor = "end"; }
      if (l.oldal === "fent") { y += 14; }
      if (l.oldal === "lent") { y -= 7; }
      svg.appendChild(S("text", { class: "lab-felirat", x: x, y: y, "text-anchor": anchor, text: l.lab, "data-lab": l.lab }));
    });

    // ---- vezeték-feliratok ----
    A.vezetekek.forEach((v) => {
      if (!v.cimke) return;
      svg.appendChild(S("text", {
        class: "felirat-kicsi vezetek-cimke", x: v.cimke.x, y: v.cimke.y, "text-anchor": "middle", text: v.cimke.szoveg,
      }));
    });

    tarolo.innerHTML = "";
    tarolo.appendChild(svg);

    // ---------------- vezérlő függvények ----------------
    const api = {
      svg: svg,

      // Kiválasztott alkatrész kiemelése (null = semmi)
      kivalaszt(kartya) {
        elemek.forEach((e) => e.el.classList.toggle("kivalasztott", e.kartya === kartya));
        Object.values(vezetekek).forEach((v) => {
          v.el.classList.toggle("kiemelt", !!kartya && kartya !== "arduino" && v.adat.kartyak.includes(kartya));
        });
      },

      // Néhány vezeték kiemelése (pl. a lábkiosztás táblázatból)
      kiemelVezetekek(idk) {
        Object.entries(vezetekek).forEach(([id, v]) => v.el.classList.toggle("kiemelt", !!idk && idk.includes(id)));
      },

      // Réteg szűrése (null = mind látszik)
      reteg(nev) {
        svg.classList.toggle("szurt", !!nev);
        elemek.forEach((e) => e.el.classList.toggle("reteg-latszik", VE.kartyak[e.kartya].reteg === nev));
        Object.values(vezetekek).forEach((v) => {
          const latszik = v.adat.kartyak.some((k) => k !== "arduino" && VE.kartyak[k].reteg === nev);
          v.el.classList.toggle("reteg-latszik", latszik);
        });
      },

      // Az opcionális oldott oxigén szenzor be/ki
      oldottOxigen(be) {
        elemek.forEach((e) => { if (VE.kartyak[e.kartya].opcionalis) e.el.classList.toggle("kikapcsolt-opcio", !be); });
        Object.values(vezetekek).forEach((v) => { if (v.adat.opcionalis) v.el.classList.toggle("kikapcsolt-opcio", !be); });
      },

      // Lejátszás: mi kap áramot, mi dolgozik, merre folyik az áram
      allapot(tap, dolgozik, aram) {
        svg.classList.add("lejatszas");
        elemek.forEach((e) => {
          e.el.classList.toggle("bekapcsolva", tap.includes(e.kartya));
          e.el.classList.toggle("dolgozik", dolgozik.includes(e.kartya));
        });
        Object.entries(vezetekek).forEach(([id, v]) => v.el.classList.toggle("aram", aram.includes(id)));
      },

      // A LED mátrix az ábrán
      led(nev) {
        const minta = VE.ledIkon(nev);
        matrixLedek.forEach((l, i) => l.classList.toggle("eg", minta[Math.floor(i / 12)][i % 12] === "#"));
      },
    };
    return api;
  };
})();
