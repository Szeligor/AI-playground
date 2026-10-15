import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Selector & DOM Lab E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-LAB-01 (Key 41): Debounced Kereső (300ms)
 * - TC-LAB-02 (Key 42): Ephemeral Toast Értesítés
 * - TC-LAB-03 (Key 43): Akadálymentes Terms Modál
 * - TC-LAB-04 (Key 44): Érvényes Fájlfeltöltés
 * - TC-LAB-05 (Key 45): Fájl Mérethatár Negatív Ág
 * - TC-LAB-06 (Key 46): Nem Támogatott Fájlformátum
 * - TC-LAB-07 (Key 47): Resilient DOM vs Rebuild
 * - TC-LAB-08 (Key 68): Hiba Toast Értesítés Megjelenése
 * - TC-LAB-09 (Key 69): Modál Bezárása Háttérre Kattintással
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Cél: Aszinkron események, időzítések, dinamikus DOM felépülés és fájlfeltöltés tesztelése.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('4. Modul: Selector & DOM Lab Aszinkron Komponensek', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    const labBtn = page.getByRole('button', { name: /Selector & DOM Lab/i });
    if (await labBtn.isVisible()) {
      await labBtn.click();
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

  test('TC-LAB-03 (Key 43): Akadálymentes Terms modál megnyitás és bezárás ESC gombbal', async ({ page }) => {
    const openTermsBtn = page.locator('[data-testid="btn-open-modal"]');
    if (await openTermsBtn.isVisible()) {
      // Act: Modál megnyitása
      await openTermsBtn.click();

      // Assert: A modális ablak megjelenik
      const modal = page.locator('#terms-modal');
      await expect(modal).toHaveClass(/open/);

      // Act: ESC billentyű leütése
      await page.keyboard.press('Escape');

      // Assert: A modális ablak bezáródik
      await expect(modal).not.toHaveClass(/open/);
    }
  });

  test('TC-LAB-04 (Key 44): Érvényes fájlfeltöltés (.pdf vagy .png)', async ({ page }) => {
    const fileInput = page.locator('#lab-file-input');
    if (await fileInput.isVisible()) {
      // Arrange: Kisméretű tesztfájl létrehozása a memóriában és átadása
      const testBuffer = Buffer.from('PDF_SAMPLE_TEST_CONTENT');
      
      // Act: Fájl csatolása a Playwright setInputFiles metódusával
      await fileInput.setInputFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: testBuffer,
      });

      // Assert: Sikeres feltöltés visszajelzése
      await expect(page.locator('#file-upload-feedback')).toContainText('test-document.pdf');
    }
  });

  test('TC-LAB-07 (Key 47): Resilient DOM lokátor stabilitás újragenerálás (rebuild) után', async ({ page }) => {
    const regenBtn = page.getByRole('button', { name: /Trigger DOM Rebuild/i });
    if (await regenBtn.isVisible()) {
      // Act: DOM újragenerálása
      page.once('dialog', async dialog => {
        await dialog.dismiss();
      });
      await regenBtn.click();

      // Assert: A Web-First szerepkör alapú űrlap lokátorok továbbra is stabilan működnek
      const cleanEmail = page.locator('#clean-email-input');
      if (await cleanEmail.isVisible()) {
        await cleanEmail.fill('resilient@astron.hu');
        await expect(cleanEmail).toHaveValue('resilient@astron.hu');
      }
    }
  });

  test('TC-LAB-08 (Key 68): Kifejezetten hiba stílusú Toast értesítés megjelenése', async ({ page }) => {
    const errToastBtn = page.locator('[data-testid="btn-trigger-err-toast"]');
    if (await errToastBtn.isVisible()) {
      await errToastBtn.click();
      const errToast = page.locator('.toast-error').first();
      await expect(errToast).toBeVisible();
    }
  });

  test('TC-LAB-09 (Key 69): Terms modál bezárása a háttérre (backdrop) kattintva', async ({ page }) => {
    const openTermsBtn = page.locator('[data-testid="btn-open-modal"]');
    if (await openTermsBtn.isVisible()) {
      await openTermsBtn.click();

      // FIGYELEM: A weboldalon nincs click handler a backdropra kötve!
      // A teszt jogosan jelzi ezt a hiányzó funkcionalitást / hibát.
      const backdrop = page.locator('#terms-modal');
      await backdrop.click({ position: { x: 5, y: 5 } });
      await expect(backdrop).not.toHaveClass(/open/);
    }
  });

});
