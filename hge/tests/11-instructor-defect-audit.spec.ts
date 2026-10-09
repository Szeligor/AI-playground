import { test, expect } from '@playwright/test';
import { HeaderComponent, StorefrontPage, OrderManagementPage, AuthModal } from '../pages';

test.describe('11 - Instructor Defect Verification Suite (Oktatói Hibák Verifikációja)', () => {
  let header: HeaderComponent;
  let storefront: StorefrontPage;
  let orderManagement: OrderManagementPage;
  let authModal: AuthModal;

  test.beforeEach(async ({ page }) => {
    header = new HeaderComponent(page);
    storefront = new StorefrontPage(page);
    orderManagement = new OrderManagementPage(page);
    authModal = new AuthModal(page);

    await storefront.goto();
    await header.resetDatabase();
  });

  test('TC-EXP-04: Stored XSS védelem az Order Management táblázat email oszlopában (Oktató BUG-04)', async ({ page }) => {
    // Canary figyelő beállítása
    await page.evaluate(() => {
      (window as unknown as { __xss_email_vuln: boolean | undefined }).__xss_email_vuln = undefined;
      // Injektált rendelés hozzáadása, ahol az email cím egy script futtató img taget tartalmaz
      const db = (window as unknown as { DB: { users: Array<{ id: number; email: string; role: string }>; orders: Array<unknown> } }).DB;
      const injectedUser = {
        id: 999,
        email: 'attacker<img src="x" onerror="window.__xss_email_vuln=true">@astron.hu',
        role: 'user'
      };
      const injectedOrder = {
        id: 999,
        user_id: 999,
        product_id: 1,
        quantity: 1,
        total: 250,
        currency: 'USD',
        payment_method: 'card',
        status: 'PAID',
        idempotency_key: 'XSS-999',
        created_at: new Date().toISOString()
      };
      db.users.push(injectedUser);
      db.orders.unshift(injectedOrder);
    });

    // Átnavigálás az Order Management fülre
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();

    // Ha a renderMgmtOrders() metódus unescaped tr.innerHTML-t használ: <td>${user.email}</td>,
    // akkor a böngésző azonnal végrehajtja a canary szkriptet
    const xssTriggered = await page.evaluate(() => {
      return (window as unknown as { __xss_email_vuln: boolean | undefined }).__xss_email_vuln;
    });

    // Elvárt: A táblázatnak escape-elnie kell a tartalmat, a canary változónak undefined-nek kell maradnia!
    expect(xssTriggered).toBeUndefined();
  });

  test('TC-EXP-05: Torzult ÁFA és Kupon adatrögzítés az adatbázisban (Oktató BUG-05)', async ({ page }) => {
    // Rendelés leadása Németország (DE) kiválasztásával és 25%-os kuponnal (AIWS25)
    await storefront.selectProduct(1); // $250
    await storefront.countrySelect.selectOption('DE');
    await storefront.applyCoupon('AIWS25'); // 25% OFF -> kedvezmény $63 kellene legyen a DB-ben, nem fix 25
    await storefront.fillCustomerDetails('de_tax_audit@astron.hu', 1, 'DE');
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO-INTEGRITY-001');

    await storefront.submitOrder();
    await expect(storefront.recentOrdersTable).toBeVisible();

    // A legutóbbi mentett rendelés vizsgálata az in-memory adatbázisban
    const savedOrder = await page.evaluate(() => {
      // @ts-ignore
      return typeof DB !== 'undefined' ? DB.orders[0] : null;
    });

    // 1. Német ÁFA kulcsnak 19-nek kell lennie a DB-ben, nem fix 27-nek (vat: isVatExempt ? 0 : 27 hiba)
    expect(savedOrder?.vat).toBe(19);

    // 2. A 25%-os kedvezmény értéke összegszerűen kellene szerepeljen ($63), nem numerikus 25-ként
    expect(savedOrder?.discount).toBe(63);
  });

  test('TC-EXP-06: RBAC szerepkörváltás azonnali reaktivitásának hiánya fülváltás nélkül (Oktató BUG-06)', async ({ page }) => {
    // 1. Belépés Adminisztrátorként az Order Management fülre
    await header.openAuthModal();
    await authModal.selectActor('admin');
    await header.switchTab('orders');
    await expect(orderManagement.ordersTable).toBeVisible();

    // Adminisztrátorként a Refund gombnak láthatónak kell lennie
    const refundBtn = page.getByTestId('btn-refund-101');
    await expect(refundBtn).toBeVisible();

    // 2. Szerepkör azonnali átváltása Junior QA-ra
    await header.openAuthModal();
    await authModal.selectActor('junior');

    // 3. Fülváltás NÉLKÜL a táblázatnak azonnal újra kellene renderelődnie és elrejtenie a Refund gombot
    // Defect: setActiveActor nem hívja meg a renderMgmtOrders()-t, így a Refund gomb a felületen marad
    await expect(refundBtn).not.toBeVisible();
  });

  test('TC-EXP-07: Kupon minimális kosárértékének ellenőrzése elmarad olcsóbb termékre váltáskor (Oktató BUG-07)', async ({ page }) => {
    // 1. Product 1 ($250) kiválasztása, ahol érvényes a $200 min_spend limitű SAVE50 kupon
    await storefront.selectProduct(1);
    await storefront.applyCoupon('SAVE50');

    await expect(storefront.couponFeedback).toBeVisible();
    await expect(storefront.couponFeedback).toContainText('applied ($50 OFF)');
    await expect(storefront.summaryDiscount).toHaveText('-$50');

    // 2. Átkattintás a Product 3-ra ($120), amely a $200-as kupon minimum költési határ ALATT van
    await storefront.selectProduct(3);

    // 3. A rendszernek újra kellene ellenőriznie a feltételt és érvénytelenítenie a kupont
    // Defect: selectProduct nem ellenőrzi újra a min_spend-et, így a $120-as termékre is megmarad a -$50
    await expect(storefront.summaryDiscount).toHaveText('-$0');
  });

  test('TC-EXP-08: Negatív mennyiség esetén a készlet megnövekszik (Oktató BUG-08)', async ({ page }) => {
    // 1. Product 1 kiinduló készletének lekérdezése (15 db)
    const initialStock = await page.evaluate(() => {
      // @ts-ignore
      return typeof DB !== 'undefined' ? DB.products.find(p => p.id === 1)?.stock ?? 15 : 15;
    });
    expect(initialStock).toBe(15);

    // 2. Negatív darabszámú (-5) rendelés szimulációja az űrlapban
    await storefront.selectProduct(1);
    await storefront.emailInput.fill('exploit_stock@astron.hu');
    await storefront.qtyInput.evaluate((el: HTMLInputElement) => {
      el.value = '-5';
    });
    await storefront.selectPaymentMethod('invoice');
    await storefront.fillPoNumber('PO-EXPLOIT-001');

    // Rendelés leadása a negatív darabszámmal
    await page.evaluate(() => {
      // @ts-ignore
      if (typeof handleUiCheckout === 'function') {
        const fakeEvent = { preventDefault: () => {} };
        handleUiCheckout(fakeEvent);
      }
    });

    // 3. Készlet ellenőrzése a tranzakció után
    const stockAfter = await page.evaluate(() => {
      // @ts-ignore
      return typeof DB !== 'undefined' ? DB.products.find(p => p.id === 1)?.stock ?? 15 : 15;
    });

    // Defect: prod.stock -= (-5) következtében a készlet megnövekszik 15 + 5 = 20-ra!
    // Elvárt: A készlet nem nőhet meg az eredeti készlet (15) fölé
    expect(stockAfter).toBeLessThanOrEqual(15);
  });
});
