import { Page, Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { NavbarComponent } from '../common/NavbarComponent';

export type ApiRole = 'user' | 'admin' | 'none';
export type OrderStatus = 'PAID' | 'CANCELLED' | 'REFUNDED' | 'PENDING';

export interface PostOrderPayload {
  email: string;
  product_id: number;
  quantity: number;
  price?: number;
}

export class SwaggerPage extends BasePage {
  readonly navbar: NavbarComponent;
  readonly roleSelect: Locator;

  // GET /api/v1/orders
  readonly getOrdersHeader: Locator;
  readonly getOrdersBody: Locator;
  readonly getOrdersExecuteBtn: Locator;
  readonly getOrdersResponseBox: Locator;

  // POST /api/v1/orders
  readonly postOrderHeader: Locator;
  readonly postOrderBody: Locator;
  readonly postOrderIdemKeyInput: Locator;
  readonly postOrderJsonTextarea: Locator;
  readonly postOrderExecuteBtn: Locator;
  readonly postOrderResponseBox: Locator;

  // PATCH /api/v1/orders/{id}/status
  readonly patchStatusHeader: Locator;
  readonly patchStatusBody: Locator;
  readonly patchOrderIdInput: Locator;
  readonly patchStatusSelect: Locator;
  readonly patchExecuteBtn: Locator;
  readonly patchResponseBox: Locator;

  // DELETE /api/v1/orders/{id}
  readonly deleteOrderHeader: Locator;
  readonly deleteOrderBody: Locator;
  readonly deleteOrderIdInput: Locator;
  readonly deleteExecuteBtn: Locator;
  readonly deleteResponseBox: Locator;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
    this.roleSelect = page.locator('#api-active-role');

    // GET
    this.getOrdersHeader = page.locator('.swagger-endpoint').filter({ hasText: 'GET' }).locator('.endpoint-header');
    this.getOrdersBody = page.locator('#ep1');
    this.getOrdersExecuteBtn = page.locator('#ep1 .btn-try-execute');
    this.getOrdersResponseBox = page.locator('#res-ep1');

    // POST
    this.postOrderHeader = page.locator('.swagger-endpoint').filter({ hasText: 'POST' }).locator('.endpoint-header');
    this.postOrderBody = page.locator('#ep2');
    this.postOrderIdemKeyInput = page.locator('#api-idem-key');
    this.postOrderJsonTextarea = page.locator('#api-post-body');
    this.postOrderExecuteBtn = page.locator('#ep2 .btn-try-execute');
    this.postOrderResponseBox = page.locator('#res-ep2');

    // PATCH
    this.patchStatusHeader = page.locator('.swagger-endpoint').filter({ hasText: 'PATCH' }).locator('.endpoint-header');
    this.patchStatusBody = page.locator('#ep3');
    this.patchOrderIdInput = page.locator('#api-patch-id');
    this.patchStatusSelect = page.locator('#api-patch-status');
    this.patchExecuteBtn = page.locator('#ep3 .btn-try-execute');
    this.patchResponseBox = page.locator('#res-ep3');

    // DELETE
    this.deleteOrderHeader = page.locator('.swagger-endpoint').filter({ hasText: 'DELETE' }).locator('.endpoint-header');
    this.deleteOrderBody = page.locator('#ep4');
    this.deleteOrderIdInput = page.locator('#api-delete-id');
    this.deleteExecuteBtn = page.locator('#ep4 .btn-try-execute');
    this.deleteResponseBox = page.locator('#res-ep4');
  }

  async openApiConsole(): Promise<void> {
    await this.navbar.switchToApiSwagger();
  }

  async selectRole(role: ApiRole): Promise<void> {
    await this.roleSelect.selectOption(role);
  }

  async executeGetOrders(): Promise<void> {
    const isOpen = await this.getOrdersBody.isVisible();
    if (!isOpen) {
      await this.getOrdersHeader.click();
    }
    await this.getOrdersExecuteBtn.click();
  }

  async executePostOrder(payload: PostOrderPayload | string, idempotencyKey?: string): Promise<void> {
    const isOpen = await this.postOrderBody.isVisible();
    if (!isOpen) {
      await this.postOrderHeader.click();
    }

    if (idempotencyKey !== undefined) {
      await this.postOrderIdemKeyInput.fill(idempotencyKey);
    }

    const jsonString = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    await this.postOrderJsonTextarea.fill(jsonString);
    await this.postOrderExecuteBtn.click();
  }

  async executePatchStatus(orderId: number, status: OrderStatus): Promise<void> {
    const isOpen = await this.patchStatusBody.isVisible();
    if (!isOpen) {
      await this.patchStatusHeader.click();
    }

    await this.patchOrderIdInput.fill(orderId.toString());
    await this.patchStatusSelect.selectOption(status);
    await this.patchExecuteBtn.click();
  }

  async executeDeleteOrder(orderId: number): Promise<void> {
    const isOpen = await this.deleteOrderBody.isVisible();
    if (!isOpen) {
      await this.deleteOrderHeader.click();
    }

    await this.deleteOrderIdInput.fill(orderId.toString());
    await this.deleteExecuteBtn.click();
  }
}
