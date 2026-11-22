// =====================================================================
//  2. rész: MŰKÖDÉS – a mérési ciklus lejátszása
//  Az adatok: VE.ciklusLepesek (js/adatok/ciklus.js)
// =====================================================================
window.VE = window.VE || {};

(function () {
  const el = (t, a, g) => VE.el(t, a, g);

  // Melyik lépés után melyik mező értéke ismert (transport.cpp mezőszámai)
  const MEZO_LEPES = { akku: [6], vizho: [1], doboz: [7], ph: [2], ec: [3], zavarossag: [4], do: [5], jel: [8] };
  const ALVAS_MS = 3000;     // az alvás lejátszása (gyorsítva)
  const MIN_LEPES_MS = 1300; // a nagyon rövid lépések is látszódjanak

  let abra, matrix, lepesek = [], idx = 0, fut = false, seb = 3;
  let kezdet = 0, kiirtSorok = 0, aktSorok = [], raf = null;
  let szunetArany = null;   // ha lejátszás közben állítottuk meg: hol tartott a lépés
  const dom = {};

  // ---------- segédek ----------
  function lepesIdo(l) { return l.gyorsitott ? ALVAS_MS : Math.max(MIN_LEPES_MS, (l.ido_s * 1000) / seb); }

  function sorokFor(l) {
    if (typeof l.soros === "function") return l.soros(VE.uzenetUrl(VE.allapot.useDO));
    return l.soros || [];
  }

  // a kezdéstől (ébredéstől) eltelt idő az adott lépés elején
  function idoElotte(i) {
    let s = 0;
    for (let j = 0; j < i; j++) if (!lepesek[j].gyorsitott) s += lepesek[j].ido_s;
    return s;
  }

  function idoKiir(i, arany) {
    const l = lepesek[i];
    if (l.gyorsitott) {
      const mp = Math.round(l.ido_s * arany);
      dom.ido.textContent = "alvás " + Math.floor(mp / 60) + ":" + String(mp % 60).padStart(2, "0");
    } else {
      dom.ido.textContent = VE.szam(idoElotte(i) + l.ido_s * arany, 1) + " s";
    }
  }

  // ---------- soros monitor ----------
  function sorosTorol() { dom.soros.textContent = ""; }
  function sorosIr(sor, animalt) {
    const [szoveg, osztaly] = sor;
    const lent = dom.soros.scrollHeight - dom.soros.scrollTop - dom.soros.clientHeight < 40;
    const s = el("span", { class: [osztaly, animalt ? "uj" : ""].join(" ").trim() || null, text: szoveg + "\n" });
    dom.soros.appendChild(s);
    if (lent || !animalt) dom.soros.scrollTop = dom.soros.scrollHeight;
  }

  // ---------- az elküldött üzenet panel ----------
  function ismertMezok(i) {
    const ismert = new Set();
    for (let j = 0; j <= i; j++) (MEZO_LEPES[lepesek[j].id] || []).forEach((m) => ismert.add(m));
    return ismert;
  }

  function uzenetFrissit(i, lepesVege) {
    const useDO = VE.allapot.useDO;
    // az aktuális lépés mezője csak a lépés végén lesz ismert
    const ismert = ismertMezok(lepesVege ? i : i - 1);
    const eredmenyUtan = lepesek.findIndex((l) => l.id === "eredmeny") <= (lepesVege ? i : i - 1);
    dom.mezok.replaceChildren(...VE.uzenetMezok(useDO).map((m) => {
      let ertek, hianyzik = false;
      if (m.ertek === null) {
        hianyzik = true;
        ertek = eredmenyUtan ? "kimarad" : "…";
      } else ertek = ismert.has(m.mezo) ? m.ertek.replace(".", ",") + (m.egyseg ? " " + m.egyseg : "") : "…";
      return el("li", { class: hianyzik ? "hianyzik" : null, title: hianyzik && eredmenyUtan ? m.hianyMiert : null }, [
        el("span", { class: "kod", text: "field" + m.mezo }),
        el("span", { text: m.nev }),
        el("span", { class: "ertek", text: ertek }),
      ]);
    }));

    const kuldesIdx = lepesek.findIndex((l) => l.uzenet);
    const elkuldve = i > kuldesIdx || (i === kuldesIdx && lepesVege);
    const kuldesAlatt = i === kuldesIdx && !lepesVege;
    if (i >= kuldesIdx) {
      dom.url.replaceChildren(...urlReszek(useDO));
      dom.allapot.textContent = elkuldve ? "✔ Megérkezett – a szerver 200-as kóddal (OK) válaszolt." : "Úton a ThingSpeak felé…";
      dom.allapot.style.color = elkuldve ? "var(--siker)" : "";
    } else {
      dom.url.replaceChildren();
      dom.allapot.textContent = "Az értékek a mérés során gyűlnek, a küldéskor állnak össze egyetlen URL-lé.";
      dom.allapot.style.color = "";
    }
    dom.url.style.background = kuldesAlatt || elkuldve ? "var(--felulet-2)" : "transparent";
  }

  // Az URL részekre bontva, hogy a mezők kiemelhetők legyenek
  function urlReszek(useDO) {
    const reszek = [el("span", { class: "halvany", text: "http://api.thingspeak.com/update?api_key=" }), el("span", { text: "ÍRÁSI_KULCS" })];
    VE.uzenetMezok(useDO).forEach((m) => {
      if (m.ertek === null) return;
      reszek.push(el("span", { class: "halvany", text: "&" }));
      reszek.push(el("span", { class: "mezo", style: "background: color-mix(in srgb, var(--v-uart) 16%, transparent)", text: "field" + m.mezo + "=" + m.ertek }));
    });
    reszek.push(el("span", { class: "halvany", text: "&" }));
    reszek.push(el("span", { class: "mezo", style: "background: color-mix(in srgb, var(--siker) 22%, transparent)", text: "status=OK" }));
    return reszek;
  }

  // ---------- idővonal ----------
  function idovonalEpit() {
    dom.idovonal.replaceChildren(...lepesek.map((l, i) => {
      const b = el("button", { type: "button", "aria-label": (i + 1) + ". lépés: " + l.cim }, [
        el("span", { class: "fazis", text: l.fazis }),
        l.rovid,
        el("span", { class: "csik" }),
      ]);
      b.addEventListener("click", () => ugrik(i, fut));
      return el("li", null, b);
    }));
  }

  function idovonalJelol(i, arany) {
    dom.idovonal.querySelectorAll("li").forEach((li, j) => {
      li.classList.toggle("kesz", j < i);
      li.classList.toggle("most", j === i);
      const csik = li.querySelector(".csik");
      csik.style.width = j === i ? Math.round(arany * 100) + "%" : "";
      if (j === i) li.querySelector("button").setAttribute("aria-current", "step");
      else li.querySelector("button").removeAttribute("aria-current");
    });
  }

  // ---------- egy lépés megjelenítése ----------
  function lepesMutat(i) {
    const l = lepesek[i];
    abra.allapot(l.tap, l.dolgozik, l.aram);
    const ikon = l.tap.includes("arduino") ? l.ikon : "NONE";
    abra.led(ikon);
    matrix.mutat(ikon);
    dom.leiras.replaceChildren(
      el("p", { class: "lepes-szam", text: (i + 1) + " / " + lepesek.length + " · " + l.fazis }),
      el("h3", { text: l.cim }),
      el("p", { text: l.leiras }),
      el("p", { class: "miert" }, [el("strong", { text: "Miért? " }), l.miert])
    );
    dom.vissza.disabled = i === 0;
    dom.elore.disabled = i === lepesek.length - 1;
  }

  // Ugrás egy lépésre: a korábbi lépések kiírásai azonnal megjelennek
  function ugrik(i, folytat) {
    szunetArany = null;
    idx = Math.max(0, Math.min(lepesek.length - 1, i));
    sorosTorol();
    for (let j = 0; j < idx; j++) sorokFor(lepesek[j]).forEach((s) => sorosIr(s, false));
    aktSorok = sorokFor(lepesek[idx]);
    lepesMutat(idx);
    if (folytat) {
      kiirtSorok = 0;
      kezdet = performance.now();
      uzenetFrissit(idx, false);
      idovonalJelol(idx, 0);
      idoKiir(idx, 0);
    } else {
      // megállítva: a lépés teljes állapota látszik
      aktSorok.forEach((s) => sorosIr(s, false));
      kiirtSorok = aktSorok.length;
      uzenetFrissit(idx, true);
      idovonalJelol(idx, 1);
      idoKiir(idx, 1);
    }
  }

  // ---------- lejátszás ----------
  function tick(most) {
    if (!fut) return;
    const l = lepesek[idx];
    const hossz = lepesIdo(l);
    const arany = Math.min(1, (most - kezdet) / hossz);

    // a soros kiírások egyenletesen elosztva a lépés alatt
    const kell = Math.min(aktSorok.length, Math.floor(arany * (aktSorok.length + 1)));
    while (kiirtSorok < kell) sorosIr(aktSorok[kiirtSorok++], true);

    idovonalJelol(idx, arany);
    idoKiir(idx, arany);

    if (arany >= 1) {
      while (kiirtSorok < aktSorok.length) sorosIr(aktSorok[kiirtSorok++], true);
      uzenetFrissit(idx, true);
      if (idx >= lepesek.length - 1) { megallit(true); return; }
      idx++;
      aktSorok = sorokFor(lepesek[idx]);
      kiirtSorok = 0;
      kezdet = most;
      lepesMutat(idx);
      uzenetFrissit(idx, false);
    }
    raf = requestAnimationFrame(tick);
  }

  function indit() {
    if (fut) return;
    if (szunetArany !== null) {
      // szünet után ott folytatjuk, ahol abbahagytuk
      kezdet = performance.now() - szunetArany * lepesIdo(lepesek[idx]);
    } else if (idx === lepesek.length - 1) {
      ugrik(0, true);        // a végéről elölről kezdjük
    } else {
      ugrik(idx, true);      // a kiválasztott lépést az elejéről játsszuk le
    }
    szunetArany = null;
    fut = true;
    gombFrissit();
    raf = requestAnimationFrame(tick);
  }

  function megallit(vege) {
    if (fut && !vege) szunetArany = Math.min(1, (performance.now() - kezdet) / lepesIdo(lepesek[idx]));
    fut = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    gombFrissit(vege);
  }

  function gombFrissit(vege) {
    dom.inditas.querySelector(".felirat").textContent = fut ? "Szünet" : vege ? "Újra lejátszás" : "Indítás";
    dom.inditas.querySelector(".ikon-play").classList.toggle("szunet", fut);
  }

  function epit() {
    megallit();
    lepesek = VE.ciklusLepesek(VE.allapot.useDO);
    idovonalEpit();
    ugrik(0, false);
    gombFrissit();
  }

  VE.mukodes = {
    init() {
      dom.inditas = document.getElementById("lj-inditas");
      dom.vissza = document.getElementById("lj-vissza");
      dom.elore = document.getElementById("lj-elore");
      dom.ujra = document.getElementById("lj-ujra");
      dom.ido = document.getElementById("lj-ido");
      dom.idovonal = document.getElementById("idovonal");
      dom.leiras = document.getElementById("lepes-leiras");
      dom.soros = document.getElementById("soros");
      dom.url = document.getElementById("uzenet-url");
      dom.mezok = document.getElementById("uzenet-mezok");
      dom.allapot = document.getElementById("uzenet-allapot");

      abra = VE.belsoAbraRajz(document.getElementById("abra-mukodes"), {
        interaktiv: false,
        cim: "A doboz belseje: a kiemelt alkatrészek kapnak éppen áramot",
      });
      abra.oldottOxigen(VE.allapot.useDO);
      matrix = VE.ledMatrix(document.getElementById("ledmatrix"));

      dom.inditas.addEventListener("click", () => (fut ? megallit() : indit()));
      dom.vissza.addEventListener("click", () => { megallit(); ugrik(idx - 1, false); });
      dom.elore.addEventListener("click", () => { megallit(); ugrik(idx + 1, false); });
      dom.ujra.addEventListener("click", () => { megallit(); ugrik(0, false); });
      document.querySelectorAll("[data-seb]").forEach((b) => {
        b.addEventListener("click", () => {
          // a futó lépés eddigi arányát megtartjuk, csak a hátralévő rész gyorsul/lassul
          const most = performance.now();
          const arany = fut ? Math.min(1, (most - kezdet) / lepesIdo(lepesek[idx])) : 0;
          seb = Number(b.dataset.seb);
          if (fut) kezdet = most - arany * lepesIdo(lepesek[idx]);
          document.querySelectorAll("[data-seb]").forEach((g) => g.setAttribute("aria-pressed", String(g === b)));
        });
      });

      VE.on("do-valtozott", (be) => { abra.oldottOxigen(be); epit(); });

      // ha a lejátszó kikerül a képből, megáll (ne pörögjön feleslegesen)
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((bej) => { if (!bej[0].isIntersecting && fut) megallit(); }, { threshold: 0 })
          .observe(document.getElementById("lejatszo"));
      }
      epit();
    },
  };
})();
