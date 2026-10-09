# 📋 Enterprise QA Sandbox - Teszt Terv & Page Object Model Térkép
**Alkalmazás URL:** `https://testacademy.hu/qa-lab/e2e-app?unlocked=true`  
**Szerepkör:** Medior Manuális Szoftvertesztelő  
**Célkitűzés:** 100%-os Funkcionális, Negatív, Jogosultsági és Adatintegritási Tesztlefedettség (Full Test Coverage)  
**Dátum:** 2026-10-09  

---

## 📌 1. Vezetői Összefoglaló & Alkalmazás Rendszerkép

A vizsgált webalkalmazás egy többrétegű **Enterprise QA Sandbox**, amely egy e-kereskedelmi és felhő-előfizetési rendszert szimulál. A háttérben egy reaktív, memóriabeli relációs adatbázis (users, products, coupons, orders, audit_logs), állapotgép (State Machine), szerepkör-alapú hozzáférés-vezérlés (RBAC), interaktív REST API (Swagger) és SQL terminál működik.

### Fő modulok és architektúra:
1. **Globális Fejléc & Biztonsági Kapu:**
   - Hozzáférési kapu (`#gate-overlay` jelszavas vagy URL query védelemmel).
   - Aktív felhasználói munkamenet (RBAC Actor Switcher: User, Admin, Junior QA, Blocked).
   - Globális DB állapot visszaállítás (`Reset DB Seed`).
   - Tréner eszköztár (v2 UI törő változások, Flaky hálózati késleltetés 503 hibákkal, 429 Brute-force zárolás).
2. **Nézet 1: 🖥️ Storefront & Checkout (UI Megrendelés):**
   - Valutaváltó (USD, EUR, HUF árfolyam-átszámítással).
   - Termékkatalógus valós idejű készletkezeléssel (Stock).
   - Adó- és EU ÁFA mentesítési kalkulátor (Reverse charge B2B VIES szintaxis-ellenőrzéssel).
   - Vállalati kuponmotor (százalékos, fix összegű, minimális költéshez kötött, lejárt kuponok).
   - Fizetési átjáró (Bankkártyás fizetés elutasítási és 3DS OTP kihívással, Vállalati PO számla).
3. **Nézet 2: 📦 Order Management & ERP Dashboard (Állapotgép):**
   - Élő szűrés (szabadszavas kereső, státusz szűrő), rendezés (ID, összeg) és lapozás (Pagination).
   - Rendelési életciklus állapotgép: `PENDING` ➔ `PAID` ➔ `PROVISIONING` ➔ `COMPLETED` / `CANCELLED` / `REFUNDED`.
   - Jogosultságfüggő akciók (Visszatérítés és törlés kizárólag Adminisztrátornak).
   - CSV export funkció.
4. **Nézet 3: 🎯 Selector & DOM Laboratory:**
   - Törékeny (Fragile/XPath/Index-trap) vs Időtálló (Web-first/Role/TestId) lokátorok összehasonlítása.
   - Aszinkron komponensek: Debounced kereső (300ms késleltetés), 3.5 mp-es automatikusan eltűnő Toast értesítés, WCAG modális ablak, 2MB-os PDF/PNG fájlfeltöltő.
5. **Nézet 4: ⚡ API Swagger Console:**
   - Interaktív REST API végpontok: `POST /auth/login`, `GET /orders`, `POST /orders`, `POST /coupons/validate`, `PATCH /orders/{id}/status`, `DELETE /orders/{id}`.
   - Idempotencia-kulcs (`Idempotency-Key`) és készletellenőrzés.
6. **Nézet 5: 🗄️ SQL Workbench:**
   - Élő SQL konzol gyorslekérdezésekkel (`SELECT`, `JOIN`, `UPDATE`).

---

## 🗺️ 2. Page Object Model (POM) Rendszertérkép

A karbantartható és moduláris Playwright automatizálás érdekében a felületet a következő Page Object osztályokra és komponensekre bontjuk:

