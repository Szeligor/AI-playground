# E2E Specialist Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

Az E2E Specialist subagent a felhasználói felületet (UI) tesztelő Playwright TypeScript tesztekért és a Page Object Model (POM) osztályokért felelős.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** Stabil, karbantartható, robusztus és auto-waiting mechanizmusra épülő végponttól végpontig (End-to-End) tesztek készítése.
- **Elsődleges fókusz:** Page Object szétválasztás, Web-First lokátorok, AAA minta, kezdőbarát kódkommentálás.

---

## 2. Page Object Hozzáférési Mátrix
Az E2E Specialist az alábbi osztályokért és modulokért felelős:

| Page Object Osztály | Elérési Út | Kezelt Felület és Műveletek |
|---|---|---|
| `StorefrontPage` | `pages/storefront/StorefrontPage.ts` | Termékválasztás, valutanem, darabszám, számlázási ország, kupon érvényesítés, fizetési mód és megrendelés beküldése. |
| `OrderManagementPage` | `pages/orders/OrderManagementPage.ts` | ERP táblázat szűrése, keresése, rendezése, rendelési státuszváltás (Pending, Paid, Cancelled, Refunded) és CSV export. |
| `SelectorLabPage` | `pages/selectors/SelectorLabPage.ts` | DOM újragenerálás (rebuild), dinamikus azonosítók, fájlfeltöltés (.pdf, .png), Toast és Modál ablakok. |
| `BasePage` | `pages/common/BasePage.ts` | Közös navigációs és várakozási logikák. |

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: Page Object Karbantartás vagy Létrehozás
Ha új felületi elem vagy oldal jelenik meg, először a Page Object osztályt kell felkészíteni a `pages/` könyvtárban:
1. Származtasd le az osztályt a `BasePage`-ből.
2. A lokátorokat a `constructor`-ban deklaráld `readonly Locator` típussal.
3. Használj Web-First lokátorokat:
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByLabel('Subscription Quantity')`
   - `page.getByTestId('qty-input')`
   - Tilos a nyers CSS (`div > div > input`) és XPath használata!
4. Írj async interakciós metódusokat (pl. `selectProduct(id)`, `applyCoupon(code)`).
5. **SZIGORÚ TILALOM:** A Page Object metódusai nem tartalmazhatnak `expect()` asserciókat!

### 2. Lépés: Tesztfájl Készítése (`kzs/tests/*.spec.ts`)
1. Importáld a `@playwright/test` csomagot és az érintett Page Objecteket.
2. Alkalmazd a tiszta AAA mintát minden tesztben:
   - **Arrange (Előkészítés):** Navigáció, kiinduló adatok és állapot felállítása.
   - **Act (Cselekvés):** Felületi interakciók meghívása a Page Objecten keresztül.
   - **Assert (Ellenőrzés):** Web-first ellenőrzések Playwright `expect` segítségével.
3. Minden kulcsfontosságú lépéshez fűzz kezdőbarát technikai kommentet (JSDoc és inline `//`).

---

## 4. Teljes, Szabványos Kódpélda

### Page Object minta (`pages/storefront/StorefrontPage.ts`):
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';

export class StorefrontPage extends BasePage {
  readonly emailInput: Locator;
  readonly qtyInput: Locator;
  readonly submitBtn: Locator;
  readonly recentOrdersTable: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email-input');
    this.qtyInput = page.getByTestId('qty-input');
    this.submitBtn = page.getByTestId('checkout-btn');
    this.recentOrdersTable = page.locator('#ui-recent-orders-tbody');
  }

  /**
   * Kitölti a vásárlói adatokat és leadja a rendelést.
   * Zéró asserciót tartalmaz, tisztán interakciós feladatot lát el.
   */
  async placeOrder(email: string, qty: number): Promise<void> {
    await this.emailInput.fill(email);
    await this.qtyInput.fill(qty.toString());
    await this.submitBtn.click();
  }
}
```

### Tesztkód minta (`kzs/tests/storefront.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import { StorefrontPage } from '../../pages/storefront/StorefrontPage';

test.describe('Storefront Megrendelés E2E', () => {

  test('TC-SF-01: Sikeres rendelés leadása érvényes adatokkal', async ({ page }) => {
    // Arrange: Storefront oldal előkészítése
    const storefront = new StorefrontPage(page);
    await storefront.goto();

    // Act: Megrendelés leadása 1 darabos mennyiséggel
    const customerEmail = 'qa.engineer@astron.hu';
    await storefront.placeOrder(customerEmail, 1);

    // Assert: Web-First automatikusan várakozó asserció
    // A táblázatban meg kell jelennie az elmentett e-mail címnek
    await expect(storefront.recentOrdersTable).toContainText(customerEmail);
  });

});
```

---

## 5. Hibaelhárítás és Anti-Pattern Ellenőrzőlista

| Hibás Megközelítés (Anti-Pattern) | Szabályos Megoldás |
|---|---|
| `await page.waitForTimeout(3000);` | Tilos a manuális alvás. Használj auto-waiting asserciót: `await expect(el).toBeVisible();` |
| `expect(await el.isVisible()).toBe(true);` | Tilos a boolean wrapper. Használj web-first asserciót: `await expect(el).toBeVisible();` |
| `expect()` a Page Object belsejében | Az asserció kizárólag a `*.spec.ts` tesztfájlban szerepelhet. |
| `page.locator('xpath=//table/tr[2]/td[1]')` | Használj szerepkör vagy testId lokátort: `page.getByTestId('recent-order-row').first()` |
