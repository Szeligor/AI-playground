import { Page, Locator } from '@playwright/test';

export class AuthModal {
  readonly page: Page;
  readonly modalOverlay: Locator;
  readonly closeButton: Locator;
  readonly actorUserBtn: Locator;
  readonly actorAdminBtn: Locator;
  readonly actorJuniorBtn: Locator;
  readonly actorBlockedBtn: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitBtn: Locator;
  readonly authError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalOverlay = page.locator('#auth-modal');
    this.closeButton = page.getByTestId('btn-close-auth-modal');
    this.actorUserBtn = page.getByTestId('select-actor-user');
    this.actorAdminBtn = page.getByTestId('select-actor-admin');
    this.actorJuniorBtn = page.getByTestId('select-actor-junior');
    this.actorBlockedBtn = page.getByTestId('select-actor-blocked');
    this.emailInput = page.getByTestId('auth-email');
    this.passwordInput = page.getByTestId('auth-password');
    this.loginSubmitBtn = page.getByTestId('auth-login-btn');
    this.authError = page.getByTestId('auth-error');
  }

  async selectActor(role: 'user' | 'admin' | 'junior' | 'blocked'): Promise<void> {
    switch (role) {
      case 'user':
        await this.actorUserBtn.click();
        break;
      case 'admin':
        await this.actorAdminBtn.click();
        break;
      case 'junior':
        await this.actorJuniorBtn.click();
        break;
      case 'blocked':
        await this.actorBlockedBtn.click();
        break;
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginSubmitBtn.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
