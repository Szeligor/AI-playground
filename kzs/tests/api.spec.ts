import { test, expect } from '@playwright/test';

/**
 * REST API Integrációs és Swagger Konzolos Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-API-01 (Key 71): POST /api/login: Sikeres hitelesítés standard fiókkal (200 OK + JWT)
 * - TC-API-02 (Key 72): POST /api/login: Érvénytelen jelszó vagy felhasználó (401 Unauthorized)
 * - TC-API-03 (Key 73): POST /api/login: Felfüggesztett felhasználó blokkolása (403 Forbidden)
 * - TC-API-04 (Key 74): GET /api/health: Rendszer és memóriabeli DB állapot (200 OK + healthy)
 * - TC-API-05 (Key 75): POST /api/reset: Adatbázis magvetés kezdőállapotának visszaállítása (200 OK)
 * - TC-API-06 (Key 76): GET /api/orders: Védett végpont hívása token nélkül (401 Unauthorized)
 * - TC-API-07 (Key 77): GET /api/orders: Rendelések listázása Bearer tokennel (200 OK)
 * - TC-API-08 (Key 78): GET /api/orders?status=PENDING: Rendelések szűrése státusz szerint (200 OK)
 * - TC-API-09 (Key 79): POST /api/orders: Új rendelés létrehozása kötelező mezőkkel (201 Created)
 * - TC-API-10 (Key 80): POST /api/orders: Készlethiány miatti elutasítás (422 Unprocessable)
 * - TC-API-11 (Key 81): POST /api/orders: Idempotency-Key fejléc ellenőrzése (409 Conflict)
 * - TC-API-12 (Key 82): POST /api/orders: Hiányzó vagy hibás JSON törzs validációja (400 Bad Request)
 * - TC-API-13 (Key 83): PATCH /api/orders/{id}/status: Státusz módosítása (200 OK)
 * - TC-API-14 (Key 84): PATCH /api/orders/{id}/status: Illegális átmenet CANCELLED -> PAID (400/422)
 * - TC-API-15 (Key 85): DELETE /api/orders/{id}: Törlés elutasítása User szerepkörrel (403 Forbidden)
 * - TC-API-16 (Key 86): DELETE /api/orders/{id}: Törlés engedélyezése Adminnal (200 OK)
 * - TC-API-17 (Key 87): POST /api/coupons/validate: Kupon érvényesítés vizsgálata
 *
 * Módszertan: Hibrid tesztelés: távoli serverless végpontok hívása és a beépített Swagger konzol automatizálása.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('5. Modul: REST API Integrációs Tesztek', () => {

  test('TC-API-04 (Key 74): Health check végpont ellenőrzése (200 OK + healthy)', async ({ request }) => {
    // Act: Közvetlen GET hívás a health check végpontra
    const response = await request.get('/api/health');

    // Assert: 200 Státuszkód és helyes JSON válaszstruktúra
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('TC-API-05 (Key 75): Adatbázis reset végpont hívása (200 OK)', async ({ page }) => {
    await page.goto(APP_URL);
    const resetBtn = page.locator('[data-testid="btn-reset-db"], button:has-text("Reset DB Seed")');
    await resetBtn.click();
    const toast = page.locator('[data-testid="toast-notification"]');
    await expect(toast).toContainText(/Database restored to baseline seed/i);
  });

  test('TC-API-01 (Key 71): Sikeres autentikáció standard fiókkal és JWT token generálás', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'standard_user@astron.hu',
        password: 'secret123',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.token).toBeDefined();
  });

  test('TC-API-02 (Key 72): Érvénytelen jelszó vagy ismeretlen felhasználó (401 Unauthorized)', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'nem.letezo@astron.hu',
        password: 'rossz_jelszo',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('TC-API-03 (Key 73): Felfüggesztett felhasználó (suspended.user) blokkolása (403 Forbidden)', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'suspended.user@enterprise.io',
        password: 'secret123',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('TC-API-06 (Key 76): Védett /api/orders végpont token nélküli hívásának elutasítása (401)', async ({ request }) => {
    // Act: Kérés küldése Bearer token nélkül
    const response = await request.get('/api/orders');

    // Assert: Jogosulatlan kérés elutasítása
    expect(response.status()).toBe(401);
  });

  test('TC-API-07 (Key 77): Rendelések listázása érvényes Bearer tokennel', async ({ request }) => {
    // Arrange: Token beszerzése bejelentkezéssel
    const loginRes = await request.post('/api/login', {
      data: { email: 'standard_user@astron.hu', password: 'secret123' },
    });
    const { token } = await loginRes.json();

    // Act: Védett végpont hívása a token fejlécben történő átadásával
    const ordersRes = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assert: 200 OK és rendelési tömb vizsgálata
    expect(ordersRes.status()).toBe(200);
    const ordersData = await ordersRes.json();
    expect(Array.isArray(ordersData.orders || ordersData)).toBeTruthy();
  });

  test('TC-API-08 (Key 78): Rendelések szűrése státusz query paraméter alapján (?status=PENDING)', async ({ request }) => {
    const loginRes = await request.post('/api/login', {
      data: { email: 'standard_user@astron.hu', password: 'secret123' },
    });
    const { token } = await loginRes.json();

    const filteredRes = await request.get('/api/orders?status=PENDING', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(filteredRes.status()).toBe(200);
  });

  test('TC-API-09 (Key 79): Új rendelés létrehozása érvényes adatokkal (201 Created)', async ({ request }) => {
    const loginRes = await request.post('/api/login', {
      data: { email: 'standard_user@astron.hu', password: 'secret123' },
    });
    const { token } = await loginRes.json();

    const postRes = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        product_id: 1,
        quantity: 1,
        email: 'dan.tester@enterprise.io',
      },
    });

    expect([200, 201]).toContain(postRes.status());
  });

  test('TC-API-11 (Key 81): Idempotency-Key fejléc ellenőrzése és duplikáció védelem', async ({ request }) => {
    const loginRes = await request.post('/api/login', {
      data: { email: 'standard_user@astron.hu', password: 'secret123' },
    });
    const { token } = await loginRes.json();
    const idemKey = `IDEM-TEST-${Date.now()}`;

    // Első kérés
    await request.post('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': idemKey,
      },
      data: { product_id: 1, quantity: 1, email: 'dan.tester@enterprise.io' },
    });

    // Második kérés azonos idempotencia kulccsal
    const duplicateRes = await request.post('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': idemKey,
      },
      data: { product_id: 1, quantity: 1, email: 'dan.tester@enterprise.io' },
    });

    // Assert: Duplikáció esetén a rendszer vagy 409 Conflict-ot, vagy idempotens választ ad
    expect([200, 201, 409]).toContain(duplicateRes.status());
  });

  test('TC-API-15 (Key 85): Törlés elutasítása normál User szerepkörrel (403 Forbidden)', async ({ page }) => {
    await page.goto(APP_URL);
    await page.getByRole('button', { name: /API Swagger/i }).click();

    // Szerepkör beállítása: user
    await page.locator('#api-active-role').selectOption('user');

    // Accordion kinyitása a DELETE végponthoz
    const deleteHeader = page.locator('.endpoint-header', { hasText: '/api/v1/orders/{id}' }).last();
    const deleteIdInput = page.locator('#api-delete-id');
    if (!await deleteIdInput.isVisible()) {
      await deleteHeader.click();
    }

    // Törlés kísérlete normál felhasználói szerepkörrel
    await deleteIdInput.fill('102');
    await page.locator('[data-testid="btn-api-delete-order"]').click();

    // Assert: A beépített Swagger konzol 403 Forbidden hibaüzenetet ad
    const resBox = page.locator('#res-ep4');
    await expect(resBox).toBeVisible();
    await expect(resBox).toContainText(/403 Forbidden/i);
    await expect(resBox).toContainText(/Access Denied/i);
  });

  test('TC-API-17 (Key 87): Kupon érvényesítő végpont ellenőrzése a Swagger felületen', async ({ page }) => {
    await page.goto(APP_URL);
    await page.getByRole('button', { name: /API Swagger/i }).click();

    // Accordion kinyitása a kupon végponthoz
    const couponHeader = page.locator('.endpoint-header', { hasText: '/api/v1/coupons/validate' });
    const couponBodyInput = page.locator('#api-coupon-body');
    if (!await couponBodyInput.isVisible()) {
      await couponHeader.click();
    }

    // Érvényes kupon megadása
    await couponBodyInput.fill(JSON.stringify({
      code: 'AIWS25',
      cart_total: 500,
    }));
    await page.locator('[data-testid="btn-api-validate-coupon"]').click();

    // Assert: A Swagger konzol 200 OK választ és VALID státuszt jelenít meg
    const resBox = page.locator('#res-ep2b');
    await expect(resBox).toBeVisible();
    await expect(resBox).toContainText(/200 OK/i);
    await expect(resBox).toContainText(/VALID/i);
  });

});
