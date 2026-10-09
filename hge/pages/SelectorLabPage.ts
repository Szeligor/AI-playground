import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SelectorLabPage extends BasePage {
  readonly cleanEmailInput: Locator;
  readonly cleanRoleSelect: Locator;
  readonly cleanSubmitBtn: Locator;
  readonly cleanFeedback: Locator;
  readonly mutateClassesBtn: Locator;
  readonly fragileSubmitBtn: Locator;
  readonly fragileFeedback: Locator;
  readonly asyncSearchInput: Locator;
  readonly asyncSpinner: Locator;
  readonly asyncResults: Locator;
  readonly triggerToastBtn: Locator;
  readonly triggerErrToastBtn: Locator;
  readonly openTermsModalBtn: Locator;
  readonly termsModal: Locator;
  readonly closeTermsModalBtn: Locator;
  readonly acceptTermsModalBtn: Locator;
  readonly modalStatusFeedback: Locator;
  readonly fileUploadInput: Locator;
  readonly fileUploadFeedback: Locator;

  constructor(page: Page) {
    super(page);
    this.cleanEmailInput = page.getByTestId('clean-email');
    this.cleanRoleSelect = page.getByTestId('clean-role');
    this.cleanSubmitBtn = page.getByTestId('clean-submit-btn');
    this.cleanFeedback = page.locator('#clean-feedback');
    this.mutateClassesBtn = page.getByRole('button', { name: /Trigger DOM Rebuild/i });
    this.fragileSubmitBtn = page.locator('#fragile-dynamic-btn');
    this.fragileFeedback = page.locator('#fragile-feedback');
    this.asyncSearchInput = page.getByTestId('async-search-input');
    this.asyncSpinner = page.locator('#async-search-spinner');
    this.asyncResults = page.getByTestId('search-results-dropdown');
    this.triggerToastBtn = page.getByTestId('btn-trigger-toast');
    this.triggerErrToastBtn = page.getByTestId('btn-trigger-err-toast');
    this.openTermsModalBtn = page.getByTestId('btn-open-modal');
    this.termsModal = page.locator('#terms-modal');
    this.closeTermsModalBtn = page.getByTestId('btn-close-modal');
    this.acceptTermsModalBtn = page.getByTestId('btn-accept-modal');
    this.modalStatusFeedback = page.locator('#modal-status-feedback');
    this.fileUploadInput = page.getByTestId('file-upload-input');
    this.fileUploadFeedback = page.getByTestId('file-upload-feedback');
  }

  async submitCleanForm(email: string, role: string): Promise<void> {
    await this.cleanEmailInput.fill(email);
    await this.cleanRoleSelect.selectOption(role);
    await this.cleanSubmitBtn.click();
  }

  async triggerDomRebuild(): Promise<void> {
    await this.mutateClassesBtn.click();
  }

  async searchAsync(term: string): Promise<void> {
    await this.asyncSearchInput.fill(term);
  }

  async triggerToast(isError: boolean = false): Promise<void> {
    if (isError) {
      await this.triggerErrToastBtn.click();
    } else {
      await this.triggerToastBtn.click();
    }
  }

  async openTermsModal(): Promise<void> {
    await this.openTermsModalBtn.click();
  }

  async closeTermsModal(): Promise<void> {
    await this.closeTermsModalBtn.click();
  }

  async acceptTermsModal(): Promise<void> {
    await this.acceptTermsModalBtn.click();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileUploadInput.setInputFiles(filePath);
  }
}
