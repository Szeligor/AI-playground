import { test, expect } from '@playwright/test';
import { BasePage, HeaderComponent, OrderManagementPage, AuthModal } from '../pages';

test.describe('03 - Order Management & Állapotgép (ERP Dashboard)', () => {

  test.beforeEach(async ({ page }) => {
    const base = new BasePage(page);
    const header = new HeaderComponent(page);
    await base.goto();
    await header.resetDatabase();
    await header.switchTab('orders');
  });

  test('TC-OM-01: Dinamikus Keresés - Szűrés Order ID-re és felhasználói emailre', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    // Keresés 104-es azonosítóra
    await ordersPage.search('104');
    await expect(ordersPage.orderRows).toHaveCount(1);
    await expect(ordersPage.orderRows.first()).toContainText('#104');

    // Keresés email címre
    await ordersPage.search('tamas.admin');
    await expect(ordersPage.orderRows).toHaveCount(1);
    await expect(ordersPage.orderRows.first()).toContainText('tamas.admin@testacademy.hu');
  });

  test('TC-OM-02: Státusz Szűrés - Csak a kiválasztott státuszú tételek jelennek meg', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    await ordersPage.filterByStatus('PENDING');
    await expect(ordersPage.orderRows).toHaveCount(1);
    await expect(ordersPage.orderRows.first()).toContainText('#102');
    await expect(ordersPage.orderRows.first()).toContainText('PENDING');

    await ordersPage.filterByStatus('CANCELLED');
    await expect(ordersPage.orderRows).toHaveCount(1);
    await expect(ordersPage.orderRows.first()).toContainText('#103');
  });

  test('TC-OM-03: Oszlopok Rendezése - ID és Végösszeg szerinti rendezés', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    // ID leghamarabbi (Oldest first: 101 az első)
    await ordersPage.sortBy('id-asc');
    await expect(ordersPage.orderRows.first()).toContainText('#101');

    // ID legújabb (Newest first: 105 az első)
    await ordersPage.sortBy('id-desc');
    await expect(ordersPage.orderRows.first()).toContainText('#105');
  });

  test('TC-OM-04: Állapotátmenet - PENDING -> PAID (Pay gomb)', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    // Order #102 is initially PENDING
    await ordersPage.payOrder(102);

    await expect(ordersPage.getOrderRow(102)).toContainText('PAID');
    await expect(ordersPage.getOrderRow(102).getByTestId('btn-provision-102')).toBeVisible();
  });

  test('TC-OM-05: Állapotátmenet - PENDING -> CANCELLED (Cancel gomb)', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    await ordersPage.cancelOrder(102);

    await expect(ordersPage.getOrderRow(102)).toContainText('CANCELLED');
    await expect(ordersPage.getOrderRow(102)).toContainText('Closed');
  });

  test('TC-OM-06: Teljes Életciklus - PENDING -> PAID -> PROVISIONING -> COMPLETED', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    // Pay
    await ordersPage.payOrder(102);
    await expect(ordersPage.getOrderRow(102)).toContainText('PAID');

    // Provision
    await ordersPage.provisionOrder(102);
    await expect(ordersPage.getOrderRow(102)).toContainText('PROVISIONING');

    // Complete
    await ordersPage.completeOrder(102);
    await expect(ordersPage.getOrderRow(102)).toContainText('COMPLETED');
  });

  test('TC-OM-07: Visszatérítés (Refund) Admin jogosultsággal', async ({ page }) => {
    const header = new HeaderComponent(page);
    const authModal = new AuthModal(page);
    const ordersPage = new OrderManagementPage(page);

    // Szerepkör váltás Adminra
    await header.openAuthModal();
    await authModal.selectActor('admin');
    await header.switchTab('orders');

    // Order #101 is initially PAID
    await ordersPage.refundOrder(101);

    await expect(ordersPage.getOrderRow(101)).toContainText('REFUNDED');
  });

  test('TC-OM-08: Végállapot Integritás - CANCELLED rendelés zárt, nem léptethető', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    // Order #103 is initially CANCELLED
    const row103 = ordersPage.getOrderRow(103);
    await expect(row103).toContainText('CANCELLED');
    await expect(row103).toContainText('Closed');
    await expect(row103.getByRole('button')).toHaveCount(0);
  });

  test('TC-OM-09: Lapozó Működése (Pagination) információs felirat és gombok', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    await expect(ordersPage.paginationInfo).toBeVisible();
    await expect(ordersPage.paginationInfo).toContainText('Showing 1 to 5 of 5 orders');
  });

  test('TC-OM-10: CSV Export generálás és sikeres értesítés', async ({ page }) => {
    const ordersPage = new OrderManagementPage(page);

    const downloadPromise = page.waitForEvent('download');
    await ordersPage.exportCsv();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('astron_orders_');
    await expect(ordersPage.toastMessages.first()).toBeVisible();
    await expect(ordersPage.toastMessages.first()).toContainText('Orders exported to CSV');
  });

});
