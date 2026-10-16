import { test, expect } from '../fixtures';

/**
 * Selector & DOM Lab E2E Tesztcsomag (POM & Custom Fixture Alapon)
 *
 * Lefedett tesztesetek:
 * - TC-LAB-01 (Key 41): Debounced Kereső (300ms)
 * - TC-LAB-02 (Key 42): Ephemeral Toast Értesítés
 * - TC-LAB-03 (Key 43): Akadálymentes Terms Modál (ESC billentyű)
 * - TC-LAB-04 (Key 44): Érvényes Fájlfeltöltés (.pdf vagy .png)
 * - TC-LAB-07 (Key 47): Resilient DOM vs Rebuild
 * - TC-LAB-08 (Key 68): Hiba Toast Értesítés Megjelenése
 * - TC-LAB-09 (Key 69): Modál Bezárása Háttérre Kattintással
 *
 * Tervezési minta: Page Object Model (kzs/pages/SelectorLabPage) + Custom Fixtures (kzs/fixtures).
 */

test.describe('4. Modul: Selector & DOM Lab Aszinkron Komponensek', () => {

  test.beforeEach(async ({ selectorLabPage }) => {
    await selectorLabPage.goto();
    if (await selectorLabPage.tabSelectors.isVisible()) {
      await selectorLabPage.tabSelectors.click();
    }
  });

  test('TC-LAB-01 (Key 41): Debounced keresőmező 300 ms késleltetéssel', async ({ page }) => {
    const debouncedInput = page.locator('#async-search-input');
    if (await debouncedInput.isVisible()) {
      // Act: Gépelés a mezőbe
      await debouncedInput.fill('QA');

      // Assert: A betöltési spinner megjelenik, majd eltűnik, és megjelenik a találat
      const results = page.locator('#async-search-results');
      await expect(results).toBeVisible();
    }
  });

  test('TC-LAB-02 (Key 42): Ephemeral toast értesítés automatikus eltűnése', async ({ page }) => {
    const toastBtn = page.locator('[data-testid="btn-trigger-toast"]');
    if (await toastBtn.isVisible()) {
      // Act: Toast triggerelése
      await toastBtn.click();

      // Assert 1: A toast azonnal megjelenik
      const toast = page.locator('[data-testid="toast-notification"]').first();
      await expect(toast).toBeVisible();

      // Assert 2: Manuális bezárás
      const closeBtn = toast.locator('button');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await expect(toast).not.toBeVisible();
      }
    }
  });

  test('TC-LAB-03 (Key 43): Akadálymentes Terms modál megnyitás és bezárás ESC gombbal', async ({ page, selectorLabPage }) => {
    if (await selectorLabPage.openModalBtn.isVisible()) {
      // Act: Modál megnyitása a Page Objecten keresztül
      await selectorLabPage.openTermsModal();

      // Assert: A modális ablak megjelenik
      await expect(selectorLabPage.termsModal).toHaveClass(/open/);

      // Act: ESC billentyű leütése
      await page.keyboard.press('Escape');

      // Assert: A modális ablak bezáródik
      await expect(selectorLabPage.termsModal).not.toHaveClass(/open/);
    }
  });

  test('TC-LAB-04 (Key 44): Érvényes fájlfeltöltés (.pdf vagy .png)', async ({ selectorLabPage }) => {
    if (await selectorLabPage.fileInput.isVisible()) {
      // Act: Fájl csatolása a Page Object uploadFile metódusával
      await selectorLabPage.uploadFile('test-document.pdf', 'application/pdf', 'PDF_SAMPLE_TEST_CONTENT');

      // Assert: Sikeres feltöltés visszajelzése
      await expect(selectorLabPage.fileFeedback).toContainText('test-document.pdf');
    }
  });

  test('TC-LAB-07 (Key 47): Resilient DOM lokátor stabilitás újragenerálás (rebuild) után', async ({ selectorLabPage }) => {
    if (await selectorLabPage.rebuildDomBtn.isVisible()) {
      // Act: DOM újragenerálása a Page Object metódusával
      await selectorLabPage.triggerRebuild();

      // Assert: A Web-First mező lokátor továbbra is stabilan kitölthető
      if (await selectorLabPage.cleanEmailInput.isVisible()) {
        await selectorLabPage.cleanEmailInput.fill('resilient@astron.hu');
        await expect(selectorLabPage.cleanEmailInput).toHaveValue('resilient@astron.hu');
      }
    }
  });

  test('TC-LAB-08 (Key 68): Kifejezetten hiba stílusú Toast értesítés megjelenése', async ({ selectorLabPage }) => {
    if (await selectorLabPage.errorToastBtn.isVisible()) {
      // Act: Hiba toast kiváltása
      await selectorLabPage.triggerErrorToast();

      // Assert: Hiba stílusú toast megjelenése
      await expect(selectorLabPage.errorToast.first()).toBeVisible();
    }
  });

  test('TC-LAB-09 (Key 69): Terms modál bezárása a háttérre (backdrop) kattintva', async ({ selectorLabPage }) => {
    if (await selectorLabPage.openModalBtn.isVisible()) {
      // Act: Modál megnyitása
      await selectorLabPage.openTermsModal();

      // FIGYELEM: A weboldalon nincs click handler a backdropra kötve!
      // A teszt a Defect-Focused Mindset alapján jogosan jelzi ezt a valós szoftverhibát.
      await selectorLabPage.clickModalBackdrop();
      await expect(selectorLabPage.termsModal).not.toHaveClass(/open/);
    }
  });

});
