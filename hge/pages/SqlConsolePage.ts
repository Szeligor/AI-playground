import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SqlConsolePage extends BasePage {
  readonly sqlInput: Locator;
  readonly executeBtn: Locator;
  readonly resultsBox: Locator;
  readonly queryChips: Locator;

  constructor(page: Page) {
    super(page);
    this.sqlInput = page.getByTestId('sql-query-input');
    this.executeBtn = page.getByTestId('btn-execute-sql');
    this.resultsBox = page.getByTestId('sql-results-box');
    this.queryChips = page.locator('.chip-query');
  }

  async runQuery(query: string): Promise<void> {
    await this.sqlInput.fill(query);
    await this.executeBtn.click();
  }

  async clickChip(chipText: string): Promise<void> {
    await this.page.locator('.chip-query', { hasText: chipText }).click();
  }
}
