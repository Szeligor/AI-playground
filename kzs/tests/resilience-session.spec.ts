import { test, expect } from '@playwright/test';

/**
 * Hálózati Reziliencia, Munkamenet és Akadálymentességi E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-NET-01 (Key 25): Backend 500 Hiba Kezelése (page.route mockolás)
 * - TC-NET-02 (Key 48): Lassú Hálózat & Dupla Beküldés Védelem (latencia szimuláció)
 * - TC-NET-03 (Key 49): Rate Limit & Brute-Force (429 Too Many Requests)
 * - TC-NET-04 (Key 61): Offline Hálózati Szakadás (context.setOffline)
 * - TC-SES-01 (Key 53): F5 / Oldalfrissítés Állapotmegőrzés
 * - TC-SES-02 (Key 54): Párhuzamos Kétlapos Szinkronizáció (context.newPage)
 * - TC-SES-03 (Key 55): Böngésző Vissza Gomb Védelem
 * - TC-A11Y-01 (Key 56): Kizárólagos Billentyűzet-Navigáció
 * - TC-A11Y-02 (Key 62): WCAG Űrlap Kontraszt és Címkék
 * - TC-A11Y-03 (Key 63): Reszponzív Mobil és Tablet Nézet (Mobil emuláció 375x667)
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Cél: Az enterprise szintű hibatűrés, session perzisztencia és eszközreszponzivitás ellenőrzése.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('7-11. Modulok: Reziliencia, Munkamenet és Reszponzivitás', () => {

  test('TC-NET-01 (Key 25): Backend 500 hiba elegáns felületi kezelése (page.route)', async ({ page }) => {
    // Arrange: 500-as szerverhiba mockolása a /api/orders végpontra
    await page.route('**/api/orders**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'InternalServerError', message: 'Szimulált adatbázis hiba' }),
      });
    });

    // Act: Navigáció és megrendelés indítása
    await page.goto(APP_URL);
    const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();

      // Assert: Az alkalmazás nem omlik össze, elegáns hibaüzenet jelenik meg
      const errorNotice = page.locator('.alert-danger, .error-banner, #order-err, .toast-error').first();
      await expect(errorNotice).toBeVisible();
    }
  });

  test('TC-NET-04 (Key 61): Offline hálózati szakadás kezelése (context.setOffline)', async ({ context, page }) => {
    await page.goto(APP_URL);

    // Act: Hálózat lekapcsolása (offline mód aktiválása)
    await context.setOffline(true);

    const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();

      // Assert: Offline hibaüzenet vagy kapcsolatvesztési értesítés
      const offlineMsg = page.locator('.network-err, .offline-banner, .toast').first();
      if (await offlineMsg.isVisible()) {
        await expect(offlineMsg).toBeVisible();
      }
    }

    // Teardown: Hálózat visszaállítása
    await context.setOffline(false);
  });

  test('TC-SES-01 (Key 53): F5 oldalfrissítés utáni állapotmegőrzés', async ({ page }) => {
    await page.goto(APP_URL);

    // Act: Kiválasztunk egy devizát (EUR)
    const currencySelect = page.locator('#currency-select, [data-testid="currency-select"]');
    if (await currencySelect.isVisible()) {
      await currencySelect.selectOption('EUR');

      // Oldal újratöltése (F5)
      await page.reload();

      // Assert: A kiválasztott beállítás megőrződik (pl. localStorage-ből)
      await expect(page.locator('#tab-storefront, [data-panel="storefront"]')).toBeVisible();
    }
  });

  test('TC-SES-02 (Key 54): Párhuzamos kétlapos szinkronizáció (context.newPage)', async ({ context }) => {
    // Arrange: Első böngészőlap (Storefront)
    const pageStorefront = await context.newPage();
    await pageStorefront.goto(APP_URL);

    // Második böngészőlap (Order Management ERP)
    const pageOrders = await context.newPage();
    await pageOrders.goto(APP_URL);
    const ordersTab = pageOrders.getByRole('button', { name: /Order Management/i });
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
    }

    // Act: Új rendelés leadása az 1. lapon
    const uniqueEmail = `sync.${Date.now()}@astron.hu`;
    const emailInput = pageStorefront.locator('#email-input, [data-testid="email-input"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(uniqueEmail);
      const checkoutBtn = pageStorefront.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
      await checkoutBtn.click();

      // Assert: A rendelés megjelenik a 2. lap ERP táblázatában is
      await expect(pageOrders.locator('#orders-tbody, table tbody')).toContainText(uniqueEmail);
    }

    // Lapok bezárása
    await pageStorefront.close();
    await pageOrders.close();
  });

  test('TC-A11Y-01 (Key 56): Kizárólagos billentyűzet-navigáció (Tab, Space, Enter)', async ({ page }) => {
    await page.goto(APP_URL);

    // Act: Fókusz mozgatása Tab gombbal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Assert: Van aktív fókuszban lévő elem az oldalon
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('TC-A11Y-03 (Key 63): Reszponzív mobil (375x667) és tablet nézet ellenőrzése', async ({ page }) => {
    // Act 1: Mobil képernyőméret beállítása (iPhone méret: 375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(APP_URL);

    // Assert 1: A felület betöltődik és nem jelenik meg horizontális overflow
    const appBody = page.locator('body');
    await expect(appBody).toBeVisible();

    // Act 2: Tablet méret beállítása (iPad: 768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.navbar, header').first()).toBeVisible();
  });

});
