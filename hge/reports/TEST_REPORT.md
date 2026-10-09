# 1. Test Report
*Generated on 09.10.2026*

| Type | Total | Not Executed | In Progress | Pass | Fail | Blocked | OK with comment | Partially OK |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Test cases** | **50** | 0 | 0 | **45** | **5** | 0 | 0 | 0 |
| **Test steps** | **182** | 0 | 0 | **168** | **14** | 0 | 0 | 0 |

---

## 📊 Test Result Distribution

```mermaid
pie title Test Result
    "Pass (45)" : 45
    "Fail (5)" : 5
```

- **Pass Rate:** 90.0% (45 / 50 sikeres)
- **Fail Rate:** 10.0% (5 / 50 elbukott a valós alkalmazásbeli hibák miatt)
- **Blocked / In Progress / Not Executed:** 0

---

## 📋 Modulonkénti Bontás (Suite Breakdown)

| Tesztfájl | Témakör | Összesen | Pass | Fail | Státusz |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `00-gate-and-global.spec.ts` | Biztonsági Kapu, DB Reset, Tab Navigáció | 4 | 4 | 0 | **PASS (100%)** |
| `01-storefront-checkout.spec.ts` | Áruház, Árak, ÁFA, Kuponok, Kártyák, 3DS, PO | 14 | 12 | 2 | **FAIL (85.7%)** |
| `02-rbac-and-auth.spec.ts` | RBAC Actor Váltó, 403 Tiltás, Form Validációk | 6 | 6 | 0 | **PASS (100%)** |
| `03-order-management.spec.ts` | Keresés, Szűrés, Rendezés, Állapotgép, CSV | 10 | 10 | 0 | **PASS (100%)** |
| `04-selector-lab.spec.ts` | 300ms Debounce, 3.5s Toast, Modal, Fájlfeltöltés | 7 | 7 | 0 | **PASS (100%)** |
| `05-swagger-api.spec.ts` | REST API Auth, Idempotencia, Készlet, Kuponok | 5 | 5 | 0 | **PASS (100%)** |
| `06-sql-and-integrity.spec.ts` | SQL Lekérdezések, UPDATE, Audit Log, v2 Mód | 4 | 1 | 3 | **FAIL (25.0%)** |
| **Összesen** | | **50** | **45** | **5** | **90.0%** |

---

# 2. Bug / Defect Report (Feltárt Hibák)

A tesztek szándékosan **módosítás és kerülőutak nélkül** futottak le a specifikáció ellen, így az alábbi **5 valós szoftverhibát** azonosítottuk az alkalmazásban:

### 🔴 BUG-001: Storefront készletszámláló DOM eleme nem frissül vásárlás után
- **Súlyosság:** Medium (S3)
- **Érintett teszt:** `01-storefront-checkout.spec.ts › TC-SF-01`
- **Leírás:** Sikeres megrendelés után a memóriában lefut a készletlevonás (`prod.stock -= qty`), de a kártya felületi felirata (`#prod-stock-1`) nem renderelődik újra, továbbra is "In Stock: 15 units" marad.
- **Javítási javaslat:** A `handleUiCheckout()` függvényben meg kell hívni a termékkártya DOM elemének szövegfrissítését.

### 🔴 BUG-002: EU VAT B2B mentesítés érvényes adószámmal is elbukik (RegEx hiba)
- **Súlyosság:** Critical / High (S1)
- **Érintett teszt:** `01-storefront-checkout.spec.ts › TC-SF-07`
- **Leírás:** Bármilyen helyes EU adószám (pl. `HU12345678`) beírásakor a rendszer "❌ Invalid EU VAT syntax" hibát jelez. A forráskódban a reguláris kifejezés elírásra került (`/^(HU|DE|AT|FR)d{8,9}$/` - `\d` helyett `d`), miközben a mező értéke nagybetűssé válik, így egyetlen adószám sem tud érvényesülni.
- **Javítási javaslat:** A reguláris kifejezést `/^(HU|DE|AT|FR)\d{8,9}$/`-re kell javítani a `validateVatNumber()` metódusban.

### 🔴 BUG-003: SQL Workbench SELECT feldolgozó reguláris kifejezés szintaktikai hiba
- **Súlyosság:** High (S2)
- **Érintett teszt:** `06-sql-and-integrity.spec.ts › TC-INT-01`
- **Leírás:** A terminálba írt `SELECT * FROM orders;` lekérdezések nem illeszkednek a regex feldolgozóra, mert a kódban `/^SELECTs+/i` szerepel (`\s` helyett `s`), így mindig az alapértelmezett "Query executed against in-memory tables" ágra fut, táblázat nem jelenik meg.
- **Javítási javaslat:** A regex illesztést `/^SELECT\s+/i`-re kell cserélni.

### 🔴 BUG-004: SQL Workbench UPDATE parancs nem hajtódik végre
- **Súlyosság:** High (S2)
- **Érintett teszt:** `06-sql-and-integrity.spec.ts › TC-INT-02`
- **Leírás:** A "Force Refund (ID 101)" chip által beillesztett `UPDATE orders SET status = 'REFUNDED' WHERE id = 101;` nem módosítja a rendelést, mert a feldolgozó regex itt is elírt: `/^UPDATEs+orders/i`.
- **Javítási javaslat:** A regexet `/^UPDATE\s+orders/i`-re kell javítani az `executeSqlQuery()` metódusban.

### 🔴 BUG-005: SQL Workbench "Audit Trail" lekérdezés nem listázza az audit naplókat
- **Súlyosság:** Medium / High (S2)
- **Érintett teszt:** `06-sql-and-integrity.spec.ts › TC-INT-03`
- **Leírás:** A rendelések létrehozásakor keletkező naplóbejegyzések nem kérdezhetők le a terminálban, mert a `FROM audit_logs` illesztő regex hiányos backslasht tartalmaz (`/FROMs+audit_logs/`).
- **Javítási javaslat:** `/FROM\s+audit_logs/i` illesztést kell használni.
