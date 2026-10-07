import { test, expect } from '@playwright/test';
import { StorefrontPage } from '../pages/StorefrontPage';

test.describe('TestAcademy E2E Storefront Tesztcsomag', () => {

  test('TC-01: Sikeres licenc vásárlás POM architektúrával', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // Felkészülés az alert ablak automatikus elfogadására
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Order #');
      await dialog.accept();
    });

    // 1. Megnyitás és rendelés leadása
    await storefront.goto();
    await storefront.submitOrder('dan.tester@enterprise.io', 1);

    // 2. Web-first asserciók a táblázat legelső (legfrissebb) sorára
    const firstRow = storefront.recentOrdersTable.locator('tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText('dan.tester@enterprise.io');
    await expect(firstRow).toContainText('PENDING');
  });

});