```
hge/
└── pages/
    ├── BasePage.ts              # Közös navigáció, Toast figyelő, Tab váltó
    ├── GateOverlay.ts           # Jelszavas beléptető kapu
    ├── HeaderComponent.ts       # Navigációs sáv, RBAC szerepkör választó, Reset DB
    ├── AuthModal.ts             # Bejelentkezési űrlap és szerepkör váltó modál
    ├── StorefrontPage.ts        # Áruház, termékek, kosár, kupon, fizetés
    ├── OrderManagementPage.ts   # ERP táblázat, szűrők, állapotgép akciók, CSV
    ├── SelectorLabPage.ts       # DOM Lab és aszinkron widgetek (Kereső, Toast, Modal, Upload)
    ├── SwaggerPage.ts           # REST API végpontok és tesztfuttató konzol
    └── SqlConsolePage.ts        # SQL lekérdező és eredménytábla komponens
```

### 2.1 Részletes Lokátor- és Metódus Térkép

#### A) `GateOverlay` (Biztonsági Kapu)
- **Lokátorok:**
  - `overlay`: `#gate-overlay`
  - `passwordInput`: `#gate-pass`
  - `unlockButton`: `#gate-btn` (vagy `getByRole('button', { name: /Unlock Lab/i })`)
  - `errorMessage`: `#gate-err`
- **Metódusok:** `unlock(password: string)`, `isLocked(): Promise<boolean>`

#### B) `HeaderComponent` (Globális Fejléc & RBAC)
- **Lokátorok:**
  - `tabStorefront`: `getByRole('button', { name: /Storefront/i })`
  - `tabOrders`: `getByRole('button', { name: /Order Management/i })`
  - `tabSelectors`: `getByRole('button', { name: /Selector & DOM Lab/i })`
  - `tabApi`: `getByRole('button', { name: /API Swagger/i })`
  - `tabSql`: `getByRole('button', { name: /SQL Workbench/i })`
  - `userDisplay`: `getByTestId('current-user-name')`
  - `roleBadge`: `getByTestId('current-role-badge')`
  - `switchRoleButton`: `getByTestId('switch-user-btn')`
  - `resetDbButton`: `getByTestId('btn-reset-db')`
- **Metódusok:** `switchTab(tabName)`, `openAuthModal()`, `resetDatabaseState()`

#### C) `AuthModal` (RBAC & Bejelentkezés)
- **Lokátorok:**
  - `modalContainer`: `#auth-modal`
  - `actorUserBtn`: `getByTestId('select-actor-user')`
  - `actorAdminBtn`: `getByTestId('select-actor-admin')`
  - `actorJuniorBtn`: `getByTestId('select-actor-junior')`
  - `actorBlockedBtn`: `getByTestId('select-actor-blocked')`
  - `emailInput`: `getByTestId('auth-email')`
  - `passwordInput`: `getByTestId('auth-password')`
  - `loginSubmitBtn`: `getByTestId('auth-login-btn')`
  - `authErrorLabel`: `getByTestId('auth-error')`
  - `closeModalBtn`: `getByTestId('btn-close-auth-modal')`
- **Metódusok:** `selectActor(role)`, `loginWithCredentials(email, password)`, `closeModal()`

