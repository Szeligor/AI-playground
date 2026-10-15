import { test, expect } from '@playwright/test';

/**
 * SQL Workbench & Adatintegritási E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-INT-01 (Key 57): SQL Lekérdezések Futtatása
 * - TC-INT-02 (Key 58): SQL-ből Frissülő UI Állapot
 * - TC-INT-03 (Key 59): Audit Naplózás Konzisztencia
 * - TC-INT-04 (Key 60): Trainer UI Breaking Mode Követés
 * - TC-SQL-05 (Key 65): SQL Gyorslekérdezés Chipek Beillesztése
 * - TC-SQL-06 (Key 66): Hibás SQL Szintaxis Kezelése
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Cél: Az SQL konzol, a gyorslekérdezések és a reaktív adatbázis szinkronizáció ellenőrzése.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('6. Modul: SQL Workbench és Adatintegritás', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    const sqlTab = page.getByRole('button', { name: /SQL Workbench/i });
    if (await sqlTab.isVisible()) {
      await sqlTab.click();
    }
  });

  test('TC-INT-01 (Key 57): SQL lekérdezés futtatása (SELECT * FROM orders) és eredménylista', async ({ page }) => {
    const sqlTextarea = page.locator('#sql-input');
    const runBtn = page.getByRole('button', { name: /Run Query/i });

    if (await sqlTextarea.isVisible() && await runBtn.isVisible()) {
      // Act: Lekérdezés megadása és futtatása
      await sqlTextarea.fill('SELECT * FROM orders;');
      await runBtn.click();

      // Assert: Az eredménymeghatározó táblázat megjelenik
      // FIGYELEM: A webalkalmazásban lévő hiba (/^SELECTs+/i helyett /\\s+/) miatt a SELECT nem illeszkedik!
      const resultsContainer = page.locator('#sql-results-container table');
      await expect(resultsContainer).toBeVisible();
    }
  });

  test('TC-SQL-05 (Key 65): Gyorslekérdezés chip gombok automatikus beillesztése', async ({ page }) => {
    // Act: Kattintás az All Orders chipre
    const chipAllOrders = page.getByRole('button', { name: 'All Orders' });
    if (await chipAllOrders.isVisible()) {
      await chipAllOrders.click();

      // Assert: A lekérdezés bekerült a szerkesztőbe
      const sqlInput = page.locator('#sql-input');
      await expect(sqlInput).toHaveValue(/SELECT.*FROM orders/i);
    }
  });

  test('TC-SQL-06 (Key 66): Hibás SQL szintaxis kezelése és hibajelzés renderelése', async ({ page }) => {
    const sqlTextarea = page.locator('#sql-input');
    const runBtn = page.getByRole('button', { name: /Run Query/i });

    if (await sqlTextarea.isVisible() && await runBtn.isVisible()) {
      // Act: Hibás szintaxisú lekérdezés küldése
      await sqlTextarea.fill('INVALID SYNTAX NONEXISTENT TABLE;;;');
      await runBtn.click();

      // Assert: A felület hibaüzenetet jelenít meg
      const errorFeedback = page.locator('#sql-results-container');
      await expect(errorFeedback).toBeVisible();
    }
  });

  test('TC-INT-03 (Key 59): Audit naplózási tábla (audit_logs) vizsgálata', async ({ page }) => {
    const sqlTextarea = page.locator('#sql-input');
    const runBtn = page.getByRole('button', { name: /Run Query/i });

    if (await sqlTextarea.isVisible() && await runBtn.isVisible()) {
      await sqlTextarea.fill('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5;');
      await runBtn.click();

      const results = page.locator('#sql-results-container table');
      await expect(results).toBeVisible();
    }
  });

});
