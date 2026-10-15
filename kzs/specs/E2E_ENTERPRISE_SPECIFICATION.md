# Enterprise QA Sandbox E2E Specifikacio es Tesztterv

Alkalmazas URL: https://testacademy.hu/qa-lab/e2e-app?pass=astron2026

## 1. Rendszerattekintes es Architektura

Az alkalmazas egy tobbmodulos Enterprise QA Sandbox rendszer, amely egy elofizeteses felho-szolgaltatas vasarlasi, megrendeles-kezeloi (ERP), szerepkor-vezerlesi (RBAC), API es adatbazis funkcioit szimulalja. A rendszer egy kozos, reaktiv, memoriabeli relacios adatbazisra es allapotgepre epul.

### Modulok attekintese:
1. Globális Fejlec es Biztonsagi Kapu (Navbar, RBAC Actor Switcher, DB Seed Reset, Trainer Toolbar)
2. Modul 1: Storefront & Checkout (Tobbvalutas webshop, EU VAT mentesites, kuponok, bankkartya es vallalati atutalas)
3. Modul 2: Order Management ERP (Rendelesi pipeline, allapotgep, szures, kereses, rendezes, lapozas, CSV export)
4. Modul 3: Role-Based Access Control (RBAC felhasznaloi profilok es jogosultsagok)
5. Modul 4: Selector & DOM Lab (Web-First vs torekeny lokatorok, aszinkron komponensek)
6. Modul 5: REST API Swagger Console (Interaktiv REST vegpontok, szerzodesek es hibakodok)
7. Modul 6: SQL Workbench (Elo SQL konzol, gyorslekerdezesek es eredmenytabla)

---

## 2. Modulonkenti Funkcionalis Specifikacio

### 2.0. Biztonsagi Kapu es Globalis Kezeloszervek
* Kapu mukodese:
  * A felulet a `pass=astron2026` vagy `unlocked=true` URL query parameterrel, illetve az `#gate-pass` mezobe irt `astron2026` jelszoval oldhato fel.
  * Helytelen jelszonal a felulet zarolva marad (`#gate-err` hiba).
* Globalis DB Seed Reset:
  * A `[data-testid="btn-reset-db"]` gomb megnyomasa visszaallitja az adatbazist a kiindulo allapotra (4 felhasznalo, 3 termek, 5 alaprendeles).
* Trainer Toolbar:
  * `toggle-v2`: UI breaking changes szimulacio (megvaltozott DOM azonosítók a POM absztrakcio tesztelesehez).
  * `toggle-flaky`: Halozati kesleltetes es 503 hibak generalasa a hibatures vizsgalatahoz.
  * `toggle-lockout`: Rate limiting / 429 zarolas szimulacioja.

### 2.1. Storefront & Checkout (Webaruhaz)
* Penznemek es arfolyamok:
  * USD ($ - Base): 1.0x szorzo
  * EUR (€): 0.92x szorzo (2 tizedesjegyre kerekitve)
  * HUF (Ft): 395x szorzo (egesz forintra kerekitve)
* Termekkatalogus es keszlet:
  * Product 1: QA Automation Runner License ($250, kezdo keszlet: 15 db)
  * Product 2: Enterprise Load Testing Engine ($490, kezdo keszlet: 8 db)
  * Product 3: Security SAST/DAST Scanner ($380, kezdo keszlet: 20 db)
  * Keszletfelugyelet: A rendelheto mennyiseg nem haladhatja meg az aktualis keszletet. Tuleroltetett rendelest a rendszer elutasit.
* Adoszamitas es EU VAT mentesites (Reverse Charge):
  * Alapertelmezett adorendszer: US 0%, DE 19% VAT, HU 27% AFA.
  * B2B EU adoszam (`vat-input`): Ervenyes szintaxis eseten (pl. `DE987654321` vagy `HU12345678`) az AFA kulcsa 0%-ra modosul, es a zold megerosito felirat jelenik meg. Hibas formátumnál az adokulcs nem valtozik.
* Kuponrendszer:
  * `AIWS25`: 25% szazalekos kedvezmeny a netto reszosszegbol.
  * `SAVE50`: Fix $50 kedvezmeny legalabb $200 netto erteku kosar eseten. Limit alatti kosarnal a kedvezmeny nem ervenyesul.
  * `EXPIRED2025`: Lejart kupon, a rendszer hibauzenettel elutasitja.