#### D) `StorefrontPage` (Pénztár és Megrendelés)
- **Lokátorok:**
  - `currencySelect`: `getByTestId('currency-select')`
  - `productOptions`: `locator('.product-card-option')`
  - `emailInput`: `getByTestId('email-input')`
  - `quantityInput`: `getByTestId('qty-input')`
  - `countrySelect`: `getByTestId('country-select')`
  - `vatInput`: `getByTestId('vat-input')`
  - `validateVatBtn`: `getByTestId('btn-validate-vat')`
  - `vatFeedback`: `#vat-feedback`
  - `couponInput`: `getByTestId('coupon-input')`
  - `applyCouponBtn`: `getByTestId('coupon-btn')`
  - `couponFeedback`: `getByTestId('coupon-feedback')`
  - `cardRadio`: `#pay-method-card`
  - `invoiceRadio`: `#pay-method-invoice`
  - `cardNumberInput`: `getByTestId('card-number-input')`
  - `cardExpiryInput`: `getByTestId('card-expiry-input')`
  - `cardCvcInput`: `getByTestId('card-cvc-input')`
  - `poNumberInput`: `getByTestId('po-number-input')`
  - `submitOrderBtn`: `getByTestId('checkout-btn')` (v2-ben `getByTestId('submit-order-btn')`)
  - `summaryTotal`: `#ui-sum-total`
  - `summaryDiscount`: `#ui-sum-discount`
  - `summaryVat`: `#ui-sum-vat`
  - `recentOrdersTable`: `#ui-recent-orders-tbody`
- **Metódusok:** `selectCurrency(currency)`, `selectProduct(productId)`, `fillCustomerDetails(email, qty, country)`, `applyVatNumber(vat)`, `applyCoupon(code)`, `fillCardDetails(card, exp, cvc)`, `fillInvoiceDetails(poNumber)`, `submitOrder()`

#### E) `OrderManagementPage` (ERP Dashboard & Állapotgép)
- **Lokátorok:**
  - `searchInput`: `getByTestId('order-search-input')`
  - `statusFilter`: `getByTestId('order-status-filter')`
  - `sortSelect`: `getByTestId('order-sort-select')`
  - `ordersTable`: `getByTestId('mgmt-orders-table')`
  - `orderRows`: `locator('tr[data-testid^="order-row-"]')`
  - `btnPay(id)`: `getByTestId('btn-pay-' + id)`
  - `btnCancel(id)`: `getByTestId('btn-cancel-' + id)`
  - `btnProvision(id)`: `getByTestId('btn-provision-' + id)`
  - `btnComplete(id)`: `getByTestId('btn-complete-' + id)`
  - `btnRefund(id)`: `getByTestId('btn-refund-' + id)`
  - `btnDelete(id)`: `getByTestId('btn-del-' + id)`
  - `paginationInfo`: `#mgmt-pagination-info`
  - `paginationPrevBtn`: `getByTestId('pagination-prev')`
  - `paginationNextBtn`: `getByTestId('pagination-next')`
  - `exportCsvBtn`: `getByTestId('export-orders-btn')`
- **Metódusok:** `searchOrders(term)`, `filterByStatus(status)`, `sortBy(option)`, `payOrder(id)`, `cancelOrder(id)`, `provisionOrder(id)`, `completeOrder(id)`, `refundOrder(id)`, `deleteOrder(id)`, `nextPage()`, `prevPage()`, `exportCsv()`

#### F) `SelectorLabPage` (DOM Lab & Aszinkron Widgetek)
- **Lokátorok:**
  - `cleanEmailInput`: `getByTestId('clean-email')`
  - `cleanRoleSelect`: `getByTestId('clean-role')`
  - `cleanSubmitBtn`: `getByTestId('clean-submit-btn')`
  - `cleanFeedback`: `#clean-feedback`
  - `asyncSearchInput`: `getByTestId('async-search-input')`
  - `asyncSearchResults`: `getByTestId('search-results-dropdown')`
  - `asyncSpinner`: `#async-search-spinner`
  - `triggerToastBtn`: `getByTestId('btn-trigger-toast')`
  - `triggerErrorToastBtn`: `getByTestId('btn-trigger-err-toast')`
  - `toastContainer`: `#toast-container`
  - `openModalBtn`: `getByTestId('btn-open-modal')`
  - `termsModal`: `#terms-modal`
  - `closeModalBtn`: `getByTestId('btn-close-modal')`
  - `acceptModalBtn`: `getByTestId('btn-accept-modal')`
  - `modalStatusFeedback`: `#modal-status-feedback`
  - `fileUploadInput`: `getByTestId('file-upload-input')`
  - `fileUploadFeedback`: `getByTestId('file-upload-feedback')`
