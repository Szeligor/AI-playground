import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SwaggerPage Page Object
 *
 * Leképezi a beépített interaktív OpenAPI / Swagger tesztelő konzolt.
 *
 * SZABALY: Zéró expect() asserció a Page Object belsejében!
 */
export class SwaggerPage extends BasePage {
  readonly endpointPostOrder: Locator;
  readonly endpointGetOrders: Locator;
  readonly endpointPatchStatus: Locator;
  readonly endpointDeleteOrder: Locator;
  readonly tryItOutBtn: Locator;
  readonly executeBtn: Locator;
  readonly requestBodyTextarea: Locator;
  readonly responseContainer: Locator;
  readonly responseStatusCode: Locator;
  readonly responseBody: Locator;

  constructor(page: Page) {
    super(page);

    this.endpointPostOrder = page.locator('[data-endpoint="/api/orders"][data-method="POST"], button:has-text("POST /api/orders")');
    this.endpointGetOrders = page.locator('[data-endpoint="/api/orders"][data-method="GET"], button:has-text("GET /api/orders")');
    this.endpointPatchStatus = page.locator('[data-endpoint*="/api/orders"][data-method="PATCH"], button:has-text("PATCH")');
    this.endpointDeleteOrder = page.locator('[data-endpoint*="/api/orders"][data-method="DELETE"], button:has-text("DELETE")');
    this.tryItOutBtn = page.locator('.btn-try-it, button:has-text("Try it out")');
    this.executeBtn = page.locator('.btn-execute, button:has-text("Execute")');
    this.requestBodyTextarea = page.locator('.body-param-textarea, #api-request-body');
    this.responseContainer = page.locator('.live-response-box, #api-response-container');
    this.responseStatusCode = page.locator('.response-status, #api-status-code');
    this.responseBody = page.locator('.response-body pre, #api-response-body');
  }

  /**
   * Kivalaszt egy vegpontot es megnyitja a szerkesztojet.
   */
  async selectEndpoint(method: 'POST' | 'GET' | 'PATCH' | 'DELETE'): Promise<void> {
    switch (method) {
      case 'POST':
        await this.endpointPostOrder.click();
        break;
      case 'GET':
        await this.endpointGetOrders.click();
        break;
      case 'PATCH':
        await this.endpointPatchStatus.click();
        break;
      case 'DELETE':
        await this.endpointDeleteOrder.click();
        break;
    }
  }

  /**
   * Kitolti a torzset es vegrehajtja a teszthivast.
   */
  async executeRequest(body?: string): Promise<void> {
    if (await this.tryItOutBtn.isVisible()) {
      await this.tryItOutBtn.click();
    }
    if (body && await this.requestBodyTextarea.isVisible()) {
      await this.requestBodyTextarea.fill(body);
    }
    await this.executeBtn.click();
  }
}
