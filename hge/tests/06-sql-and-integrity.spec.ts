import { test, expect } from '@playwright/test';
import { BasePage, HeaderComponent, SqlConsolePage, OrderManagementPage, StorefrontPage } from '../pages';

test.describe('06 - Adatintegritás, SQL & Tréner Szimuláció', () => {

  test.beforeEach(async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);
    await base.goto();
    await header.resetDatabase();
  });

  test('TC-INT-01: SQL Workbench - Relációs lekérdezések és eredménytábla ellenőrzése', async ({ page }) => {
    const header = new HeaderComponent(page);
    const sqlPage = new SqlConsolePage(page);

    await header.switchTab('sql');

    // Alapértelmezett INNER JOIN futtatása
    await sqlPage.executeBtn.click();

    await expect(sqlPage.resultsBox).toBeVisible();
    await expect(sqlPage.resultsBox).toContainText('5 rows in set');
    await expect(sqlPage.resultsBox.locator('table.e2e-table')).toBeVisible();

    // Gyorslekérdezés chip: All Users
    await sqlPage.clickChip('All Users');
    await expect(sqlPage.resultsBox).toContainText('dan.tester@enterprise.io');
    await expect(sqlPage.resultsBox).toContainText('tamas.admin@testacademy.hu');
  });

  test('TC-INT-02: SQL Workbench - Közvetlen UPDATE parancs azonnali szinkronizációja a UI-jal', async ({ page }) => {
    const header = new HeaderComponent(page);
    const sqlPage = new SqlConsolePage(page);
    const ordersPage = new OrderManagementPage(page);

    await header.switchTab('sql');

    // Force Refund query futtatása
    await sqlPage.clickChip('Force Refund (ID 101)');
    await expect(sqlPage.resultsBox).toContainText('Query OK, 1 row affected');

    // Átlépés az Order Management fülre: #101 státuszának ellenőrzése
    await header.switchTab('orders');
    await expect(ordersPage.getOrderRow(101)).toContainText('REFUNDED');
  });

  test('TC-INT-03: Audit Naplózás Konzisztencia - Új rendelés létrehozása után keletkező audit rekord', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    const header = new HeaderComponent(page);
    const sqlPage = new SqlConsolePage(page);

    // 1. Új rendelés leadása Storefronton
    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('audit.check@astron.hu', 1, 'US');
    await storefront.submitOrder();

    // 2. SQL konzolon az audit napló ellenőrzése
    await header.switchTab('sql');
    await sqlPage.clickChip('Audit Trail');

    await expect(sqlPage.resultsBox).toContainText('ORDER_CREATED');
    await expect(sqlPage.resultsBox).toContainText('audit.check@astron.hu');
  });

  test('TC-INT-04: Tréner UI v2 Változás Követése - Dinamikus gombfelirat és testid ellenőrzése', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // Kezdetben v1 mód: "Place Subscription Order →"
    await expect(storefront.checkoutBtn).toHaveText(/Place Subscription Order/i);

    // Bekapcsoljuk a v2 módot
    await page.locator('#toggle-v2').check();

    // Gomb szövege és testid-je megváltozik
    await expect(storefront.checkoutBtn).toHaveText(/Submit Order Now/i);
    await expect(storefront.checkoutBtn).toHaveAttribute('data-testid', 'submit-order-btn');
  });

});
