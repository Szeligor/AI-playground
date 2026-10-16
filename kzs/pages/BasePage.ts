import { Page, Locator } from '@playwright/test';

/**
 * Absztrakt BasePage Alaposztaly
 *
 * Minden Page Object ososztalya a kzs modulban.
 * Kezeli a kozos navigaciot, felulet-valto tabokat es a felhasznaloi szerepkoroket.
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export abstract class BasePage {
  readonly page: Page;
  readonly tabStorefront: Locator;
  readonly tabOrders: Locator;
  readonly tabSelectors: Locator;
  readonly tabApi: Locator;
  readonly tabSql: Locator;
  readonly trainerActorSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabStorefront = page.getByRole('button', { name: /Storefront/i });
    this.tabOrders = page.getByRole('button', { name: /Order Management/i });
    this.tabSelectors = page.getByRole('button', { name: /DOM & Selectors/i });
    this.tabApi = page.getByRole('button', { name: /API Console/i });
    this.tabSql = page.getByRole('button', { name: /SQL Workbench/i });
    this.trainerActorSelect = page.locator('#trainer-actor, #current-actor-select');
  }

  /**
   * Megnyitja az alkalmazas kezdolapjat az érvényes jelszoval.
   */
  async goto(url = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026'): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Atvalt a megadott fo nezetre (tabra).
   */
  async switchTab(tab: 'storefront' | 'orders' | 'selectors' | 'api' | 'sql'): Promise<void> {
    switch (tab) {
      case 'storefront':
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

  /**
   * Beallitja az aktiv szerepkort a trainer eszkoztaron.
   */
  async setActor(actor: 'admin' | 'junior' | 'auditor'): Promise<void> {
    if (await this.trainerActorSelect.isVisible()) {
      await this.trainerActorSelect.selectOption(actor);
    }
  }
}
