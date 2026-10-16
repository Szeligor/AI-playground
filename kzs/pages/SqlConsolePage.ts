import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SqlConsolePage Page Object
 *
 * Leképezi az in-memory SQL Workbench felületét, a gyorslekérdezési chipeket,
 * a lekérdezés-futtató gombot és az eredménytáblázatot.
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export class SqlConsolePage extends BasePage {
  readonly sqlInput: Locator;
  readonly runQueryBtn: Locator;
  readonly chipAllOrders: Locator;
  readonly chipAuditLogs: Locator;
  readonly chipTopCustomers: Locator;
  readonly resultsContainer: Locator;
  readonly resultsTable: Locator;

  constructor(page: Page) {
    super(page);

    this.sqlInput = page.locator('#sql-input');
    this.runQueryBtn = page.getByRole('button', { name: /Run Query/i }).or(page.locator('#btn-run-sql'));
    this.chipAllOrders = page.getByRole('button', { name: 'All Orders' });
    this.chipAuditLogs = page.getByRole('button', { name: 'Audit Logs' });
    this.chipTopCustomers = page.getByRole('button', { name: 'Top Customers' });
    this.resultsContainer = page.locator('#sql-results-container');
    this.resultsTable = page.locator('#sql-results-container table');
  }

  /**
   * Egyedi SQL lekerdezes beirasa es futtatasa.
   */
  async executeQuery(sql: string): Promise<void> {
    await this.sqlInput.fill(sql);
    await this.runQueryBtn.click();
  }

  /**
   * All Orders gyorslekerdezes chip kivalasztasa.
   */
  async selectAllOrdersChip(): Promise<void> {
    await this.chipAllOrders.click();
  }

  /**
   * Audit Logs gyorslekerdezes chip kivalasztasa.
   */
  async selectAuditLogsChip(): Promise<void> {
    await this.chipAuditLogs.click();
  }
}
