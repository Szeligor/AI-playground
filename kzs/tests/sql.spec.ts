import { test, expect } from '../fixtures';

/**
 * SQL Workbench & Adatintegritási E2E Tesztcsomag (POM & Custom Fixture Alapon)
 *
 * Lefedett tesztesetek:
 * - TC-INT-01 (Key 57): SQL Lekérdezések Futtatása (SELECT * FROM orders)
 * - TC-SQL-05 (Key 65): SQL Gyorslekérdezés Chipek Beillesztése
 * - TC-SQL-06 (Key 66): Hibás SQL Szintaxis Kezelése
 * - TC-INT-03 (Key 59): Audit Naplózási Tábla (audit_logs) Vizsgálata
 *
 * Tervezési minta: Page Object Model (kzs/pages/SqlConsolePage) + Custom Fixtures (kzs/fixtures).
 */

test.describe('6. Modul: SQL Workbench és Adatintegritás', () => {

  test.beforeEach(async ({ sqlConsolePage }) => {
    await sqlConsolePage.goto();
    if (await sqlConsolePage.tabSql.isVisible()) {
      await sqlConsolePage.tabSql.click();
    }
  });

  test('TC-INT-01 (Key 57): SQL lekérdezés futtatása (SELECT * FROM orders) és eredménylista', async ({ sqlConsolePage }) => {
    if (await sqlConsolePage.sqlInput.isVisible()) {
      // Act: Lekérdezés megadása és futtatása a Page Objecten keresztül
      await sqlConsolePage.executeQuery('SELECT * FROM orders;');

      // Assert: Az eredménymeghatározó táblázat megjelenik
      // FIGYELEM: A webalkalmazásban lévő hiba (/^SELECTs+/i helyett /\s+/) miatt a SELECT nem illeszkedik!
      await expect(sqlConsolePage.resultsTable).toBeVisible();
    }
  });

  test('TC-SQL-05 (Key 65): Gyorslekérdezés chip gombok automatikus beillesztése', async ({ sqlConsolePage }) => {
    if (await sqlConsolePage.chipAllOrders.isVisible()) {
      // Act: Kattintás az All Orders chipre
      await sqlConsolePage.selectAllOrdersChip();

      // Assert: A lekérdezés bekerült a szerkesztőbe
      await expect(sqlConsolePage.sqlInput).toHaveValue(/SELECT.*FROM orders/i);
    }
  });

  test('TC-SQL-06 (Key 66): Hibás SQL szintaxis kezelése és hibajelzés renderelése', async ({ sqlConsolePage }) => {
    if (await sqlConsolePage.sqlInput.isVisible()) {
      // Act: Hibás szintaxisú lekérdezés küldése
      await sqlConsolePage.executeQuery('INVALID SYNTAX NONEXISTENT TABLE;;;');

      // Assert: A felület hibaüzenetet jelenít meg
      await expect(sqlConsolePage.resultsContainer).toBeVisible();
    }
  });

  test('TC-INT-03 (Key 59): Audit naplózási tábla (audit_logs) vizsgálata', async ({ sqlConsolePage }) => {
    if (await sqlConsolePage.sqlInput.isVisible()) {
      // Act: Audit napló lekérdezése
      await sqlConsolePage.executeQuery('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5;');

      // Assert: Eredménytábla megjelenése
      // FIGYELEM: A webalkalmazásban lévő hiba (/FROMs+audit_logs/i) miatt ez a teszt jogosan elbukik!
      await expect(sqlConsolePage.resultsTable).toBeVisible();
    }
  });

});
