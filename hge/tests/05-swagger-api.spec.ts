import { test, expect } from '@playwright/test';
import { BasePage, HeaderComponent, SwaggerPage } from '../pages';

test.describe('05 - REST API Swagger Interaktív Konzol', () => {

  test.beforeEach(async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);
    await base.goto();
    await header.resetDatabase();
    await header.switchTab('api');
  });

  test('TC-API-01: POST /api/v1/auth/login - Hitelesítés és hibakezelés', async ({ page }) => {
    const swagger = new SwaggerPage(page);

    // Sikeres belépés (200 OK)
    await swagger.executeLogin(JSON.stringify({
      email: 'dan.tester@enterprise.io',
      password: 'Password123'
    }));
    await expect(swagger.loginResponse).toBeVisible();
    await expect(swagger.loginResponse).toContainText('200 OK');
    await expect(swagger.loginResponse).toContainText('eyJhbGciOi');

    // Hibás jelszó (401 Unauthorized)
    await swagger.loginBody.fill(JSON.stringify({
      email: 'dan.tester@enterprise.io',
      password: 'WrongPassword'
    }));
    await swagger.loginExecuteBtn.click();
    await expect(swagger.loginResponse).toContainText('401 Unauthorized');
  });

  test('TC-API-02: GET /api/v1/orders - Hozzáférés-védelem (401 vs 200)', async ({ page }) => {
    const swagger = new SwaggerPage(page);

    // Token nélkül (Role: none) -> 401
    await swagger.selectApiRole('none');
    await swagger.executeGetOrders();
    await expect(swagger.getOrdersResponse).toBeVisible();
    await expect(swagger.getOrdersResponse).toContainText('401 Unauthorized');

    // User tokennel -> 200 OK
    await swagger.selectApiRole('user');
    await swagger.getOrdersExecuteBtn.click();
    await expect(swagger.getOrdersResponse).toContainText('200 OK');
    await expect(swagger.getOrdersResponse).toContainText('total_records');
  });

  test('TC-API-03: POST /api/v1/orders - Idempotencia (409) és Készletellenőrzés (422)', async ({ page }) => {
    const swagger = new SwaggerPage(page);
    await swagger.selectApiRole('user');

    const idemKey = `TEST-IDEM-${Date.now()}`;

    // 1. Első sikeres rendelés létrehozása
    await swagger.executePostOrder(JSON.stringify({
      email: 'dan.tester@enterprise.io',
      product_id: 1,
      quantity: 1,
      price: 250
    }), idemKey);
    await expect(swagger.postOrderResponse).toBeVisible();
    await expect(swagger.postOrderResponse).toContainText('201 Created');

    // 2. Ismételt kérés ugyanazzal az Idempotency-Key-jel -> 409 Conflict
    await swagger.postOrderExecuteBtn.click();
    await expect(swagger.postOrderResponse).toContainText('409 Conflict');
    await expect(swagger.postOrderResponse).toContainText('already processed');

    // 3. Készlet túllépés -> 422 Unprocessable Entity
    await swagger.executePostOrder(JSON.stringify({
      email: 'dan.tester@enterprise.io',
      product_id: 2,
      quantity: 50, // Stock is only 8
      price: 490
    }), `NEW-KEY-${Date.now()}`);
    await expect(swagger.postOrderResponse).toContainText('422 Unprocessable Entity');
    await expect(swagger.postOrderResponse).toContainText('Insufficient Stock');
  });

  test('TC-API-04: POST /api/v1/coupons/validate - Kupon szerződés és validációs státuszok', async ({ page }) => {
    const swagger = new SwaggerPage(page);

    // Érvényes kupon (200 OK)
    await swagger.executeValidateCoupon(JSON.stringify({
      code: 'AIWS25',
      cart_total: 500
    }));
    await expect(swagger.validateCouponResponse).toBeVisible();
    await expect(swagger.validateCouponResponse).toContainText('200 OK');
    await expect(swagger.validateCouponResponse).toContainText('VALID');

    // Lejárt kupon (410 Gone)
    await swagger.couponBody.fill(JSON.stringify({
      code: 'EXPIRED2025',
      cart_total: 500
    }));
    await swagger.validateCouponExecuteBtn.click();
    await expect(swagger.validateCouponResponse).toContainText('410 Gone');

    // Nem létező kupon (404 Not Found)
    await swagger.couponBody.fill(JSON.stringify({
      code: 'NEMLETEZIK',
      cart_total: 500
    }));
    await swagger.validateCouponExecuteBtn.click();
    await expect(swagger.validateCouponResponse).toContainText('404 Not Found');
  });

  test('TC-API-05: DELETE /api/v1/orders/{id} - Szerepkör alapú törlés (403 vs 200)', async ({ page }) => {
    const swagger = new SwaggerPage(page);

    // Normál felhasználó nem törölhet (403 Forbidden)
    await swagger.selectApiRole('user');
    await swagger.executeDeleteOrder(102);
    await expect(swagger.deleteResponse).toBeVisible();
    await expect(swagger.deleteResponse).toContainText('403 Forbidden');

    // Adminisztrátor törölhet (200 OK)
    await swagger.selectApiRole('admin');
    await swagger.deleteExecuteBtn.click();
    await expect(swagger.deleteResponse).toContainText('200 OK');
    await expect(swagger.deleteResponse).toContainText('permanently deleted');
  });

});
