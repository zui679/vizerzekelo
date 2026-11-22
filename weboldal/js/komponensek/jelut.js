// =====================================================================
//  A közös „jelút” sáv: hogyan lesz a vízből szám?
//    1. A vízben → 2. Szenzor → 3. Feszültség → 4. ADC → 5. Képlet → 6. Eredmény
//  Digitális szenzornál (DS18B20, BME280) a 3–4. lépés helyett a chip
//  maga küldi a számot („Digitális adat”).
// =====================================================================
window.VE = window.VE || {};

(function () {
  const el = (t, a, g) => VE.el(t, a, g);
  const S = (t, a, g) => VE.svg(t, a, g);

  // opciok: { digitalis: bool, cim: "aria címke", bemenetCim: "az 1. lépés címe" }
  VE.jelut = function (tarolo, opciok) {
    opciok = opciok || {};
    const lepesek = opciok.digitalis
      ? ["bemenet", "szenzor", "digit", "keplet", "eredmeny"]
      : ["bemenet", "szenzor", "fesz", "adc", "keplet", "eredmeny"];
    const CIMEK = {
      bemenet: opciok.bemenetCim || "A vízben", szenzor: "Szenzor", fesz: "Feszültség", adc: "ADC – számmá alakítás",
      digit: "Digitális adat", keplet: "Képlet", eredmeny: "Ezt küldi el",
    };
    const d = {};   // dom elemek lépésenként
    const sor = el("div", { class: "jelut", role: "group", "aria-label": opciok.cim || "A jel útja", style: "--n:" + lepesek.length });

    lepesek.forEach((id, i) => {
      const doboz = el("div", { class: "jl-lepes jl-" + id });
      doboz.appendChild(el("span", { class: "jl-cim", text: (i + 1) + ". " + CIMEK[id] }));
      d[id] = { doboz: doboz };
      if (id === "fesz") {
        d.fesz.lab = el("span", { class: "jl-lab" });
        doboz.firstChild.appendChild(d.fesz.lab);
        d.fesz.nagy = el("span", { class: "jl-nagy" });
        const mero = el("div", { class: "jl-mero", "aria-hidden": "true" });
        d.fesz.tolt = el("div", { class: "jl-mero-tolt" });
        mero.appendChild(d.fesz.tolt);
        doboz.append(d.fesz.nagy, mero, el("span", { class: "jl-skala", "aria-hidden": "true" }, [el("span", { text: "0 V" }), el("span", { text: "5 V" })]));
      } else if (id === "adc") {
        d.adc.nagy = el("span", { class: "jl-nagy" });
        d.adc.bitek = el("code", { class: "jl-bitek" });
        d.adc.svg = S("svg", { viewBox: "0 0 124 30", class: "jl-mintak", role: "img", "aria-label": "31 minta sorba rendezve" });
        d.adc.al = el("span", { class: "jl-al" });
        doboz.append(d.adc.nagy, d.adc.bitek, d.adc.svg, d.adc.al);
      } else if (id === "digit") {
        d.digit.bitek = el("code", { class: "jl-bitek" });
        d.digit.nagy = el("span", { class: "jl-kozep" });
        d.digit.al = el("span", { class: "jl-al" });
        doboz.append(d.digit.nagy, d.digit.bitek, d.digit.al);
      } else if (id === "keplet") {
        d.keplet.kod = el("code", { class: "jl-keplet-kod" });
        doboz.appendChild(d.keplet.kod);
      } else {
        d[id].nagy = el("span", { class: id === "szenzor" ? "jl-kozep" : "jl-nagy" });
        d[id].al = el("span", { class: "jl-al" });
        doboz.append(d[id].nagy, d[id].al);
        if (id === "eredmeny") {
          d.eredmeny.jelzes = el("span", { class: "jl-jelzes" });
          doboz.appendChild(d.eredmeny.jelzes);
        }
      }
      sor.appendChild(doboz);
    });
    tarolo.replaceChildren(sor);

    function mintakRajz(svg, info) {
      // info: nyesettAtlag() eredménye (rendezett minták, tol, ig)
      const r = info.rendezett;
      const min = Math.min.apply(null, r), max = Math.max.apply(null, r);
      const tart = Math.max(8, max - min);
      const kozep = (max + min) / 2;
      svg.replaceChildren();
      r.forEach((m, i) => {
        const h = 4 + ((m - (kozep - tart / 2)) / tart) * 24;
        svg.appendChild(S("rect", {
          x: i * 4, y: 30 - h, width: 3, height: h, rx: 1,
          class: i >= info.tol && i < info.ig ? "jl-minta-tart" : "jl-minta-dob",
        }));
      });
    }

    return {
      // allapot: { bemenet:{nagy,al}, szenzor:{nagy,al}, lab, fesz, mintak:{nyesettAtlag eredmény}, adc,
      //            digit:{nagy,bitek,al}, keplet:[sorok], eredmeny:{nagy,al,allapot,jelzes} }
      frissit(a) {
        if (a.bemenet) { d.bemenet.nagy.textContent = a.bemenet.nagy; d.bemenet.al.textContent = a.bemenet.al || ""; }
        if (a.szenzor) { d.szenzor.nagy.textContent = a.szenzor.nagy; d.szenzor.al.textContent = a.szenzor.al || ""; }
        if (d.fesz && a.fesz !== undefined) {
          d.fesz.lab.textContent = a.lab ? " · " + a.lab : "";
          d.fesz.nagy.textContent = VE.szam(a.fesz, 3) + " V";
          d.fesz.tolt.style.width = Math.max(0, Math.min(100, (a.fesz / VE.konstansok.ADC_VREF) * 100)) + "%";
        }
        if (d.adc && a.adc !== undefined) {
          d.adc.nagy.textContent = a.adc + " / " + VE.kepletek.ADC_MAX;
          d.adc.bitek.textContent = a.adc.toString(2).padStart(14, "0").replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
          if (a.mintak) {
            mintakRajz(d.adc.svg, a.mintak);
            d.adc.al.textContent = "31 minta, a két szélső harmadot eldobja (szürke)";
          }
        }
        if (d.digit && a.digit) {
          d.digit.nagy.textContent = a.digit.nagy || "";
          d.digit.bitek.textContent = a.digit.bitek || "";
          d.digit.bitek.hidden = !a.digit.bitek;
          d.digit.al.textContent = a.digit.al || "";
        }
        if (a.keplet) d.keplet.kod.textContent = a.keplet.join("\n");
        if (a.eredmeny) {
          d.eredmeny.nagy.textContent = a.eredmeny.nagy;
          d.eredmeny.al.textContent = a.eredmeny.al || "";
          d.eredmeny.jelzes.textContent = a.eredmeny.jelzes || "OK";
          d.eredmeny.doboz.dataset.allapot = a.eredmeny.allapot || "ok";
        }
      },
    };
  };
})();
