import { test, expect } from '@playwright/test';
import { StorefrontPage, HeaderComponent } from '../pages';

test.describe('01 - Storefront & Checkout (Megrendelési folyamatok)', () => {

  test.beforeEach(async ({ page }) => {
    const storefront = new StorefrontPage(page);
    const header = new HeaderComponent(page);
    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-SF-01: Happy Path - Bankkártyás vásárlás sikeres lefutása', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('tester.auto@astron.hu', 1, 'US');
    await storefront.selectPaymentMethod('card');
    await storefront.fillCardDetails('4000 0000 0000 0001', '12/28', '123');

    await storefront.submitOrder();

    // Siker toast
    await expect(storefront.toastMessages.first()).toBeVisible();
    await expect(storefront.toastMessages.first()).toContainText('placed successfully');

    // Mini táblázat első sora PAID
    await expect(storefront.recentOrderRows.first()).toContainText('tester.auto@astron.hu');
    await expect(storefront.recentOrderRows.first()).toContainText('PAID');

    // Készletcsökkenés (15-ről 14-re)
    await expect(page.locator('#prod-stock-1')).toContainText('In Stock: 14 units');
  });

  test('TC-SF-02: Happy Path - Vállalati Corporate Invoice vásárlás PENDING státusszal', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.selectProduct(2);
    await storefront.fillCustomerDetails('finance@astron.hu', 1, 'US');
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO-AST-2026-99');

    await storefront.submitOrder();

    await expect(storefront.toastMessages.first()).toBeVisible();
    await expect(storefront.recentOrderRows.first()).toContainText('finance@astron.hu');
    await expect(storefront.recentOrderRows.first()).toContainText('PENDING');
  });

  test('TC-SF-03: Pénznemváltás & Árfolyamok (USD -> EUR -> HUF)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1); // 250 USD

    // Alapértelmezett USD
    await expect(storefront.summaryTotal).toHaveText('$250');

    // Váltás EUR-ra (0.92x -> 230)
    await storefront.selectCurrency('EUR');
    await expect(storefront.summaryTotal).toHaveText('€230');

    // Váltás HUF-ra (395x -> 98750)
    await storefront.selectCurrency('HUF');
    await expect(storefront.summaryTotal).toHaveText('Ft 98750');
  });

  test('TC-SF-04: Mennyiség Határérték-elemzés (BVA: 1 db és 10 db kalkuláció)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1); // $250 / db

    // 1 db
    await storefront.fillCustomerDetails('bva@astron.hu', 1, 'US');
    await expect(storefront.summaryQty).toHaveText('1 unit');
    await expect(storefront.summaryTotal).toHaveText('$250');

    // 5 db -> $1250
    await storefront.qtyInput.fill('5');
    await expect(storefront.summaryQty).toHaveText('5 units');
    await expect(storefront.summaryTotal).toHaveText('$1250');
  });

  test('TC-SF-05: Készlethiány Negatív Ág - Elérhető készlet feletti rendelés meghiúsul', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(2); // Stock is 8 units

    await storefront.fillCustomerDetails('stock.test@astron.hu', 20, 'US');

    // Alert dialógus figyelése
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await storefront.submitOrder();

    expect(alertMessage).toContain('Stock Error: Only 8 units remaining');
  });

  test('TC-SF-06: Ország Adókulcsok Kalkulációja (US 0%, DE 19%, HU 27%)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1); // $250
    await storefront.fillCustomerDetails('tax@astron.hu', 1, 'US');

    // US 0%
    await expect(storefront.summaryVatPercent).toHaveText('0');
    await expect(storefront.summaryVat).toHaveText('$0');
    await expect(storefront.summaryTotal).toHaveText('$250');

    // DE 19% (250 * 0.19 = 48 (kerekítve) -> 298)
    await storefront.countrySelect.selectOption('DE');
    await expect(storefront.summaryVatPercent).toHaveText('19');
    await expect(storefront.summaryVat).toHaveText('$48');
    await expect(storefront.summaryTotal).toHaveText('$298');

    // HU 27% (250 * 0.27 = 68 (kerekítve) -> 318)
    await storefront.countrySelect.selectOption('HU');
    await expect(storefront.summaryVatPercent).toHaveText('27');
    await expect(storefront.summaryVat).toHaveText('$68');
    await expect(storefront.summaryTotal).toHaveText('$318');
  });

  test('TC-SF-07: EU VAT Mentesítés - Reverse Charge B2B 0% ÁFA alkalmazása', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);
    await storefront.countrySelect.selectOption('HU'); // Alapesetben 27% lenne

    await storefront.applyVatNumber('HU12345678');

    await expect(storefront.vatFeedback).toBeVisible();
    await expect(storefront.vatFeedback).toContainText('0% Reverse Charge');
    await expect(storefront.summaryVatPercent).toHaveText('0');
    await expect(storefront.summaryTotal).toHaveText('$250');
  });

  test('TC-SF-08: EU VAT Érvénytelen Formátum - Szintaktikai hiba esetén adó marad érvényben', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);
    await storefront.countrySelect.selectOption('HU');

    await storefront.applyVatNumber('INVALID_VAT_123');

    await expect(storefront.vatFeedback).toBeVisible();
    await expect(storefront.vatFeedback).toContainText('Invalid EU VAT syntax');
    await expect(storefront.summaryVatPercent).toHaveText('27');
  });

  test('TC-SF-09: Kupon - Százalékos Kedvezmény (AIWS25 = 25% OFF)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1); // $250, 0% tax

    await storefront.applyCoupon('AIWS25');

    await expect(storefront.couponFeedback).toBeVisible();
    await expect(storefront.couponFeedback).toContainText('applied (25% OFF)');
    await expect(storefront.summaryDiscount).toHaveText('-$63');
    await expect(storefront.summaryTotal).toHaveText('$187');
  });

  test('TC-SF-10: Kupon - Fix összeg & Minimum költési limit (SAVE50)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1); // $250 > $200 min spend

    await storefront.applyCoupon('SAVE50');

    await expect(storefront.couponFeedback).toBeVisible();
    await expect(storefront.couponFeedback).toContainText('applied ($50 OFF)');
    await expect(storefront.summaryDiscount).toHaveText('-$50');
    await expect(storefront.summaryTotal).toHaveText('$200');
  });

  test('TC-SF-11: Kupon - Lejárt Kupon Negatív Ág (EXPIRED2025)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);

    await storefront.applyCoupon('EXPIRED2025');

    await expect(storefront.couponFeedback).toBeVisible();
    await expect(storefront.couponFeedback).toContainText('Coupon expired');
    await expect(storefront.summaryDiscount).toHaveText('-$0');
  });

  test('TC-SF-12: Bankkártya - Elutasított Tranzakció (402 Declined)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('declined@astron.hu', 1, 'US');
    await storefront.fillCardDetails('4000 0000 0000 0002');

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.accept();
    });

    await storefront.submitOrder();

    expect(alertMsg).toContain('Payment Gateway Declined (402)');
  });

  test('TC-SF-13: Bankkártya - 3D Secure Challenge OTP Hitelesítés (123456)', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('3ds@astron.hu', 1, 'US');
    await storefront.fillCardDetails('4000 0000 0000 0003');

    // Prompt kezelése 123456 helyes OTP-vel
    page.once('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept('123456');
      }
    });

    await storefront.submitOrder();

    await expect(storefront.toastMessages.first()).toBeVisible();
    await expect(storefront.toastMessages.first()).toContainText('placed successfully');
  });

  test('TC-SF-14: Számlázási PO Szám Validáció - 5 karakternél rövidebb PO hiba', async ({ page }) => {
    const storefront = new StorefrontPage(page);
    await storefront.selectProduct(1);
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO1'); // < 5 karakter

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.accept();
    });

    await storefront.submitOrder();

    expect(alertMsg).toContain('Purchase Order (PO) reference must be at least 5 characters');
  });

});
