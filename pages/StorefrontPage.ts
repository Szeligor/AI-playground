import { Page, Locator } from '@playwright/test';

export class StorefrontPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly qtyInput: Locator;
  readonly submitButton: Locator;
  readonly recentOrdersTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.qtyInput = page.getByTestId('qty-input');
    // V1 módban: checkout-btn | V2 módban: submit-order-btn
    this.submitButton = page.getByTestId('checkout-btn');
    this.recentOrdersTable = page.locator('#ui-recent-orders-tbody');
  }

  async goto(queryString: string = '') {
    await this.page.goto(`https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026${queryString}`);
  }

  async selectProduct(id: number) {
    await this.page.locator(`[data-product-id="${id}"] button, button[onclick*="${id}"]`).first().click();
  }

  async submitOrder(email: string, qty: number = 1) {
    await this.emailInput.fill(email);
    await this.qtyInput.fill(qty.toString());
    await this.submitButton.click();
  }
}