* Fizetesi modok:
  * Bankkartya (`pay-method-card`): Mock kartyaadatok (`card-number-input`, `card-expiry-input`, `card-cvc-input`). A `4000 0000 0000 0001` sikeres fizetest hajt vegre (`PAID` statusz). A `4000 0000 0000 0002` kartya elutasitott tranzakciot (402 Declined), a `4000 0000 0000 0003` 3DS OTP megerositest szimulal.
  * Vallalati atutalas (`pay-method-invoice`): Kotelezo megrendelesi szam (`po-number-input`, legalabb 5 karakter). A rendeles `PENDING` statuszban jon letre.
* Elo Rendelesi Tabla (Live Database Orders):
  * Sikeres rendelest kovetoen az uj rekord azonnal megjelenik a tablazat legelso soraban a megadott e-mail cimmel, vegosszeggel es statusszal.

### 2.2. Order Management ERP (Allapotgep es Pipeline)
* Tablazat es kereso funkcio:
  * Keresomezo (`order-search-input`): Valos ideju szures azonositora, felhasznaloi e-mailre vagy termeknevre.
  * Statusz szuro (`order-status-filter`): ALL, PENDING, PAID, PROVISIONING, COMPLETED, CANCELLED, REFUNDED.
  * Oszloprendezes (`order-sort-select`): ID (uj/regi elol) es Vegosszeg (magas/alacsony).
* Allapotgep (Order State Machine):
  * Megengedett atmenetek:
    * `PENDING` -> `PAID` (Pay gomb)
    * `PENDING` -> `CANCELLED` (Cancel gomb)
    * `PAID` -> `PROVISIONING` (Provision gomb)
    * `PROVISIONING` -> `COMPLETED` (Complete gomb)
    * `PAID` / `COMPLETED` -> `REFUNDED` (Refund gomb - kizarolag Adminnak)
  * Végallapotok: A `CANCELLED` es `REFUNDED` statuszu rendelesek lezartak (`Locked`/`Closed`), tobb allapotvaltas nem hajthato vegre rajtuk.
* Lapozas es Export:
  * 5 tetel felett mukodo lapozo (`pagination-prev`, `pagination-next`).
  * CSV export (`export-orders-btn`) megfelelo fejleccel es adattartalommal.

### 2.3. Role-Based Access Control (RBAC)
* Szerepkorok es felhasznalok:
  * Dan Tester (`dan.tester@enterprise.io`, Szerepkor: `USER`): Standard felhasznalo. Nem torolhet, nem terithet vissza.
  * Tamas Admin (`tamas.admin@testacademy.hu`, Szerepkor: `ADMIN`): Rendszergazda. Elerheto szamara a `Refund` es a `Delete` muvelet az ERP feluleten.
  * Junior QA (`junior.auditor@astron.hu`, Szerepkor: `JUNIOR_QA`): Auditor profil, korlatozott modositasi jogokkal.
  * Suspended Account (`suspended.user@malicious.com`, Szerepkor: `BLOCKED`): Letiltott felhasznalo. Megrendeles inditasakor 403 Forbidden hibat kap, a vasarlas tiltott.
* Bejelentkezesi urlap szabalyzat:
  * E-mail szintaxis validacio (szabvanyos email formatum).
  * Jelszo hazirend: Minimum 8 karakter, legalabb 1 nagybetu es 1 szamjegy.

### 2.4. Selector & DOM Laboratory
* Lokator szabvanyok:
  * Torekeny lokatorok: Dinamikusan valtozo osztalyok (`.btn_v49_sub_2x`), indexelt tablazatsorok.
  * Web-First lokatorok: `getByRole`, `getByLabel`, `getByTestId`.
  * DOM ujrageneralas: A `#btn-regenerate-dom` megnyomasakor az id-k es class-ok atszervezodnek, a Web-First lokatorok mukodokepesek maradnak.
* Aszinkron komponensek:
  * Debounced kereso: 300 ms kesleltetes gepeles utan, folyamatjelzo spinnerrel.
  * Ephemeral Toast: 3.5 masodpercig lathato, onmagat torlo ertesites.
  * Akadalymentes modalis ablak (Terms Modal): ESC billentyuvel es elfogadas gombbal zarhato.
  * Fajlfeltoltes: Max 2MB meretu `.pdf` vagy `.png` engedelyezett. Nagyobb meretre 413, mas tipusra 415 hiba.

