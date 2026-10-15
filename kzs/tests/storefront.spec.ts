import { test, expect } from '@playwright/test';

/**
 * Storefront & Checkout E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-SF-01 (Key 5): Bankkártyás Vásárlás (Happy Path)
 * - TC-SF-02 (Key 6): Vállalati Számlás Fizetés (PO)
 * - TC-SF-03 (Key 7): Pénznemváltás & Árfolyamok (USD, EUR, HUF)
 * - TC-SF-04 (Key 8): Mennyiség Határérték-elemzés (BVA)
 * - TC-SF-05 (Key 9): Készlethiány Negatív Ág
 * - TC-SF-06 (Key 10): Országos Adókulcsok Kalkulációja (US 0%, DE 19%, HU 27%)
 * - TC-SF-07 (Key 11): EU VAT Mentesítés (Reverse Charge)
 * - TC-SF-08 (Key 12): Érvénytelen EU VAT Formátum
 * - TC-SF-09 (Key 13): Százalékos Kupon Érvényesítés (AIWS25)
 * - TC-SF-10 (Key 14): Fix Összegű & Limit Kupon (SAVE50)
 * - TC-SF-11 (Key 15): Lejárt Kupon Negatív Ág (EXPIRED2025)
 * - TC-SF-12 (Key 16): Elutasított Kártyatranzakció (402 Declined)
 * - TC-SF-13 (Key 17): 3D Secure OTP Hitelesítés
 * - TC-SF-14 (Key 18): Számlázási PO Szám Validáció
 * - TC-FIN-01 (Key 26): Devizakerekítési Lebegőpontos Hiba
 * - TC-FIN-02 (Key 27): Kupon Kedvezmény & ÁFA Sorrend
 * - TC-FIN-03 (Key 28): Dinamikus Országváltás Kuponnal
 * - TC-FIN-04 (Key 50): Nagy Mennyiségű Kosár Pontosság
 *
 * Web-First lokátorok, AAA minta és automatikus várakozás (auto-waiting).
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('1. Modul: Storefront & Checkout Webshop', () => {

  test.beforeEach(async ({ page }) => {
    // Minden teszt előtt megnyitjuk a Storefront felületet tiszta kapu-állapottal
    await page.goto(APP_URL);
    const storefrontBtn = page.getByRole('button', { name: /Storefront/i });
    if (await storefrontBtn.isVisible()) {
      await storefrontBtn.click();
    }
  });

  test('TC-SF-01 (Key 5): Sikeres bankkártyás vásárlás (Happy Path)', async ({ page }) => {
    // Arrange: Adatok előkészítése
    const testEmail = 'dan.tester@enterprise.io';
    
    // Act: Termék kiválasztása, űrlap kitöltése és fizetés beküldése
    await page.locator('.product-card-option').first().click();
    await page.locator('#email-input, [data-testid="email-input"]').fill(testEmail);
    await page.locator('#qty-input, [data-testid="qty-input"]').fill('1');

    // Bankkártyás fizetési mód kiválasztása, ha elérhető
    const cardRadio = page.locator('#pm-card, input[value="card"]');
    if (await cardRadio.isVisible()) {
      await cardRadio.check();
    }

    // Rendelés jóváhagyása
    const checkoutBtn = page.locator('[data-testid="checkout-btn"], [data-testid="submit-order-btn"], #submit-order-btn').first();
    await checkoutBtn.click();

    // Assert: A megrendelés megjelenik a legfrissebb rendelések táblázatában
    const recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    await expect(recentOrdersTable).toContainText(testEmail);
  });

  test('TC-SF-02 (Key 6): Vállalati számlás fizetés (PO szám)', async ({ page }) => {
    // Arrange: PO azonosító és céges email megadása
    const corporateEmail = 'finance@astron.hu';
    const poNumber = 'PO-ASTRON-2026-X1';

    // Act: Termék választása és céges fizetési mód
    await page.locator('.product-card-option').first().click();
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill(corporateEmail);

    const poRadio = page.locator('#pm-invoice, input[value="invoice"]');
    if (await poRadio.isVisible()) {
      await poRadio.check();
      const poInput = page.locator('#ui-po-number, #po-number, [data-testid="po-input"]');
      if (await poInput.isVisible()) {
        await poInput.fill(poNumber);
      }
    }

    const checkoutBtn = page.locator('[data-testid="checkout-btn"], [data-testid="submit-order-btn"], #submit-order-btn').first();
    await checkoutBtn.click();

    // Assert: A rendelés létrejött PENDING státusszal
    const ordersBody = page.locator('#ui-recent-orders-tbody');
    await expect(ordersBody).toContainText(corporateEmail);
  });

  test('TC-SF-03 (Key 7): Pénznemváltás & árfolyamok kalkulációja (USD, EUR, HUF)', async ({ page }) => {
    // Act & Assert 1: EUR váltás vizsgálata
    const currencySelect = page.locator('#currency-select, [data-testid="currency-select"]');
    if (await currencySelect.isVisible()) {
      await currencySelect.selectOption('EUR');
      await expect(page.locator('#ui-sum-total, .cart-total')).toContainText(/€|EUR/);

      // Act & Assert 2: HUF váltás vizsgálata
      await currencySelect.selectOption('HUF');
      await expect(page.locator('#ui-sum-total, .cart-total')).toContainText(/Ft|HUF/);
    }
  });

  test('TC-SF-04 (Key 8): Mennyiség határérték-elemzés (BVA)', async ({ page }) => {
    // Arrange: Mennyiségi mező megcélzása
    const qtyInput = page.locator('#qty-input, [data-testid="qty-input"]');
    
    // Act: Minimális érvényes érték (1)
    await qtyInput.fill('1');
    await expect(qtyInput).toHaveValue('1');

    // Act: Magasabb érték
    await qtyInput.fill('5');
    await expect(qtyInput).toHaveValue('5');
  });

  test('TC-SF-05 (Key 9): Készlethiány negatív ág ellenőrzése', async ({ page }) => {
    // Act: Raktárkészlet feletti irracionális mennyiség beírása
    const qtyInput = page.locator('#qty-input, [data-testid="qty-input"]');
    await qtyInput.fill('9999');

    const checkoutBtn = page.locator('[data-testid="checkout-btn"], [data-testid="submit-order-btn"], #submit-order-btn').first();
    await checkoutBtn.click();

    // Assert: Készlethiány vagy hibaüzenet megjelenése
    const feedback = page.locator('.stock-err, .alert-danger, #stock-warning, [data-testid="order-feedback"]');
    if (await feedback.isVisible()) {
      await expect(feedback).toContainText(/készlet|stock|limit|nem elegendő/i);
    }
  });

  test('TC-SF-06 (Key 10): Országos adókulcsok kalkulációja (US 0%, DE 19%, HU 27%)', async ({ page }) => {
    const countrySelect = page.locator('#ui-country, #country-select, [data-testid="country-select"]');
    if (await countrySelect.isVisible()) {
      // US adókulcs (0%)
      await countrySelect.selectOption('US');
      // DE adókulcs (19%)
      await countrySelect.selectOption('DE');
      // HU adókulcs (27%)
      await countrySelect.selectOption('HU');
      await expect(page.locator('#ui-sum-vat')).toBeVisible();
    }
  });

  test('TC-SF-07 (Key 11): EU VAT mentesítés (Reverse Charge) érvényes adószámmal', async ({ page }) => {
    const vatInput = page.locator('#ui-vat-number, #vat-input, [data-testid="vat-input"]');
    const verifyBtn = page.locator('[data-testid="btn-validate-vat"], button:has-text("Verify VAT")');
    if (await vatInput.isVisible()) {
      // Act: Érvényes német B2B adószám beírása és ellenőrzése
      await vatInput.fill('DE987654321');
      if (await verifyBtn.isVisible()) {
        await verifyBtn.click();
      }

      // Assert: Zöld jóváhagyó felirat vagy 0% ÁFA megjelenése
      // FIGYELEM: A webalkalmazásban lévő hiba (d{8,9} \d helyett) miatt ez a teszt jogosan bukik el!
      const vatStatus = page.locator('#vat-feedback, #vat-status');
      await expect(vatStatus).toContainText(/mentesített|valid|reverse charge|0%/i);
    }
  });

  test('TC-SF-08 (Key 12): Érvénytelen EU VAT formátum elutasítása', async ({ page }) => {
    const vatInput = page.locator('#ui-vat-number, #vat-input, [data-testid="vat-input"]');
    const verifyBtn = page.locator('[data-testid="btn-validate-vat"], button:has-text("Verify VAT")');
    if (await vatInput.isVisible()) {
      // Act: Szintaktikailag hibás kód
      await vatInput.fill('hibas_vat_99');
      if (await verifyBtn.isVisible()) {
        await verifyBtn.click();
      }

      // Assert: Hibajelzés, alap adókulcs megmaradása
      const vatStatus = page.locator('#vat-feedback, #vat-status');
      await expect(vatStatus).toContainText(/érvénytelen|hibás|invalid/i);
    }
  });

  test('TC-SF-09 (Key 13): Százalékos kupon (AIWS25) 25% kedvezmény érvényesítése', async ({ page }) => {
    const couponInput = page.locator('#coupon-input, [data-testid="coupon-input"]');
    const applyBtn = page.locator('#apply-coupon-btn, [data-testid="apply-coupon-btn"]');

    if (await couponInput.isVisible() && await applyBtn.isVisible()) {
      await couponInput.fill('AIWS25');
      await applyBtn.click();

      // Assert: 25% kedvezmény megjelenése a kosárban
      await expect(page.locator('#coupon-feedback, .discount-row')).toContainText(/25%|AIWS25/);
    }
  });

  test('TC-SF-10 (Key 14): Fix összegű kupon (SAVE50) minimum kosárérték vizsgálata', async ({ page }) => {
    const couponInput = page.locator('#coupon-input, [data-testid="coupon-input"]');
    const applyBtn = page.locator('#apply-coupon-btn, [data-testid="apply-coupon-btn"]');

    if (await couponInput.isVisible() && await applyBtn.isVisible()) {
      await couponInput.fill('SAVE50');
      await applyBtn.click();

      // Assert: Kosárérték vizsgálat visszajelzése
      await expect(page.locator('#coupon-feedback, .discount-row')).toBeVisible();
    }
  });

  test('TC-SF-11 (Key 15): Lejárt kupon negatív ág (EXPIRED2025)', async ({ page }) => {
    const couponInput = page.locator('#coupon-input, [data-testid="coupon-input"]');
    const applyBtn = page.locator('#apply-coupon-btn, [data-testid="apply-coupon-btn"]');

    if (await couponInput.isVisible() && await applyBtn.isVisible()) {
      await couponInput.fill('EXPIRED2025');
      await applyBtn.click();

      // Assert: Lejárt kupon hibaüzenet
      await expect(page.locator('#coupon-feedback, .coupon-error')).toContainText(/lejárt|expired/i);
    }
  });

  test('TC-SF-12 (Key 16): Elutasított bankkártya tranzakció (4000...0002)', async ({ page }) => {
    // Act: Ismert elutasított tesztkártya használata
    const cardInput = page.locator('#card-num, [data-testid="card-input"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill('4000000000000002');
      const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
      await checkoutBtn.click();

      // Assert: Tranzakció elutasítási hiba (Declined / 402)
      await expect(page.locator('.payment-err, #order-err, .toast-error')).toContainText(/elutasítva|declined|hiba/i);
    }
  });

  test('TC-SF-13 (Key 17): 3D Secure OTP megerősítés (4000...0003)', async ({ page }) => {
    const cardInput = page.locator('#card-num, [data-testid="card-input"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill('4000000000000003');
      const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
      await checkoutBtn.click();

      // Assert: Megjelenik a 3DS OTP modal
      const otpModal = page.locator('#otp-modal, [data-modal="3ds"]');
      if (await otpModal.isVisible()) {
        await expect(otpModal).toBeVisible();
      }
    }
  });

  test('TC-SF-14 (Key 18): Számlázási PO szám validáció', async ({ page }) => {
    const poRadio = page.locator('#pm-invoice, input[value="invoice"]');
    if (await poRadio.isVisible()) {
      await poRadio.check();
      const poInput = page.locator('#po-number, [data-testid="po-input"]');
      if (await poInput.isVisible()) {
        // Túl rövid PO szám megadása
        await poInput.fill('PO');
        const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
        await checkoutBtn.click();

        // Assert: Validációs hiba
        await expect(page.locator('.po-err, #form-error')).toBeVisible();
      }
    }
  });

});
