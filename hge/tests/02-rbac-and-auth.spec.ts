import { test, expect } from '@playwright/test';
import { BasePage, HeaderComponent, AuthModal, StorefrontPage, OrderManagementPage } from '../pages';

test.describe('02 - RBAC Jogosultságkezelés & Bejelentkezés', () => {

  test.beforeEach(async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);
    await base.goto();
    await header.resetDatabase();
  });

  test('TC-RBAC-01: Actor Váltás - Dan Tester (USER) profil beállítása', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);
    const storefront = new StorefrontPage(page);

    await header.openAuthModal();
    await authModal.selectActor('user');

    await expect(header.currentUserDisplay).toHaveText('dan.tester');
    await expect(header.currentRoleBadge).toHaveText('USER');
    await expect(storefront.emailInput).toHaveValue('dan.tester@enterprise.io');
  });

  test('TC-RBAC-02: Felfüggesztett Felhasználó (BLOCKED) - Rendelés indítása tiltott (403)', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);
    const storefront = new StorefrontPage(page);

    await header.openAuthModal();
    await authModal.selectActor('blocked');

    await expect(header.currentRoleBadge).toHaveText('BLOCKED');

    let alertMsg = '';
    page.once('dialog', async dialog => {
      alertMsg = dialog.message();
      await dialog.accept();
    });

    await storefront.submitOrder();

    expect(alertMsg).toContain('403 Forbidden');
    expect(alertMsg).toContain('account is suspended');
  });

  test('TC-RBAC-03: Bejelentkezési Form - Email Szintaxis validáció (@ hiánya)', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);

    await header.openAuthModal();
    await authModal.login('nincs-kukac-email.hu', 'Password123');

    await expect(authModal.authError).toBeVisible();
    await expect(authModal.authError).toContainText('Please enter a valid email address');
  });

  test('TC-RBAC-04: Bejelentkezési Form - Jelszó Házirend validáció (< 8 karakter, nincs nagybetű/szám)', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);

    await header.openAuthModal();
    await authModal.login('tester@enterprise.io', 'gyenge');

    await expect(authModal.authError).toBeVisible();
    await expect(authModal.authError).toContainText('Password Policy Violation');
  });

  test('TC-RBAC-05: Admin Jogosultságok - Tamás Admin láthatja a Refund és Delete gombokat', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);
    const ordersPage = new OrderManagementPage(page);

    await header.openAuthModal();
    await authModal.selectActor('admin');

    await header.switchTab('orders');

    // Adminisztrátornak a PAID / COMPLETED státuszú rendeléseknél elérhető a Refund és Delete gomb
    await expect(ordersPage.ordersTable.getByTestId('btn-del-101')).toBeVisible();
    await expect(ordersPage.ordersTable.getByTestId('btn-refund-101')).toBeVisible();
  });

  test('TC-RBAC-06: Junior QA Jogosultságok - Korlátozott nézet (Admin gombok rejtve maradnak)', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);
    const ordersPage = new OrderManagementPage(page);

    await header.openAuthModal();
    await authModal.selectActor('junior');

    await header.switchTab('orders');

    // Junior QA nem láthatja a törlés (Del) gombokat
    await expect(page.getByTestId('btn-del-101')).toBeHidden();
    await expect(page.getByTestId('btn-refund-101')).toBeHidden();
  });

});
