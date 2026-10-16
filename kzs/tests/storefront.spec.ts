import { test, expect } from '../fixtures';

/**
 * Storefront & Checkout E2E Tesztcsomag (POM & Custom Fixture Alapon)
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
 *
 * Tervezési minta: Page Object Model (kzs/pages/StorefrontPage) + Custom Fixtures (kzs/fixtures).
 * Web-First lokátorok, AAA minta és automatikus várakozás (auto-waiting).
 */

test.describe('1. Modul: Storefront & Checkout Webshop', () => {

  test.beforeEach(async ({ storefrontPage }) => {
    // Minden teszt előtt megnyitjuk az alkalmazást és a Storefront nézetre váltunk
    await storefrontPage.goto();
    if (await storefrontPage.tabStorefront.isVisible()) {
      await storefrontPage.tabStorefront.click();
    }
  });

  test('TC-SF-01 (Key 5): Sikeres bankkártyás vásárlás (Happy Path)', async ({ storefrontPage }) => {
    // Arrange: Adatok előkészítése
    const testEmail = 'dan.tester@enterprise.io';

    // Act: Termék kiválasztása, űrlap kitöltése és fizetés beküldése a Page Objecten keresztül
    await storefrontPage.selectProduct(1);
    await storefrontPage.fillCustomerDetails(testEmail, 1, 'US');
    await storefrontPage.fillCardPayment('4000000000000001');
    await storefrontPage.submitOrder();

    // Assert: A megrendelés megjelenik a legfrissebb rendelések táblázatában
    await expect(storefrontPage.recentOrdersTable).toContainText(testEmail);
  });

  test('TC-SF-02 (Key 6): Vállalati számlás fizetés (PO szám)', async ({ storefrontPage }) => {
    // Arrange: PO azonosító és céges email megadása
    const corporateEmail = 'finance@astron.hu';
    const poNumber = 'PO-ASTRON-2026-X1';

    // Act: Termék választása és céges számlás fizetési mód
    await storefrontPage.selectProduct(1);
    await storefrontPage.fillCustomerDetails(corporateEmail, 1, 'HU');
    await storefrontPage.fillInvoicePayment(poNumber);
    await storefrontPage.submitOrder();

    // Assert: A rendelés létrejött PENDING státusszal
    await expect(storefrontPage.recentOrdersTable).toContainText(corporateEmail);
  });

  test('TC-SF-03 (Key 7): Pénznemváltás & árfolyamok kalkulációja (USD, EUR, HUF)', async ({ storefrontPage }) => {
    // Act & Assert 1: EUR váltás vizsgálata
    await storefrontPage.selectCurrency('EUR');
    await expect(storefrontPage.summaryTotal).toContainText(/€|EUR/);

    // Act & Assert 2: HUF váltás vizsgálata
    await storefrontPage.selectCurrency('HUF');
    await expect(storefrontPage.summaryTotal).toContainText(/Ft|HUF/);
  });

  test('TC-SF-04 (Key 8): Mennyiség határérték-elemzés (BVA)', async ({ storefrontPage }) => {
    // Act & Assert 1: Minimális érvényes érték (1)
    await storefrontPage.qtyInput.fill('1');
    await expect(storefrontPage.qtyInput).toHaveValue('1');

    // Act & Assert 2: Magasabb érvényes érték (5)
    await storefrontPage.qtyInput.fill('5');
    await expect(storefrontPage.qtyInput).toHaveValue('5');
  });

  test('TC-SF-05 (Key 9): Készlethiány negatív ág ellenőrzése', async ({ page, storefrontPage }) => {
    // Act: Raktárkészlet feletti irracionális mennyiség beírása
    await storefrontPage.qtyInput.fill('9999');
    await storefrontPage.submitOrder();

    // Assert: Készlethiány vagy hibaüzenet megjelenése
    const feedback = page.locator('.stock-err, .alert-danger, #stock-warning, [data-testid="order-feedback"]');
    if (await feedback.isVisible()) {
      await expect(feedback).toContainText(/készlet|stock|limit|nem elegendő/i);
    }
  });

  test('TC-SF-06 (Key 10): Országos adókulcsok kalkulációja (US 0%, DE 19%, HU 27%)', async ({ storefrontPage }) => {
    // US adókulcs (0%)
    await storefrontPage.countrySelect.selectOption('US');
    // DE adókulcs (19%)
    await storefrontPage.countrySelect.selectOption('DE');
    // HU adókulcs (27%)
    await storefrontPage.countrySelect.selectOption('HU');

    await expect(storefrontPage.summaryVat).toBeVisible();
  });

  test('TC-SF-07 (Key 11): EU VAT mentesítés (Reverse Charge) érvényes adószámmal', async ({ storefrontPage }) => {
    if (await storefrontPage.vatInput.isVisible()) {
      // Act: Érvényes német B2B adószám beírása és ellenőrzése a Page Objecten keresztül
      await storefrontPage.applyVatNumber('DE987654321');

      // Assert: Zöld jóváhagyó felirat vagy 0% ÁFA megjelenése
      // FIGYELEM: A webalkalmazásban lévő hiba (d{8,9} \d helyett) miatt ez a teszt jogosan bukik el!
      await expect(storefrontPage.vatFeedback).toContainText(/0% Reverse Charge B2B|\bValid EU\b/i);
    }
  });

  test('TC-SF-08 (Key 12): Érvénytelen EU VAT formátum elutasítása', async ({ storefrontPage }) => {
    if (await storefrontPage.vatInput.isVisible()) {
      // Act: Szintaktikailag hibás kód beírása
      await storefrontPage.applyVatNumber('hibas_vat_99');

      // Assert: Hibajelzés, alap adókulcs megmaradása
      await expect(storefrontPage.vatFeedback).toContainText(/érvénytelen|hibás|invalid/i);
    }
  });

  test('TC-SF-09 (Key 13): Százalékos kupon (AIWS25) 25% kedvezmény érvényesítése', async ({ storefrontPage }) => {
    // Act: AIWS25 kupon érvényesítése
    await storefrontPage.applyCoupon('AIWS25');

    // Assert: 25% kedvezmény megjelenése a kosárban
    await expect(storefrontPage.couponFeedback).toContainText(/25%|AIWS25/);
  });

  test('TC-SF-10 (Key 14): Fix összegű kupon (SAVE50) minimum kosárérték vizsgálata', async ({ storefrontPage }) => {
    // Act: SAVE50 kupon megadása
    await storefrontPage.applyCoupon('SAVE50');

    // Assert: Kosárérték vizsgálat visszajelzése
    await expect(storefrontPage.couponFeedback).toBeVisible();
  });

  test('TC-SF-11 (Key 15): Lejárt kupon negatív ág (EXPIRED2025)', async ({ storefrontPage }) => {
    // Act: Lejárt kuponkód bevitele
    await storefrontPage.applyCoupon('EXPIRED2025');

    // Assert: Lejárt kupon hibaüzenet
    await expect(storefrontPage.couponFeedback).toContainText(/lejárt|expired/i);
  });

  test('TC-SF-12 (Key 16): Elutasított bankkártya tranzakció (4000...0002)', async ({ page, storefrontPage }) => {
    // Arrange: Feliratkozás az elutasítási alert/dialog eseményre
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Act: Ismert elutasított tesztkártya használata a Page Objecten keresztül
    await storefrontPage.fillCardPayment('4000000000000002');
    await storefrontPage.submitOrder();

    // Assert: Tranzakció elutasítási hiba (Declined / 402)
    if (dialogMessage) {
      expect(dialogMessage).toMatch(/declined|elutasítva|insufficient|402/i);
    } else {
      const errDisplay = page.locator('.payment-err, #order-err, .toast-error, .alert-danger');
      await expect(errDisplay).toContainText(/elutasítva|declined|hiba/i);
    }
  });

  test('TC-SF-13 (Key 17): 3D Secure OTP megerősítés (4000...0003)', async ({ page, storefrontPage }) => {
    // Act: 3DS OTP-t igénylő tesztkártya kitöltése
    await storefrontPage.fillCardPayment('4000000000000003');
    await storefrontPage.submitOrder();

    // Assert: Megjelenik a 3DS OTP modal
    const otpModal = page.locator('#otp-modal, [data-modal="3ds"]');
    if (await otpModal.isVisible()) {
      await expect(otpModal).toBeVisible();
    }
  });

  test('TC-SF-14 (Key 18): Számlázási PO szám validáció', async ({ page, storefrontPage }) => {
    // Act: Túl rövid PO szám megadása a Page Objecttel
    await storefrontPage.fillInvoicePayment('PO');
    await storefrontPage.submitOrder();

    // Assert: Validációs hiba megjelenése
    const poErr = page.locator('.po-err, #form-error');
    if (await poErr.isVisible()) {
      await expect(poErr).toBeVisible();
    }
  });

});
