import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * StorefrontPage Page Object
 *
 * Leképezi a Storefront & Checkout nezet valamennyi mezejet, gombjat es szamitasat.
 * Lokator strategia: Web-First, data-testid es getByRole elonnyel.
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export class StorefrontPage extends BasePage {
  // Termekkartyák
  readonly productCards: Locator;
  readonly product1: Locator;
  readonly product2: Locator;
  readonly product3: Locator;

  // Beviteli mezok
  readonly currencySelect: Locator;
  readonly emailInput: Locator;
  readonly qtyInput: Locator;
  readonly countrySelect: Locator;

  // EU VAT
  readonly vatInput: Locator;
  readonly validateVatBtn: Locator;
  readonly vatFeedback: Locator;

  // Kupon
  readonly couponInput: Locator;
  readonly applyCouponBtn: Locator;
  readonly couponFeedback: Locator;

  // Fizetesi mod
  readonly payMethodCardRadio: Locator;
  readonly payMethodInvoiceRadio: Locator;
  readonly cardNumberInput: Locator;
  readonly cardExpiryInput: Locator;
  readonly cardCvcInput: Locator;
  readonly poNumberInput: Locator;

  // Megrendeles gomb
  readonly checkoutBtn: Locator;

  // Kosar osszegzo reszlet
  readonly summaryProduct: Locator;
  readonly summaryBase: Locator;
  readonly summaryQty: Locator;
  readonly summaryDiscount: Locator;
  readonly summaryVatPercent: Locator;
  readonly summaryVat: Locator;
  readonly summaryTotal: Locator;

  // Legutobbi megrendelesek tablazat
  readonly recentOrdersTable: Locator;
  readonly recentOrderRows: Locator;

  constructor(page: Page) {
    super(page);

    // Termekek
    this.productCards = page.locator('.product-card-option');
    this.product1 = page.getByTestId('product-1').or(this.productCards.nth(0));
    this.product2 = page.getByTestId('product-2').or(this.productCards.nth(1));
    this.product3 = page.getByTestId('product-3').or(this.productCards.nth(2));

    // Form mezok
    this.currencySelect = page.getByTestId('currency-select').or(page.locator('#currency-select'));
    this.emailInput = page.getByTestId('email-input').or(page.locator('#ui-email, #email-input'));
    this.qtyInput = page.getByTestId('qty-input').or(page.locator('#ui-qty, #qty-input'));
    this.countrySelect = page.getByTestId('country-select').or(page.locator('#ui-country'));

    // VAT
    this.vatInput = page.getByTestId('vat-input').or(page.locator('#ui-vat-number'));
    this.validateVatBtn = page.getByTestId('btn-validate-vat').or(page.locator('button:has-text("Verify VAT")'));
    this.vatFeedback = page.locator('#vat-feedback');

    // Kupon
    this.couponInput = page.getByTestId('coupon-input').or(page.locator('#ui-coupon-code'));
    this.applyCouponBtn = page.getByTestId('coupon-btn').or(page.locator('#btn-apply-coupon'));
    this.couponFeedback = page.getByTestId('coupon-feedback').or(page.locator('#coupon-feedback'));

    // Fizetes
    this.payMethodCardRadio = page.locator('#pm-card, #pay-method-card, input[value="card"]');
    this.payMethodInvoiceRadio = page.locator('#pm-invoice, #pay-method-invoice, input[value="invoice"]');
    this.cardNumberInput = page.getByTestId('card-number-input').or(page.locator('#ui-card-num, #card-num, #ui-card-number'));
    this.cardExpiryInput = page.getByTestId('card-expiry-input').or(page.locator('#ui-card-exp, #card-exp, #ui-card-expiry'));
    this.cardCvcInput = page.getByTestId('card-cvc-input').or(page.locator('#ui-card-cvc, #card-cvc'));
    this.poNumberInput = page.getByTestId('po-number-input').or(page.locator('#ui-po-number, #po-number'));

    // Submit
    this.checkoutBtn = page.getByTestId('checkout-btn').or(page.locator('#btn-ui-submit, #submit-order-btn, button:has-text("Place Subscription Order")')).first();

    // Kosar osszegzo
    this.summaryProduct = page.locator('#ui-sum-product');
    this.summaryBase = page.locator('#ui-sum-base');
    this.summaryQty = page.locator('#ui-sum-qty');
    this.summaryDiscount = page.locator('#ui-sum-discount');
    this.summaryVatPercent = page.locator('#ui-vat-percent');
    this.summaryVat = page.locator('#ui-sum-vat');
    this.summaryTotal = page.locator('#ui-sum-total');

    // Tablazat
    this.recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    this.recentOrderRows = page.locator('#ui-recent-orders-tbody tr');
  }

  /**
   * Termek kivalasztasa azonosito alapjan (1: Basic $250, 2: Pro $490, 3: Enterprise $990).
   */
  async selectProduct(productId: 1 | 2 | 3): Promise<void> {
    await this.productCards.nth(productId - 1).click();
  }

  /**
   * Penznem valtasa (USD, EUR, HUF).
   */
  async selectCurrency(currency: 'USD' | 'EUR' | 'HUF'): Promise<void> {
    await this.currencySelect.selectOption(currency);
  }

  /**
   * Vasarloi alapadatok kitoltese.
   */
  async fillCustomerDetails(email: string, qty: number, country: 'US' | 'DE' | 'HU'): Promise<void> {
    await this.emailInput.fill(email);
    await this.qtyInput.fill(qty.toString());
    await this.countrySelect.selectOption(country);
  }

  /**
   * EU VAT adoszam beirasa es validalasa.
   */
  async applyVatNumber(vatNumber: string): Promise<void> {
    await this.vatInput.fill(vatNumber);
    await this.validateVatBtn.click();
  }

  /**
   * Kuponkod ervenyesitese.
   */
  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponBtn.click();
  }

  /**
   * Bankkartyas fizetesi adatok kitoltese.
   */
  async fillCardPayment(cardNumber: string, expiry = '12/28', cvc = '123'): Promise<void> {
    if (await this.payMethodCardRadio.isVisible()) {
      await this.payMethodCardRadio.check();
    }
    await this.cardNumberInput.fill(cardNumber);
    await this.cardExpiryInput.fill(expiry);
    await this.cardCvcInput.fill(cvc);
  }

  /**
   * Vallalati szamlas fizetes PO szam megadasaval.
   */
  async fillInvoicePayment(poNumber: string): Promise<void> {
    if (await this.payMethodInvoiceRadio.isVisible()) {
      await this.payMethodInvoiceRadio.check();
    }
    await this.poNumberInput.fill(poNumber);
  }

  /**
   * Megrendeles veglegesitese es bekuldese.
   */
  async submitOrder(): Promise<void> {
    await this.checkoutBtn.click();
  }
}
