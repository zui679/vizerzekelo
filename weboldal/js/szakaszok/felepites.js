// =====================================================================
//  1. rész: FELÉPÍTÉS – kattintható ábra, alkatrész-kártya,
//  rétegszűrő, lábkiosztás, USE_DO kapcsoló
// =====================================================================
window.VE = window.VE || {};

(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  let belso, kulso, nezet = "belso", aktivReteg = null, kivalasztott = null;

  function retegJel(reteg) {
    const r = VE.retegek[reteg];
    return el("span", {
      class: "reteg-jel",
      style: "background: color-mix(in srgb, var(" + r.szin + ") 22%, transparent); border: 1px solid var(" + r.szin + ")",
      text: r.nev,
    });
  }

  function lista(cim, elemek) {
    if (!elemek || !elemek.length) return [];
    return [el("h4", { text: cim }), el("ul", null, elemek.map((s) => el("li", { text: s })))];
  }

  // ---- az alkatrész-kártya kitöltése ----
  function kartyaMutat(id) {
    const k = VE.kartyak[id];
    const doboz = document.getElementById("kartya");
    kivalasztott = id;
    belso.kivalaszt(id);
    kulso.kivalaszt(id);
    if (!k) return;

    const tartalom = [
      el("div", { class: "kartya-fej" }, [
        el("div", null, [el("h3", { text: k.nev }), retegJel(k.reteg)]),
        el("button", { class: "zar", type: "button", "aria-label": "Kártya bezárása", text: "×", onclick: kartyaZar }),
      ]),
      el("p", { class: "tipus", text: k.tipus }),
      el("p", { class: "mire", text: k.mire }),
    ];
    if (k.hogyan) tartalom.push(el("h4", { text: "Hogyan működik?" }), el("p", { text: k.hogyan }));
    if (k.labak) {
      tartalom.push(el("h4", { text: "Bekötés az Arduinóba" }));
      tartalom.push(el("div", { class: "labak" }, k.labak.map(([lab, tipus]) =>
        el("span", { class: "lab", style: "border-left-color: var(" + VE.vezetekTipusok[tipus].szin + ")", text: lab }))));
    }
    tartalom.push(...lista("Jó tudni", k.tenyek));
    tartalom.push(...lista("Miért ezt választottuk?", k.miert));
    if (k.figyelem) tartalom.push(el("p", { class: "figyelem", text: "⚠ " + k.figyelem }));
    if (k.belulrol) {
      tartalom.push(el("p", null, el("button", { class: "gomb elsodleges", type: "button", text: "Nézzünk bele! →", onclick: () => nezetValt("belso") })));
    }
    if (k.linkek) {
      tartalom.push(el("div", { class: "linkek" }, k.linkek.map(([szoveg, ut]) =>
        el("a", { href: VE.repoLink(ut), target: "_blank", rel: "noopener", text: "📄 " + szoveg }))));
    }
    doboz.replaceChildren(...tartalom);

    // keskeny képernyőn a kártya az ábra alatt van – görgessünk oda
    if (window.matchMedia("(max-width: 980px)").matches) {
      doboz.scrollIntoView({ behavior: VE.kevesMozgas() ? "auto" : "smooth", block: "nearest" });
    }
  }

  function kartyaZar() {
    kivalasztott = null;
    belso.kivalaszt(null);
    kulso.kivalaszt(null);
    const doboz = document.getElementById("kartya");
    doboz.replaceChildren(el("div", { class: "kartya-ures" }, [
      el("p", null, el("strong", { text: "Válassz egy alkatrészt" })),
      el("p", { class: "halvany", text: "Kattints az ábra bármelyik elemére, vagy használd a Tab és az Enter billentyűt." }),
    ]));
  }

  // ---- nézetváltás: kívülről / belülről ----
  function nezetValt(uj) {
    nezet = uj;
    document.querySelectorAll("[data-nezet]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.nezet === uj)));
    document.getElementById("abra-belso").hidden = uj !== "belso";
    document.getElementById("abra-kulso").hidden = uj !== "kulso";
    document.getElementById("kulso-vezerlo").hidden = uj !== "kulso";
    document.getElementById("jelmagyarazat").hidden = uj !== "belso";
    document.getElementById("gnd-megjegyzes").hidden = uj !== "belso";
    document.querySelector(".labkiosztas").hidden = uj !== "belso";
    // a csak kívülről látható részek (doboz, cölöp, cső) kártyája belső nézetben bezárul
    if (uj === "belso" && kivalasztott && !VE.belsoAbra.elemek.some((e) => e.kartya === kivalasztott)) kartyaZar();
  }

  // ---- rétegszűrő gombok ----
  function retegGombok() {
    const tarolo = document.getElementById("reteg-gombok");
    Object.entries(VE.retegek).forEach(([id, r]) => {
      const b = el("button", { type: "button", class: "reteg-gomb", "aria-pressed": "false", "data-reteg": id }, [
        el("span", { class: "potty", style: "border-color: var(" + r.szin + "); background: color-mix(in srgb, var(" + r.szin + ") 35%, transparent)" }),
        r.nev,
      ]);
      b.addEventListener("click", () => {
        aktivReteg = aktivReteg === id ? null : id;
        tarolo.querySelectorAll("button").forEach((g) => g.setAttribute("aria-pressed", String(g.dataset.reteg === aktivReteg)));
        belso.reteg(aktivReteg);
        kulso.reteg(aktivReteg);
      });
      tarolo.appendChild(b);
    });
  }

  // ---- jelmagyarázat ----
  function jelmagyarazat() {
    const t = document.getElementById("jelmagyarazat");
    Object.values(VE.vezetekTipusok).forEach((v) => {
      t.appendChild(el("span", null, [el("i", { class: v.szaggatott ? "szaggatott" : null, style: "border-top-color: var(" + v.szin + ")" }), v.nev]));
    });
  }

  // ---- lábkiosztás táblázat ----
  function labTabla() {
    const tbody = document.querySelector("#lab-tabla tbody");
    VE.labkiosztas.forEach((sor) => {
      const tipus = VE.vezetekTipusok[sor.tipus];
      const tr = el("tr", { tabindex: 0, "data-kartya": sor.kartya }, [
        el("td", { text: sor.lab }),
        el("td", { text: sor.mire }),
        el("td", null, el("span", { class: "jel" }, [el("i", { style: "border-top-color: var(" + tipus.szin + ")" }), tipus.nev])),
        el("td", { class: "halvany", text: sor.megj }),
      ]);
      tr._vezetekek = sor.vezetekek;
      const be = () => { if (nezet === "belso") belso.kiemelVezetekek(sor.vezetekek); tr.classList.add("kiemelt"); };
      const ki = () => { belso.kiemelVezetekek(null); tr.classList.remove("kiemelt"); if (kivalasztott) belso.kivalaszt(kivalasztott); };
      tr.addEventListener("mouseenter", be);
      tr.addEventListener("mouseleave", ki);
      tr.addEventListener("focus", be);
      tr.addEventListener("blur", ki);
      tr.addEventListener("click", () => kartyaMutat(sor.kartya));
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter") kartyaMutat(sor.kartya); });
      tbody.appendChild(tr);
    });
  }

  // Ha egy vezetékre visszük az egeret, a táblázat sora is kigyullad
  function vezetekHover(id) {
    document.querySelectorAll("#lab-tabla tbody tr").forEach((tr) => {
      tr.classList.toggle("kiemelt", !!id && tr._vezetekek.includes(id));
    });
  }

  VE.felepites = {
    init() {
      belso = VE.belsoAbraRajz(document.getElementById("abra-belso"), { onKartya: kartyaMutat, onVezetek: vezetekHover });
      kulso = VE.allomasRajz(document.getElementById("abra-kulso"), { onKartya: kartyaMutat });
      retegGombok();
      jelmagyarazat();
      labTabla();
      kartyaZar();

      document.querySelectorAll("[data-nezet]").forEach((b) => b.addEventListener("click", () => nezetValt(b.dataset.nezet)));
      const csuszka = document.getElementById("vizszint");
      const kiiras = document.getElementById("vizszint-ki");
      const frissit = () => { kiiras.textContent = kulso.vizszint(Number(csuszka.value)); };
      csuszka.addEventListener("input", frissit);
      frissit();

      const doKapcsolo = document.getElementById("use-do");
      doKapcsolo.checked = VE.allapot.useDO;
      belso.oldottOxigen(VE.allapot.useDO);
      doKapcsolo.addEventListener("change", () => {
        VE.allapot.useDO = doKapcsolo.checked;
        belso.oldottOxigen(VE.allapot.useDO);
        VE.emit("do-valtozott", VE.allapot.useDO);
      });
    },
    // máshonnan (pl. a kezdőlap csempéiről) is megnyitható egy kártya
    mutat(id) {
      nezetValt("belso");
      kartyaMutat(id);
    },
  };
})();
