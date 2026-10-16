import { test, expect } from '@playwright/test';

/**
 * Feltaro (Exploratory) Tesztcsomag - Valos Szoftverhibak Detektalasa
 *
 * A tesztcsomag a rendszerspecifikacio implicit elvarasait, allapotgep-anomaliait,
 * kombinatorikus esemenylancait es adatintegritasi hibait vizsgalja a
 * "Defect-Focused Testing Mindset" (AGENTS.md 1.2 szabaly) alapjan.
 *
 * Lefedett hibak:
 * - TC-EXP-01: Negativ darabszam bevitele miatti keszletnoveles es negativ vegosszeg
 * - TC-EXP-02: Kupon minimum kosarertek feltetel kijatszasa termekvaltassal (SAVE100 bypass)
 * - TC-EXP-03: Ures darabszam beviteli mezo csendes 1 db-ra kerekitve torteno rendelese
 * - TC-EXP-04: Raktarkeszlet visszavetelezes elmaradasa Cancelled / Refunded statuszvaltaskor
 * - TC-EXP-05: RBAC szerepkorvaltaskor az admin funkciogombok feluleti bennmaradasa
 * - TC-EXP-06: Storefront termekkartya keszletszamlalo DOM szinkronizaciojanak elmaradasa
 * - TC-EXP-07: Fájlfeltoltes elutasitasa nagybetus kiterjesztes eseten (.PDF / .PNG)
 * - TC-EXP-08: Nemzetkozi rendelesek AFA kulcsanak torzult rogzitese (fix 27% DE es US eseten)
 * - TC-EXP-09: Szazalekos kupon kedvezmeny ertekenek literalis szamkent valo tarolasa
 * - TC-EXP-10: Rendelesleadasi versenyhelyzet (Race condition) dupla kattintas eseten
 *
 * Tervezesi minta: AAA (Arrange - Act - Assert)
 * Lokator strategia: Web-First, Auto-waiting
 */

const APP_URL = 'https://testacademy.hu/qa-lab/e2e-app?pass=astron2026';

