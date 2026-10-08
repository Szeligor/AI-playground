import { Page, Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { NavbarComponent } from '../common/NavbarComponent';
import { TrainerToolbar } from '../common/TrainerToolbar';

export type ProductId = 1 | 2 | 3;

export class StorefrontPage extends BasePage {
  readonly navbar: NavbarComponent;
  readonly toolbar: TrainerToolbar;

  // Termékkártyák
  readonly productRunnerLicense: Locator;
  readonly productLoadTestingEngine: Locator;
  readonly productSecurityScanner: Locator;

  // Űrlap elemek
  readonly emailInput: Locator;
  readonly qtyInput: Locator;
  readonly countrySelect: Locator;
  readonly checkoutButtonV1: Locator;
  readonly checkoutButtonV2: Locator;
  readonly submitButton: Locator;

  // Összegzés (Order Summary)
  readonly summaryProductName: Locator;
  readonly summaryBasePrice: Locator;
  readonly summaryQuantity: Locator;
  readonly summaryTotal: Locator;

  // Rendelési táblázat (Live Database Orders)
  readonly recentOrdersTable: Locator;
  readonly orderRows: Locator;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
    this.toolbar = new TrainerToolbar(page);

    this.productRunnerLicense = page.locator('.product-card-option').filter({ hasText: 'QA Automation Runner License' });
    this.productLoadTestingEngine = page.locator('.product-card-option').filter({ hasText: 'Enterprise Load Testing Engine' });
    this.productSecurityScanner = page.locator('.product-card-option').filter({ hasText: 'Security SAST/DAST Scanner' });

    this.emailInput = page.getByTestId('email-input');
    this.qtyInput = page.getByTestId('qty-input');
    this.countrySelect = page.getByTestId('country-select');
    this.checkoutButtonV1 = page.getByTestId('checkout-btn');
    this.checkoutButtonV2 = page.getByTestId('submit-order-btn');
    this.submitButton = page.locator('[data-testid="checkout-btn"], [data-testid="submit-order-btn"]');

    this.summaryProductName = page.locator('#ui-sum-product');
    this.summaryBasePrice = page.locator('#ui-sum-base');
    this.summaryQuantity = page.locator('#ui-sum-qty');
    this.summaryTotal = page.locator('#ui-sum-total');

    this.recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    this.orderRows = page.locator('#ui-recent-orders-tbody tr');
  }

  async selectProduct(idOrName: ProductId | string): Promise<void> {
    if (typeof idOrName === 'number') {
      const productMap: Record<ProductId, Locator> = {
        1: this.productRunnerLicense,
        2: this.productLoadTestingEngine,
        3: this.productSecurityScanner
      };
      await productMap[idOrName as ProductId].click();
    } else {
      await this.page.locator('.product-card-option').filter({ hasText: idOrName }).click();
    }
  }

  async fillOrderForm(email: string, qty: number = 1, countryCode?: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.qtyInput.fill(qty.toString());
    if (countryCode) {
      await this.countrySelect.selectOption(countryCode);
    }
  }

  async submitOrder(email: string, qty: number = 1, countryCode?: string): Promise<void> {
    await this.fillOrderForm(email, qty, countryCode);
    await this.submitButton.click();
  }

  getLatestOrderRow(): Locator {
    return this.orderRows.first();
  }
}