- **Metódusok:** `submitCleanForm(email, role)`, `searchAsync(query)`, `triggerToast(isError)`, `openAndAcceptTerms()`, `uploadFile(filePath)`

#### G) `SwaggerPage` (REST API Konzol)
- **Lokátorok:**
  - `roleSelector`: `getByTestId('api-role-select')`
  - `epLoginBtn`: `getByTestId('btn-api-login')`
  - `epGetOrdersBtn`: `getByTestId('btn-api-get-orders')`
  - `epPostOrderBtn`: `getByTestId('btn-api-post-order')`
  - `epValidateCouponBtn`: `getByTestId('btn-api-validate-coupon')`
  - `epPatchStatusBtn`: `getByTestId('btn-api-patch-status')`
  - `epDeleteOrderBtn`: `getByTestId('btn-api-delete-order')`
  - `responseContainers`: `locator('.swagger-response-box')`
- **Metódusok:** `selectApiRole(role)`, `executeLogin(body)`, `executeGetOrders()`, `executePostOrder(body, idempotencyKey)`, `executeValidateCoupon(code, cartTotal)`, `executePatchStatus(id, targetStatus)`, `executeDeleteOrder(id)`

#### H) `SqlConsolePage` (SQL Workbench)
- **Lokátorok:**
  - `sqlInput`: `getByTestId('sql-query-input')`
  - `executeBtn`: `getByTestId('btn-execute-sql')`
  - `resultsBox`: `getByTestId('sql-results-box')`
  - `queryChips`: `locator('.chip-query')`
- **Metódusok:** `runQuery(sql)`, `clickQuickQueryChip(chipText)`

---

## 📊 3. Tesztterv (Test Plan Matrix) a 100%-os Lefedettséghez

A 100%-os lefedettséghez összesen **50 jól strukturált tesztesetre** van szükség, amelyek lefedik a funkcionális helyes ágakat (Happy Path), a határétékeket (BVA), az ekvivalencia-partíciókat (EP), az állapotátmeneteket (State Transitions), a hibakezelést és az adatintegritást.

### Összesített Teszteset Mátrix

| Modul | Kategória | Tesztek Száma | Prioritás |
| :--- | :--- | :---: | :---: |
| **0. Gate & Globális Fejléc** | Biztonság, Konfiguráció | 4 | P1 (Blocker) |
| **1. Storefront & Checkout** | E-kereskedelem, Pénzügy, BVA | 14 | P1 (Critical) |
| **2. RBAC & Hitelesítés** | Hozzáférés-védelem, Űrlap | 6 | P1 (Critical) |
| **3. Order Management ERP** | Állapotgép, Szűrés, Export | 10 | P2 (Major) |
| **4. Aszinkron & DOM Lab** | Race condition, WCAG, Fájl | 7 | P2 (Major) |
| **5. REST API Swagger** | Szerződés, Idempotencia, RBAC | 5 | P2 (Major) |
| **6. Adatintegritás & SQL** | Tranzakció, Audit, Szimuláció | 4 | P3 (Normal) |
| **ÖSSZESEN** | | **50 teszt** | **100% Coverage** |

---

### Részletes Teszteset Specifikációk

#### 🛡️ 0. Modul: Biztonsági Kapu & Globális Kezelőszervek (4 teszt)
* **TC-00-01 (Zárolt Kapu Negatív):** Helytelen jelszó beírásakor (`hibas123`) a felület zárolva marad, megjelenik a `gate-err` hibaüzenet.
* **TC-00-02 (Kapu Feloldás):** Helyes jelszó (`astron2026`) vagy `?unlocked=true` URL paraméter esetén a kapu eltűnik, a fő felület azonnal elérhető.
* **TC-00-03 (Globális DB Seed Reset):** A `Reset DB Seed` gombra kattintva a módosított adatok (új rendelések, törlések) visszaállnak az alapértelmezett seed állapotra (4 felhasználó, 3 termék, 5 rendelés), sikeres Toast értesítéssel.
* **TC-00-04 (Fő Tab Navigáció):** Mind az 5 tab (`ui`, `orders`, `selectors`, `api`, `sql`) közötti váltás működik, a megfelelő panel kapja meg az `.active` osztályt.

