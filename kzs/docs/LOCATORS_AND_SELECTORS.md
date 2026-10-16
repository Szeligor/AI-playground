# Szelektorok és Lokátorok Katalógusa (LOCATORS_AND_SELECTORS.md)
### Astron Informatikai Kft. | Playwright QA Automation Framework | kzs Modul

Ez a dokumentum az alkalmazás (`https://testacademy.hu/qa-lab/e2e-app`) összes felületi elemének szabványos Web-First lokátorát, szelektor-hierarchiáját és a `kzs/pages/` Page Object implementációkat foglalja össze.

---

## 1. Lokátor Stratégia és Prioritási Szabályzat

A Playwright hivatalos ajánlása és a keretrendszer szabályzata alapján az alábbi prioritási sorrend érvényes:

1. **Szerepkör és hozzáférhetőség (`page.getByRole(...)`):** A felhasználó szemszögéből azonosítja az elemet (pl. gomb, beviteli mező, táblázat).
2. **Címke szerinti azonosítás (`page.getByLabel(...)`):** Űrlapmezők azonosítására a kapcsolódó label alapján.
3. **Tesztazonosító (`page.getByTestId(...)`):** `data-testid` attribútummal ellátott elemek stabil célzására.
4. **ID alapú lokátor (`page.locator('#element-id')`):** Egyedi HTML azonosítókhoz.
5. **SZIGORÚAN TILTOTT:** Törékeny CSS útvonalak (`div > div.col-md-4 > span:nth-child(2)`) és nyers XPath kifejezések.

---

## 2. Storefront & Checkout Nezet Lokátortáblája

A Page Object osztály: [`kzs/pages/StorefrontPage.ts`](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/pages/StorefrontPage.ts)

| Felületi Elem | Szerep / Funkció | Elsődleges Web-First Lokátor | Tartalék (Fallback) Szelektor |
|---|---|---|---|
| Termékkártyák | Termék választása (1, 2, 3) | `page.getByTestId('product-1')` | `page.locator('.product-card-option').nth(0)` |
| Pénznem választó | USD, EUR, HUF | `page.getByTestId('currency-select')` | `page.locator('#currency-select')` |
| Vásárlói e-mail | E-mail cím bevitele | `page.getByTestId('email-input')` | `page.locator('#ui-email, #email-input')` |
| Darabszám | Mennyiség bevitele | `page.getByTestId('qty-input')` | `page.locator('#ui-qty, #qty-input')` |
| Célország | Adózási ország (US, DE, HU) | `page.getByTestId('country-select')` | `page.locator('#ui-country')` |
| EU VAT adószám | B2B adószám mező | `page.getByTestId('vat-input')` | `page.locator('#ui-vat-number')` |
| VAT ellenőrzés | Verify VAT gomb | `page.getByTestId('btn-validate-vat')` | `page.locator('button:has-text("Verify VAT")')` |
| VAT visszajelzés | Zöld/Piros szövegdoboz | `page.locator('#vat-feedback')` | `#vat-feedback` |
| Kupon kód | Kuponkód bevitele | `page.getByTestId('coupon-input')` | `page.locator('#ui-coupon-code')` |
| Kupon gomb | Apply gomb | `page.getByTestId('coupon-btn')` | `page.locator('#btn-apply-coupon')` |
| Kupon visszajelzés | Sikeres/Hibás üzenet | `page.getByTestId('coupon-feedback')`| `page.locator('#coupon-feedback')` |
| Kártya rádiógomb | Bankkártyás fizetési mód | `page.locator('#pm-card')` | `input[value="card"]` |
| Számla rádiógomb | PO számlás fizetési mód | `page.locator('#pm-invoice')` | `input[value="invoice"]` |
| Kártyaszám | 16 jegyű kártyaszám | `page.getByTestId('card-number-input')`| `page.locator('#card-num, #ui-card-number')` |
| PO azonosító | Vállalati PO szám | `page.getByTestId('po-number-input')` | `page.locator('#ui-po-number, #po-number')` |
| Megrendelés gomb | Checkout beküldése | `page.getByTestId('checkout-btn')` | `page.locator('#btn-ui-submit')` |
| Kosár részösszeg | Végösszeg kijelzés | `page.locator('#ui-sum-total')` | `.cart-total` |
| Rendelési előzmények | Legutóbbi rendelések tábla | `page.locator('#ui-recent-orders-tbody')`| `#ui-recent-orders-tbody tr` |

---

## 3. Order Management ERP Nezet Lokátortáblája

A Page Object osztály: [`kzs/pages/OrderManagementPage.ts`](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/pages/OrderManagementPage.ts)

