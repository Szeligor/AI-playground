import { Page, Locator } from '@playwright/test';

export class GateComponent {
  readonly page: Page;
  readonly overlay: Locator;
  readonly passcodeInput: Locator;
  readonly unlockButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overlay = page.locator('#gate-overlay');
    this.passcodeInput = page.locator('#gate-pass');
    this.unlockButton = page.getByRole('button', { name: /Unlock Environment/i });
    this.errorMessage = page.locator('#gate-err');
  }

  async unlock(passcode: string): Promise<void> {
    await this.passcodeInput.fill(passcode);
    await this.unlockButton.click();
  }
}
