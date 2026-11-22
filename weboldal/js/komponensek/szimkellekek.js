// =====================================================================
//  Közös kellékek a szenzor-szimulátorokhoz:
//  csúszka, gombsor, kapcsoló, tipikus-tartomány sáv, részecskék,
//  ADC minták (zajjal), a szimulátor-panel váza.
// =====================================================================
window.VE = window.VE || {};

(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);
  let azon = 0;

  // ---------- csúszka ----------
  // o: { cim, min, max, lepes, ertek, formaz(ertek) → szöveg, onInput(ertek) }
  VE.csuszka = function (o) {
    const id = "cs-" + (++azon);
    const input = el("input", { type: "range", id: id, min: o.min, max: o.max, step: o.lepes || 1, value: o.ertek });
    const ki = el("output", { for: id });
    const doboz = el("div", { class: "csuszka" }, [
      el("div", { class: "csuszka-fej" }, [el("label", { for: id, text: o.cim }), ki]),
      input,
    ]);
    function frissit(kuld) {
      const v = Number(input.value);
      ki.textContent = o.formaz ? o.formaz(v) : String(v);
      input.setAttribute("aria-valuetext", ki.textContent);
      if (kuld && o.onInput) o.onInput(v);
    }
    input.addEventListener("input", () => frissit(true));
    frissit(false);
    return {
      el: doboz,
      get ertek() { return Number(input.value); },
      beallit(v, kuld) { input.value = v; frissit(kuld !== false); },
    };
  };

  // ---------- előre beállított értékek gombsora ----------
  // elemek: [[felirat, fv], ...]
  VE.gombsor = function (cim, elemek) {
    return el("div", { class: "gombsor-kicsi", role: "group", "aria-label": cim }, [
      el("span", { class: "gombsor-cim", text: cim }),
      ...elemek.map(([felirat, fv]) => el("button", { type: "button", class: "kis-gomb", text: felirat, onclick: fv })),
    ]);
  };

  // ---------- kapcsoló (jelölőnégyzet) ----------
  VE.kapcsolo = function (cim, onChange, alap) {
    const input = el("input", { type: "checkbox" });
    input.checked = !!alap;
    input.addEventListener("change", () => onChange(input.checked));
    return { el: el("label", { class: "kis-kapcsolo" }, [input, el("span", { text: cim })]), input: input };
  };

  // ---------- tipikus tartomány sáv ----------
  // o: { min, max, log, zonak: [{tol, ig, osztaly, cim}], jelek: [ertekek], formaz }
  VE.tartomanySav = function (o) {
    const poz = (v) => {
      const x = o.log
        ? (Math.log10(Math.max(v, o.min) + 1) - Math.log10(o.min + 1)) / (Math.log10(o.max + 1) - Math.log10(o.min + 1))
        : (v - o.min) / (o.max - o.min);
      return Math.max(0, Math.min(1, x)) * 100;
    };
    const sav = el("div", { class: "tsav", "aria-hidden": "true" });
    (o.zonak || []).forEach((z) => {
      sav.appendChild(el("div", { class: "tsav-zona " + (z.osztaly || ""), style: "left:" + poz(z.tol) + "%;width:" + (poz(z.ig) - poz(z.tol)) + "%", title: z.cim || "" }));
    });
    const jelzo = el("div", { class: "tsav-jelzo" });
    sav.appendChild(jelzo);
    const skala = el("div", { class: "tsav-skala", "aria-hidden": "true" },
      (o.jelek || [o.min, o.max]).map((v) => el("span", { style: "left:" + poz(v) + "%", text: o.formaz ? o.formaz(v) : String(v) })));
    const jelmagy = el("div", { class: "tsav-jelmagy" },
      (o.zonak || []).filter((z) => z.cim).map((z) => el("span", null, [el("i", { class: "tsav-zona " + (z.osztaly || "") }), z.cim])));
    return {
      el: el("div", { class: "tsav-keret" }, [sav, skala, jelmagy]),
      mutat(v) { jelzo.style.left = poz(v) + "%"; },
    };
  };

  // ---------- ADC minták zajjal ----------
  // A firmware 31 mintát vesz; a valóságban mindig van egy kis zaj.
  function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()); }
  // feszültség → { adc (nyesett átlag, egészre kerekítve), volt (amit a firmware lát), mintak }
  VE.adcMeres = function (v, zaj) {
    const F = VE.kepletek;
    zaj = zaj || { szoras: 1.5, tuskek: 0 };
    const kozep = (v / VE.konstansok.ADC_VREF) * F.ADC_MAX;
    const mintak = [];
    for (let i = 0; i < VE.konstansok.ADC_SAMPLES; i++) {
      let m = kozep + gauss() * zaj.szoras;
      if (zaj.tuskek && Math.random() < zaj.tuskek) m += (Math.random() < 0.5 ? -1 : 1) * zaj.szoras * 8;
      mintak.push(Math.max(0, Math.min(F.ADC_MAX, Math.round(m))));
    }
    const info = F.nyesettAtlag(mintak);
    return { adc: Math.round(info.atlag), volt: F.adcFesz(info.atlag), mintak: info };
  };

  // ---------- részecskék (ionok, iszap, oxigén…) egy téglalapban ----------
  // o: { x, y, w, h, r, osztaly, felirat }
  VE.reszecskek = function (szulo, o) {
    const g = S("g", { "aria-hidden": "true" });
    szulo.appendChild(g);
    const lista = [];
    let sodras = 0;   // vízszintes sodródás (pl. ionok az elektróda felé)
    function uj() {
      const p = {
        x: o.x + Math.random() * o.w, y: o.y + Math.random() * o.h,
        vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
      };
      if (o.felirat) {
        p.el = S("g", { class: o.osztaly });
        p.el.appendChild(S("circle", { r: o.r }));
        const betu = o.r * (o.felirat.length > 2 ? 0.82 : 1.1);
        p.el.appendChild(S("text", { "text-anchor": "middle", y: betu * 0.36, "font-size": betu, text: o.felirat }));
      } else {
        p.el = S("circle", { r: o.r, class: o.osztaly });
      }
      g.appendChild(p.el);
      helyez(p);
      return p;
    }
    function helyez(p) {
      if (o.felirat) p.el.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
      else { p.el.setAttribute("cx", p.x.toFixed(1)); p.el.setAttribute("cy", p.y.toFixed(1)); }
    }
    return {
      darab(n) {
        n = Math.max(0, Math.round(n));
        while (lista.length < n) lista.push(uj());
        while (lista.length > n) lista.pop().el.remove();
      },
      sodras(v) { sodras = v; },
      tick(dt) {
        lista.forEach((p) => {
          p.vx += (Math.random() - 0.5) * 120 * dt;
          p.vy += (Math.random() - 0.5) * 120 * dt;
          p.vx = Math.max(-25, Math.min(25, p.vx));
          p.vy = Math.max(-25, Math.min(25, p.vy));
          p.x += (p.vx + sodras) * dt;
          p.y += p.vy * dt;
          if (p.x < o.x) { p.x = o.x; p.vx = Math.abs(p.vx); }
          if (p.x > o.x + o.w) { p.x = o.x + o.w; p.vx = -Math.abs(p.vx); }
          if (p.y < o.y) { p.y = o.y; p.vy = Math.abs(p.vy); }
          if (p.y > o.y + o.h) { p.y = o.y + o.h; p.vy = -Math.abs(p.vy); }
          helyez(p);
        });
      },
    };
  };

  // ---------- egy szimulátor panel váza ----------
  // o: { cim, bevezeto, opcionalis, kartya }  →  { abra, vezerlok, info, jelut, extra }
  VE.szimPanel = function (panel, o) {
    const abra = el("div", { class: "szim-abra" });
    const vezerlok = el("div", { class: "szim-vezerlok" });
    const info = el("div", { class: "szim-info" });
    const jelut = el("div", { class: "szim-jelut" });
    const extra = el("div", { class: "szim-extra" });
    panel.append(
      el("div", { class: "szim-fej" }, [
        el("h3", null, [o.cim, o.opcionalis ? el("span", { class: "opcio-jel", text: "opcionális" }) : null]),
        el("p", { text: o.bevezeto }),
      ]),
      el("div", { class: "szim-racs" }, [el("div", { class: "szim-bal panel" }, [abra, vezerlok]), info]),
      el("h4", { class: "szim-alcim", text: "A jel útja – a víztől az elküldött számig" }),
      jelut,
      extra
    );
    return { abra, vezerlok, info, jelut, extra };
  };

  // Info blokkok: [[cím, szöveg | elem], ...]
  VE.infoBlokk = function (cim, tartalom, osztaly) {
    return el("div", { class: "info-blokk " + (osztaly || "") }, [
      el("h4", { text: cim }),
      typeof tartalom === "string" ? el("p", { text: tartalom }) : tartalom,
    ]);
  };
})();
