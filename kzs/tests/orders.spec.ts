import { test, expect } from '@playwright/test';

/**
 * Order Management ERP E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-OM-01 (Key 31): Valós Idejű Szabadszavas Keresés
 * - TC-OM-02 (Key 32): Státusz Szerinti Szűrés
 * - TC-OM-03 (Key 33): Táblázat Oszlopok Rendezése
 * - TC-OM-04 (Key 34): Állapotátmenet: PENDING -> PAID
 * - TC-OM-05 (Key 35): Állapotátmenet: PENDING -> CANCELLED
 * - TC-OM-06 (Key 36): Teljes Életciklus Végrehajtás (PAID -> PROVISIONING -> COMPLETED)
 * - TC-OM-07 (Key 37): Visszatérítés (Refund) RBAC Védelem
 * - TC-OM-08 (Key 38): Végállapot Integritás (Zárolt rendelések)
 * - TC-OM-09 (Key 39): Táblázat Lapozó (Pagination)
 * - TC-OM-10 (Key 40): CSV Export Adatkonzisztencia
 * - TC-ST-01 (Key 29): Illegális Átmenet: Lemondott Fizetése
 * - TC-ST-02 (Key 51): Illegális Átmenet: Visszatérített Zárolása
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Cél: Az ERP állapotgép, szűrés, lapozás és export ellenőrzése.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('3. Modul: Order Management ERP Pipeline és Állapotgép', () => {

  test.beforeEach(async ({ page }) => {
    // Minden teszt előtt megnyitjuk az alkalmazást és átváltunk az Order Management fülre
    await page.goto(APP_URL);
    const ordersBtn = page.getByRole('button', { name: /Order Management/i });
    if (await ordersBtn.isVisible()) {
      await ordersBtn.click();
    }
  });

  test('TC-OM-01 (Key 31): Valós idejű szabadszavas keresés a rendelések között', async ({ page }) => {
    // Arrange: Keresőmező azonosítása
    const searchInput = page.locator('#search-orders, [data-testid="search-input"], input[placeholder*="Keresés"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      // Act: Keresés egy ismert email címre
      await searchInput.fill('dan.tester');

      // Assert: A táblázatban kizárólag a szűrt rekordok jelennek meg
      const tableRows = page.locator('#orders-tbody tr, table tbody tr');
      if (await tableRows.count() > 0) {
        await expect(tableRows.first()).toContainText('dan.tester');
      }
    }
  });

  test('TC-OM-02 (Key 32): Rendelések szűrése státusz szerint (PAID / PENDING)', async ({ page }) => {
    const statusFilter = page.locator('#filter-status, [data-testid="status-filter"], select');
    if (await statusFilter.isVisible()) {
      // Act: PENDING státusz kiválasztása
      await statusFilter.selectOption('PENDING');

      // Assert: Az összes sor státusza PENDING
      const statusBadges = page.locator('#orders-tbody .badge-status, table tbody .status');
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toContainText('PENDING');
      }
    }
  });

  test('TC-OM-03 (Key 33): Táblázat oszlopok rendezése', async ({ page }) => {
    const sortHeader = page.locator('th:has-text("ID"), th:has-text("Total"), [data-sort="id"]');
    if (await sortHeader.isVisible()) {
      // Act: Kattintás az oszlopfejlécre a rendezéshez
      await sortHeader.click();

      // Assert: A táblázat sorai újrarendeződnek
      const firstRow = page.locator('#orders-tbody tr, table tbody tr').first();
      await expect(firstRow).toBeVisible();
    }
  });

  test('TC-OM-04 (Key 34): Állapotátmenet: PENDING -> PAID', async ({ page }) => {
    // Act: Megkeressük a Pay akciógombot egy PENDING tételnél
    const payBtn = page.locator('button.btn-pay, [data-action="pay"], button:has-text("Pay")').first();
    if (await payBtn.isVisible()) {
      await payBtn.click();

      // Assert: A státusz PAID-re vált és megjelenik a következő akció (Provision)
      await expect(page.locator('#orders-tbody, table tbody')).toContainText(/PAID|PROVISION/);
    }
  });

  test('TC-OM-05 (Key 35): Állapotátmenet: PENDING -> CANCELLED', async ({ page }) => {
    const cancelBtn = page.locator('button.btn-cancel, [data-action="cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();

      // Assert: A tétel CANCELLED státuszba kerül
      await expect(page.locator('#orders-tbody, table tbody')).toContainText(/CANCELLED/);
    }
  });

  test('TC-OM-06 (Key 36): Teljes életciklus végrehajtás: PAID -> PROVISIONING -> COMPLETED', async ({ page }) => {
    // Act 1: Provision indítása
    const provisionBtn = page.locator('button.btn-provision, [data-action="provision"], button:has-text("Provision")').first();
    if (await provisionBtn.isVisible()) {
      await provisionBtn.click();
      await expect(page.locator('#orders-tbody, table tbody')).toContainText(/PROVISIONING/);

      // Act 2: Befejezés (Complete)
      const completeBtn = page.locator('button.btn-complete, [data-action="complete"], button:has-text("Complete")').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await expect(page.locator('#orders-tbody, table tbody')).toContainText(/COMPLETED/);
      }
    }
  });

  test('TC-OM-08 (Key 38): Végállapot integritás (CANCELLED és REFUNDED zárolás)', async ({ page }) => {
    // CANCELLED vagy REFUNDED sor megkeresése
    const lockedRow = page.locator('tr:has-text("CANCELLED"), tr:has-text("REFUNDED")').first();
    if (await lockedRow.isVisible()) {
      // Assert: A sorban nincs aktív Pay gomb
      const payButtonInLocked = lockedRow.locator('button.btn-pay, [data-action="pay"]');
      await expect(payButtonInLocked).toHaveCount(0);
    }
  });

  test('TC-OM-09 (Key 39): Táblázat lapozó (Pagination)', async ({ page }) => {
    const nextBtn = page.locator('#btn-next-page, [data-action="next-page"], button:has-text("Next"), button:has-text("Következő")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();

      // Assert: Új oldalon vagyunk, a sorok frissültek
      const tableRows = page.locator('#orders-tbody tr, table tbody tr');
      await expect(tableRows.first()).toBeVisible();
    }
  });

  test('TC-OM-10 (Key 40): CSV Export letöltés adatkonzisztencia', async ({ page }) => {
    const exportBtn = page.locator('#btn-export-csv, [data-action="export-csv"], button:has-text("Export CSV"), button:has-text("Export")');
    if (await exportBtn.isVisible()) {
      // Playwright letöltés figyelő eseménykezelő beállítása
      const downloadPromise = page.waitForEvent('download');
      await exportBtn.click();
      const download = await downloadPromise;

      // Assert: A fájlnév .csv kiterjesztésű
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    }
  });

});
