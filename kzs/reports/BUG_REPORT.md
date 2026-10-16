# Astron QA Lab - Feltárt Hibák Katalógusa és Jelentés (kzs Modul)
### TestAcademy E2E QA Lab v2026 | Környezet: https://testacademy.hu/qa-lab/e2e-app

Ez a dokumentum az automatizált tesztelés és a feltáró (exploratory) tesztelés során azonosított mind a 20 valós hibát és sérülékenységet tartalmazza strukturált formában.

HTML Riport: [kzs/reports/exploratory-bug-report.html](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/reports/exploratory-bug-report.html)

---

## Összesítő Mutatók (KPI)

- **Összes feltárt hiba:** 20
- **Funkcionális hibák:** 13
- **Biztonsági (OWASP) & Megfelelőségi hibák:** 7
- **Súlyosság szerinti bontás:**
  - Kritikus (Critical): 4
  - Magas (High): 8
  - Közepes (Medium): 6
  - Alacsony (Low): 2

---

## 1. Funkcionális Hibák (13 db)

| ID | Hiba Megnevezése | Súlyosság | Érintett Terület | Várt vs. Tényleges Működés |
|---|---|---|---|---|
| **DEF-01** | EU VAT Formátum Regex Szintaxishiba | Kritikus | Storefront / B2B ÁFA | Várt: B2B 0% ÁFA mentesítés. Tényleges: Hibás regex (`d{8,9}`) miatt elutasítja a valós EU adószámokat (`DE987654321`). |
| **DEF-02** | SQL Workbench SELECT és UPDATE Parser Hiba | Kritikus | Database Console | Várt: Lekérdezések lefutása. Tényleges: Hibás regex (`/^SELECTs+/i`) miatt szintaxishibát dob. |
| **DEF-03** | SQL Audit Napló Lekérdezés Blokkolódása | Magas | Database Console / Audit | Várt: Audit sorok megjelenítése. Tényleges: `/FROMs+audit_logs/i` elgépelés miatt nem találja a táblát. |
| **DEF-04** | Terms Modál Háttérkattintásos Bezárásának Hiánya | Közepes | UI / Modális dialógus | Várt: A háttérre (backdrop) kattintva bezáródik. Tényleges: Nincs click eseményfigyelő az overlay elemen. |
| **DEF-05** | Nemzetközi Rendelések ÁFA Kulcsának Torzulása | Magas | Számítás / Adatintegritás | Várt: DE 19%, US 0% tárolása. Tényleges: A háttérben minden külföldi rendelésre fix 27% mentődik (`vat: isVatExempt ? 0 : 27`). |
| **DEF-06** | Százalékos Kupon Kedvezmény Numerikus Torzulása | Magas | Számítás / Adatintegritás | Várt: 25%-os kuponnál $122.50 kedvezmény rögzítése. Tényleges: Literális 25 érték kerül mentésre (`discount: activeCoupon.value`). |
| **DEF-07** | Kupon Minimum Kosárérték Kijátszása Termékváltással | Magas | Kosár / Kupon érvényesség | Várt: Kupon törlése olcsóbb terméknél. Tényleges: $490-ről $250-re váltva a SAVE100 ($300 min limit) aktív marad ($150 végösszeg). |
| **DEF-08** | Negatív Mennyiség miatti Készletnövekedés | Kritikus | Kosár / Raktárkészlet | Várt: Validációs hiba, rendelés tiltása. Tényleges: -5 db megadásakor -$1250 számla jön létre és a készlet 15-ről 20-ra nő. |
| **DEF-09** | Készlet Visszavételezés Elmaradása Lemondáskor | Magas | Rendelés Életciklus / ERP | Várt: Cancelled / Refunded státusznál készlet visszatöltése. Tényleges: Készletszivárgás, a levont darabszám nem kerül vissza. |
| **DEF-10** | RBAC Szerepkörváltás Utáni Árva Admin Gombok | Közepes | Jogosultságkezelés / UI | Várt: Junior QA-ra váltáskor Delete/Refund gombok azonnali eltűnése. Tényleges: Gombok láthatóak maradnak a felületen. |
| **DEF-11** | Storefront Termékkártya Készletszámláló DOM Staleness | Alacsony | UI Adatszinkronizáció | Várt: Vásárlás után kártya készlet azonnal 13-ra vált. Tényleges: Kártya szöveg elavult marad (15 units) újratöltésig. |
| **DEF-12** | Üres Darabszám Mező Csendes Kerekítése | Közepes | Bemeneti Mező Validáció | Várt: Kötelező mező hibajelzés. Tényleges: Üres mezővel leadva csendben 1 db-os rendelést hoz létre $250-ért (`|| 1` fallback). |
| **DEF-13** | Fájlfeltöltés Kis- és Nagybetű Érzékenység | Közepes | Fájlfeltöltés / Validáció | Várt: .PDF kiterjesztés elfogadása. Tényleges: 415 Unsupported Media Type hibával elutasítja a nagybetűs kiterjesztést. |

---

## 2. Biztonsági és Megfelelőségi Sérülékenységek (7 db)

| ID | Hiba / Sérülékenység Megnevezése | Súlyosság | Kategória / Szabvány | Kockázat és Hatás |
|---|---|---|---|---|
| **DEF-14** | Tárolt Cross-Site Scripting (Stored XSS) | Kritikus | OWASP A03 / CWE-79 | Vásárlói email mező szűretlen innerHTML kiírása az előzményekben és ERP-ben, tetszőleges JS futtatható. |
| **DEF-15** | CSV Formula Injection (Képletbefecskendezés) | Magas | CWE-1236 | `=SUM(...)` vagy `=cmd` karakterláncok szűretlen CSV exportja, Excel megnyitáskor kódfuttatás lehetséges. |
| **DEF-16** | API Ármanipuláció (Price Tampering) | Magas | CWE-20 | POST /api/orders törzsben beküldött `{ price: 1 }` mezőt a backend ellenőrzés nélkül elfogadja. |
| **DEF-17** | Hiányzó Hitelesítés PATCH Végponton | Magas | OWASP A01:2021 | Bárki token nélkül módosíthatja bármely rendelés státuszát a `/api/orders/:id/status` végponton. |
| **DEF-18** | Törlési Műveletek Audit Naplózásának Hiánya | Közepes | OWASP A09 / Megfelelőség | Végleges törléskor nem keletkezik bejegyzés az `audit_logs` táblában, az esemény utólag nyomozhatatlan. |
| **DEF-19** | Duplikált Rendelés Versenyhelyzet (Race Condition) | Közepes | Párhuzamosság / UX | A megrendelés gomb nincs letiltva a feldolgozás alatt, dupla kattintással kétszeres terhelés és rendelés jön létre. |
| **DEF-20** | Admin Jogosultság Részleges E-mail Egyezés Alapján | Alacsony | RBAC Tervezési Hiba | Bármely email cím, ami tartalmazza az "admin" szót (`badadmin@gmail.com`), automatikusan teljes Admin jogkört kap. |
