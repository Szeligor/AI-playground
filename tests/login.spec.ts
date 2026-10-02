import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Reset storageState so login tests run cleanly without pre-existing session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SauceDemo Authentication Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('valid user can log in successfully', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    // Auto-waiting assertions
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('locked out user sees clear error message', async ({ page }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');

    // Auto-waiting assertion on error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });
});
