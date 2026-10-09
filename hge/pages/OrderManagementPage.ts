import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('order-search-input');
    this.statusFilter = page.getByTestId('order-status-filter');
    this.sortSelect = page.getByTestId('order-sort-select');
    this.ordersTable = page.getByTestId('mgmt-orders-table');
    this.orderRows = page.locator('tr[data-testid^="order-row-"]');
    this.paginationInfo = page.locator('#mgmt-pagination-info');
    this.paginationPrevBtn = page.getByTestId('pagination-prev');
    this.paginationNextBtn = page.getByTestId('pagination-next');
    this.exportCsvBtn = page.getByTestId('export-orders-btn');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async filterByStatus(status: 'ALL' | 'PENDING' | 'PAID' | 'PROVISIONING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async sortBy(sortOption: 'id-desc' | 'id-asc' | 'total-desc' | 'total-asc'): Promise<void> {
    await this.sortSelect.selectOption(sortOption);
  }

  getOrderRow(orderId: number): Locator {
    return this.page.getByTestId(`order-row-${orderId}`);
  }

  async payOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-pay-${orderId}`).click();
  }

  async cancelOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-cancel-${orderId}`).click();
  }

  async provisionOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-provision-${orderId}`).click();
  }

  async completeOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-complete-${orderId}`).click();
  }

  async refundOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-refund-${orderId}`).click();
  }

  async deleteOrder(orderId: number): Promise<void> {
    await this.page.getByTestId(`btn-del-${orderId}`).click();
  }

  async prevPage(): Promise<void> {
    await this.paginationPrevBtn.click();
  }

  async nextPage(): Promise<void> {
    await this.paginationNextBtn.click();
  }

  async exportCsv(): Promise<void> {
    await this.exportCsvBtn.click();
  }
}