---

#### 🛒 1. Modul: Storefront & Checkout (14 teszt)
* **TC-SF-01 (Happy Path - Bankkártyás vásárlás):** 1 db Runner License ($250) vásárlása alapértelmezett kártyával. A rendelés létrejön `PAID` státusszal, a termék készlete 15-ről 14-re csökken, megjelenik a mini táblázatban.
* **TC-SF-02 (Happy Path - Corporate Invoice):** Vásárlás átutalásos fizetéssel érvényes PO számmal (`PO-AST-2026-99`). A rendelés `PENDING` státusszal jön létre.
* **TC-SF-03 (Pénznemváltás & Árfolyamok):** USD ($) ➔ EUR (€ 0.92x) ➔ HUF (Ft 395x) váltáskor a bázisárak és a végösszeg pontosan a konfigurált szorzókkal számolódnak át.
* **TC-SF-04 (Mennyiség Határérték-elemzés - BVA):** Mennyiség tesztelése: alsó határ (1 db), felső határ (100 db), valamint készlethez igazodó ellenőrzés.
* **TC-SF-05 (Készlethiány Negatív Ág):** Több termék rendelése, mint az aktuális készlet (pl. 25 db a 15-ből) ➔ `Stock Error` alert ablak, a rendelés meghiúsul.
* **TC-SF-06 (Ország Adókulcsok Kalkulációja):** US (0%), DE (19% VAT), HU (27% ÁFA) kiválasztásakor az adóösszeg és a bruttó Grand Total matematikai pontossága.
* **TC-SF-07 (EU VAT Mentesítés - Reverse Charge B2B):** Érvényes EU adószám (`HU12345678` vagy `DE987654321`) beírása és ellenőrzése ➔ 0% ÁFA kulcs kerül alkalmazásra, zöld megerősítő felirat jelenik meg.
* **TC-SF-08 (EU VAT Érvénytelen Formátum):** Hibás formátumú adószám (pl. `ABC123`) ➔ piros hibaüzenet, az adó az ország alapértelmezett kulcsán marad.
* **TC-SF-09 (Kupon - Százalékos Kedvezmény):** `AIWS25` kuponkód beváltása ➔ 25% levonás a részösszegből, a Grand Total megfelelően csökken.
* **TC-SF-10 (Kupon - Fix összeg & Minimum költési korlát):** `SAVE50` kupon ($50 kedvezmény $200 felett). Alacsonyabb összegnél figyelmeztetés jelenik meg, elegendő összegnél érvényesül.
* **TC-SF-11 (Kupon - Lejárt Kupon Negatív Ág):** `EXPIRED2025` kód alkalmazása ➔ piros hibaüzenet: kupon lejárt, kedvezmény nem érvényesül.
* **TC-SF-12 (Bankkártya - Elutasított Tranzakció):** `4000 0000 0000 0002` tesztkártya használata ➔ 402 Declined alert, rendelés nem jön létre.
* **TC-SF-13 (Bankkártya - 3D Secure OTP Hitelesítés):** `4000 0000 0000 0003` kártya esetén prompt jelenik meg. Helyes OTP (`123456`) esetén sikeres fizetés; hibás OTP esetén megszakad.
* **TC-SF-14 (Számlázási PO Szám Validáció):** Vállalati számlás fizetésnél üres vagy 5 karakternél rövidebb PO szám esetén validációs hiba.

---