| Felületi Elem | Szerep / Funkció | Elsődleges Web-First Lokátor | Tartalék Szelektor |
|---|---|---|---|
| Keresőmező | Valós idejű szűrés | `page.getByTestId('order-search-input')` | `page.locator('#mgmt-search')` |
| Státusz szűrő | Dropdown (ALL, PENDING...) | `page.getByTestId('order-status-filter')` | `page.locator('#mgmt-status-filter')` |
| Rendezés | Dropdown (id, total asc/desc)| `page.getByTestId('order-sort-select')` | `page.locator('#mgmt-sort')` |
| Rendelési táblázat | ERP sorok konténere | `page.getByTestId('mgmt-orders-table')` | `page.locator('#mgmt-orders-tbody')` |
| Rendelési sorok | Egyedi rendelési rekordok | `page.locator('tr[data-testid^="order-row-"]')` | `page.locator('#mgmt-orders-tbody tr')` |
| Státuszváltó select | Soronkénti állapotváltás | `row.locator('select.select-status')` | `row.locator('select')` |
| Törlés (Delete) | Adminisztrátori törlés | `row.locator('.btn-delete')` | `row.locator('button:has-text("Delete")')` |
| Visszatérítés (Refund)| Admin visszatérítés | `row.locator('.btn-refund')` | `row.locator('button:has-text("Refund")')` |
| Előző oldal lapozó | Lapozás vissza | `page.getByTestId('pagination-prev')` | `page.locator('#mgmt-btn-prev')` |
| Következő oldal | Lapozás előre | `page.getByTestId('pagination-next')` | `page.locator('#mgmt-btn-next')` |
| CSV Export gomb | Exportálás indítása | `page.getByTestId('export-orders-btn')` | `page.locator('#mgmt-btn-export')` |

---

## 4. DOM & Selectors Lab Nezet Lokátortáblája

A Page Object osztály: [`kzs/pages/SelectorLabPage.ts`](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/pages/SelectorLabPage.ts)

| Felületi Elem | Szerep / Funkció | Elsődleges Web-First Lokátor | Tartalék Szelektor |
|---|---|---|---|
| Rebuild DOM gomb | DOM újraépítés tesztelése | `page.getByRole('button', { name: /Trigger DOM Rebuild/i })` | `.btn-rebuild` |
| Fájlfeltöltő | Számlamelléklet csatolás | `page.locator('#lab-file-input')` | `input[type="file"]` |
| Feltöltés visszajelzés| Fájlnév és státusz | `page.locator('#file-upload-feedback')` | `#file-upload-feedback` |
| Modál nyitó gomb | Terms modál megnyitása | `page.getByTestId('btn-open-modal')` | `page.locator('#btn-open-modal')` |
| Terms Modál háttér | Overlay / Backdrop | `page.locator('#terms-modal')` | `.modal-overlay` |
| Hiba Toast gomb | Hiba Toast provokálása | `page.getByTestId('btn-trigger-err-toast')` | `.btn-trigger-toast` |
| Hiba Toast doboz | Megjelenő hiba értesítés | `page.locator('.toast-error')` | `.toast-box.error` |

---

## 5. SQL Workbench és Adatbázis Konzol Lokátortáblája

A Page Object osztály: [`kzs/pages/SqlConsolePage.ts`](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/pages/SqlConsolePage.ts)

| Felületi Elem | Szerep / Funkció | Elsődleges Web-First Lokátor | Tartalék Szelektor |
|---|---|---|---|
| SQL szerkesztő | Lekérdezés szövegmező | `page.locator('#sql-input')` | `textarea#sql-input` |
| Run Query gomb | Lekérdezés végrehajtása | `page.getByRole('button', { name: /Run Query/i })` | `#btn-run-sql` |
| All Orders chip | Gyorslekérdezés gomb | `page.getByRole('button', { name: 'All Orders' })` | `.sql-chip:has-text("All Orders")` |
| Audit Logs chip | Gyorslekérdezés gomb | `page.getByRole('button', { name: 'Audit Logs' })` | `.sql-chip:has-text("Audit Logs")` |
| Eredménytáblázat | Lekérdezés kimenete | `page.locator('#sql-results-container table')` | `#sql-results-container table` |

---

## 6. Használati Példa a Tesztekben

A Page Objectek a [`kzs/pages`](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/pages) modulból közvetlenül importálhatók:

```typescript
import { test, expect } from '@playwright/test';
import { StorefrontPage, OrderManagementPage } from '../pages';

test('Teljes vásárlási és ERP jóváhagyási folyamat', async ({ page }) => {
  // 1. Storefront fázis
  const storefront = new StorefrontPage(page);
  await storefront.goto();
  await storefront.selectProduct(2); // Pro termék
  await storefront.fillCustomerDetails('flow@astron.hu', 1, 'DE');
  await storefront.submitOrder();

  // Ellenőrzés: megrendelés létrejött
  await expect(storefront.recentOrdersTable).toContainText('flow@astron.hu');

  // 2. Order Management fázis
  const orders = new OrderManagementPage(page);
  await orders.switchTab('orders');
  await orders.search('flow@astron.hu');
  await expect(orders.orderRows.first()).toContainText('flow@astron.hu');
});
```
