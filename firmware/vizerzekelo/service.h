// =====================================================================
//  Szerviz mód: kalibrálás, élő mérés, modem teszt a soros monitorból.
//
//  Belépés:
//   - szerviz jumper (D2–GND) bekötve bekapcsoláskor – terepen ez az egyetlen mód;
//   - tesztpadon: bekapcsolás után SERVICE_PROMPT_MS időn belül Enter a soros
//     monitorban (115200 baud, "Új sor" / Newline). Ez a várakozás minden
//     bekapcsoláskor lefut, ezért terepen SERVICE_PROMPT_MS = 0 legyen!
//
//  Védelem: SERVICE_TIMEOUT_S tétlenség után a menü magától kilép. Ha közben
//  a jumper is bent maradt, a doboz a jumper kivételéig nem lép újra szerviz
//  módba, és SZERVIZ_JUMPER állapotot küld.
// =====================================================================
#pragma once

bool serviceModeRequested();   // kell-e szerviz módba lépni?
void serviceMenu();            // a menü (kilépésig vagy időtúllépésig fut)
bool serviceJumperStuck();     // true, ha a bent felejtett jumper miatt tiltva van
