import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * OrderManagementPage Page Object
 *
 * Leképezi az ERP megrendelés-kezelési táblázatot, szűrést, rendezést, lapozást és állapotgép gombokat.
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export class OrderManagementPage extends BasePage {
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly sortSelect: Locator;
  readonly ordersTable: Locator;
  readonly orderRows: Locator;
  readonly paginationInfo: Locator;
  readonly paginationPrevBtn: Locator;
  readonly paginationNextBtn: Locator;
  readonly exportCsvBtn: Locator;
  readonly statusBadges: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.getByTestId('order-search-input').or(page.locator('#mgmt-search'));
    this.statusFilter = page.getByTestId('order-status-filter').or(page.locator('#mgmt-status-filter'));
    this.sortSelect = page.getByTestId('order-sort-select').or(page.locator('#mgmt-sort'));
    this.ordersTable = page.getByTestId('mgmt-orders-table').or(page.locator('#mgmt-orders-table, #mgmt-orders-tbody'));
    this.orderRows = page.locator('#mgmt-orders-tbody tr');
    this.paginationInfo = page.locator('#mgmt-pagination-info');
    this.paginationPrevBtn = page.getByTestId('pagination-prev').or(page.locator('#mgmt-btn-prev'));
    this.paginationNextBtn = page.getByTestId('pagination-next').or(page.locator('#mgmt-btn-next'));
    this.exportCsvBtn = page.getByTestId('export-orders-btn').or(page.locator('#mgmt-btn-export, button:has-text("Export CSV")'));
    this.statusBadges = page.locator('#mgmt-orders-tbody .badge-status');
  }

  /**
   * Szabadszavas kereses a megrendelesek kozott.
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  /**
   * Szures megrendelesi statusz szerint.
   */
  async filterByStatus(status: 'ALL' | 'PENDING' | 'PAID' | 'PROVISIONING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  /**
   * Tablazat rendezese.
   */
  async sortBy(sortOption: 'id-desc' | 'id-asc' | 'total-desc' | 'total-asc'): Promise<void> {
    await this.sortSelect.selectOption(sortOption);
  }

  /**
   * Adott azonositoju vagy indexu rendelési sor lekerese.
   */
  getOrderRow(index = 0): Locator {
    return this.orderRows.nth(index);
  }

  /**
   * Megrendeles statuszanak modositasa a sorban levo select segitsevevel.
   */
  async changeOrderStatus(rowIndex: number, newStatus: string): Promise<void> {
    const row = this.getOrderRow(rowIndex);
    const select = row.locator('select.select-status, select');
    await select.selectOption(newStatus);
  }

  /**
   * Megrendeles torlese a sorban levo Delete gombbal.
   */
  async deleteOrder(rowIndex: number): Promise<void> {
    const row = this.getOrderRow(rowIndex);
    const delBtn = row.locator('.btn-delete, button:has-text("Delete")');
    await delBtn.click();
  }

  /**
   * CSV export letoltes inditasa.
   */
  async exportCsv(): Promise<void> {
    await this.exportCsvBtn.click();
  }

  /**
   * Lapozas elozo oldalra.
   */
  async prevPage(): Promise<void> {
    await this.paginationPrevBtn.click();
  }

  /**
   * Lapozas kovetkezo oldalra.
   */
  async nextPage(): Promise<void> {
    await this.paginationNextBtn.click();
  }
}
