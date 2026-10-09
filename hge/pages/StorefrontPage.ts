import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StorefrontPage extends BasePage {
  readonly currencySelect: Locator;
  readonly product1: Locator;
  readonly product2: Locator;
  readonly product3: Locator;
  readonly emailInput: Locator;
  readonly qtyInput: Locator;
  readonly countrySelect: Locator;
  readonly vatInput: Locator;
  readonly validateVatBtn: Locator;
  readonly vatFeedback: Locator;
  readonly couponInput: Locator;
  readonly applyCouponBtn: Locator;
  readonly couponFeedback: Locator;
  readonly payMethodCardRadio: Locator;
  readonly payMethodInvoiceRadio: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly poNumberInput: Locator;
  readonly checkoutBtn: Locator;
  readonly summaryProduct: Locator;
  readonly summaryBase: Locator;
  readonly summaryQty: Locator;
  readonly summaryDiscount: Locator;
  readonly summaryVatPercent: Locator;
  readonly summaryVat: Locator;
  readonly summaryTotal: Locator;
  readonly recentOrdersTable: Locator;
  readonly recentOrderRows: Locator;

  constructor(page: Page) {
    super(page);
    this.currencySelect = page.getByTestId('currency-select');
    this.product1 = page.getByTestId('product-1');
    this.product2 = page.getByTestId('product-2');
    this.product3 = page.getByTestId('product-3');
    this.emailInput = page.getByTestId('email-input');
    this.qtyInput = page.getByTestId('qty-input');
    this.countrySelect = page.getByTestId('country-select');
    this.vatInput = page.getByTestId('vat-input');
    this.validateVatBtn = page.getByTestId('btn-validate-vat');
    this.vatFeedback = page.locator('#vat-feedback');
    this.couponInput = page.getByTestId('coupon-input');
    this.applyCouponBtn = page.getByTestId('coupon-btn');
    this.couponFeedback = page.getByTestId('coupon-feedback');
    this.payMethodCardRadio = page.locator('#pay-method-card');
    this.payMethodInvoiceRadio = page.locator('#pay-method-invoice');
    this.cardNumberInput = page.getByTestId('card-number-input');
    this.cardExpiryInput = page.getByTestId('card-expiry-input');
    this.cardCvcInput = page.getByTestId('card-cvc-input');
    this.poNumberInput = page.getByTestId('po-number-input');
    this.checkoutBtn = page.locator('#btn-ui-submit');
    this.summaryProduct = page.locator('#ui-sum-product');
    this.summaryBase = page.locator('#ui-sum-base');
    this.summaryQty = page.locator('#ui-sum-qty');
    this.summaryDiscount = page.locator('#ui-sum-discount');
    this.summaryVatPercent = page.locator('#ui-vat-percent');
    this.summaryVat = page.locator('#ui-sum-vat');
    this.summaryTotal = page.locator('#ui-sum-total');
    this.recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    this.recentOrderRows = page.locator('#ui-recent-orders-tbody tr');
  }

  async selectCurrency(currency: 'USD' | 'EUR' | 'HUF'): Promise<void> {
    await this.currencySelect.selectOption(currency);
  }

  async selectProduct(productId: 1 | 2 | 3): Promise<void> {
    switch (productId) {
      case 1:
        await this.product1.click();
        break;
      case 2:
        await this.product2.click();
        break;
      case 3:
        await this.product3.click();
        break;
    }
  }

  async fillCustomerDetails(email: string, qty: number, country: 'US' | 'DE' | 'HU'): Promise<void> {
    await this.emailInput.fill(email);
    await this.qtyInput.fill(qty.toString());
    await this.countrySelect.selectOption(country);
  }

  async applyVatNumber(vatNumber: string): Promise<void> {
    await this.vatInput.fill(vatNumber);
    await this.validateVatBtn.click();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponBtn.click();
  }

  async selectPaymentMethod(method: 'card' | 'invoice'): Promise<void> {
    if (method === 'card') {
      await this.payMethodCardRadio.check();
    } else {
      await this.payMethodInvoiceRadio.check();
    }
  }

  async fillCardDetails(cardNumber: string, expiry: string = '12/28', cvc: string = '123'): Promise<void> {
    await this.cardNumberInput.fill(cardNumber);
    await this.cardExpiryInput.fill(expiry);
    await this.cardCvcInput.fill(cvc);
  }

  async fillInvoiceDetails(poNumber: string): Promise<void> {
    await this.poNumberInput.fill(poNumber);
  }

  async submitOrder(): Promise<void> {
    await this.checkoutBtn.click();
  }
}
