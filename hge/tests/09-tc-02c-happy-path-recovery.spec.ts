import { test, expect } from '@playwright/test';
import { StorefrontPage, HeaderComponent } from '../pages';

test.describe('09 - TC-02C: Hibák Utáni Sikeres Vásárlás (Happy Path Recovery Flow)', () => {

  test.beforeEach(async ({ page }) => {
    const storefront = new StorefrontPage(page);
    const header = new HeaderComponent(page);
    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-02C.1: Teljes Helyreállítási Folyamat - Hibás kitöltés után adatok javítása és sikeres vásárlás', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // 1. LÉPÉS: Hibás adatokkal próbálkozunk először
    await storefront.emailInput.fill('hibas-nem-letezo-email');
    await storefront.qtyInput.fill('0');
    await storefront.submitOrder();

    // Validáció megállítja, nem keletkezik rendelés
    expect(await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    expect(await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    await expect(storefront.toastMessages).toHaveCount(0);

    // 2. LÉPÉS: HELYREÁLLÍTÁS (Adatok javítása érvényesre)
    // 2-es termék kiválasztása (Enterprise Load Testing Engine - $490)
    await storefront.selectProduct(2);

    // Érvényes adatok beírása
    await storefront.emailInput.fill('recovery.tester@astron.hu');
    await storefront.qtyInput.fill('2');
    await storefront.countrySelect.selectOption('US'); // 0% Tax az egyszerű összehasonlíthatóságért

    // Kosár összegző ellenőrzése beküldés előtt
    await expect(storefront.summaryProduct).toHaveText('Enterprise Load Testing Engine');
    await expect(storefront.summaryQty).toHaveText('2 units');
    await expect(storefront.summaryTotal).toHaveText('$980'); // 490 * 2 = 980

    // Érvényes bankkártya adatok
    await storefront.selectPaymentMethod('card');
    await storefront.fillCardDetails('4000 0000 0000 0001', '12/28', '123');

    // 3. LÉPÉS: Sikeres megrendelés leadása
    await storefront.submitOrder();

    // 4. LÉPÉS: Eredmények ellenőrzése
    // Toast értesítés
    await expect(storefront.toastMessages.first()).toBeVisible();
    await expect(storefront.toastMessages.first()).toContainText('placed successfully');

    // Live Database Orders első sora a javított adatokkal
    await expect(storefront.recentOrderRows.first()).toContainText('recovery.tester@astron.hu');
    await expect(storefront.recentOrderRows.first()).toContainText('PAID');
    await expect(storefront.recentOrderRows.first()).toContainText('$980');
  });

  test('TC-02C.2: Helyreállítás Corporate Invoice fizetési móddal rövid PO szám javítása után', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('invoice.recovery@astron.hu', 1, 'US');
    await storefront.selectPaymentMethod('invoice');

    // 1. Hibás PO szám (< 5 karakter)
    await storefront.fillPoNumber('PO1');

    let alertTriggered = false;
    page.once('dialog', async dialog => {
      alertTriggered = true;
      await dialog.accept();
    });
    await storefront.submitOrder();

    expect(alertTriggered).toBe(true);

    // 2. Javítás érvényes PO azonosítóra
    await storefront.fillPoNumber('PO-ASTRON-2026-RECOVERY');
    await storefront.submitOrder();

    // 3. Sikeres rendelés létrejön PENDING státusszal
    await expect(storefront.toastMessages.first()).toBeVisible();
    await expect(storefront.recentOrderRows.first()).toContainText('invoice.recovery@astron.hu');
    await expect(storefront.recentOrderRows.first()).toContainText('PENDING');
  });

});
