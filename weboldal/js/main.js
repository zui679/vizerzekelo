// =====================================================================
//  Indítás: téma, menü, kezdőlap csempéi, linkek, szakaszok
// =====================================================================
(function () {
  const el = (t, a, g) => VE.el(t, a, g);

  // ---- világos / sötét téma ----
  function temaGomb() {
    const gomb = document.getElementById("tema-gomb");
    gomb.addEventListener("click", () => {
      const most = document.documentElement.dataset.theme
        || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const uj = most === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = uj;
      try { localStorage.setItem("ve-tema", uj === "dark" ? "sotet" : "vilagos"); } catch (e) { /* nem baj */ }
    });
  }

  // ---- a menüben kiemeljük az épp látható szakaszt ----
  function menuKovetes() {
    if (!("IntersectionObserver" in window)) return;
    const linkek = document.querySelectorAll(".menu a");
    const obs = new IntersectionObserver((bejegyzesek) => {
      bejegyzesek.forEach((b) => {
        if (!b.isIntersecting) return;
        linkek.forEach((a) => a.classList.toggle("aktiv", a.getAttribute("href") === "#" + b.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main > section").forEach((s) => obs.observe(s));
  }

  // ---- kezdőlap: mit mér a doboz? ----
  function csempek() {
    const t = document.getElementById("csempek");
    VE.csempek.forEach((c) => {
      const b = el("button", { type: "button", class: "csempe" + (c.opcionalis ? " opcionalis" : "") }, [
        el("span", { class: "nev", text: c.ikon + " " + c.nev }),
        el("span", { class: "ertek", text: c.ertek }),
        el("span", { class: "mivel", text: c.mivel }),
      ]);
      b.setAttribute("aria-label", c.nev + ", tipikus érték folyóvízben: " + c.ertek + ". Mivel mérjük: " + c.mivel);
      b.addEventListener("click", () => {
        // ha van hozzá szimulátor, oda visz; különben az alkatrész-kártyához
        const sim = VE.szenzorok.kartyabol(c.kartya);
        if (sim) { VE.szenzorok.mutat(sim); return; }
        VE.felepites.mutat(c.kartya);
        document.getElementById("felepites").scrollIntoView({ behavior: VE.kevesMozgas() ? "auto" : "smooth" });
      });
      t.appendChild(b);
    });
    t.insertAdjacentElement("beforebegin", el("p", { class: "halvany", style: "grid-column: 1 / -1; margin: 0", text: "Mit mér a doboz? (tipikus értékek – kattints, és kipróbálhatod a szenzort)" }));
  }

  // ---- „Építsd meg te is!” linkek ----
  function linkek() {
    const lista = [
      ["Projekt áttekintés", "Mi ez, kinek szól, mit tud?", "docs/01_projekt_attekintes.md"],
      ["Rendszerterv", "Blokkdiagram, működési ciklus, döntések", "docs/02_rendszerterv.md"],
      ["Szenzorok", "Mit mérnek, hogyan, mire figyeljünk", "docs/03_szenzorok.md"],
      ["Alkatrészlista", "Mit kell megvenni (kb. 140–200 ezer Ft)", "hardware/alkatreszlista.md"],
      ["Bekötés", "Lábkiosztás, kapcsolási rajzok", "hardware/bekotes.md"],
      ["Összeszerelés", "Lépésről lépésre, tesztekkel", "docs/07_osszeszereles.md"],
      ["Oktatási segédlet", "Foglalkozások, kísérletek", "docs/11_oktatasi_segedlet.md"],
      ["Olcsó szenzorok", "Kísérletezéshez csoportonként", "docs/12_oktatasi_szenzorok.md"],
    ];
    const t = document.getElementById("link-racs");
    lista.forEach(([cim, leiras, ut]) => {
      t.appendChild(el("a", { href: VE.repoLink(ut), target: "_blank", rel: "noopener" }, [
        el("strong", { text: cim }), el("span", { text: leiras }),
      ]));
    });
  }

  function indul() {
    document.getElementById("verzio-cimke").textContent = "Tervezési fázis · v" + VE.konstansok.FIRMWARE_VERSION;
    temaGomb();
    csempek();
    linkek();
    VE.felepites.init();
    VE.szenzorok.init();
    VE.mukodes.init();
    menuKovetes();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", indul);
  else indul();
})();
