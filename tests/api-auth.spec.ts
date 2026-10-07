import { test, expect } from '@playwright/test';

test.describe('TestAcademy QA Lab - Full-Stack API Testing Suite', () => {

  test('TC-API-01: Health check endpoint returns 200 and healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('TC-API-02: User can authenticate via API and receive JWT Bearer token', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'standard_user@astron.hu',
        password: 'secret123'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.status).toBe('success');
    expect(body.token).toBeDefined();
    expect(body.token).toContain('eyJ');
    expect(body.user.email).toBe('standard_user@astron.hu');
  });

  test('TC-API-03: Invalid credentials return 401 Unauthorized error', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'wrong.user@astron.hu',
        password: 'invalid_password'
      }
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('InvalidCredentials');
  });

  test('TC-API-04: Protected orders endpoint rejects requests without Bearer token', async ({ request }) => {
    const response = await request.get('/api/orders');
    expect(response.status()).toBe(401);
  });

  test('TC-API-05: Protected orders endpoint returns data with valid Bearer token', async ({ request }) => {
    // 1. Authenticate first to obtain token
    const loginRes = await request.post('/api/login', {
      data: {
        email: 'standard_user@astron.hu',
        password: 'secret123'
      }
    });
    const { token } = await loginRes.json();

    // 2. Request protected orders with Bearer token
    const ordersRes = await request.get('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(ordersRes.status()).toBe(200);
    const ordersData = await ordersRes.json();
    expect(ordersData.status).toBe('success');
    expect(Array.isArray(ordersData.orders)).toBe(true);
  });

});
