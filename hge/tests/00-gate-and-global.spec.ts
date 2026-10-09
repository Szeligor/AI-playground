import { test, expect } from '@playwright/test';
import { GateOverlay, HeaderComponent, BasePage } from '../pages';

test.describe('00 - Biztonsági Kapu & Globális Kezelőszervek', () => {

  test('TC-00-01: Zárolt Kapu Negatív teszt - Helytelen jelszóval a labor zárolva marad', async ({ page }) => {
    const gate = new GateOverlay(page);
    await page.goto('https://testacademy.hu/qa-lab/e2e-app');

    await gate.enterPassword('hibas123');
    await gate.clickUnlock();

    await expect(gate.errorMessage).toBeVisible();
    await expect(gate.errorMessage).toContainText('Invalid password');
    await expect(gate.overlay).toBeVisible();
  });

  test('TC-00-02: Kapu Feloldás - Helyes jelszóval a felület feloldódik', async ({ page }) => {
    const gate = new GateOverlay(page);
    await page.goto('https://testacademy.hu/qa-lab/e2e-app');

    await gate.unlock('astron2026');

    await expect(gate.overlay).toBeHidden();
    await expect(page.locator('.brand-title')).toBeVisible();
    await expect(page.locator('.brand-title')).toHaveText('Full-Stack QA Gateway & Order Engine');
  });

  test('TC-00-03: Globális DB Seed Reset - Adatbázis visszaállítása kiinduló állapotra Toast értesítéssel', async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);

    await base.goto();
    await header.resetDatabase();

    await expect(base.toastMessages.first()).toBeVisible();
    await expect(base.toastMessages.first()).toContainText('Database restored to baseline seed');
  });

  test('TC-00-04: Fő Tab Navigáció - Mind az 5 fő nézet közötti váltás működik', async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);

    await base.goto();

    // 1. Order Management
    await header.switchTab('orders');
    await expect(page.locator('#view-orders')).toHaveClass(/active/);
    await expect(page.locator('#view-ui')).not.toHaveClass(/active/);

    // 2. Selector Lab
    await header.switchTab('selectors');
    await expect(page.locator('#view-selectors')).toHaveClass(/active/);

    // 3. API Swagger
    await header.switchTab('api');
    await expect(page.locator('#view-api')).toHaveClass(/active/);

    // 4. SQL Workbench
    await header.switchTab('sql');
    await expect(page.locator('#view-sql')).toHaveClass(/active/);

    // 5. Vissza a Storefrontra
    await header.switchTab('ui');
    await expect(page.locator('#view-ui')).toHaveClass(/active/);
  });

});
