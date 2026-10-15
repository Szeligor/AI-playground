# Enterprise QA Sandbox - Teljes Teszteset Mátrix (TEST_CASES.md)

Alkalmazás URL: https://testacademy.hu/qa-lab/e2e-app?pass=astron2026  
Összes teszteset száma: 75 db  
Rendezési elv: Prioritás szerint szigorúan csökkenő sorrendben (P1 Blocker -> P1 Critical -> P2 Major -> P3 Normal -> P4 Low).

---

## Prioritási Összesítő

* P1 (Blocker): 4 teszt (Alapvető hozzáférés és környezeti feltételek)
* P1 (Critical): 26 teszt (Fő üzleti folyamat, pénzügy, biztonság, szerepkörök)
* P2 (Major): 31 teszt (ERP állapotgép, szűrés, aszinkron komponensek, munkamenet)
* P3 (Normal): 7 teszt (Adatintegritás, SQL, reszponzivitás, WCAG)
* P4 (Low): 7 teszt (Kiegészítő UI kényelmi funkciók, chipek, külső linkek, hibajelzések)
* Összesen: 75 teszteset

---

## Teljes Teszteset Táblázat

| Key | TC Azonosító | Teszteset Neve | Modul | Lefedett Követelmény / Specifikáció | Prioritás |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | TC-00-01 | Zárolt Kapu Negatív | 0. Gate | Helytelen jelszó esetén a labor zárolva marad, hibajelzés jelenik meg. | P1 (Blocker) |
| 2 | TC-00-02 | Kapu Sikeres Feloldása | 0. Gate | Helyes jelszóval vagy URL paraméterrel a labor azonnal elérhetővé válik. | P1 (Blocker) |
| 3 | TC-00-03 | Globális DB Seed Reset | 0. Gate | Adatbázis visszaállítása az alapértelmezett kezdőállapotra. | P1 (Blocker) |
| 4 | TC-00-04 | Fő Navigációs Fülek | 0. Gate | Mind az 5 fül közötti navigáció és az aktív panel megjelenítése. | P1 (Blocker) |
| 5 | TC-SF-01 | Bankkártyás Vásárlás (Happy Path) | 1. Storefront | Sikeres rendelés kártyával, PAID státusz és raktárkészlet csökkenése. | P1 (Critical) |
| 6 | TC-SF-02 | Vállalati Számlás Fizetés (PO) | 1. Storefront | Érvényes PO számmal leadott rendelés PENDING státuszba kerül. | P1 (Critical) |
| 7 | TC-SF-03 | Pénznemváltás & Árfolyamok | 1. Storefront | USD, EUR (0.92x), HUF (395x) pontos árszámítása és kerekítése. | P1 (Critical) |
| 8 | TC-SF-04 | Mennyiség Határérték-elemzés (BVA) | 1. Storefront | Mennyiség alsó és felső határértékeinek ellenőrzése. | P1 (Critical) |
| 9 | TC-SF-05 | Készlethiány Negatív Ág | 1. Storefront | Raktárkészlet feletti mennyiség rendelése tiltott (Stock Error). | P1 (Critical) |
| 10 | TC-SF-06 | Országos Adókulcsok Kalkulációja | 1. Storefront | US 0%, DE 19%, HU 27% pontos adószámítása és végösszege. | P1 (Critical) |
| 11 | TC-SF-07 | EU VAT Mentesítés (Reverse Charge) | 1. Storefront | Érvényes B2B EU adószám esetén 0% ÁFA kulcs alkalmazása. | P1 (Critical) |
| 12 | TC-SF-08 | Érvénytelen EU VAT Formátum | 1. Storefront | Szintaktikailag hibás adószám elutasítása, alap adókulcs marad érvényben. | P1 (Critical) |
| 13 | TC-SF-09 | Százalékos Kupon Érvényesítés | 1. Storefront | AIWS25 kupon 25% azonnali levonása a nettó részösszegből. | P1 (Critical) |
| 14 | TC-SF-10 | Fix Összegű & Limit Kupon | 1. Storefront | SAVE50 kupon kötelező kosárérték limit vizsgálata és levonása. | P1 (Critical) |
| 15 | TC-SF-11 | Lejárt Kupon Negatív Ág | 1. Storefront | EXPIRED2025 kupon hibajelzéssel elutasítva. | P1 (Critical) |
| 16 | TC-SF-12 | Elutasított Kártyatranzakció | 1. Storefront | 4000 0000 0000 0002 tesztkártya elutasítása (402 Declined hiba). | P1 (Critical) |
| 17 | TC-SF-13 | 3D Secure OTP Hitelesítés | 1. Storefront | 4000 0000 0000 0003 kártya esetén 3DS OTP megerősítés vizsgálata. | P1 (Critical) |
| 18 | TC-SF-14 | Számlázási PO Szám Validáció | 1. Storefront | Rövid vagy hiányzó PO szám esetén megrendelés elutasítása. | P1 (Critical) |
| 19 | TC-RBAC-01 | Szerepkörváltás - Dan Tester (USER) | 2. RBAC | Fejléc jelvény szinkronizáció és űrlap email cím kitöltése. | P1 (Critical) |
| 20 | TC-RBAC-02 | Felfüggesztett Fiók (BLOCKED) | 2. RBAC | suspended.user rendelésindítása 403 Forbidden hibával blokkolva. | P1 (Critical) |
| 21 | TC-RBAC-03 | Login Form E-mail Validáció | 2. RBAC | Helytelen formátumú email cím elutasítása a modálban. | P1 (Critical) |
| 22 | TC-RBAC-04 | Login Form Jelszó Házirend | 2. RBAC | Szabványnak nem megfelelő jelszó elutasítása (Password Policy). | P1 (Critical) |
| 23 | TC-RBAC-05 | Adminisztrátori Jogosultságok | 2. RBAC | Tamás Admin profilban a Refund és Delete gombok elérhetővé válnak. | P1 (Critical) |
| 24 | TC-RBAC-06 | Junior QA Korlátozott Jogosultság | 2. RBAC | Junior QA esetén a törlési és visszatérítési gombok rejtettek. | P1 (Critical) |
| 25 | TC-NET-01 | Backend 500 Hiba Kezelése | 7. Hálózat | 500-as szerverhiba esetén elegáns tájékoztatás, az applikáció nem omlik össze. | P1 (Critical) |
| 26 | TC-FIN-01 | Devizakerekítési Lebegőpontos Hiba | 8. Pénzügy | HUF egészre, EUR 2 tizedesre kerekítve, precíz árszámítás. | P1 (Critical) |
| 27 | TC-FIN-02 | Kupon Kedvezmény & ÁFA Sorrend | 8. Pénzügy | A kedvezmény a nettó alapból vonódik le, erre épül az ÁFA. | P1 (Critical) |
| 28 | TC-FIN-03 | Dinamikus Országváltás Kuponnal | 8. Pénzügy | Beváltott kuponnal történő országváltáskor azonnali újraszámolás. | P1 (Critical) |
| 29 | TC-ST-01 | Illegális Átmenet: Lemondott Fizetése | 9. Állapotgép | CANCELLED rendelés nem fizethető ki újra, a gomb inaktív marad. | P1 (Critical) |
| 30 | TC-ST-04 | Jogosulatlan Visszatérítés Megtagadása | 9. Állapotgép | User vagy Junior QA szerepkörben a refund hívás tiltott (403). | P1 (Critical) |
| 31 | TC-OM-01 | Valós Idejű Szabadszavas Keresés | 3. Orders | Keresés ID-re, emailre és terméknévre pontos szűréssel. | P2 (Major) |
| 32 | TC-OM-02 | Státusz Szerinti Szűrés | 3. Orders | Szűrés mind a 6 státuszra pontos sorilleszkedéssel. | P2 (Major) |
| 33 | TC-OM-03 | Táblázat Oszlopok Rendezése | 3. Orders | Rendezés ellenőrzése ID és Végösszeg szerint növekvő és csökkenő sorrendben. | P2 (Major) |
| 34 | TC-OM-04 | Állapotátmenet: PENDING -> PAID | 3. Orders | Pay gombra kattintva státuszváltás PAID-re és Provision gomb megjelenése. | P2 (Major) |
| 35 | TC-OM-05 | Állapotátmenet: PENDING -> CANCELLED | 3. Orders | Cancel gombra kattintva a rendelés véglegesen lezárul. | P2 (Major) |
| 36 | TC-OM-06 | Teljes Életciklus Végrehajtás | 3. Orders | PAID -> PROVISIONING -> COMPLETED lépéssor végigvitele. | P2 (Major) |
| 37 | TC-OM-07 | Visszatérítés (Refund) RBAC Védelem | 3. Orders | Admin által indított refund sikeresen REFUNDED státuszba állítja a tételt. | P2 (Major) |
| 38 | TC-OM-08 | Végállapot Integritás | 3. Orders | CANCELLED és REFUNDED rendelések zároltak minden további akciótól. | P2 (Major) |
| 39 | TC-OM-09 | Táblázat Lapozó (Pagination) | 3. Orders | 5-nél több tétel esetén Next és Prev lapozás megfelelő tételekkel. | P2 (Major) |
| 40 | TC-OM-10 | CSV Export Adatkonzisztencia | 3. Orders | Export CSV letöltés a rendelések helyes adataival és fejlécével. | P2 (Major) |
| 41 | TC-LAB-01 | Debounced Kereső (300ms) | 4. DOM Lab | Gépelés után spinner megjelenés, 300ms késleltetett eredmény. | P2 (Major) |
| 42 | TC-LAB-02 | Ephemeral Toast Értesítés | 4. DOM Lab | 3.5 másodperces toast automatikus eltűnése és manuális bezárása. | P2 (Major) |
| 43 | TC-LAB-03 | Akadálymentes Terms Modál | 4. DOM Lab | Modál megnyitás, fókuszkezelés, zárás ESC gombbal és gombbal. | P2 (Major) |
| 44 | TC-LAB-04 | Érvényes Fájlfeltöltés | 4. DOM Lab | Érvényes .pdf vagy .png (< 2MB) sikeres feltöltése és visszajelzése. | P2 (Major) |
| 45 | TC-LAB-05 | Fájl Mérethatár Negatív Ág | 4. DOM Lab | 2MB feletti fájl esetén 413 hibajelzés megjelenése. | P2 (Major) |
| 46 | TC-LAB-06 | Nem Támogatott Fájlformátum | 4. DOM Lab | .txt vagy .exe kiterjesztés esetén 415 hibajelzés megjelenése. | P2 (Major) |
| 47 | TC-LAB-07 | Resilient DOM vs Rebuild | 4. DOM Lab | DOM újragenerálás után a Web-First lokátorok működőképesek maradnak. | P2 (Major) |
| 48 | TC-API-01 | Auth Végpont Szerződés | 5. API Swagger | POST /login helyes adatokra 200, hibásra 401, blokkoltra 403. | P2 (Major) |
| 49 | TC-API-02 | Rendelések Hozzáférés-védelem | 5. API Swagger | GET /orders token nélkül 401, tokennel 200 a rendelési listával. | P2 (Major) |
| 50 | TC-API-03 | Idempotencia & Készlet Végpont | 5. API Swagger | POST /orders azonos kulcsra 409, készlethiányra 422 hibát ad. | P2 (Major) |
| 51 | TC-API-04 | Kupon Érvényesítő Végpont | 5. API Swagger | POST /coupons/validate ismeretlenre 404, lejàrtra 410, limit alattira 422. | P2 (Major) |
| 52 | TC-API-05 | Rendelés Törlése Végpont | 5. API Swagger | DELETE /orders/{id} Userként 403, Adminként 200 törlés. | P2 (Major) |
| 53 | TC-NET-02 | Lassú Hálózat & Dupla Beküldés Védelem | 7. Hálózat | 3000ms latenciánál a gomb kattintás után azonnal disabled lesz. | P2 (Major) |
| 54 | TC-NET-03 | Rate Limit & Brute-Force (429) | 7. Hálózat | Gyors egymás utáni kérésekre a szerver 429 Too Many Requests-et ad. | P2 (Major) |
| 55 | TC-FIN-04 | Nagy Mennyiségű Kosár Pontosság | 8. Pénzügy | 50+ darabszámnál a tételek és adók összeadásának cent-pontossága. | P2 (Major) |
| 56 | TC-ST-02 | Illegális Átmenet: Visszatérített Zárolása | 9. Állapotgép | REFUNDED tétel nem módosítható tovább, akciógombok rejtettek. | P2 (Major) |
| 57 | TC-ST-03 | Konkurens Státuszváltási Kísérlet | 9. Állapotgép | Párhuzamos kérések esetén a backend konzisztens marad. | P2 (Major) |
| 58 | TC-SES-01 | F5 / Oldalfrissítés Állapotmegőrzés | 10. Munkamenet | F5 újratöltés után a kiválasztott deviza/adatok megőrződnek. | P2 (Major) |
| 59 | TC-SES-02 | Párhuzamos Kétlapos Szinkronizáció | 10. Munkamenet | 1. lapon leadott rendelés valós időben megjelenik a 2. lap ERP-jében. | P2 (Major) |
| 60 | TC-SES-03 | Böngésző Vissza Gomb Védelem | 10. Munkamenet | Rendelés után a Vissza gomb nem küldi be újra a tranzakciót. | P2 (Major) |
| 61 | TC-A11Y-01 | Kizárólagos Billentyűzet-Navigáció | 11. Akadálymentesség | A teljes vásárlás végigvihető egér nélkül (Tab, Space, Enter). | P2 (Major) |
| 62 | TC-INT-01 | SQL Lekérdezések Futtatása | 6. SQL | SELECT * FROM orders és JOIN futtatása, eredménytábla vizsgálat. | P3 (Normal) |
| 63 | TC-INT-02 | SQL-ből Frissülő UI Állapot | 6. SQL | UPDATE orders lefutása után az ERP azonnal frissül. | P3 (Normal) |
| 64 | TC-INT-03 | Audit Naplózás Konzisztencia | 6. SQL | Minden művelet bejegyzést hoz létre az audit_logs táblában. | P3 (Normal) |
| 65 | TC-INT-04 | Trainer UI Breaking Mode Követés | 6. SQL | v2 Breaking Mode esetén a POM réteg sikeresen absztrahál. | P3 (Normal) |
| 66 | TC-NET-04 | Offline Hálózati Szakadás | 7. Hálózat | setOffline esetén az űrlap jelzi a kapcsolat megszűnését. | P3 (Normal) |
| 67 | TC-A11Y-02 | WCAG Űrlap Kontraszt és Címkék | 11. Akadálymentesség | Szabványos form címkék és megfelelő kontrasztarányok (WCAG 2.1 AA). | P3 (Normal) |
| 68 | TC-A11Y-03 | Reszponzív Mobil és Tablet Nézet | 11. Akadálymentesség | Mobil (375x667) és tablet nézetben az űrlap nem csúszik szét. | P3 (Normal) |
| 69 | TC-NAV-01 | Külső Guide Link Ellenőrzése | 0. Gate | A fejlécben a Guide hivatkozás érvényes céllal nyitja meg az e2e-guide.html oldalt. | P4 (Low) |
| 70 | TC-SQL-05 | SQL Gyorslekérdezés Chipek Beillesztése | 6. SQL | A chipekre kattintva a minta lekérdezés automatikusan bekerül a szerkesztőbe. | P4 (Low) |
| 71 | TC-SQL-06 | Hibás SQL Szintaxis Kezelése | 6. SQL | Érvénytelen SQL szintaxis futtatásakor hibaüzenet renderelődik, a felület stabil marad. | P4 (Low) |
| 72 | TC-SWG-06 | Swagger cURL Generálás és Latencia | 5. API Swagger | Végpont meghívásakor generálódik a másolható cURL parancs és látható a válaszidő (ms). | P4 (Low) |
| 73 | TC-LAB-08 | Hiba Toast Értesítés Megjelenése | 4. DOM Lab | A piros toast gomb megnyomásakor kifejezetten hiba stílusú Toast üzenet renderelődik. | P4 (Low) |
| 74 | TC-LAB-09 | Modál Bezárása Háttérre Kattintással | 4. DOM Lab | A Terms modális ablak a sötétített háttérre (backdrop) kattintva is bezáródik. | P4 (Low) |
| 75 | TC-TOOL-01 | Trainer Toolbar Paraméter Szinkron | 0. Gate | Toolbar jelölőnégyzetek kapcsolásakor az információs sorban a paraméterek frissülnek. | P4 (Low) |
