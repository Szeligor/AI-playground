import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly tabStorefront: Locator;
  readonly tabOrders: Locator;
  readonly tabSelectors: Locator;
  readonly tabApi: Locator;
  readonly tabSql: Locator;
  readonly currentUserDisplay: Locator;
  readonly currentRoleBadge: Locator;
  readonly switchUserButton: Locator;
  readonly resetDbButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabStorefront = page.getByRole('button', { name: /Storefront/i });
    this.tabOrders = page.getByRole('button', { name: /Order Management/i });
    this.tabSelectors = page.getByRole('button', { name: /Selector & DOM Lab/i });
    this.tabApi = page.getByRole('button', { name: /API Swagger/i });
    this.tabSql = page.getByRole('button', { name: /SQL Workbench/i });
    this.currentUserDisplay = page.getByTestId('current-user-name');
    this.currentRoleBadge = page.getByTestId('current-role-badge');
    this.switchUserButton = page.getByTestId('switch-user-btn');
    this.resetDbButton = page.getByTestId('btn-reset-db');
  }

  async switchTab(tab: 'ui' | 'orders' | 'selectors' | 'api' | 'sql'): Promise<void> {
    switch (tab) {
      case 'ui':
        await this.tabStorefront.click();
        break;
      case 'orders':
        await this.tabOrders.click();
        break;
      case 'selectors':
        await this.tabSelectors.click();
        break;
      case 'api':
        await this.tabApi.click();
        break;
      case 'sql':
        await this.tabSql.click();
        break;
    }
  }

  async openAuthModal(): Promise<void> {
    await this.switchUserButton.click();
  }

  async resetDatabase(): Promise<void> {
    await this.resetDbButton.click();
  }
}
