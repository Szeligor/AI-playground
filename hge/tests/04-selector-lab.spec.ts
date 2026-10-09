import { test, expect } from '@playwright/test';
import { BasePage, HeaderComponent, SelectorLabPage } from '../pages';

test.describe('04 - Aszinkron & Interaktív DOM Lab', () => {

  test.beforeEach(async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);
    await base.goto();
    await header.switchTab('selectors');
  });

  test('TC-LAB-01: Debounced Kereső - 300ms késleltetés és automatikus találati lista', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    await labPage.searchAsync('runner');

    // Találati lista auto-waiting megjelenése
    await expect(labPage.asyncResults).toBeVisible();
    await expect(labPage.asyncResults).toContainText('QA Automation Runner License');
  });

  test('TC-LAB-02: Ephemeral Toast Értesítés - Megjelenés, siker üzenet és manuális bezárás', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    await labPage.triggerToast(false);

    const toast = labPage.toastMessages.first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('provisioned successfully');

    // Bezárás 'x' gombbal
    await toast.getByRole('button', { name: '×' }).click();
    await expect(toast).toBeHidden();
  });

  test('TC-LAB-03: Akadálymentes Terms Modális Ablak - ESC billentyűvel és Accept gombbal', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    // Megnyitás és zárás ESC gombbal
    await labPage.openTermsModal();
    await expect(labPage.termsModal).toBeVisible();
    await expect(labPage.modalStatusFeedback).toHaveText('Modal is OPEN.');

    await page.keyboard.press('Escape');
    await expect(labPage.termsModal).toBeHidden();
    await expect(labPage.modalStatusFeedback).toHaveText('Modal was dismissed.');

    // Újra megnyitás és Accept
    await labPage.openTermsModal();
    await labPage.acceptTermsModal();
    await expect(labPage.termsModal).toBeHidden();
    await expect(labPage.modalStatusFeedback).toHaveText('Modal terms ACCEPTED!');
  });

  test('TC-LAB-04: Fájlfeltöltés Érvényes Ág - .pdf vagy .png elfogadása', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    await labPage.fileUploadInput.setInputFiles({
      name: 'audit-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 mock content')
    });

    await expect(labPage.fileUploadFeedback).toBeVisible();
    await expect(labPage.fileUploadFeedback).toContainText('Upload valid: audit-report.pdf');
  });

  test('TC-LAB-05: Fájlfeltöltés Mérethatár Negatív Ág - 2MB feletti fájl elutasítása (413)', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    await labPage.fileUploadInput.setInputFiles({
      name: 'huge-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(2.5 * 1024 * 1024)
    });

    await expect(labPage.fileUploadFeedback).toBeVisible();
    await expect(labPage.fileUploadFeedback).toContainText('Error 413: File size exceeds 2MB limit');
  });

  test('TC-LAB-06: Fájlfeltöltés Negatív Ág - Nem támogatott formátum elutasítása (415)', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    await labPage.fileUploadInput.setInputFiles({
      name: 'script.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('binary')
    });

    await expect(labPage.fileUploadFeedback).toBeVisible();
    await expect(labPage.fileUploadFeedback).toContainText('Error 415: Unsupported media type');
  });

  test('TC-LAB-07: Resilient DOM vs Fragile Rebuild - DOM mutáció után is stabil web-first lokátor', async ({ page }) => {
    const labPage = new SelectorLabPage(page);

    // DOM rebuild trigger
    page.once('dialog', async dialog => await dialog.accept());
    await labPage.triggerDomRebuild();

    // A web-first data-testid űrlap változatlanul megbízhatóan lefut
    await labPage.submitCleanForm('automation@astron.hu', 'pom');

    await expect(labPage.cleanFeedback).toBeVisible();
    await expect(labPage.cleanFeedback).toContainText('Bulletproof Web-First Submission!');
    await expect(labPage.cleanFeedback).toContainText('automation@astron.hu');
  });

});
