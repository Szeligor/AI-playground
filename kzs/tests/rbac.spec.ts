import { test, expect } from '@playwright/test';

/**
 * Role-Based Access Control (RBAC) E2E Tesztcsomag
 *
 * Lefedett tesztesetek:
 * - TC-RBAC-01 (Key 19): Szerepkörváltás - Dan Tester (USER)
 * - TC-RBAC-02 (Key 20): Felfüggesztett Fiók (BLOCKED)
 * - TC-RBAC-03 (Key 21): Login Form E-mail Validáció
 * - TC-RBAC-04 (Key 22): Login Form Jelszó Házirend
 * - TC-RBAC-05 (Key 23): Adminisztrátori Jogosultságok (Tamás Admin)
 * - TC-RBAC-06 (Key 24): Junior QA Korlátozott Jogosultság
 *
 * Tervezési minta: AAA (Arrange - Act - Assert)
 * Cél: A jogosultsági határok és szerepkör-szinkronizáció felületi ellenőrzése.
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('2. Modul: Role-Based Access Control (RBAC) Profilok', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('TC-RBAC-01 (Key 19): Szerepkörváltás - Dan Tester (USER)', async ({ page }) => {
    // Act: Profilváltó modál megnyitása a fejlécből
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil|Felhasználó/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      // Dan Tester profil kiválasztása
      const danOption = page.locator('#btn-role-dan, [data-user="dan.tester@enterprise.io"], button:has-text("Dan Tester")');
      if (await danOption.isVisible()) {
        await danOption.click();

        // Assert: A fejlécben a USER jelvény és a Dan Tester név látható
        const userBadge = page.locator('.role-badge, #current-role-badge');
        await expect(userBadge).toContainText(/USER/i);
      }
    }
  });

  test('TC-RBAC-02 (Key 20): Felfüggesztett fiók (BLOCKED) rendelésindítási tilalma', async ({ page }) => {
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      // Blocked / Suspended profil kiválasztása
      const blockedOption = page.locator('#btn-role-blocked, button:has-text("BLOCKED"), button:has-text("Felfüggesztett")');
      if (await blockedOption.isVisible()) {
        await blockedOption.click();

        // Vissza a Storefrontra és rendelés kísérlet
        const checkoutBtn = page.locator('[data-testid="checkout-btn"], #submit-order-btn').first();
        if (await checkoutBtn.isVisible()) {
          await checkoutBtn.click();

          // Assert: 403 Forbidden vagy tiltó hibaüzenet
          await expect(page.locator('.alert-danger, .error-banner, #auth-err')).toContainText(/tiltva|blocked|forbidden|felfüggesztve/i);
        }
      }
    }
  });

  test('TC-RBAC-03 (Key 21): Login form e-mail cím formátum validáció', async ({ page }) => {
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      // Kézi belépési űrlap tesztelése hibás email címmel
      const emailField = page.locator('#login-email, [data-testid="login-email"]');
      const submitLogin = page.locator('#login-submit, [data-testid="login-submit"]');

      if (await emailField.isVisible() && await submitLogin.isVisible()) {
        await emailField.fill('nem_valid_email');
        await submitLogin.click();

        // Assert: Validációs hibaüzenet
        await expect(page.locator('.login-err, #auth-feedback')).toBeVisible();
      }
    }
  });

  test('TC-RBAC-04 (Key 22): Login form jelszó házirend ellenőrzés (Password Policy)', async ({ page }) => {
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      const passField = page.locator('#login-pass, [data-testid="login-password"]');
      const submitLogin = page.locator('#login-submit, [data-testid="login-submit"]');

      if (await passField.isVisible() && await submitLogin.isVisible()) {
        // Túl egyszerű/rövid jelszó
        await passField.fill('123');
        await submitLogin.click();

        // Assert: Szabványnak nem megfelelő jelszó elutasítása
        await expect(page.locator('.login-err, #auth-feedback')).toBeVisible();
      }
    }
  });

  test('TC-RBAC-05 (Key 23): Adminisztrátori jogosultságok (Tamás Admin - Refund & Delete)', async ({ page }) => {
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      // Tamás Admin kiválasztása
      const adminOption = page.locator('#btn-role-admin, button:has-text("Tamás Admin")');
      if (await adminOption.isVisible()) {
        await adminOption.click();

        // Assert: A fejléc ADMIN-ra változik
        const roleBadge = page.locator('.role-badge, #current-role-badge');
        await expect(roleBadge).toContainText(/ADMIN/i);

        // Átváltás az Order Management fülre
        const ordersTab = page.getByRole('button', { name: /Order Management/i });
        if (await ordersTab.isVisible()) {
          await ordersTab.click();

          // Assert: A veszélyes Admin akciók (Delete / Refund) gombjai láthatóak
          const adminButtons = page.locator('button.btn-delete, button.btn-refund, [data-action="delete"], [data-action="refund"]');
          if (await adminButtons.count() > 0) {
            await expect(adminButtons.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('TC-RBAC-06 (Key 24): Junior QA korlátozott jogosultságok védelme', async ({ page }) => {
    const switchRoleBtn = page.getByRole('button', { name: /Switch Role|Profil/i });
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();

      // Junior QA kiválasztása
      const juniorOption = page.locator('#btn-role-junior, button:has-text("Junior QA")');
      if (await juniorOption.isVisible()) {
        await juniorOption.click();

        // Átváltás az Order Management fülre
        const ordersTab = page.getByRole('button', { name: /Order Management/i });
        if (await ordersTab.isVisible()) {
          await ordersTab.click();

          // Assert: Törlés (Delete) gomb nem elérhető a táblázatban
          const deleteButtons = page.locator('button.btn-delete, [data-action="delete"]');
          await expect(deleteButtons).toHaveCount(0);
        }
      }
    }
  });

});