#### 👤 2. Modul: RBAC Jogosultságkezelés & Bejelentkezés (6 teszt)
* **TC-RBAC-01 (Actor Váltás - Dan Tester / USER):** Átváltás normál felhasználóra ➔ fejléc badge frissül, űrlap email címe automatikusan beáll.
* **TC-RBAC-02 (Felfüggesztett Felhasználó - BLOCKED):** `suspended.user@malicious.com` szerepkörben rendelés indítása ➔ 403 Forbidden alert, rendelés tiltva.
* **TC-RBAC-03 (Bejelentkezési Form - Email Szintaxis):** `@` nélküli email cím megadása a modálban ➔ validációs hiba.
* **TC-RBAC-04 (Bejelentkezési Form - Jelszó Házirend):** < 8 karakter, vagy hiányzó nagybetű/szám ➔ Password Policy Violation hiba.
* **TC-RBAC-05 (Admin Jogosultságok):** Tamás Admin aktív szerepkörben az Order Management táblázatban megjelennek a `Refund` és `Del` (törlés) gombok.
* **TC-RBAC-06 (Junior QA Jogosultságok):** Junior QA szerepkörben az admin-specifikus gombok rejtve maradnak (Read-Only biztonság).

---

#### 📦 3. Modul: Order Management & Állapotgép (10 teszt)
* **TC-OM-01 (Dinamikus Keresés):** Keresés Order ID-re, felhasználói emailre és terméknévre ➔ a táblázat valós időben csak az egyező sorokat mutatja.
* **TC-OM-02 (Státusz Szűrés):** Státusz dropdown tesztelése minden értékre (`PENDING`, `PAID`, `PROVISIONING`, `COMPLETED`, `CANCELLED`, `REFUNDED`).
* **TC-OM-03 (Oszlopok Rendezése):** Rendezés ellenőrzése: ID növekvő/csökkenő és Végösszeg növekvő/csökkenő szerint.
* **TC-OM-04 (Állapotátmenet - PENDING ➔ PAID):** `Pay` gombra kattintva a státusz `PAID`-re vált, és megjelenik a `Provision` gomb.
* **TC-OM-05 (Állapotátmenet - PENDING ➔ CANCELLED):** `Cancel` gombra kattintva a státusz `CANCELLED`-re vált, a sor lezárul (`Closed`).
* **TC-OM-06 (Teljes Életciklus - PAID ➔ PROVISIONING ➔ COMPLETED):** `Provision` kattintás után `PROVISIONING`, majd `Complete` kattintás után `COMPLETED` állapot elérése.
* **TC-OM-07 (Visszatérítés RBAC Védelem):** Normál felhasználóként vagy Junior QA-ként nincs Refund gomb. Adminisztrátorként a `Refund` gomb megnyomásával a rendelés `REFUNDED` státuszba kerül.
* **TC-OM-08 (Végállapot Integritás):** Törölt (`CANCELLED`) vagy visszatérített (`REFUNDED`) állapotból nem engedélyezett további tranzakció.
* **TC-OM-09 (Lapozó Működése - Pagination):** 5-nél több rendelés esetén a `Next` és `Prev` gombok helyesen léptetik az oldalakat, a "Showing X to Y" szöveg szinkronban marad.
* **TC-OM-10 (CSV Export Adatkonzisztencia):** `Export CSV` gombra kattintva a letöltött fájl fejlécet és a memóriában lévő rendelések pontos adatait tartalmazza.

---

