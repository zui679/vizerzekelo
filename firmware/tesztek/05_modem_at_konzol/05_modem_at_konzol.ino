// =====================================================================
//  TESZT 05 – Modem konzol (AT parancsok kézzel)
//  Lapok: UNO R4 WiFi, Nano 33 IoT, Nano RP2040 Connect
//
//  A soros monitorba írt sorokat továbbítja a modemnek, a modem válaszait
//  kiírja. Így "beszélgethetünk" a modemmel, és megtanulhatjuk, hogyan
//  működik a mobilhálózat.
//
//  Bekötés (részletesen: hardware/bekotes.md) – mindhárom lapon ugyanazok a lábak:
//    D0 (RX) ← modem TX
//    D1 (TX) → modem RX
//    D8 → modem tápkapcsoló
//    D9 → 1 kΩ → NPN tranzisztor → modem PWRKEY  (SOHA ne közvetlenül!)
//  Szintillesztő:
//    UNO R4 WiFi (5 V):  KELL szintillesztő a D0/D1 és a modem közé.
//    Nano lapok (3,3 V): ha a modem panel logikája 3,3 V-os, nem kell;
//                        ha 1,8 V-os, akkor itt is kell.
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
  // Az UNO R4 WiFi-n a "while (!Serial)" nem vár, ezért időkorláttal várunk
  // (a Nano lapokon ez addig vár, amíg meg nem nyitod a soros monitort, max. 5 mp-ig).
  while (!Serial && millis() < 5000) {}
  delay(500);
  pinMode(PIN_MODEM_PWRKEY, OUTPUT);
  digitalWrite(PIN_MODEM_PWRKEY, PWRKEY_ACTIVE_HIGH ? LOW : HIGH);
  pinMode(PIN_MODEM_POWER, OUTPUT);
  digitalWrite(PIN_MODEM_POWER, HIGH);       // modem táp BE
  Serial1.begin(MODEM_BAUD);                 // mindhárom lapon a D0/D1 lábak

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
