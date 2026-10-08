import { Page, Locator } from '@playwright/test';

export class NavbarComponent {
  readonly page: Page;
  readonly brandBadge: Locator;
  readonly brandTitle: Locator;
  readonly storefrontTabButton: Locator;
  readonly selectorLabTabButton: Locator;
  readonly apiSwaggerTabButton: Locator;
  readonly sqlDatabaseTabButton: Locator;
  readonly resetDbButton: Locator;
  readonly missionGuideLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandBadge = page.locator('.brand-badge');
    this.brandTitle = page.locator('.brand-title');
    this.storefrontTabButton = page.getByRole('button', { name: /Storefront \(UI\)/i });
    this.selectorLabTabButton = page.getByRole('button', { name: /Selector & DOM Lab/i });
    this.apiSwaggerTabButton = page.getByRole('button', { name: /API Swagger Console/i });
    this.sqlDatabaseTabButton = page.getByRole('button', { name: /Live SQL Database/i });
    this.resetDbButton = page.getByRole('button', { name: /Reset DB Seed/i });
    this.missionGuideLink = page.getByRole('link', { name: /Mission Guide/i });
  }

  async switchToStorefront(): Promise<void> {
    await this.storefrontTabButton.click();
  }

  async switchToSelectorLab(): Promise<void> {
    await this.selectorLabTabButton.click();
  }

  async switchToApiSwagger(): Promise<void> {
    await this.apiSwaggerTabButton.click();
  }

  async switchToSqlDatabase(): Promise<void> {
    await this.sqlDatabaseTabButton.click();
  }

  async resetDatabase(): Promise<void> {
    await this.resetDbButton.click();
  }
}
