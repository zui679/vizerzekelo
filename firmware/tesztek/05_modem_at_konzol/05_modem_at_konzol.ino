// =====================================================================
//  TESZT 05 – Modem konzol (AT parancsok kézzel)
//
//  A soros monitorba írt sorokat továbbítja a modemnek, a modem válaszait
//  kiírja. Így "beszélgethetünk" a modemmel, és megtanulhatjuk, hogyan
//  működik a mobilhálózat.
//
//  Bekötés (részletesen: hardware/bekotes.md):
//    D0 (RX) ← szintillesztő ← modem TX
//    D1 (TX) → szintillesztő → modem RX
//    D8 → modem tápkapcsoló,  D9 → modem PWRKEY
//
//  Soros monitor: 115200 baud, "Mindkettő NL és CR" (Both NL & CR).
//
//  Próbáld ki sorban (felnőtt felügyelettel, SIM kártyával):
//    AT              → OK               (él a modem?)
//    ATI             → modem típusa
//    AT+CPIN?        → +CPIN: READY     (rendben a SIM?)
//    AT+CSQ          → +CSQ: 18,99      (jelerősség 0..31)
//    AT+COPS?        → melyik szolgáltató hálózatán vagyunk
//    AT+CEREG?       → +CEREG: 0,1      (1 = csatlakozva)
//    AT+CCLK?        → a hálózat szerinti pontos idő
//  A parancsok magyarázata: docs/05_kommunikacio.md
// =====================================================================
const int PIN_MODEM_POWER  = 8;
const int PIN_MODEM_PWRKEY = 9;
const bool PWRKEY_ACTIVE_HIGH = true;
const long MODEM_BAUD = 115200;

void setup() {
  Serial.begin(115200);
  while (!Serial) {}
  pinMode(PIN_MODEM_PWRKEY, OUTPUT);
  digitalWrite(PIN_MODEM_PWRKEY, PWRKEY_ACTIVE_HIGH ? LOW : HIGH);
  pinMode(PIN_MODEM_POWER, OUTPUT);
  digitalWrite(PIN_MODEM_POWER, HIGH);       // modem táp BE
  Serial1.begin(MODEM_BAUD);

  Serial.println("Modem táp bekapcsolva. 3 mp múlva megnyomom a PWRKEY-t...");
  delay(3000);
  digitalWrite(PIN_MODEM_PWRKEY, PWRKEY_ACTIVE_HIGH ? HIGH : LOW);
  delay(1200);
  digitalWrite(PIN_MODEM_PWRKEY, PWRKEY_ACTIVE_HIGH ? LOW : HIGH);
  Serial.println("Várj kb. 10-15 mp-et, aztán írd be: AT");
}

void loop() {
  while (Serial.available())  Serial1.write(Serial.read());
  while (Serial1.available()) Serial.write(Serial1.read());
}
