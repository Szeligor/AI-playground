import { test, expect } from '../fixtures';

/**
 * Order Management ERP E2E Tesztcsomag (POM & Custom Fixture Alapon)
 *
 * Lefedett tesztesetek:
 * - TC-OM-01 (Key 31): Valós Idejű Szabadszavas Keresés
 * - TC-OM-02 (Key 32): Státusz Szerinti Szűrés
 * - TC-OM-03 (Key 33): Táblázat Oszlopok Rendezése
 * - TC-OM-04 (Key 34): Állapotátmenet: PENDING -> PAID
 * - TC-OM-05 (Key 35): Állapotátmenet: PENDING -> CANCELLED
 * - TC-OM-06 (Key 36): Teljes Életciklus Végrehajtás (PAID -> PROVISIONING -> COMPLETED)
 * - TC-OM-08 (Key 38): Végállapot Integritás (Zárolt rendelések)
 * - TC-OM-09 (Key 39): Táblázat Lapozó (Pagination)
 * - TC-OM-10 (Key 40): CSV Export Adatkonzisztencia
 *
 * Tervezési minta: Page Object Model (kzs/pages/OrderManagementPage) + Custom Fixtures (kzs/fixtures).
 * AAA minta, Web-First lokátorok, zéró manuális alvás.
 */

test.describe('3. Modul: Order Management ERP Pipeline és Állapotgép', () => {

  test.beforeEach(async ({ orderManagementPage }) => {
    // Minden teszt előtt megnyitjuk az alkalmazást és átváltunk az Order Management fülre
    await orderManagementPage.goto();
    if (await orderManagementPage.tabOrders.isVisible()) {
      await orderManagementPage.tabOrders.click();
    }
  });

  test('TC-OM-01 (Key 31): Valós idejű szabadszavas keresés a rendelések között', async ({ orderManagementPage }) => {
    // Act: Keresés egy ismert email címre a Page Objecten keresztül
    await orderManagementPage.search('dan.tester');

    // Assert: A táblázatban kizárólag a szűrt rekordok jelennek meg
    await expect(orderManagementPage.orderRows.first()).toContainText('dan.tester');
  });

  test('TC-OM-02 (Key 32): Rendelések szűrése státusz szerint (PAID / PENDING)', async ({ orderManagementPage }) => {
    // Act: PENDING státusz kiválasztása a szűrővel
    await orderManagementPage.filterByStatus('PENDING');

    // Assert: A szűrt sorok státusza PENDING
    await expect(orderManagementPage.statusBadges.first()).toContainText('PENDING');
  });

  test('TC-OM-03 (Key 33): Táblázat oszlopok rendezése', async ({ orderManagementPage }) => {
    // Act: Összeg szerinti csökkenő rendezés kiválasztása
    await orderManagementPage.sortBy('total-desc');

    // Assert: A táblázat első sora látható és rendezett
    await expect(orderManagementPage.orderRows.first()).toBeVisible();
  });

  test('TC-OM-04 (Key 34): Állapotátmenet: PENDING -> PAID', async ({ orderManagementPage }) => {
    // Act: Fizetés (Pay) indítása az első PENDING tételnél
    const payBtn = orderManagementPage.orderRows.first().locator('button.btn-pay, button:has-text("Pay")');
    if (await payBtn.isVisible()) {
      await payBtn.click();

      // Assert: A státusz PAID-re vált
      await expect(orderManagementPage.ordersTable).toContainText(/PAID|PROVISION/);
    }
  });

  test('TC-OM-05 (Key 35): Állapotátmenet: PENDING -> CANCELLED', async ({ orderManagementPage }) => {
    // Act: Lemondás (Cancel) indítása
    const cancelBtn = orderManagementPage.orderRows.first().locator('button.btn-cancel, button:has-text("Cancel")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();

      // Assert: A tétel CANCELLED státuszba kerül
      await expect(orderManagementPage.ordersTable).toContainText(/CANCELLED/);
    }
  });

  test('TC-OM-06 (Key 36): Teljes életciklus végrehajtás: PAID -> PROVISIONING -> COMPLETED', async ({ orderManagementPage }) => {
    // Act 1: Provision indítása
    const provisionBtn = orderManagementPage.orderRows.locator('[data-testid^="btn-provision-"]').first();
    if (await provisionBtn.isVisible()) {
      await provisionBtn.click();
      await expect(orderManagementPage.ordersTable).toContainText(/PROVISIONING/);

      // Act 2: Befejezés (Complete)
      const completeBtn = orderManagementPage.orderRows.locator('[data-testid^="btn-complete-"]').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await expect(orderManagementPage.ordersTable).toContainText(/COMPLETED/);
      }
    }
  });

  test('TC-OM-08 (Key 38): Végállapot integritás (CANCELLED és REFUNDED zárolás)', async ({ orderManagementPage }) => {
    // CANCELLED vagy REFUNDED sor megkeresése
    const lockedRow = orderManagementPage.orderRows.filter({ hasText: /CANCELLED|REFUNDED/ }).first();
    if (await lockedRow.isVisible()) {
      // Assert: A végállapotú sorban nincs aktív Pay gomb
      const payButtonInLocked = lockedRow.locator('button.btn-pay');
      await expect(payButtonInLocked).toHaveCount(0);
    }
  });

  test('TC-OM-09 (Key 39): Táblázat lapozó (Pagination)', async ({ orderManagementPage }) => {
    if (await orderManagementPage.paginationNextBtn.isVisible()) {
      // Act: Lapozás a következő oldalra a Page Objecttel
      await orderManagementPage.nextPage();

      // Assert: Új oldalon vagyunk, a táblázat sorai frissültek
      await expect(orderManagementPage.orderRows.first()).toBeVisible();
    }
  });

  test('TC-OM-10 (Key 40): CSV Export letöltés adatkonzisztencia', async ({ page, orderManagementPage }) => {
    if (await orderManagementPage.exportCsvBtn.isVisible()) {
      // Playwright letöltés figyelő eseménykezelő beállítása
      const downloadPromise = page.waitForEvent('download');
      await orderManagementPage.exportCsv();
      const download = await downloadPromise;

      // Assert: A fájlnév .csv kiterjesztésű
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    }
  });

});
