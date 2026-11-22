// =====================================================================
//  2. rész: SZENZOROK – szenzoronként egy szimulátor, fülekkel.
//  Az egyes szimulátorok a js/szimulatorok/ mappában vannak, és
//  a VE.szimulatorok listába jegyzik be magukat:
//    { id, ful, ikon, kartya, epit(panel) → { tick(dt)?, aktival()?, deaktival()? } }
//  Új szenzor = egy új fájl ebben a mappában + egy <script> sor az index.html-ben.
// =====================================================================
window.VE = window.VE || {};
VE.szimulatorok = VE.szimulatorok || [];

(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  let aktiv = null, lathato = true, raf = null, utolso = 0;
  const peldanyok = {};   // id → { panel, gomb, api }

  function ciklus(most) {
    raf = null;
    const dt = Math.min(0.05, (most - utolso) / 1000);
    utolso = most;
    const p = aktiv && peldanyok[aktiv];
    if (p && p.api && p.api.tick) p.api.tick(dt);
    indit();
  }
  function indit() {
    if (raf || !lathato || VE.kevesMozgas()) return;
    const p = aktiv && peldanyok[aktiv];
    if (!p || !p.api || !p.api.tick) return;
    raf = requestAnimationFrame(ciklus);
  }
  function megall() { if (raf) cancelAnimationFrame(raf); raf = null; }

  function valaszt(id, fokusz) {
    if (aktiv && peldanyok[aktiv].api && peldanyok[aktiv].api.deaktival) peldanyok[aktiv].api.deaktival();
    aktiv = id;
    Object.entries(peldanyok).forEach(([pid, p]) => {
      const ez = pid === id;
      p.gomb.setAttribute("aria-selected", String(ez));
      p.gomb.tabIndex = ez ? 0 : -1;
      p.panel.hidden = !ez;
    });
    const p = peldanyok[id];
    if (!p.api) p.api = p.sz.epit(p.panel) || {};     // első megnyitáskor épül fel
    if (p.api.aktival) p.api.aktival();
    if (fokusz) p.gomb.focus();
    megall();
    utolso = performance.now();
    indit();
  }

  VE.szenzorok = {
    init() {
      const fulek = document.getElementById("szenzor-fulek");
      const panelek = document.getElementById("szenzor-panelek");
      VE.szimulatorok.forEach((sz, i) => {
        const gomb = el("button", {
          type: "button", role: "tab", id: "ful-" + sz.id, "aria-controls": "szim-" + sz.id,
          "aria-selected": "false", class: "szenzor-ful", tabindex: -1,
        }, [el("span", { class: "ful-ikon", "aria-hidden": "true", text: sz.ikon }), sz.ful]);
        gomb.addEventListener("click", () => valaszt(sz.id));
        gomb.addEventListener("keydown", (e) => {
          const n = VE.szimulatorok.length;
          let j = null;
          if (e.key === "ArrowRight") j = (i + 1) % n;
          if (e.key === "ArrowLeft") j = (i - 1 + n) % n;
          if (e.key === "Home") j = 0;
          if (e.key === "End") j = n - 1;
          if (j !== null) { e.preventDefault(); valaszt(VE.szimulatorok[j].id, true); }
        });
        const panel = el("div", { role: "tabpanel", id: "szim-" + sz.id, "aria-labelledby": "ful-" + sz.id, class: "szim", hidden: true });
        fulek.appendChild(gomb);
        panelek.appendChild(panel);
        peldanyok[sz.id] = { sz: sz, gomb: gomb, panel: panel, api: null };
      });
      if (VE.szimulatorok.length) valaszt(VE.szimulatorok[0].id);

      // csak akkor animálunk, ha a szakasz látszik
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((b) => {
          lathato = b[0].isIntersecting;
          if (lathato) { utolso = performance.now(); indit(); } else megall();
        }).observe(document.getElementById("szenzorok"));
      }
    },
    // kívülről (kezdőlap csempe, alkatrész-kártya) is megnyitható
    mutat(id) {
      if (peldanyok[id]) valaszt(id);
      document.getElementById("szenzorok").scrollIntoView({ behavior: VE.kevesMozgas() ? "auto" : "smooth" });
    },
    // kártya-azonosító → szimulátor (ha van)
    kartyabol(kartya) {
      const sz = VE.szimulatorok.find((s) => s.kartya === kartya);
      return sz ? sz.id : null;
    },
  };
})();
