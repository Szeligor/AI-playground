import { test, expect } from '@playwright/test';
import { StorefrontPage, HeaderComponent } from '../pages';

test.describe('07 - TC-02A: Üres Mezők Kombinatorikus Tesztelése (Decision Table)', () => {

  test.beforeEach(async ({ page }) => {
    const storefront = new StorefrontPage(page);
    const header = new HeaderComponent(page);
    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-02A.1: Teljesen üres űrlap beküldésének elutasítása (Email és Darabszám üres)', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // Mindkét mező kiürítése
    await storefront.emailInput.fill('');
    await storefront.qtyInput.fill('');

    // Beküldési kísérlet
    await storefront.submitOrder();

    // HTML5 validáció: email mező értéke hiányzik (valueMissing)
    const isValueMissing = await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isValueMissing).toBe(true);

    // Nincs új rendelés a táblázatban
    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02A.2: Csak az Email mező üres, a darabszám kitöltve', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // Email üres, Darabszám: 2
    await storefront.emailInput.fill('');
    await storefront.qtyInput.fill('2');

    await storefront.submitOrder();

    // Validáció meghiúsul az email mezőn
    const isValid = await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);

    // Táblázatban nem jön létre rekord
    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02A.3: Email kitöltve, de a Darabszám mező teljesen üres', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.emailInput.fill('valid.user@astron.hu');
    await storefront.qtyInput.fill('');

    await storefront.submitOrder();

    // Validáció meghiúsul a Darabszám mezőn (hiányzó vagy érvénytelen érték)
    const isQtyValid = await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isQtyValid).toBe(false);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

});
