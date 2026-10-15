# Enterprise QA Sandbox - Teljes Teszteset Mátrix (TEST_CASES.md)

Alkalmazás URL: https://testacademy.hu/qa-lab/e2e-app?pass=astron2026  
Összes teszteset száma: 90 db  
Teszttípusok megoszlása: 70 db E2E (UI) teszt, 20 db közvetlen REST API teszt  
Rendezési elv: Prioritás szerint szigorúan csökkenő sorrendben (P1 Blocker -> P1 Critical -> P2 Major -> P3 Normal -> P4 Low).

---

## Prioritási és Típus Összesítő

* P1 (Blocker): 6 teszt (4 E2E, 2 API) - Alapvető hozzáférés, környezeti feltételek, health check, DB reset
* P1 (Critical): 34 teszt (26 E2E, 8 API) - Fő üzleti folyamat, pénzügy, biztonság, RBAC védelem, készlet, állapotgép
* P2 (Major): 36 teszt (26 E2E, 10 API) - ERP állapotgép, szűrés, lapozás, idempotencia, kuponok, aszinkron elemek, munkamenet
* P3 (Normal): 7 teszt (7 E2E) - Adatintegritás, SQL, offline mód, reszponzivitás, WCAG
* P4 (Low): 7 teszt (7 E2E) - Kiegészítő UI kényelmi funkciók, chipek, külső linkek, hibajelzések, toolbar szinkron
* Összesen: 90 teszteset (70 E2E / 20 API)

---

## Teljes Teszteset Táblázat

