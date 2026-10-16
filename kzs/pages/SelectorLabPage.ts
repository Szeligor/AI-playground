import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SelectorLabPage Page Object
 *
 * Leképezi a DOM & Selectors Lab felületét (DOM rebuild, dinamikus azonosítók,
 * fájlfeltöltés, Toast értesítések és Terms modál ablak).
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export class SelectorLabPage extends BasePage {
  readonly rebuildDomBtn: Locator;
  readonly cleanEmailInput: Locator;
  readonly fileInput: Locator;
  readonly fileFeedback: Locator;
  readonly openModalBtn: Locator;
  readonly termsModal: Locator;
  readonly modalCloseBtn: Locator;
  readonly errorToastBtn: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);

    this.rebuildDomBtn = page.getByRole('button', { name: /Trigger DOM Rebuild/i });
    this.cleanEmailInput = page.locator('#clean-email-input');
    this.fileInput = page.locator('#lab-file-input');
    this.fileFeedback = page.locator('#file-upload-feedback');
    this.openModalBtn = page.getByTestId('btn-open-modal').or(page.locator('#btn-open-modal'));
    this.termsModal = page.locator('#terms-modal');
    this.modalCloseBtn = page.locator('#terms-modal .btn-close, #terms-modal button:has-text("Close")');
    this.errorToastBtn = page.getByTestId('btn-trigger-err-toast');
    this.errorToast = page.locator('.toast-error');
  }

  /**
   * DOM ujrageneralasa (rebuild trigger).
   */
  async triggerRebuild(): Promise<void> {
    this.page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
    await this.rebuildDomBtn.click();
  }

  /**
   * Fajl feltoltese a setInputFiles metodussal.
   */
  async uploadFile(fileName: string, mimeType: string, content: string): Promise<void> {
    const buffer = Buffer.from(content);
    await this.fileInput.setInputFiles({
      name: fileName,
      mimeType,
      buffer,
    });
  }

  /**
   * Terms modal megnyitasa.
   */
  async openTermsModal(): Promise<void> {
    await this.openModalBtn.click();
  }

  /**
   * Terms modal bezarasa a modális ablakon kivuli hatterre (backdrop) kattintva.
   */
  async clickModalBackdrop(): Promise<void> {
    await this.termsModal.click({ position: { x: 5, y: 5 } });
  }

  /**
   * Hiba Toast ertesites kivaltasa.
   */
  async triggerErrorToast(): Promise<void> {
    await this.errorToastBtn.click();
  }
}
