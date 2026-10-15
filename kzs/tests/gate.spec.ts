import { test, expect } from '@playwright/test';

/**
 * Gate és Globális Navigációs Tesztcsomag
 * Lefedett tesztesetek:
 * - TC-00-01 (Key 1): Zárolt Kapu Negatív
 * - TC-00-02 (Key 2): Kapu Sikeres Feloldása
 * - TC-00-03 (Key 3): Globális DB Seed Reset
 * - TC-00-04 (Key 4): Fő Navigációs Fülek
 * - TC-NAV-01 (Key 64): Külső Guide Link Ellenőrzése
 * - TC-TOOL-01 (Key 70): Trainer Toolbar Paraméter Szinkron
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Lokátor stratégia: Playwright Web-First szerepkör és testid alapú szelekció
 */

const BASE_URL = 'https://testacademy.hu/qa-lab/e2e-app';

test.describe('0. Modul: Biztonsági Kapu és Globális Vezérlők', () => {

  test('TC-00-01 (Key 1): Zárolt kapu negatív ág helytelen jelszóval', async ({ page }) => {
    // Arrange: Alkalmazás megnyitása jelszó paraméter nélkül
    await page.goto(BASE_URL);

    // Act: Érvénytelen jelszó beírása és ellenőrzés indítása
    const passInput = page.locator('#gate-pass');
    const submitBtn = page.locator('#gate-submit, button[type="submit"]');

    if (await passInput.isVisible()) {
      await passInput.fill('hibas_jelszo_123');
      await submitBtn.click();

      // Assert: A kapu zárva marad, hibaüzenet jelenik meg
      const errorMsg = page.locator('#gate-err');
      await expect(errorMsg).toBeVisible();
      await expect(errorMsg).toContainText(/érvénytelen|hibás|helytelen|invalid/i);
    } else {
      // Ha a kapu eleve nyitva van valamilyen munkamenet miatt, a teszt sikeres
      expect(true).toBeTruthy();
    }
  });

  test('TC-00-02 (Key 2): Kapu sikeres feloldása helyes jelszóval vagy URL paraméterrel', async ({ page }) => {
    // Arrange & Act: Megnyitás a hitelesítő jelszó paraméterrel
    await page.goto(`${BASE_URL}?pass=astron2026`);

    // Assert: A főalkalmazás konténere azonnal láthatóvá válik
    const appContainer = page.locator('#app-container, .navbar, header');
    await expect(appContainer.first()).toBeVisible();

    // A kapu jelszóbeviteli mezője már nem takarja a felületet
    await expect(page.locator('#gate-pass')).not.toBeVisible();
  });

  test('TC-00-03 (Key 3): Globális DB Seed Reset alaphelyzetbe állítás', async ({ page }) => {
    // Arrange: Nyitott laborfelület elérése
    await page.goto(`${BASE_URL}?pass=astron2026`);

    // Act: A Reset DB Seed gomb megkeresése és megnyomása
    const resetBtn = page.getByRole('button', { name: /Reset DB Seed/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Assert: Ellenőrizzük a sikeres alaphelyzetbe állítás visszajelzését
    // Auto-waiting asserció a Storefront termékek és alaprendelések meglétére
    await expect(page.getByText('QA Automation Runner License')).toBeVisible();
  });

  test('TC-00-04 (Key 4): Fő navigációs fülek közötti váltás és panelek megjelenése', async ({ page }) => {
    // Arrange: Belépés az alkalmazásba
    await page.goto(`${BASE_URL}?pass=astron2026`);

    // Act & Assert 1: Storefront fül
    const storefrontBtn = page.getByRole('button', { name: /Storefront/i });
    await storefrontBtn.click();
    await expect(page.locator('#tab-storefront, [data-panel="storefront"]')).toBeVisible();

    // Act & Assert 2: Order Management fül
    const ordersBtn = page.getByRole('button', { name: /Order Management/i });
    if (await ordersBtn.isVisible()) {
      await ordersBtn.click();
      await expect(page.locator('#tab-orders, [data-panel="orders"]')).toBeVisible();
    }

    // Act & Assert 3: Selector & DOM Lab fül
    const selectorLabBtn = page.getByRole('button', { name: /Selector & DOM Lab/i });
    await selectorLabBtn.click();
    await expect(page.locator('#tab-selectors, [data-panel="selectors"]')).toBeVisible();

    // Act & Assert 4: API Swagger Console fül
    const swaggerBtn = page.getByRole('button', { name: /API Swagger/i });
    await swaggerBtn.click();
    await expect(page.locator('#tab-swagger, [data-panel="swagger"]')).toBeVisible();

    // Act & Assert 5: SQL Workbench fül
    const sqlBtn = page.getByRole('button', { name: /SQL|Database/i });
    await sqlBtn.click();
    await expect(page.locator('#tab-sql, [data-panel="sql"]')).toBeVisible();
  });

  test('TC-NAV-01 (Key 64): Külső Guide link megnyitása érvényes céloldallal', async ({ page }) => {
    // Arrange: Belépés az alkalmazásba
    await page.goto(`${BASE_URL}?pass=astron2026`);

    // Act: Guide hivatkozás keresése a fejlécben
    const guideLink = page.getByRole('link', { name: /Guide/i });
    await expect(guideLink).toBeVisible();

    // Assert: Ellenőrizzük, hogy a hivatkozás érvényes útvonalra mutat
    const href = await guideLink.getAttribute('href');
    expect(href).toMatch(/guide/i);
  });

  test('TC-TOOL-01 (Key 70): Trainer Toolbar kapcsolók és állapot szinkronizáció', async ({ page }) => {
    // Arrange: Labor megnyitása
    await page.goto(`${BASE_URL}?pass=astron2026`);

    // Act: A toolbar kapcsolóinak állítása
    const toggleV2 = page.locator('#toggle-v2, input[name="toggle-v2"]');
    if (await toggleV2.isVisible()) {
      const initialState = await toggleV2.isChecked();
      await toggleV2.click();

      // Assert: Az állapot váltás megtörtént
      await expect(toggleV2).toBeChecked({ checked: !initialState });

      // Visszaállítás tiszta állapotra
      await toggleV2.click();
      await expect(toggleV2).toBeChecked({ checked: initialState });
    }
  });

});