test.describe('Feltaro (Exploratory) Tesztek - Valos Hibak Detektalasa', () => {

  test.beforeEach(async ({ page }) => {
    // Minden teszt elott tiszta Storefront allapotbol indulunk
    await page.goto(APP_URL);
    const storefrontBtn = page.getByRole('button', { name: /Storefront/i });
    if (await storefrontBtn.isVisible()) {
      await storefrontBtn.click();
    }
  });

  test('TC-EXP-01: Negativ darabszam megadasanak es negativ vegosszegu rendelesenek tiltasa', async ({ page }) => {
    // Arrange: Termek kivalasztasa es email kitoltese
    await page.locator('.product-card-option').first().click();
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill('negative-qty@astron.hu');

    // Act: Negativ darabszam megadasa (-5)
    const qtyInput = page.locator('#ui-qty, #qty-input, [data-testid="qty-input"]');
    await qtyInput.fill('-5');

    // Rendeles leadasi kiserlet
    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"], #submit-order-btn').first();
    await checkoutBtn.click();

    // Assert: A rendszer nem hozhat letre rendelest negativ vegosszeggel
    // Az elvart mukodes az, hogy a form validacios hibat jelez es nem engedi a leadast
    const recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    await expect(recentOrdersTable).not.toContainText('-$');
    await expect(recentOrdersTable).not.toContainText('-5');
  });

  test('TC-EXP-02: Kupon minimum kosarertek ujraellenorzese termekvaltas eseten (SAVE100 bypass)', async ({ page }) => {
    // Arrange: Dragabb termek kivalasztasa ($490), amely teljesiti a $300 minimum limitet
    const productCards = page.locator('.product-card-option');
    await productCards.nth(1).click(); // Termek 2 ($490)

    // SAVE100 kupon aktivalasa (Minimum spend: $300)
    const couponInput = page.locator('#ui-coupon-code, #coupon-input, [data-testid="coupon-input"]');
    const applyCouponBtn = page.locator('#btn-apply-coupon, [data-testid="coupon-btn"]');
    await couponInput.fill('SAVE100');
    await applyCouponBtn.click();

    // Ellenorizzuk, hogy a kupon levonasa sikeresen megjelent
    const discountSum = page.locator('#ui-sum-discount');
    await expect(discountSum).toContainText(/100/);

    // Act: Visszavaltunk az olcsobb ($250) termekre, amely NEM eri el a $300-as kuszobot
    await productCards.first().click(); // Termek 1 ($250)

    // Assert: Az uzleti szabaly szerint a kuponnak azonnal torlodnie / ervenytelenitodnie kell
    // A kedvezmeny osszegenek $0-nak kell lennie az uj termeknel
    await expect(discountSum).toHaveText(/(\$|€|Ft)?\s*0(\.00)?/);
  });

  test('TC-EXP-03: Ures darabszam beviteli mezo eseten a rendelesleadás blokkolasa', async ({ page }) => {
    // Arrange: Termek es email beallitasa
    await page.locator('.product-card-option').first().click();
    const emailInput = page.locator('#ui-email, #email-input, [data-testid="email-input"]');
    const testEmail = 'empty-qty-check@astron.hu';
    await emailInput.fill(testEmail);

    // Act: A darabszam mezo teljes kiuritese
    const qtyInput = page.locator('#ui-qty, #qty-input, [data-testid="qty-input"]');
    await qtyInput.fill('');

    // Rendelesleadasi kiserlet
    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"], #submit-order-btn').first();
    await checkoutBtn.click();

    // Assert: Kotelezo mezo validacios hiba elvarasa, tilos csendben 1 db-os rendelest generalni
    const recentOrdersTable = page.locator('#ui-recent-orders-tbody');
    await expect(recentOrdersTable).not.toContainText(testEmail);
  });

  test('TC-EXP-04: Raktarkeszlet visszavetelezesenek ellenorzese Cancelled statusz eseten', async ({ page }) => {
    // Arrange: Storefronton leadunk egy rendelest 1 darabos mennyiseggel
    const testEmail = `stock-test-${Date.now()}@astron.hu`;
    await page.locator('.product-card-option').first().click();
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill(testEmail);
    await page.locator('#ui-qty, #qty-input, [data-testid="qty-input"]').fill('1');

    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"]').first();
    await checkoutBtn.click();

    // Megvarjuk a rendeles letrejottet
    await expect(page.locator('#ui-recent-orders-tbody')).toContainText(testEmail);

    // Act: Atvaltunk az Order Management fulre es a rendelest CANCELLED statuszra allitjuk
    const ordersTabBtn = page.getByRole('button', { name: /Order Management/i });
    await ordersTabBtn.click();

    // Kereses a teszt emailre
    const searchInput = page.locator('#mgmt-search');
    await searchInput.fill(testEmail);

    // Statusz atallitasa CANCELLED-re
    const targetRow = page.locator('#mgmt-orders-tbody tr').first();
    const statusSelect = targetRow.locator('select.select-status, select');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('CANCELLED');
    }

    // Assert: Visszaterve a Storefrontra vagy az adatbazisba a termek raktarkeszletenek vissza kell potlodnia
    const storefrontTabBtn = page.getByRole('button', { name: /Storefront/i });
    await storefrontTabBtn.click();

    // A termekkartya keszletszovegenek az eredeti keszletszintet kell tukroznie
    const productCard = page.locator('.product-card-option').first();
    await expect(productCard).toContainText(/In Stock:\s*15/i);
  });

  test('TC-EXP-05: RBAC szerepkorvaltaskor az admin gombok azonnali eltunese a DOM-bol', async ({ page }) => {
    // Arrange: Order Management megnyitasa Admin szerepkorben
    const ordersTabBtn = page.getByRole('button', { name: /Order Management/i });
    await ordersTabBtn.click();

    // Ellenorizzuk, hogy az Admin aktor aktiv es latja a Delete funkciogombot
    const adminDeleteBtns = page.locator('#mgmt-orders-tbody .btn-delete, #mgmt-orders-tbody button:has-text("Delete")');
    await expect(adminDeleteBtns.first()).toBeVisible();

    // Act: Szerepkor valtas Junior QA-ra a trainer panelen
    const actorSelect = page.locator('#trainer-actor, #current-actor-select');
    if (await actorSelect.isVisible()) {
      await actorSelect.selectOption('junior');
    }

    // Assert: Az Admin jogosultsaghoz kotott Delete gomboknak azonnal el kell tunniuk a DOM-bol
    // A hiba miatt renderMgmtOrders() nem fut le, ezert a gombok a kepernyon maradnak
    await expect(adminDeleteBtns).toHaveCount(0);
  });

  test('TC-EXP-06: Storefront termekkartya keszletszamlalo DOM frissulese vasarlas utan', async ({ page }) => {
    // Arrange: Termek 1 kivalasztasa, kiindulasi keszlet: 15
    const product1Card = page.locator('.product-card-option').first();
    await expect(product1Card).toContainText(/15 units/i);
    await product1Card.click();

    // Act: 2 darab megrendelese
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill('stock-sync@astron.hu');
    await page.locator('#ui-qty, #qty-input, [data-testid="qty-input"]').fill('2');

    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"]').first();
    await checkoutBtn.click();

    // Megvarjuk a rendeles bejegyzeset
    await expect(page.locator('#ui-recent-orders-tbody')).toContainText('stock-sync@astron.hu');

    // Assert: A termekkartya szovegenek azonnal, oldalujratoltes nelkul "13 units"-ra kell frissulnie
    // A DOM-ban levo szoveg a valosagban stale marad (15 units)
    await expect(product1Card).toContainText(/13 units/i);
  });

  test('TC-EXP-07: Fájlfeltoltes nagybetus kiterjesztes (.PDF) elfogadasa', async ({ page }) => {
    // Arrange: DOM & Selector Lab navigacio
    const selectorLabBtn = page.getByRole('button', { name: /DOM & Selectors/i });
    await selectorLabBtn.click();

    const fileInput = page.locator('#lab-file-input');
    await expect(fileInput).toBeAttached();

    // Act: Nagybetus .PDF fajl csatolasa
    const testBuffer = Buffer.from('UPPERCASE_EXTENSION_TEST_SAMPLE');
    await fileInput.setInputFiles({
      name: 'corporate_invoice_2026.PDF',
      mimeType: 'application/pdf',
      buffer: testBuffer,
    });

    // Assert: A rendszernek el kell fogadnia a fajlt es meg kell jelenitenie a nevet a feedback mezoben
    // A hiba miatt 415-os hiba lep fel a kisbetus szuro (.pdf) miatt
    const feedback = page.locator('#file-upload-feedback');
    await expect(feedback).toContainText('corporate_invoice_2026.PDF');
    await expect(feedback).not.toContainText(/415|Unsupported/i);
  });

  test('TC-EXP-08: Nemzetkozi rendeles AFA kulcsanak integritasa (US 0% es DE 19% rogzitese)', async ({ page }) => {
    // Arrange: Nemetorszag (DE) kivalasztasa, ahol az AFA 19%
    await page.locator('.product-card-option').first().click();
    const testEmail = `vat-integrity-${Date.now()}@astron.hu`;
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill(testEmail);

    const countrySelect = page.locator('#ui-country, #country-select, [data-testid="country-select"]');
    await countrySelect.selectOption('DE');

    // Act: Rendeles leadasa
    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"]').first();
    await checkoutBtn.click();

    // Megvarjuk a rendeles bejegyzeset
    const recentTable = page.locator('#ui-recent-orders-tbody');
    await expect(recentTable).toContainText(testEmail);

    // Assert: SQL Workbench-ben lekerdezzuk a rendeles vat mezejet
    const sqlTabBtn = page.getByRole('button', { name: /SQL Workbench/i });
    await sqlTabBtn.click();

    const sqlInput = page.locator('#sql-input');
    const runBtn = page.getByRole('button', { name: /Run Query/i });
    await sqlInput.fill(`SELECT email, country, vat FROM orders WHERE email='${testEmail}';`);
    await runBtn.click();

    // Az elmentett vat erteknek 19-nek kell lennie DE eseten, nem pedig fix 27-nek
    const sqlResult = page.locator('#sql-results-container');
    await expect(sqlResult).toContainText('19');
    await expect(sqlResult).not.toContainText('27');
  });

  test('TC-EXP-09: Szazalekos kupon kedvezmeny osszegenek pontos mentese a megrendelesben', async ({ page }) => {
    // Arrange: Termek 2 ($490) es AIWS25 (25%) kupon
    // Elvart valos kedvezmeny: $490 * 0.25 = $122.50
    const productCards = page.locator('.product-card-option');
    await productCards.nth(1).click();

    const testEmail = `discount-calc-${Date.now()}@astron.hu`;
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill(testEmail);

    const couponInput = page.locator('#ui-coupon-code, #coupon-input, [data-testid="coupon-input"]');
    const applyCouponBtn = page.locator('#btn-apply-coupon, [data-testid="coupon-btn"]');
    await couponInput.fill('AIWS25');
    await applyCouponBtn.click();

    // Act: Rendeles bekuldese
    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"]').first();
    await checkoutBtn.click();

    await expect(page.locator('#ui-recent-orders-tbody')).toContainText(testEmail);

    // Assert: SQL Workbench konzolon lekerdezzuk a mentett discount mezot
    const sqlTabBtn = page.getByRole('button', { name: /SQL Workbench/i });
    await sqlTabBtn.click();

    const sqlInput = page.locator('#sql-input');
    const runBtn = page.getByRole('button', { name: /Run Query/i });
    await sqlInput.fill(`SELECT email, discount FROM orders WHERE email='${testEmail}';`);
    await runBtn.click();

    // Az elmentett rekordban a szamitott 122.5 dollarnak kell lennie, nem literalis 25-nek
    const sqlResult = page.locator('#sql-results-container');
    await expect(sqlResult).toContainText('122.5');
  });

  test('TC-EXP-10: Megrendelesleadasi versenyhelyzet (Race Condition) megelozese gombletiltassal', async ({ page }) => {
    // Arrange: Termek es adatok kitoltese
    await page.locator('.product-card-option').first().click();
    await page.locator('#ui-email, #email-input, [data-testid="email-input"]').fill('race-condition@astron.hu');

    // Act: Kattintas a megrendeles gombra
    const checkoutBtn = page.locator('#btn-ui-submit, [data-testid="checkout-btn"]').first();
    await checkoutBtn.click();

    // Assert: A kattintast kovetoen a gombnak azonnal disabled allapotba kell kerulnie a folyamat vegig
    // megelozve a gyors dupla kattintassal bejegyzet duplikalt megrendeleseket
    await expect(checkoutBtn).toBeDisabled();
  });

});
