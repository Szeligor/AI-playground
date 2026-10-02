import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addToCartBackpackBtn: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Products');
    this.addToCartBackpackBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async addBackpackToCart() {
    await this.addToCartBackpackBtn.click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
