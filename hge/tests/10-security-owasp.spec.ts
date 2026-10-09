import { test, expect } from '@playwright/test';
import { HeaderComponent, StorefrontPage, OrderManagementPage } from '../pages';

test.describe('10 - Security & OWASP Defense Suite', () => {
  let header: HeaderComponent;
  let storefront: StorefrontPage;
  let orderManagement: OrderManagementPage;

  test.beforeEach(async ({ page }) => {
    header = new HeaderComponent(page);
    storefront = new StorefrontPage(page);
    orderManagement = new OrderManagementPage(page);

    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-SEC-01: Stored and Reflected XSS injection defense in customer inputs', async ({ page }) => {
    // Set up XSS canary listener in window
    await page.evaluate(() => {
      (window as unknown as { __xss_detected: boolean | undefined }).__xss_detected = undefined;
    });

    const xssPayload = '<img src="x" onerror="window.__xss_detected=true" />';
    
    await storefront.selectProduct(1);
    // Fill customer email with safe part and notes/PO with XSS payload
    await storefront.fillCustomerDetails('sec_tester@company.com', 1, 'US');
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber(xssPayload);

    await storefront.submitOrder();

    // Verify order completed
    await expect(storefront.recentOrdersTable).toBeVisible();

    // Verify canary variable was never triggered/executed
    const xssTriggered = await page.evaluate(() => {
      return (window as unknown as { __xss_detected: boolean | undefined }).__xss_detected;
    });
    expect(xssTriggered).toBeUndefined();

    // Check Order Management table as well to verify stored XSS doesn't trigger
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();

    const storedXssTriggered = await page.evaluate(() => {
      return (window as unknown as { __xss_detected: boolean | undefined }).__xss_detected;
    });
    expect(storedXssTriggered).toBeUndefined();
  });

  test('TC-SEC-02: SQL Injection syntax injection defense in Order Management search filter', async ({ page }) => {
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();

    // 1. Injected boolean bypass payload
    await orderManagement.search("' OR '1'='1");
    
    // The search filter must safely treat this as literal text, not SQL bypass
    // Either zero rows or no unexpected full dump
    const bypassRowCount = await orderManagement.orderRows.count();
    expect(bypassRowCount).toBe(0);

    // 2. Destructive SQL injection payload
    await orderManagement.search("'; DROP TABLE orders; --");
    const dropRowCount = await orderManagement.orderRows.count();
    expect(dropRowCount).toBe(0);

    // 3. Clear search and verify database integrity (original rows remain intact)
    await orderManagement.search('');
    await expect(orderManagement.orderRows.first()).toBeVisible();
    const finalRowCount = await orderManagement.orderRows.count();
    expect(finalRowCount).toBeGreaterThan(0);
  });

  test('TC-SEC-03: Sensitive Cardholder Data (PCI DSS) masking in DOM and order history', async ({ page }) => {
    const rawCardNumber = '4532015099998888';
    const rawCvc = '789';

    await storefront.selectProduct(2);
    await storefront.fillCustomerDetails('pci_audit@secops.com', 1, 'US');
    await storefront.selectPaymentMethod('card');
    await storefront.fillCardDetails(rawCardNumber, '11/29', rawCvc);

    await storefront.submitOrder();

    // Wait for the order to appear in recent orders
    await expect(storefront.recentOrdersTable).toBeVisible();
    const firstRow = storefront.recentOrderRows.first();
    await expect(firstRow).toBeVisible();

    // The raw 16-digit card number and CVC must NEVER appear in plain text
    await expect(storefront.recentOrdersTable).not.toContainText(rawCardNumber);
    await expect(storefront.recentOrdersTable).not.toContainText(rawCvc);

    // Verify localStorage does not store raw credit card credentials
    const localStorageDump = await page.evaluate(() => JSON.stringify(window.localStorage));
    expect(localStorageDump).not.toContain(rawCardNumber);
    expect(localStorageDump).not.toContain(rawCvc);
  });

  test('TC-SEC-04: Client-side DOM parameter tampering defense (Price Integrity)', async ({ page }) => {
    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('tamper_test@secops.com', 1, 'US');
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO-TAMPER-001');

    // Attacker tries to alter displayed total in DOM before submitting
    await page.evaluate(() => {
      const totalEl = document.querySelector('#ui-sum-total');
      if (totalEl) {
        totalEl.textContent = '$0.01';
      }
    });

    await storefront.submitOrder();

    // Switch to Order Management to inspect the registered order price
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();
    await orderManagement.search('tamper_test@secops.com');

    const createdRow = orderManagement.orderRows.first();
    await expect(createdRow).toBeVisible();

    // Price must be computed server-side / model-side, not taken from tampered DOM '$0.01'
    await expect(createdRow).not.toContainText('$0.01');
    await expect(createdRow).toContainText('29'); // Base unit price is $29
  });

  test('TC-SEC-05: Double submission and click storm defense on checkout', async ({ page }) => {
    await storefront.selectProduct(3);
    const uniqueEmail = `anti_spam_${Date.now()}@secops.com`;
    await storefront.fillCustomerDetails(uniqueEmail, 1, 'US');
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO-ANTISPAM-001');

    // Rapid double submission attempt
    await Promise.all([
      storefront.checkoutBtn.click({ clickCount: 2 }),
    ]);

    // Check in Order Management how many orders were generated
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();
    await orderManagement.search(uniqueEmail);

    // Exactly 1 order should exist, avoiding duplicate transaction generation
    await expect(orderManagement.orderRows).toHaveCount(1);
  });
});
