import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SwaggerPage extends BasePage {
  readonly roleSelector: Locator;
  readonly loginHeader: Locator;
  readonly loginBody: Locator;
  readonly loginExecuteBtn: Locator;
  readonly loginResponse: Locator;
  readonly getOrdersHeader: Locator;
  readonly getOrdersExecuteBtn: Locator;
  readonly getOrdersResponse: Locator;
  readonly postOrderHeader: Locator;
  readonly idempotencyKeyInput: Locator;
  readonly postOrderBody: Locator;
  readonly postOrderExecuteBtn: Locator;
  readonly postOrderResponse: Locator;
  readonly validateCouponHeader: Locator;
  readonly couponBody: Locator;
  readonly validateCouponExecuteBtn: Locator;
  readonly validateCouponResponse: Locator;
  readonly patchStatusHeader: Locator;
  readonly patchIdInput: Locator;
  readonly patchStatusSelect: Locator;
  readonly patchExecuteBtn: Locator;
  readonly patchResponse: Locator;
  readonly deleteOrderHeader: Locator;
  readonly deleteIdInput: Locator;
  readonly deleteExecuteBtn: Locator;
  readonly deleteResponse: Locator;

  constructor(page: Page) {
    super(page);
    this.roleSelector = page.getByTestId('api-role-select');
    this.loginHeader = page.locator('.endpoint-header', { hasText: '/api/v1/auth/login' });
    this.loginBody = page.locator('#api-login-body');
    this.loginExecuteBtn = page.getByTestId('btn-api-login');
    this.loginResponse = page.locator('#res-ep0');
    this.getOrdersHeader = page.locator('.endpoint-header', { hasText: '/api/v1/orders' }).first();
    this.getOrdersExecuteBtn = page.getByTestId('btn-api-get-orders');
    this.getOrdersResponse = page.locator('#res-ep1');
    this.postOrderHeader = page.locator('.endpoint-header', { hasText: 'Create a new subscription order' });
    this.idempotencyKeyInput = page.locator('#api-idem-key');
    this.postOrderBody = page.locator('#api-post-body');
    this.postOrderExecuteBtn = page.getByTestId('btn-api-post-order');
    this.postOrderResponse = page.locator('#res-ep2');
    this.validateCouponHeader = page.locator('.endpoint-header', { hasText: '/api/v1/coupons/validate' });
    this.couponBody = page.locator('#api-coupon-body');
    this.validateCouponExecuteBtn = page.getByTestId('btn-api-validate-coupon');
    this.validateCouponResponse = page.locator('#res-ep2b');
    this.patchStatusHeader = page.locator('.endpoint-header', { hasText: '/api/v1/orders/{id}/status' });
    this.patchIdInput = page.locator('#api-patch-id');
    this.patchStatusSelect = page.locator('#api-patch-status');
    this.patchExecuteBtn = page.getByTestId('btn-api-patch-status');
    this.patchResponse = page.locator('#res-ep3');
    this.deleteOrderHeader = page.locator('.endpoint-header', { hasText: '/api/v1/orders/{id}' }).last();
    this.deleteIdInput = page.locator('#api-delete-id');
    this.deleteExecuteBtn = page.getByTestId('btn-api-delete-order');
    this.deleteResponse = page.locator('#res-ep4');
  }

  async selectApiRole(role: 'user' | 'admin' | 'junior_qa' | 'none'): Promise<void> {
    await this.roleSelector.selectOption(role);
  }

  async toggleEndpoint(header: Locator): Promise<void> {
    await header.click();
  }

  async executeLogin(bodyJson: string): Promise<void> {
    await this.loginHeader.click();
    await this.loginBody.fill(bodyJson);
    await this.loginExecuteBtn.click();
  }

  async executeGetOrders(): Promise<void> {
    await this.getOrdersHeader.click();
    await this.getOrdersExecuteBtn.click();
  }

  async executePostOrder(bodyJson: string, idempotencyKey?: string): Promise<void> {
    await this.postOrderHeader.click();
    if (idempotencyKey !== undefined) {
      await this.idempotencyKeyInput.fill(idempotencyKey);
    }
    await this.postOrderBody.fill(bodyJson);
    await this.postOrderExecuteBtn.click();
  }

  async executeValidateCoupon(bodyJson: string): Promise<void> {
    await this.validateCouponHeader.click();
    await this.couponBody.fill(bodyJson);
    await this.validateCouponExecuteBtn.click();
  }

  async executePatchStatus(orderId: number, targetStatus: string): Promise<void> {
    await this.patchStatusHeader.click();
    await this.patchIdInput.fill(orderId.toString());
    await this.patchStatusSelect.selectOption(targetStatus);
    await this.patchExecuteBtn.click();
  }

  async executeDeleteOrder(orderId: number): Promise<void> {
    await this.deleteOrderHeader.click();
    await this.deleteIdInput.fill(orderId.toString());
    await this.deleteExecuteBtn.click();
  }
}
