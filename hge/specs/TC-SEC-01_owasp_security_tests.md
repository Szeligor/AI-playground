# TC-SEC-01: Web Alkalmazás Biztonsági Tesztelési Specifikáció (OWASP Top 10)

## 📌 Áttekintés és Célkitűzés
A tesztcsomag célja a `https://testacademy.hu/qa-lab/e2e-app` alkalmazás védelmi szintjének ellenőrzése a legfontosebb webes biztonsági kockázatok (OWASP Top 10, PCI DSS) mentén. A tesztek szigorúan a Playwright beépített mechanizmusaira támaszkodnak, manuális várakozások nélkül.

---

## 🔒 Tesztesetek Specifikációja

### SEC-01: Cross-Site Scripting (XSS) Védelem a Storefront és Rendeléskezelő Felületen
- **Kategória:** OWASP A03: Injection (Stored / Reflected XSS)
- **Leírás:** A megrendelési űrlapon (email, PO szám) és a keresőmezőkben kártékony szkript és HTML tagek injektálása.
- **Payload:** `<img src=x onerror="window.__xss_detected=true">` és `<script>window.__xss_detected=true</script>`
- **Elvárt Működés:** 
  1. A `window.__xss_detected` globális változónak `undefined`-nek kell maradnia (a szkript nem futhat le).
  2. A felület szövegként (escaped HTML) jeleníti meg az értéket, nem hajtja végre végrehajtható DOM csomópontként.

### SEC-02: SQL Injection (SQLi) Védelem a Rendeléskezelő Szűrőben
- **Kategória:** OWASP A03: Injection (SQL Injection)
- **Leírás:** Az Order Management fül keresőmezőjébe SQL injection szintaxisok bevitele.
- **Payloads:** `' OR '1'='1`, `'; DROP TABLE orders; --`, `admin'--`
- **Elvárt Működés:**
  1. Az alkalmazás nem omlik össze, nem dob feldolgozatlan JavaScript/SQL szintaxis hibát a konzolra.
  2. Nem adja vissza a teljes adatbázist jogosulatlanul, hanem literális keresési kifejezésként kezeli (üres vagy pontos illeszkedést ad).

### SEC-03: Szenzitív Bankkártya Adatok Védelme és Maszkolása (PCI DSS / OWASP A02)
- **Kategória:** OWASP A02: Cryptographic Failures / Sensitive Data Exposure
- **Leírás:** Sikeres kártyás fizetés leadása után a Recent Orders táblázat és az állapot vizsgálata.
- **Elvárt Működés:**
  1. A felületen megjelenő rendelési adatokban és az előzményekben a teljes 16 jegyű kártyaszám és a 3 jegyű CVC kód **SOHA nem jelenhet meg nyers szövegként**.
  2. Ha a kártya feltüntetésre kerül, legalább maszkoltnak kell lennie (pl. `**** **** **** 0000`).

### SEC-04: Kliensoldali Ármanipuláció (Client-Side Parameter Tampering) Kivédése
- **Kategória:** OWASP A08: Software and Data Integrity Failures
- **Leírás:** Kliensoldali DOM manipulációval a felületi végösszeg (`#ui-sum-total`) átírása a beküldés előtt.
- **Elvárt Működés:**
  1. A leadott rendelés végösszegét a rendszer belső üzleti logikája és egységárai határozzák meg.
  2. A DOM elem átírása után a rendelés az eredeti, kalkulált áron jön létre az Order Managementben, nem a manipulált összegen.

### SEC-05: Duplikált Tranzakció és Kattintás-vihar (Race Condition / Clickjacking / Double Submit)
- **Kategória:** OWASP A04: Insecure Design
- **Leírás:** A megrendelés gomb (`#btn-ui-submit`) gyors, egymás utáni többszöri megnyomása a fizetési folyamat alatt.
- **Elvárt Működés:**
  1. A gomb a kattintás után azonnal tiltott (`disabled`) állapotba kerül, vagy a folyamat megakadályozza több azonos rendelés egyidejű létrehozását.
  2. Csak egyetlen megrendelés jön létre a rendszerben.