### 2.5. REST API Swagger es Adatintegritas
* REST API Vegpontok:
  * `POST /api/v1/auth/login`: Hitelesites, JWT token kiadas.
  * `GET /api/v1/orders`: Rendelesi lista lekerese Bearer tokennel.
  * `POST /api/v1/orders`: Uj rendeles feladasa idempotencia-kulccsal (`Idempotency-Key`).
  * `POST /api/v1/coupons/validate`: Kupon ervenyessegenek es kosarosszeg limittol fuggo vizsgalata.
  * `PATCH /api/v1/orders/{id}/status`: Allapotgep atmenet vezerlese.
  * `DELETE /api/v1/orders/{id}`: Rendeles torlese (kizarolag Admin tokennel).
* SQL Workbench es Audit Naplozas:
  * Kozvetlen SQL lekerdezesek futtatasa es eredmenytabla renderelese.
  * UI-SQL szinkronizacio: SQL-ben vegzett modositas azonnal megjelenik a UI-on.
  * Minden rendelesletrehozas es statuszvaltas bejegyzest general az `audit_logs` tablaban.

---

## 3. Vallalati Kiegeszito Kovetelmenyek (Enterprise Dimensions)

### 3.1. Halozati Reziliencia es Hibatures
* Backend 500 hiba eseten a felulet felhasznalobarat tajekoztatast ad, nem omlik ossze unhandled exceptionnel.
* Lassu halozat eseten (3000ms+) a bekuldes gomb kattintas utan azonnal `disabled` allapotba kerul a dupla tranzakcio megelozesere.
* Halozati szakadas (`setOffline`) eseten az urlap jelzi a kapcsolat hianyat.

### 3.2. Penzugyi Szamitas es Kerekitesi Integritas
* HUF eseten fillerek nem letezhetnek, a vegosszeg egesz forintra kerekítendő.
* A kuponkedvezmeny a netto alapbol vonodik le, az AFA a csokkentett alapra kalkulalodik.
* Dinamikus orszagvaltas eseten a reszosszeg, adokulcs es vegosszeg azonnal ujraszamolodik.

### 3.3. Allapotgep Illegalis Atmenetek Kivédése
* `CANCELLED` es `REFUNDED` rendelesek nem fizethetok ki ujra, lezart allapotban maradnak.
* Parhuzamos statuszmodositas eseten az alkalmazas megorzi az adatintegritast.

### 3.4. Munkamenet es Session Perzisztencia
* F5 oldalfrissites eseten az aktiv munkamenet es kivalasztott adatok megorzodnek.
* Tobblapos mukodes eseten az 1. lapon feladott rendeles megjelenik a 2. lap ERP tablazataban.
* Bongeszo Vissza gomb hasznalatakor a megrendeles nem kerul duplan bekuldesre.

### 3.5. Akadalymentesseg (A11y) es Reszponzivitas
* A vasarlasi folyamat vegrehajthato kizarolag billentyuzettel (`Tab`, `Space`, `Enter`).
* Minden urlapmezo rendelkezik megfelelo akadalymentes cimkevel (WCAG 2.1 AA).
* Mobil es tablet felbontasban a kezelofeluelet torésmentes marad.

---

## 4. Teljes Tesztterv Matrix (Prioritas szerint csokkeno sorrendben)

