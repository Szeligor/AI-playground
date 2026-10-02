import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('SauceDemo Purchase & Inventory Flow', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
  });

  test('authenticated user can view inventory and add item to cart', async ({ page }) => {
    // Verify direct access to inventory without logging in
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.pageTitle).toBeVisible();

    // Add backpack to cart
    await inventoryPage.addBackpackToCart();

    // Verify cart badge updates to 1
    await expect(inventoryPage.cartBadge).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