| Key | TC Azonosító | Típus | Teszteset Neve | Modul | Lefedett Követelmény / Specifikáció | Prioritás |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| 1 | TC-00-01 | E2E | Zárolt Kapu Negatív | 0. Gate | Helytelen jelszó esetén a labor zárolva marad, hibajelzés jelenik meg. | P1 (Blocker) |
| 2 | TC-00-02 | E2E | Kapu Sikeres Feloldása | 0. Gate | Helyes jelszóval vagy URL paraméterrel a labor azonnal elérhetővé válik. | P1 (Blocker) |
| 3 | TC-00-03 | E2E | Globális DB Seed Reset (UI) | 0. Gate | Adatbázis visszaállítása az alapértelmezett kezdőállapotra a gombsorról. | P1 (Blocker) |
| 4 | TC-00-04 | E2E | Fő Navigációs Fülek | 0. Gate | Mind az 5 fül közötti navigáció és az aktív panel megjelenítése. | P1 (Blocker) |
| 5 | TC-API-04 | API | Rendszer Health Check Végpont | 5. API Swagger | GET /api/health ellenőrzése, 200 OK és healthy státusz validálása. | P1 (Blocker) |
| 6 | TC-API-05 | API | DB Seed Reset API Végpont | 5. API Swagger | POST /api/reset meghívása, kezdőállapot azonnali visszaállítása (200 OK). | P1 (Blocker) |
| 7 | TC-SF-01 | E2E | Bankkártyás Vásárlás (Happy Path) | 1. Storefront | Sikeres rendelés kártyával, PAID státusz és raktárkészlet csökkenése. | P1 (Critical) |
| 8 | TC-SF-02 | E2E | Vállalati Számlás Fizetés (PO) | 1. Storefront | Érvényes PO számmal leadott rendelés PENDING státuszba kerül. | P1 (Critical) |
| 9 | TC-SF-03 | E2E | Pénznemváltás & Árfolyamok | 1. Storefront | USD, EUR (0.92x), HUF (395x) pontos árszámítása és kerekítése. | P1 (Critical) |
| 10 | TC-SF-04 | E2E | Mennyiség Határérték-elemzés (BVA) | 1. Storefront | Mennyiség alsó és felső határértékeinek ellenőrzése az űrlapon. | P1 (Critical) |
| 11 | TC-SF-05 | E2E | Készlethiány Negatív Ág | 1. Storefront | Raktárkészlet feletti mennyiség rendelése tiltott (Stock Error). | P1 (Critical) |
| 12 | TC-SF-06 | E2E | Országos Adókulcsok Kalkulációja | 1. Storefront | US 0%, DE 19%, HU 27% pontos adószámítása és végösszege. | P1 (Critical) |
| 13 | TC-SF-07 | E2E | EU VAT Mentesítés (Reverse Charge) | 1. Storefront | Érvényes B2B EU adószám esetén 0% ÁFA kulcs alkalmazása. | P1 (Critical) |
| 14 | TC-SF-08 | E2E | Érvénytelen EU VAT Formátum | 1. Storefront | Szintaktikailag hibás adószám elutasítása, alap adókulcs marad érvényben. | P1 (Critical) |
| 15 | TC-SF-09 | E2E | Százalékos Kupon Érvényesítés | 1. Storefront | AIWS25 kupon 25% azonnali levonása a nettó részösszegből. | P1 (Critical) |
| 16 | TC-SF-10 | E2E | Fix Összegű & Limit Kupon | 1. Storefront | SAVE50 kupon kötelező kosárérték limit vizsgálata és levonása. | P1 (Critical) |
| 17 | TC-SF-11 | E2E | Lejárt Kupon Negatív Ág | 1. Storefront | EXPIRED2025 kupon hibajelzéssel elutasítva a felületen. | P1 (Critical) |
| 18 | TC-SF-12 | E2E | Elutasított Kártyatranzakció | 1. Storefront | 4000 0000 0000 0002 tesztkártya elutasítása (402 Declined hiba). | P1 (Critical) |
| 19 | TC-SF-13 | E2E | 3D Secure OTP Hitelesítés | 1. Storefront | 4000 0000 0000 0003 kártya esetén 3DS OTP megerősítés vizsgálata. | P1 (Critical) |
| 20 | TC-SF-14 | E2E | Számlázási PO Szám Validáció | 1. Storefront | Rövid vagy hiányzó PO szám esetén megrendelés elutasítása. | P1 (Critical) |
| 21 | TC-RBAC-01 | E2E | Szerepkörváltás - Dan Tester (USER) | 2. RBAC | Fejléc jelvény szinkronizáció és űrlap email cím kitöltése. | P1 (Critical) |
| 22 | TC-RBAC-02 | E2E | Felfüggesztett Fiók (BLOCKED) | 2. RBAC | suspended.user rendelésindítása 403 Forbidden hibával blokkolva. | P1 (Critical) |
| 23 | TC-RBAC-03 | E2E | Login Form E-mail Validáció | 2. RBAC | Helytelen formátumú email cím elutasítása az auth modálban. | P1 (Critical) |
| 24 | TC-RBAC-04 | E2E | Login Form Jelszó Házirend | 2. RBAC | Szabványnak nem megfelelő jelszó elutasítása (Password Policy). | P1 (Critical) |
| 25 | TC-RBAC-05 | E2E | Adminisztrátori Jogosultságok | 2. RBAC | Tamás Admin profilban a Refund és Delete gombok elérhetővé válnak. | P1 (Critical) |
| 26 | TC-RBAC-06 | E2E | Junior QA Korlátozott Jogosultság | 2. RBAC | Junior QA esetén a törlési és visszatérítési gombok rejtettek. | P1 (Critical) |
| 27 | TC-NET-01 | E2E | Backend 500 Hiba Kezelése | 7. Hálózat | 500-as szerverhiba esetén elegáns tájékoztatás, az applikáció nem omlik össze. | P1 (Critical) |
| 28 | TC-FIN-01 | E2E | Devizakerekítési Lebegőpontos Hiba | 8. Pénzügy | HUF egészre, EUR 2 tizedesre kerekítve, precíz árszámítás. | P1 (Critical) |
| 29 | TC-FIN-02 | E2E | Kupon Kedvezmény & ÁFA Sorrend | 8. Pénzügy | A kedvezmény a nettó alapból vonódik le, erre épül az ÁFA. | P1 (Critical) |
| 30 | TC-FIN-03 | E2E | Dinamikus Országváltás Kuponnal | 8. Pénzügy | Beváltott kuponnal történő országváltáskor azonnali újraszámolás. | P1 (Critical) |
| 31 | TC-ST-01 | E2E | Illegális Átmenet: Lemondott Fizetése | 9. Állapotgép | CANCELLED rendelés nem fizethető ki újra, a gomb inaktív marad. | P1 (Critical) |
| 32 | TC-ST-04 | E2E | Jogosulatlan Visszatérítés Megtagadása | 9. Állapotgép | User vagy Junior QA szerepkörben a refund hívás tiltott (403). | P1 (Critical) |
| 33 | TC-API-01 | API | Bejelentkezés Standard Fiókkal | 5. API Swagger | POST /api/login helyes adatokra 200 OK és érvényes JWT Bearer token visszaadás. | P1 (Critical) |
| 34 | TC-API-02 | API | Hitelesítés Negatív Ág (401) | 5. API Swagger | POST /api/login érvénytelen jelszó vagy felhasználó esetén 401 Unauthorized. | P1 (Critical) |
| 35 | TC-API-03 | API | Felfüggesztett Fiók Blokkolása (403) | 5. API Swagger | POST /api/login suspended.user kísérlet esetén 403 Forbidden státusz. | P1 (Critical) |
| 36 | TC-API-06 | API | Token Nélküli Hozzáférés Védelem | 5. API Swagger | GET /api/orders token nélkül 401 Unauthorized hibát ad. | P1 (Critical) |
| 37 | TC-API-09 | API | Rendelés Létrehozás Végpont | 5. API Swagger | POST /api/orders érvényes törzzsel 201 Created státuszt és új ID-t ad. | P1 (Critical) |
| 38 | TC-API-10 | API | Készlethiány Végpont Kezelés | 5. API Swagger | POST /api/orders raktárkészlet feletti igénynél 422 hibakódot ad. | P1 (Critical) |
| 39 | TC-API-14 | API | Illegális Státuszváltás API Védelem | 5. API Swagger | PATCH /api/orders/{id}/status CANCELLED -> PAID átmenetre 400/422 hibát ad. | P1 (Critical) |
| 40 | TC-API-15 | API | Törlés Védelem Normál Felhasználónál | 5. API Swagger | DELETE /api/orders/{id} User Bearer tokennel 403 Forbidden tiltást ad. | P1 (Critical) |
| 41 | TC-OM-01 | E2E | Valós Idejű Szabadszavas Keresés | 3. Orders | Keresés ID-re, emailre és terméknévre pontos szűréssel. | P2 (Major) |
| 42 | TC-OM-02 | E2E | Státusz Szerinti Szűrés | 3. Orders | Szűrés mind a 6 státuszra pontos sorilleszkedéssel. | P2 (Major) |
| 43 | TC-OM-03 | E2E | Táblázat Oszlopok Rendezése | 3. Orders | Rendezés ellenőrzése ID és Végösszeg szerint növekvő és csökkenő sorrendben. | P2 (Major) |
| 44 | TC-OM-04 | E2E | Állapotátmenet: PENDING -> PAID | 3. Orders | Pay gombra kattintva státuszváltás PAID-re és Provision gomb megjelenése. | P2 (Major) |
| 45 | TC-OM-05 | E2E | Állapotátmenet: PENDING -> CANCELLED | 3. Orders | Cancel gombra kattintva a rendelés véglegesen lezárul. | P2 (Major) |
| 46 | TC-OM-06 | E2E | Teljes Életciklus Végrehajtás | 3. Orders | PAID -> PROVISIONING -> COMPLETED lépéssor végigvitele. | P2 (Major) |
| 47 | TC-OM-07 | E2E | Visszatérítés (Refund) RBAC Védelem | 3. Orders | Admin által indított refund sikeresen REFUNDED státuszba állítja a tételt. | P2 (Major) |
| 48 | TC-OM-08 | E2E | Végállapot Integritás | 3. Orders | CANCELLED és REFUNDED rendelések zároltak minden további akciótól. | P2 (Major) |
| 49 | TC-OM-09 | E2E | Táblázat Lapozó (Pagination) | 3. Orders | 5-nél több tétel esetén Next és Prev lapozás megfelelő tételekkel. | P2 (Major) |
| 50 | TC-OM-10 | E2E | CSV Export Adatkonzisztencia | 3. Orders | Export CSV letöltés a rendelések helyes adataival és fejlécével. | P2 (Major) |
| 51 | TC-LAB-01 | E2E | Debounced Kereső (300ms) | 4. DOM Lab | Gépelés után spinner megjelenés, 300ms késleltetett eredmény. | P2 (Major) |
| 52 | TC-LAB-02 | E2E | Ephemeral Toast Értesítés | 4. DOM Lab | 3.5 másodperces toast automatikus eltűnése és manuális bezárása. | P2 (Major) |
| 53 | TC-LAB-03 | E2E | Akadálymentes Terms Modál | 4. DOM Lab | Modál megnyitás, fókuszkezelés, zárás ESC gombbal és gombbal. | P2 (Major) |
| 54 | TC-LAB-04 | E2E | Érvényes Fájlfeltöltés | 4. DOM Lab | Érvényes .pdf vagy .png (< 2MB) sikeres feltöltése és visszajelzése. | P2 (Major) |
| 55 | TC-LAB-05 | E2E | Fájl Mérethatár Negatív Ág | 4. DOM Lab | 2MB feletti fájl esetén 413 hibajelzés megjelenése. | P2 (Major) |
| 56 | TC-LAB-06 | E2E | Nem Támogatott Fájlformátum | 4. DOM Lab | .txt vagy .exe kiterjesztés esetén 415 hibajelzés megjelenése. | P2 (Major) |
| 57 | TC-LAB-07 | E2E | Resilient DOM vs Rebuild | 4. DOM Lab | DOM újragenerálás után a Web-First lokátorok működőképesek maradnak. | P2 (Major) |
| 58 | TC-NET-02 | E2E | Lassú Hálózat & Dupla Beküldés Védelem | 7. Hálózat | 3000ms latenciánál a gomb kattintás után azonnal disabled lesz. | P2 (Major) |
| 59 | TC-NET-03 | E2E | Rate Limit & Brute-Force (429) | 7. Hálózat | Gyors egymás utáni kérésekre a szerver 429 Too Many Requests-et ad. | P2 (Major) |
| 60 | TC-FIN-04 | E2E | Nagy Mennyiségű Kosár Pontosság | 8. Pénzügy | 50+ darabszámnál a tételek és adók összeadásának cent-pontossága. | P2 (Major) |
| 61 | TC-ST-02 | E2E | Illegális Átmenet: Visszatérített Zárolása | 9. Állapotgép | REFUNDED tétel nem módosítható tovább, akciógombok rejtettek. | P2 (Major) |
| 62 | TC-ST-03 | E2E | Konkurens Státuszváltási Kísérlet | 9. Állapotgép | Párhuzamos kérések esetén a backend konzisztens marad. | P2 (Major) |
| 63 | TC-SES-01 | E2E | F5 / Oldalfrissítés Állapotmegőrzés | 10. Munkamenet | F5 újratöltés után a kiválasztott deviza/adatok megőrződnek. | P2 (Major) |
| 64 | TC-SES-02 | E2E | Párhuzamos Kétlapos Szinkronizáció | 10. Munkamenet | 1. lapon leadott rendelés valós időben megjelenik a 2. lap ERP-jében. | P2 (Major) |
| 65 | TC-SES-03 | E2E | Böngésző Vissza Gomb Védelem | 10. Munkamenet | Rendelés után a Vissza gomb nem küldi be újra a tranzakciót. | P2 (Major) |
| 66 | TC-A11Y-01 | E2E | Kizárólagos Billentyűzet-Navigáció | 11. Akadálymentesség | A teljes vásárlás végigvihető egér nélkül (Tab, Space, Enter). | P2 (Major) |
| 67 | TC-API-07 | API | Rendelések Listázása Tokennel | 5. API Swagger | GET /api/orders érvényes tokennel 200 OK és tömb formátumú válasz. | P2 (Major) |
| 68 | TC-API-08 | API | Rendelések Szűrése Query Paraméterrel | 5. API Swagger | GET /api/orders?status=PENDING csak a PENDING tételeket adja vissza. | P2 (Major) |
| 69 | TC-API-11 | API | Idempotencia Kulcs Duplikáció Védelem | 5. API Swagger | POST /api/orders ismételt küldése azonos Idempotency-Key-vel 409-et ad. | P2 (Major) |
| 70 | TC-API-12 | API | Hiányzó / Hibás JSON Törzs Kezelés | 5. API Swagger | POST /api/orders hiányzó kötelező mezőkkel 400 Bad Request-et ad. | P2 (Major) |
| 71 | TC-API-13 | API | Rendelés Státusz Módosítás | 5. API Swagger | PATCH /api/orders/{id}/status PENDING -> PAID átmenetre 200 OK-t ad. | P2 (Major) |
| 72 | TC-API-16 | API | Rendelés Törlése Admin Joggal | 5. API Swagger | DELETE /api/orders/{id} Admin Bearer tokennel 200 OK sikeres törlést ad. | P2 (Major) |
| 73 | TC-API-17 | API | Nem Létező Rendelés Törlése | 5. API Swagger | DELETE /api/orders/999999 nem létező azonosítóra 404 Not Found hibát ad. | P2 (Major) |
| 74 | TC-API-18 | API | Kupon Érvényesítés Sikeres Ág | 5. API Swagger | POST /api/coupons/validate AIWS25 / SAVE50 esetén 200 OK és discount adat. | P2 (Major) |
| 75 | TC-API-19 | API | Lejárt Kupon Elutasítás Végponton | 5. API Swagger | POST /api/coupons/validate EXPIRED2025 esetén 410 Gone / 422 hiba. | P2 (Major) |
| 76 | TC-API-20 | API | Kupon Kosárérték Limit Alatt | 5. API Swagger | POST /api/coupons/validate SAVE50 esetén $200 alatt 422 hibát ad. | P2 (Major) |
| 77 | TC-INT-01 | E2E | SQL Lekérdezések Futtatása | 6. SQL | SELECT * FROM orders és JOIN futtatása, eredménytábla vizsgálat. | P3 (Normal) |
| 78 | TC-INT-02 | E2E | SQL-ből Frissülő UI Állapot | 6. SQL | UPDATE orders lefutása után az ERP azonnal frissül. | P3 (Normal) |
| 79 | TC-INT-03 | E2E | Audit Naplózás Konzisztencia | 6. SQL | Minden művelet bejegyzést hoz létre az audit_logs táblában. | P3 (Normal) |
| 80 | TC-INT-04 | E2E | Trainer UI Breaking Mode Követés | 6. SQL | v2 Breaking Mode esetén a POM réteg sikeresen absztrahál. | P3 (Normal) |
| 81 | TC-NET-04 | E2E | Offline Hálózati Szakadás | 7. Hálózat | setOffline esetén az űrlap jelzi a kapcsolat megszűnését. | P3 (Normal) |
| 82 | TC-A11Y-02 | E2E | WCAG Űrlap Kontraszt és Címkék | 11. Akadálymentesség | Szabványos form címkék és megfelelő kontrasztarányok (WCAG 2.1 AA). | P3 (Normal) |
| 83 | TC-A11Y-03 | E2E | Reszponzív Mobil és Tablet Nézet | 11. Akadálymentesség | Mobil (375x667) és tablet nézetben az űrlap nem csúszik szét. | P3 (Normal) |
| 84 | TC-NAV-01 | E2E | Külső Guide Link Ellenőrzése | 0. Gate | A fejlécben a Guide hivatkozás érvényes céllal nyitja meg az e2e-guide.html oldalt. | P4 (Low) |
| 85 | TC-SQL-05 | E2E | SQL Gyorslekérdezés Chipek Beillesztése | 6. SQL | A chipekre kattintva a minta lekérdezés automatikusan bekerül a szerkesztőbe. | P4 (Low) |
| 86 | TC-SQL-06 | E2E | Hibás SQL Szintaxis Kezelése | 6. SQL | Érvénytelen SQL szintaxis futtatásakor hibaüzenet renderelődik, a felület stabil marad. | P4 (Low) |
| 87 | TC-SWG-06 | E2E | Swagger cURL Generálás és Latencia | 5. API Swagger | Végpont meghívásakor generálódik a másolható cURL parancs és látható a válaszidő (ms). | P4 (Low) |
| 88 | TC-LAB-08 | E2E | Hiba Toast Értesítés Megjelenése | 4. DOM Lab | A piros toast gomb megnyomásakor kifejezetten hiba stílusú Toast üzenet renderelődik. | P4 (Low) |
| 89 | TC-LAB-09 | E2E | Modál Bezárása Háttérre Kattintással | 4. DOM Lab | A Terms modális ablak a sötétített háttérre (backdrop) kattintva is bezáródik. | P4 (Low) |
| 90 | TC-TOOL-01 | E2E | Trainer Toolbar Paraméter Szinkron | 0. Gate | Toolbar jelölőnégyzetek kapcsolásakor az információs sorban a paraméterek frissülnek. | P4 (Low) |
