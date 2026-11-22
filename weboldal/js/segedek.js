// =====================================================================
//  Kis segédfüggvények, amiket minden szakasz használ
// =====================================================================
window.VE = window.VE || {};

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // HTML elem létrehozása: VE.el("p", { class: "x" }, ["szöveg", másikElem])
  VE.el = function (tag, attrs, gyerekek) {
    const e = document.createElement(tag);
    beallit(e, attrs, gyerekek);
    return e;
  };

  // SVG elem létrehozása – ugyanúgy, mint VE.el
  VE.svg = function (tag, attrs, gyerekek) {
    const e = document.createElementNS(SVG_NS, tag);
    beallit(e, attrs, gyerekek);
    return e;
  };

  function beallit(e, attrs, gyerekek) {
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === undefined || v === null || v === false) continue;
        if (k === "text") e.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? "" : v);
      }
    }
    if (gyerekek) {
      (Array.isArray(gyerekek) ? gyerekek : [gyerekek]).forEach((g) => {
        if (g === null || g === undefined || g === false) return;
        e.appendChild(typeof g === "string" ? document.createTextNode(g) : g);
      });
    }
  }

  // Szám magyar formában: 3.98 → "3,98"
  VE.szam = function (x, tizedes) {
    return Number(x).toFixed(tizedes).replace(".", ",");
  };

  // Mozgáscsökkentés beállítva?
  VE.kevesMozgas = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  // Egyszerű eseménybusz a szakaszok között
  const figyelok = {};
  VE.on = function (nev, fv) { (figyelok[nev] = figyelok[nev] || []).push(fv); };
  VE.emit = function (nev, adat) { (figyelok[nev] || []).forEach((fv) => fv(adat)); };

  // Közös állapot
  VE.allapot = { useDO: false };
})();
