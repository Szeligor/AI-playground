import { Page, Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { NavbarComponent } from '../common/NavbarComponent';

export type QuickQueryChip =
  | 'All Orders'
  | 'All Users'
  | 'Inventory'
  | 'Check Duplicates'
  | 'Force Refund (ID 101)';

export class SqlConsolePage extends BasePage {
  readonly navbar: NavbarComponent;

  // Editor elemek
  readonly sqlTextarea: Locator;
  readonly runQueryBtn: Locator;

  // Gyorslekérdezés gombok (chips)
  readonly chipAllOrders: Locator;
  readonly chipAllUsers: Locator;
  readonly chipInventory: Locator;
  readonly chipCheckDuplicates: Locator;
  readonly chipForceRefund: Locator;

  // Eredmények
  readonly resultsContainer: Locator;
  readonly resultsTable: Locator;
  readonly resultsRows: Locator;

  // Adatbázis séma kártya
  readonly schemaHelpBox: Locator;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);

    this.sqlTextarea = page.locator('#sql-input');
    this.runQueryBtn = page.getByRole('button', { name: /Run Query/i });

    this.chipAllOrders = page.getByRole('button', { name: 'All Orders' });
    this.chipAllUsers = page.getByRole('button', { name: 'All Users' });
    this.chipInventory = page.getByRole('button', { name: 'Inventory' });
    this.chipCheckDuplicates = page.getByRole('button', { name: 'Check Duplicates' });
    this.chipForceRefund = page.getByRole('button', { name: 'Force Refund (ID 101)' });

    this.resultsContainer = page.locator('#sql-results-container');
    this.resultsTable = page.locator('#sql-results-container table');
    this.resultsRows = page.locator('#sql-results-container table tbody tr');

    this.schemaHelpBox = page.locator('.schema-help-box');
  }

  async openSqlConsole(): Promise<void> {
    await this.navbar.switchToSqlDatabase();
  }

  async runQuery(sql: string): Promise<void> {
    await this.sqlTextarea.fill(sql);
    await this.runQueryBtn.click();
  }

  async clickQuickQuery(chipName: QuickQueryChip): Promise<void> {
    const chipMap: Record<QuickQueryChip, Locator> = {
      'All Orders': this.chipAllOrders,
      'All Users': this.chipAllUsers,
      'Inventory': this.chipInventory,
      'Check Duplicates': this.chipCheckDuplicates,
      'Force Refund (ID 101)': this.chipForceRefund,
    };
    await chipMap[chipName].click();
  }
}
