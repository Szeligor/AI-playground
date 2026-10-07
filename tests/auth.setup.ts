import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate via API and save storageState', async ({ request }) => {
  const response = await request.post('https://testacademy.hu/api/login', {
    data: {
      email: 'standard_user@astron.hu',
      password: 'secret123'
    }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('success');
  expect(body.token).toBeDefined();

  // Save auth token to storageState json for UI tests
  await request.storageState({ path: authFile });
});
