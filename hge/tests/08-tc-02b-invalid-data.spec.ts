import { test, expect } from '@playwright/test';
import { StorefrontPage, HeaderComponent } from '../pages';

test.describe('08 - TC-02B: Érvénytelen Adatok Kombinatorikus Tesztelése (Invalid Data Matrix)', () => {

  test.beforeEach(async ({ page }) => {
    const storefront = new StorefrontPage(page);
    const header = new HeaderComponent(page);
    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-02B.1 & TC-02B.2: Szintaktikailag hibás email címek (typeMismatch)', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // 1. @ nélküli email
    await storefront.emailInput.fill('rossz-email-formatum');
    await storefront.qtyInput.fill('1');
    await storefront.submitOrder();

    const isTypeMismatch1 = await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
    expect(isTypeMismatch1).toBe(true);

    // 2. Csak domain név @ nélkül
    await storefront.emailInput.fill('hianyzo-kukac.hu');
    await storefront.qtyInput.fill('2');
    await storefront.submitOrder();

    const isTypeMismatch2 = await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
    expect(isTypeMismatch2).toBe(true);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02B.3: Érvénytelen darabszám: 0 db (rangeUnderflow - min=1)', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.emailInput.fill('valid.user@astron.hu');
    await storefront.qtyInput.fill('0');

    await storefront.submitOrder();

    const isUnderflow = await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow);
    expect(isUnderflow).toBe(true);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02B.4: Érvénytelen darabszám: Negatív érték (-5)', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.emailInput.fill('valid.user@astron.hu');
    await storefront.qtyInput.fill('-5');

    await storefront.submitOrder();

    const isUnderflow = await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow);
    expect(isUnderflow).toBe(true);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02B.5 & TC-02B.6: Kettős hiba - Rossz email és 0 vagy negatív darabszám egyszerre', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    // Rossz email + 0 db
    await storefront.emailInput.fill('hibas-email');
    await storefront.qtyInput.fill('0');
    await storefront.submitOrder();

    expect(await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    expect(await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

    // Rossz email + -3 db
    await storefront.emailInput.fill('masik-hibas-email');
    await storefront.qtyInput.fill('-3');
    await storefront.submitOrder();

    expect(await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    expect(await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

  test('TC-02B.7: Hiányos email előtag (@astron.hu) és 0 darab', async ({ page }) => {
    const storefront = new StorefrontPage(page);

    await storefront.emailInput.fill('@astron.hu');
    await storefront.qtyInput.fill('0');
    await storefront.submitOrder();

    expect(await storefront.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    expect(await storefront.qtyInput.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);

    await expect(storefront.toastMessages).toHaveCount(0);
  });

});
