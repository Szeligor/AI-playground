import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly toastContainer: Locator;
  readonly toastMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastContainer = page.locator('#toast-container');
    this.toastMessages = page.getByTestId('toast-notification');
  }

  async goto(url: string = 'https://testacademy.hu/qa-lab/e2e-app?unlocked=true'): Promise<void> {
    await this.page.goto(url);
  }

  async waitForToast(): Promise<Locator> {
    const toast = this.toastMessages.first();
    await toast.waitFor({ state: 'visible' });
    return toast;
  }
}