| TC Azonosito | Teszteset Neve | Modul | Kategoria / Kovetelmeny | Prioritas |
| :--- | :--- | :--- | :--- | :---: |
| TC-00-01 | Zarolt Kapu Negativ | 0. Gate | Helytelen jelszo eseten a labor zarolva marad. | P1 (Blocker) |
| TC-00-02 | Kapu Sikeres Feloldasa | 0. Gate | Helyes jelszoval vagy URL parameterrel a labor elerheto. | P1 (Blocker) |
| TC-00-03 | Globalis DB Seed Reset | 0. Gate | Adatbazis visszaallitasa az alap seed allapotra. | P1 (Blocker) |
| TC-00-04 | Fo Navigacios Fulek | 0. Gate | Mind az 5 ful kozotti navigacio es aktiv panel rendereles. | P1 (Blocker) |
| TC-SF-01 | Bankkartyas Vasarlas (Happy Path) | 1. Storefront | Sikeres rendeles kartyahasznalattal, PAID statusz, keszletcsokkenes. | P1 (Critical) |
| TC-SF-02 | Vallalati Szamlas Fizetes (PO) | 1. Storefront | Ervenyes PO szammal leadott rendeles PENDING statuszba kerul. | P1 (Critical) |
| TC-SF-03 | Penznemvaltas & Arfolyamok | 1. Storefront | USD, EUR (0.92x), HUF (395x) pontos arszamitas es kerekités. | P1 (Critical) |
| TC-SF-04 | Mennyiseg Hatarertek-elemzes (BVA) | 1. Storefront | Mennyiseg also es felso hatarertekeinek ellenorzese. | P1 (Critical) |
| TC-SF-05 | Keszlethiany Negativ Ag | 1. Storefront | Raktarkeszlet feletti mennyiseg rendelese tiltott (Stock Error). | P1 (Critical) |
| TC-SF-06 | Orszagos Adokulcsok Kalkulacioja | 1. Storefront | US 0%, DE 19%, HU 27% pontos adoszamitasa es vegosszege. | P1 (Critical) |
| TC-SF-07 | EU VAT Mentesites (Reverse Charge) | 1. Storefront | Ervenyes B2B EU adoszam eseten 0% AFA alkalmazasa. | P1 (Critical) |
| TC-SF-08 | Ervenytelen EU VAT Format | 1. Storefront | Szintaktikailag hibas adoszam elutasitasa, alap adokulcs marad. | P1 (Critical) |
| TC-SF-09 | Szazalekos Kupon Ervenyesites | 1. Storefront | AIWS25 kupon 25% azonnali levonasa a netto reszosszegbol. | P1 (Critical) |
| TC-SF-10 | Fix Osszegu & Limit Kupon | 1. Storefront | SAVE50 kupon kotelezo kosarlimit vizsgalata es levonasa. | P1 (Critical) |
| TC-SF-11 | Lejart Kupon Negativ Ag | 1. Storefront | EXPIRED2025 kupon hibauzenettel elutasitva. | P1 (Critical) |
| TC-SF-12 | Elutasitott Kartyatranzakcio | 1. Storefront | 4000 0000 0000 0002 tesztkartya elutasitasa (402 Declined). | P1 (Critical) |
| TC-SF-13 | 3D Secure OTP Hitelesites | 1. Storefront | 4000 0000 0000 0003 kartya eseten OTP megerosites vizsgalata. | P1 (Critical) |
| TC-SF-14 | Szamlazasi PO Szam Validacio | 1. Storefront | Rovid vagy hianyzo PO szam eseten rendeles megtagadasa. | P1 (Critical) |
| TC-RBAC-01 | Szerepkorvaltas - Dan Tester (USER) | 2. RBAC | Fejlec jelveny szinkronizacio es urlap email kitoltes. | P1 (Critical) |
| TC-RBAC-02 | Felfuggesztett Fiok (BLOCKED) | 2. RBAC | suspended.user rendelesinditasa 403 Forbidden hibaval tiltva. | P1 (Critical) |
| TC-RBAC-03 | Login Form E-mail Validacio | 2. RBAC | Helytelen szintaxisu email cim elutasitasa a modalban. | P1 (Critical) |
| TC-RBAC-04 | Login Form Jelszo Hazirend | 2. RBAC | Nem megfelelo bonyolultsagu jelszo elutasitasa (Policy). | P1 (Critical) |
| TC-RBAC-05 | Adminisztratori Jogosultsagok | 2. RBAC | Tamas Admin profilban a Refund es Delete gombok megjelennek. | P1 (Critical) |
| TC-RBAC-06 | Junior QA Korlatozott Jogosultsag | 2. RBAC | Junior QA eseten a torlesi es visszateritesi gombok rejtettek. | P1 (Critical) |
| TC-NET-01 | Backend 500 Hiba Kezelese | 7. Halozat | 500-as szerverhiba eseten elegans tajekoztatas, app nem omlik ossze. | P1 (Critical) |
| TC-FIN-01 | Devizakerekitesi Lebegopontos Hiba | 8. Penzugy | HUF egeszre, EUR 2 tizedesre kerekitve, preciz arszamitas. | P1 (Critical) |
| TC-FIN-02 | Kupon Kedvezmeny & AFA Sorrend | 8. Penzugy | A kedvezmeny a netto alapbol vonodik le, erre epul az AFA. | P1 (Critical) |
| TC-FIN-03 | Dinamikus Orszagvaltas Kuponnal | 8. Penzugy | Bevaltott kuponnal torteno orszagvaltaskor azonnali ujrakalkulacio. | P1 (Critical) |
| TC-ST-01 | Illegalis Atmenet: Lemondott Fizetese | 9. Allapotgep | CANCELLED rendeles nem fizetheto ki ujra, a gomb inaktiv. | P1 (Critical) |
| TC-ST-04 | Jogosulatlan Visszaterites Megtagadasa | 9. Allapotgep | User vagy Junior QA szerepkorben a refund hivas tiltott (403). | P1 (Critical) |
| TC-OM-01 | Valos Ideju Szabadszavas Kereses | 3. Orders | Kereses ID-re, emailre es termekre: pontos talalati lista. | P2 (Major) |
| TC-OM-02 | Statusz Szerinti Szures | 3. Orders | Szures mind a 6 statuszra pontos sorilleszkedessel. | P2 (Major) |
| TC-OM-03 | Tablazat Oszlopok Rendezese | 3. Orders | Rendezés ellenorzese ID es Vegosszeg szerint nov./csokk. | P2 (Major) |
| TC-OM-04 | Allapotatmenet: PENDING -> PAID | 3. Orders | Pay gombra kattintva statuszvaltás PAID-re es Provision megjelenes. | P2 (Major) |
| TC-OM-05 | Allapotatmenet: PENDING -> CANCELLED | 3. Orders | Cancel gombra kattintva a rendeles veglegesen lezarul. | P2 (Major) |
| TC-OM-06 | Teljes Eletciklus Vegrehajtas | 3. Orders | PAID -> PROVISIONING -> COMPLETED lepessor vegrehajtasa. | P2 (Major) |
| TC-OM-07 | Visszaterites (Refund) RBAC Vedelem | 3. Orders | Admin altal inditott refund sikeresen REFUNDED statuszba allit. | P2 (Major) |
| TC-OM-08 | Vegallapot Integritas | 3. Orders | CANCELLED es REFUNDED rendelesek zaroltak minden tovabbi akciotol. | P2 (Major) |
| TC-OM-09 | Tablazat Lapozo (Pagination) | 3. Orders | 5-nel tobb tetel eseten Next es Prev lapozas pontos adatokkal. | P2 (Major) |
| TC-OM-10 | CSV Export Adatkonzisztencia | 3. Orders | Export CSV letoltes a rendelesek helyes adataival es fejleccevel. | P2 (Major) |
| TC-LAB-01 | Debounced Kereso (300ms) | 4. DOM Lab | Gepeles utan spinner megjelenes, 300ms kesleltetett eredmeny. | P2 (Major) |
| TC-LAB-02 | Ephemeral Toast Ertesites | 4. DOM Lab | 3.5 masodperces toast auto-dismiss es azonnali bezarasi lehetoseg. | P2 (Major) |
| TC-LAB-03 | Akadalymentes Terms Modal | 4. DOM Lab | Modal megnyitas, fokuszkontroll, zarás ESC-pel es gombbal. | P2 (Major) |
| TC-LAB-04 | Ervenyes Fajlfeltoltes | 4. DOM Lab | Ervenyes .pdf vagy .png (< 2MB) sikeres feltoltese. | P2 (Major) |
| TC-LAB-05 | Fajl Merethatar Negativ Ag | 4. DOM Lab | 2MB feletti fajl eseten 413 hibajelzes megjelenese. | P2 (Major) |
| TC-LAB-06 | Nem Tamogatott Fajlformatum | 4. DOM Lab | .txt vagy .exe kiterjesztes eseten 415 hibajelzes. | P2 (Major) |
| TC-LAB-07 | Resilient DOM vs Rebuild | 4. DOM Lab | DOM ujrageneralas utan a Web-First locatorok mukodokepesek maradnak. | P2 (Major) |
| TC-API-01 | Auth Vegpont Szerzodes | 5. API Swagger | POST /login helyes adatokra 200, hibasra 401, blokkoltra 403. | P2 (Major) |
| TC-API-02 | Rendelesek Hozzaferes-vedelem | 5. API Swagger | GET /orders token nelkul 401, tokennel 200 a rendelesi listaval. | P2 (Major) |
| TC-API-03 | Idempotencia & Keszlet Vegpont | 5. API Swagger | POST /orders azonos kulcsra 409, keszlethianyra 422 hibat ad. | P2 (Major) |
| TC-API-04 | Kupon Ervenyesito Vegpont | 5. API Swagger | POST /coupons/validate ismeretlenre 404, lejartra 410, limit alattira 422. | P2 (Major) |
| TC-API-05 | Rendeles Torlese Vegpont | 5. API Swagger | DELETE /orders/{id} Userkent 403, Adminkent 200 torles. | P2 (Major) |
| TC-NET-02 | Lassu Halozat & Dupla Bekuldes Vedelem | 7. Halozat | 3000ms latencianal a gomb kattintas utan azonnal disabled lesz. | P2 (Major) |
| TC-NET-03 | Rate Limit & Brute-Force (429) | 7. Halozat | Gyors egymas utani keresekre a szerver 429 Too Many Requests-et ad. | P2 (Major) |
| TC-FIN-04 | Nagy Mennyisegu Kosar Pontossag | 8. Penzugy | 50+ darabszamnal a tetelek es adok osszeadasanak cent-pontossaga. | P2 (Major) |
| TC-ST-02 | Illegalis Atmenet: Visszateritett Zarolasa | 9. Allapotgep | REFUNDED tetel nem modosithato tovabb, akcios gombok rejtettek. | P2 (Major) |
| TC-ST-03 | Konkurens Statuszvaltasi Kiserlet | 9. Allapotgep | Parhuzamos keresek eseten a backend konzisztens marad. | P2 (Major) |
| TC-SES-01 | F5 / Oldalfrissites Allapotmegorzes | 10. Munkamenet | F5 ujratoltes utan a kivalasztott deviza/adatok megorzodnek. | P2 (Major) |
| TC-SES-02 | Parhuzamos Ketlapos Szinkronizacio | 10. Munkamenet | 1. lapon leadott rendeles valos idoben megjelenik a 2. lap ERP-jeben. | P2 (Major) |
| TC-SES-03 | Bongeszo Vissza Gomb Vedelem | 10. Munkamenet | Rendeles utan a Vissza gomb nem kudi be ujra a tranzakciot. | P2 (Major) |
| TC-A11Y-01 | Kizarolagos Billentyuzet-Navigacio | 11. Akadalymentesseg | A teljes vasarlas vegigviheto eger nelkul (Tab, Space, Enter). | P2 (Major) |
| TC-INT-01 | SQL Lekerdezesek Futtatasa | 6. SQL | SELECT * FROM orders es JOIN futtatasa, eredmenytabla vizsgalat. | P3 (Normal) |
| TC-INT-02 | SQL-bol Frissulo UI Allapot | 6. SQL | UPDATE orders lefutasa utan az ERP azonnal frissul. | P3 (Normal) |
| TC-INT-03 | Audit Naplozas Konzisztencia | 6. SQL | Minden muvelet bejegyzest hoz letre az audit_logs tablaban. | P3 (Normal) |
| TC-INT-04 | Trainer UI Breaking Mode Kovetes | 6. SQL | v2 Breaking Mode eseten a POM reteg sikeresen absztrahal. | P3 (Normal) |
| TC-NET-04 | Offline Halozati Szakadas | 7. Halozat | setOffline eseten az urlap jelzi a kapcsolat megszuneset. | P3 (Normal) |
| TC-A11Y-02 | WCAG Urlap Kontraszt es Cimkek | 11. Akadalymentesseg | Szabvanyos form cimkek es megfelelo kontrasztaranyok (WCAG 2.1 AA). | P3 (Normal) |
| TC-A11Y-03 | Reszponziv Mobil es Tablet Nezet | 11. Akadalymentesseg | Mobil (375x667) es tablet nezetben az urlap nem csuszik szet. | P3 (Normal) |
