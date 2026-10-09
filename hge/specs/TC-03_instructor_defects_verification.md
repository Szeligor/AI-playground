# TC-03: Oktatói Hibajegyzék Verifikációs Specifikáció (Deep Defect Verification)

## 📌 Áttekintés és Célkitűzés
Ez a specifikáció az oktatói mesterlista azon 5 rejtett, mély üzleti logikai és adatintegritási hibájának automatizált lefedésére és reprodukálására szolgál, amelyek a felületi standard folyamatok helyett a belső állapotot, az eseménykezelést és a reaktivitást érintik.

---

## 📋 Tesztesetek Specifikációja

### TC-EXP-04: Stored XSS Sérülékenység a Rendelési Táblázatban (Oktató BUG-04)
- **Kategória:** OWASP A03: Injection / Stored XSS
- **Hiba oka:** A `renderMgmtOrders()` metódusban a vevő e-mail címe nyers HTML-ként kerül beillesztésre: `tr.innerHTML = ... <td>${user.email}</td>`.
- **Lépések:**
  1. Rendelés létrehozása olyan e-mail címmel, amely XSS canary payloadot tartalmaz: `xss<img src=x onerror="window.__xss_table_vuln=true">@test.com`.
  2. Navigáció az Order Management (ERP) táblázathoz.
- **Elvárt Működés:** A táblázat biztonságosan (szövegesen vagy kódolva) jeleníti meg az e-mail címet, a globális `window.__xss_table_vuln` változó értéke `undefined` marad.

### TC-EXP-05: Torzult ÁFA és Kupon Adatrögzítés a Belső Adatbázisban (Oktató BUG-05)
- **Kategória:** Adatintegritás / Pénzügyi Számítások
- **Hiba oka:** `vat: isVatExempt ? 0 : 27` (a backend mindig fix 27-et ment el az `order.vat` mezőbe még német 19% esetén is), illetve a 25%-os kuponnál a mentett `order.discount` a numerikus 25 számérték, nem a tényleges levont összeg ($125).
- **Lépések:**
  1. Megrendelés leadása Németország (DE) kiválasztásával (19% ÁFA elvárás).
  2. Belső adatbázis rekord (`window.DB.orders`) lekérdezése.
- **Elvárt Működés:** A mentett rendelési objektum `vat` mezőjének 19-nek kell lennie (a tényleges alkalmazott adókulcsnak), nem pedig fix 27-nek.

### TC-EXP-06: RBAC Szerepkörváltás Azonnali Reaktivitásának Hiánya (Oktató BUG-06)
- **Kategória:** Felületi Reaktivitás & Jogosultságkezelés
- **Hiba oka:** A `setActiveActor()` függvény nem hívja meg a `renderMgmtOrders()` metódust, így a gombsorok csak fülváltás után frissülnek.
- **Lépések:**
  1. Navigáció az Order Management fülre Adminisztrátorként (a táblázatban látszanak a Refund és Delete műveleti gombok).
  2. A fejlécben a felhasználó átváltása Junior QA vagy Auditor szerepkörre.
  3. Fülváltás nélkül a táblázat azonnali ellenőrzése.
- **Elvárt Működés:** Az Admin-specifikus gomboknak (Refund / Delete) azonnal el kell tűnniük a felületről fülváltás nélkül is.

### TC-EXP-07: Kupon Újraérvényesítés Elmaradása Olcsóbb Termékre Váltáskor (Oktató BUG-07)
- **Kategória:** Üzleti Logika / Kupon Szabályrendszer
- **Hiba oka:** Ha a felhasználó egy drága terméknél bevált egy kupont, majd átkattint egy olcsóbbra, a rendszer nem érvényteleníti újra a minimális költési korlátot.
- **Lépések:**
  1. Product 3 ($490) kiválasztása.
  2. Minimum költéshez kötött kupon beváltása (`SAVE25`).
  3. Átváltás Product 1-re ($29).
- **Elvárt Működés:** A rendszernek újra kell kalkulálnia és ellenőriznie a kupon érvényességét, vagy figyelmeztetnie kell a felhasználót a minimum kosárérték megsértésére.

### TC-EXP-08: Negatív Rendelési Mennyiség Készletnövelő Hatása (Oktató BUG-08)
- **Kategória:** Bemenet-kezelés & Készletintegritás
- **Hiba oka:** `prod.stock -= qty` negatív szám esetén matematikai hozzáadást végez (`stock - (-qty) = stock + qty`).
- **Lépések:**
  1. Product 1 kiinduló készletének ellenőrzése (15 db).
  2. Rendelés leadása negatív mennyiséggel (pl. `-5` db).
  3. Product 1 készletének ellenőrzése a tranzakció után.
- **Elvárt Működés:** A termék készlete nem növekedhet az eredeti készlet fölé negatív rendelés beküldésével.