#### 🎯 4. Modul: Aszinkron & Interaktív DOM Lab (7 teszt)
* **TC-LAB-01 (Debounced Kereső - 300ms Késleltetés):** Gépelés után megjelenik a "Searching... ⏳" spinner, 300ms után leáll és megjeleníti a találati listát.
* **TC-LAB-02 (Ephemeral Toast Értesítés):** Zöld/Piros Toast kiváltása. Ellenőrzés: 3.5 másodpercen belül látható, majd auto-dismiss után eltűnik a DOM-ból; az `x` gombbal azonnal bezárható.
* **TC-LAB-03 (Akadálymentes Terms Modális Ablak):** Modál megnyitása, fókusz ellenőrzése, zárás `ESC` billentyűvel és az "I Accept Terms" gombbal.
* **TC-LAB-04 (Fájlfeltöltés - Érvényes Ág):** Érvényes `.pdf` vagy `.png` fájl feltöltése (< 2MB) ➔ zöld sikerüzenet mérettel és névvel.
* **TC-LAB-05 (Fájlfeltöltés - Mérethatár Negatív Ág):** 2MB-nál nagyobb fájl feltöltése ➔ `Error 413: File size exceeds 2MB limit`.
* **TC-LAB-06 (Fájlfeltöltés - Nem Támogatott Formátum):** `.txt` vagy `.exe` fájl feltöltése ➔ `Error 415: Unsupported media type`.
* **TC-LAB-07 (Resilient DOM vs Fragile Rebuild):** "Trigger DOM Rebuild" gomb megnyomása után az osztályok megváltoznak, de a web-first `getByTestId('clean-submit-btn')` továbbra is hibátlanul működik.

---

#### ⚡ 5. Modul: REST API Swagger Integráció (5 teszt)
* **TC-API-01 (`POST /api/v1/auth/login` Hitelesítés):** Érvényes bejelentkezés ➔ 200 OK + JWT Bearer token; hibás jelszó ➔ 401 Unauthorized; blokkolt fiók ➔ 403 Forbidden.
* **TC-API-02 (`GET /api/v1/orders` Hozzáférés-védelem):** Token nélkül `401 Unauthorized`, aktív szerepkörrel `200 OK` a rendelések listájával.
* **TC-API-03 (`POST /api/v1/orders` Idempotencia & Készlet):** Új rendelés létrehozása `201 Created`. Ismételt kérés ugyanazzal az `Idempotency-Key`-jel ➔ `409 Conflict`. Készlet feletti kérés ➔ `422 Unprocessable Entity`.
* **TC-API-04 (`POST /api/v1/coupons/validate` Szerződés):** Nem létező kupon ➔ `404 Not Found`; lejárt kupon ➔ `410 Gone`; limit alatti kosár ➔ `422 Unprocessable Entity`.
* **TC-API-05 (`DELETE /api/v1/orders/{id}` Admin Törlés):** Nem admin token ➔ `403 Forbidden`; admin token ➔ `200 OK`, a rendelés törlődik a memóriából.

---

#### 🗄️ 6. Modul: Adatintegritás, SQL & Tréner Szimuláció (4 teszt)
* **TC-INT-01 (SQL Workbench - Lekérdezések):** `SELECT * FROM orders` és `INNER JOIN users` futtatása ➔ helyes táblázatos megjelenítés, rekordszám egyezőség.
* **TC-INT-02 (SQL Workbench - UI Szinkronizáció):** `UPDATE orders SET status = 'REFUNDED' WHERE id = 101` lefutása után a Storefront és Order Management felületen azonnal frissül a státusz.
* **TC-INT-03 (Audit Naplózás Konzisztencia):** Minden rendelés létrehozása és státuszváltása bejegyzést hoz létre az `audit_logs` táblában az aktív actor email címével.
* **TC-INT-04 (Tréner UI v2 Változás Követése):** `Simulate UI Breaking Changes (v2 Mode)` bekapcsolásakor a checkout gomb szövege és testid-je megváltozik, igazolva a POM absztrakció szükségességét.

---

## 🎯 4. Következtetés & Következő Lépések

Ez a **Page Object Model felépítés** és az **50 pontos tesztterv** biztosítja az alkalmazás 100%-os lefedettségét anélkül, hogy törékeny vagy feleslegesen duplikált tesztek születnének. 

A medior manuális tesztelői megközelítés garantálja, hogy:
1. Az üzleti szabályok (B2B ÁFA, kuponok, készlet, állapotgép) szigorúan validáltak.
2. A peremfeltételek és negatív ágak (kártya elutasítás, 3DS, hibás formátumok, jogosultságok) sem maradnak fedetlenül.
3. A Page Object réteg teljesen elválasztja az üzleti logikát a lokátoroktól, asserciók nélkül.
