import { Page, Locator } from '@playwright/test';

export class GateOverlay {
  readonly page: Page;
  readonly overlay: Locator;
  readonly passwordInput: Locator;
  readonly unlockButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overlay = page.locator('#gate-overlay');
    this.passwordInput = page.locator('#gate-pass');
    this.unlockButton = page.locator('#gate-btn');
    this.errorMessage = page.locator('#gate-err');
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickUnlock(): Promise<void> {
    await this.unlockButton.click();
  }

  async unlock(password: string): Promise<void> {
    await this.enterPassword(password);
    await this.clickUnlock();
  }

  async isOverlayVisible(): Promise<boolean> {
    return await this.overlay.isVisible();
  }
}
