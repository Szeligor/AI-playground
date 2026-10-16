import { test, expect } from '../fixtures';

/**
 * Feltaro (Exploratory) Tesztcsomag - Valos Szoftverhibak Detektalasa (POM & Fixture Alapon)
 *
 * A tesztcsomag a rendszerspecifikacio implicit elvarasait, allapotgep-anomaliait,
 * kombinatorikus esemenylancait es adatintegritasi hibait vizsgalja a
 * "Defect-Focused Testing Mindset" (AGENTS.md 1.2 szabaly) alapjan.
 *
 * Tervezesi minta: Page Object Model (kzs/pages/) + Custom Fixtures (kzs/fixtures/).
 */

test.describe('Feltaro (Exploratory) Tesztek - Valos Hibak Detektalasa', () => {

  test.beforeEach(async ({ storefrontPage }) => {
    // Minden teszt elott tiszta Storefront allapotbol indulunk
    await storefrontPage.goto();
    if (await storefrontPage.tabStorefront.isVisible()) {
      await storefrontPage.tabStorefront.click();
    }
  });

  test('TC-EXP-01: Negativ darabszam megadasanak es negativ vegosszegu rendelesenek tiltasa', async ({ storefrontPage }) => {
    // Arrange: Termek kivalasztasa es email kitoltese a Page Objecttel
    await storefrontPage.selectProduct(1);
    await storefrontPage.emailInput.fill('negative-qty@astron.hu');

    // Act: Negativ darabszam megadasa (-5)
    await storefrontPage.qtyInput.fill('-5');

    // Rendeles leadasi kiserlet
    await storefrontPage.submitOrder();

    // Assert: A rendszer nem hozhat letre rendelest negativ vegosszeggel
    await expect(storefrontPage.recentOrdersTable).not.toContainText('-$');
    await expect(storefrontPage.recentOrdersTable).not.toContainText('-5');
  });

  test('TC-EXP-02: Kupon minimum kosarertek ujraellenorzese termekvaltas eseten (SAVE100 bypass)', async ({ storefrontPage }) => {
    // Arrange: Dragabb termek kivalasztasa ($490), amely teljesiti a $300 minimum limitet
    await storefrontPage.selectProduct(2); // Termek 2 ($490)

    // SAVE100 kupon aktivalasa (Minimum spend: $300)
    await storefrontPage.applyCoupon('SAVE100');

    // Ellenorizzuk, hogy a kupon levonasa sikeresen megjelent
    await expect(storefrontPage.summaryDiscount).toContainText(/100/);

    // Act: Visszavaltunk az olcsobb ($250) termekre, amely NEM eri el a $300-as kuszobot
    await storefrontPage.selectProduct(1); // Termek 1 ($250)

    // Assert: Az uzleti szabaly szerint a kuponnak azonnal torlodnie / ervenytelenitodnie kell
    // A kedvezmeny osszegenek $0-nak kell lennie az uj termeknel
    await expect(storefrontPage.summaryDiscount).toHaveText(/(\$|€|Ft)?\s*0(\.00)?/);
  });

  test('TC-EXP-03: Ures darabszam beviteli mezo eseten a rendelesleadás blokkolasa', async ({ storefrontPage }) => {
    // Arrange: Termek es email beallitasa
    await storefrontPage.selectProduct(1);
    const testEmail = 'empty-qty-check@astron.hu';
    await storefrontPage.emailInput.fill(testEmail);

    // Act: A darabszam mezo teljes kiuritese
    await storefrontPage.qtyInput.fill('');

    // Rendelesleadasi kiserlet
    await storefrontPage.submitOrder();

    // Assert: Kotelezo mezo validacios hiba elvarasa, tilos csendben 1 db-os rendelest generalni
    await expect(storefrontPage.recentOrdersTable).not.toContainText(testEmail);
  });

  test('TC-EXP-04: Raktarkeszlet visszavetelezesenek ellenorzese Cancelled statusz eseten', async ({ storefrontPage, orderManagementPage }) => {
    // Arrange: Storefronton leadunk egy rendelest 1 darabos mennyiseggel
    const testEmail = `stock-test-${Date.now()}@astron.hu`;
    await storefrontPage.selectProduct(1);
    await storefrontPage.emailInput.fill(testEmail);
    await storefrontPage.qtyInput.fill('1');
    await storefrontPage.submitOrder();

    // Megvarjuk a rendeles letrejottet
    await expect(storefrontPage.recentOrdersTable).toContainText(testEmail);

    // Act: Atvaltunk az Order Management fulre es a rendelest CANCELLED statuszra allitjuk
    await orderManagementPage.switchTab('orders');
    await orderManagementPage.search(testEmail);

    const targetRow = orderManagementPage.orderRows.first();
    const statusSelect = targetRow.locator('select.select-status, select');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('CANCELLED');
    }

    // Assert: Visszaterve a Storefrontra a termek raktarkeszletenek vissza kell potlodnia
    await storefrontPage.switchTab('storefront');
    await expect(storefrontPage.product1).toContainText(/In Stock:\s*15/i);
  });

  test('TC-EXP-05: RBAC szerepkorvaltaskor az admin gombok azonnali eltunese a DOM-bol', async ({ orderManagementPage }) => {
    // Arrange: Order Management megnyitasa Admin szerepkorben
    await orderManagementPage.switchTab('orders');

    // Ellenorizzuk, hogy az Admin aktor aktiv es latja a Delete funkciogombot
    const adminDeleteBtns = orderManagementPage.orderRows.locator('.btn-delete, button:has-text("Delete")');
    await expect(adminDeleteBtns.first()).toBeVisible();

    // Act: Szerepkor valtas Junior QA-ra a BasePage setActor metodusaval
    await orderManagementPage.setActor('junior');

    // Assert: Az Admin jogosultsaghoz kotott Delete gomboknak azonnal el kell tunniuk a DOM-bol
    // A hiba miatt renderMgmtOrders() nem fut le, ezert a gombok a kepernyon maradnak
    await expect(adminDeleteBtns).toHaveCount(0);
  });

  test('TC-EXP-06: Storefront termekkartya keszletszamlalo DOM frissulese vasarlas utan', async ({ storefrontPage }) => {
    // Arrange: Termek 1 kivalasztasa, kiindulasi keszlet: 15
    await expect(storefrontPage.product1).toContainText(/15 units/i);
    await storefrontPage.selectProduct(1);

    // Act: 2 darab megrendelese
    await storefrontPage.emailInput.fill('stock-sync@astron.hu');
    await storefrontPage.qtyInput.fill('2');
    await storefrontPage.submitOrder();

    // Megvarjuk a rendeles bejegyzeset
    await expect(storefrontPage.recentOrdersTable).toContainText('stock-sync@astron.hu');

    // Assert: A termekkartya szovegenek azonnal, oldalujratoltes nelkul "13 units"-ra kell frissulnie
    // A DOM-ban levo szoveg a valosagban stale marad (15 units)
    await expect(storefrontPage.product1).toContainText(/13 units/i);
  });

  test('TC-EXP-07: Fájlfeltoltes nagybetus kiterjesztes (.PDF) elfogadasa', async ({ selectorLabPage }) => {
    // Arrange: DOM & Selector Lab navigacio a Page Objecttel
    await selectorLabPage.switchTab('selectors');
    await expect(selectorLabPage.fileInput).toBeAttached();

    // Act: Nagybetus .PDF fajl csatolasa
    await selectorLabPage.uploadFile('corporate_invoice_2026.PDF', 'application/pdf', 'UPPERCASE_EXTENSION_TEST_SAMPLE');

    // Assert: A rendszernek el kell fogadnia a fajlt es meg kell jelenitenie a nevet a feedback mezoben
    // A hiba miatt 415-os hiba lep fel a kisbetus szuro (.pdf) miatt
    await expect(selectorLabPage.fileFeedback).toContainText('corporate_invoice_2026.PDF');
    await expect(selectorLabPage.fileFeedback).not.toContainText(/415|Unsupported/i);
  });

  test('TC-EXP-08: Nemzetkozi rendeles AFA kulcsanak integritasa (US 0% es DE 19% rogzitese)', async ({ storefrontPage, sqlConsolePage }) => {
    // Arrange: Nemetorszag (DE) kivalasztasa a StorefrontPage-en
    await storefrontPage.selectProduct(1);
    const testEmail = `vat-integrity-${Date.now()}@astron.hu`;
    await storefrontPage.emailInput.fill(testEmail);
    await storefrontPage.countrySelect.selectOption('DE');

    // Act: Rendeles leadasa
    await storefrontPage.submitOrder();

    // Megvarjuk a rendeles bejegyzeset
    await expect(storefrontPage.recentOrdersTable).toContainText(testEmail);

    // Assert: SQL Workbench-ben lekerdezzuk a rendeles vat mezejet az SqlConsolePage segitsevevel
    await sqlConsolePage.switchTab('sql');
    await sqlConsolePage.executeQuery(`SELECT email, country, vat FROM orders WHERE email='${testEmail}';`);

    // Az elmentett vat erteknek 19-nek kell lennie DE eseten, nem pedig fix 27-nek
    await expect(sqlConsolePage.resultsContainer).toContainText('19');
    await expect(sqlConsolePage.resultsContainer).not.toContainText('27');
  });

  test('TC-EXP-09: Szazalekos kupon kedvezmeny osszegenek pontos mentese a megrendelesben', async ({ storefrontPage, sqlConsolePage }) => {
    // Arrange: Termek 2 ($490) es AIWS25 (25%) kupon
    // Elvart valos kedvezmeny: $490 * 0.25 = $122.50
    await storefrontPage.selectProduct(2);

    const testEmail = `discount-calc-${Date.now()}@astron.hu`;
    await storefrontPage.emailInput.fill(testEmail);
    await storefrontPage.applyCoupon('AIWS25');

    // Act: Rendeles bekuldese
    await storefrontPage.submitOrder();
    await expect(storefrontPage.recentOrdersTable).toContainText(testEmail);

    // Assert: SQL Workbench konzolon lekerdezzuk a mentett discount mezot
    await sqlConsolePage.switchTab('sql');
    await sqlConsolePage.executeQuery(`SELECT email, discount FROM orders WHERE email='${testEmail}';`);

    // Az elmentett rekordban a szamitott 122.5 dollarnak kell lennie, nem literalis 25-nek
    await expect(sqlConsolePage.resultsContainer).toContainText('122.5');
  });

  test('TC-EXP-10: Megrendelesleadasi versenyhelyzet (Race Condition) megelozese gombletiltassal', async ({ storefrontPage }) => {
    // Arrange: Termek es adatok kitoltese
    await storefrontPage.selectProduct(1);
    await storefrontPage.emailInput.fill('race-condition@astron.hu');

    // Act: Kattintas a megrendeles gombra
    await storefrontPage.submitOrder();

    // Assert: A kattintast kovetoen a gombnak azonnal disabled allapotba kell kerulnie a folyamat vegig
    await expect(storefrontPage.checkoutBtn).toBeDisabled();
  });

});
