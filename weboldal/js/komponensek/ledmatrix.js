// =====================================================================
//  Az UNO R4 WiFi 12×8-as LED mátrixa – az ikonok a firmware-ből
//  (firmware/vizerzekelo/status.cpp, ICON_DATA) vannak átmásolva.
// =====================================================================
window.VE = window.VE || {};

(function () {
  // Soronként egy 12 karakteres szöveg: "#" = világít
  const IKONOK = {
    NONE: [
      "............", "............", "............", "............",
      "............", "............", "............", "............",
    ],
    MEASURE: [ // vízcsepp
      ".....#......", "....###.....", "...#####....", "..#######...",
      "..##.####...", "..##.####...", "...#####....", "....###.....",
    ],
    SEND: [ // felfelé nyíl
      ".....#......", "....###.....", "...#.#.#....", "..#..#..#...",
      ".....#......", ".....#......", ".....#......", ".....#......",
    ],
    OK: [ // pipa
      "............", ".........#..", "........#...", ".......#....",
      "..#...#.....", "...#.#......", "....#.......", "............",
    ],
    ERROR: [ // X
      "............", "..#.....#...", "...#...#....", "....#.#.....",
      ".....#......", "....#.#.....", "...#...#....", "..#.....#...",
    ],
  };
  const NEVEK = { NONE: "üres", MEASURE: "vízcsepp – mérés folyik", SEND: "felfelé nyíl – adatküldés", OK: "pipa – sikeres küldés", ERROR: "X – hiba" };

  VE.ledIkon = function (nev) { return IKONOK[nev] || IKONOK.NONE; };

  // Önálló LED mátrix egy <div>-ben
  VE.ledMatrix = function (tarolo) {
    const ledek = [];
    for (let i = 0; i < 96; i++) {
      const s = document.createElement("span");
      tarolo.appendChild(s);
      ledek.push(s);
    }
    return {
      mutat(nev) {
        const minta = VE.ledIkon(nev);
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 12; c++) ledek[r * 12 + c].classList.toggle("eg", minta[r][c] === "#");
        }
        tarolo.setAttribute("aria-label", "LED mátrix: " + (NEVEK[nev] || NEVEK.NONE));
      },
    };
  };
})();
