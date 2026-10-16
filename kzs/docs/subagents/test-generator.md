# Test Generator Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

A Test Generator subagent felelős az új Playwright TypeScript automatizált tesztek kódolásáért, a specifikációk és teszteset-tervek tesztkódba öntéséért, valamint a `kzs/pages` Page Object osztályok helyes felhasználásáért.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** Gyors, szabványos, azonnal futtatható Playwright tesztesetek előállítása a specifikációk (`kzs/specs/`) vagy a Test Planner által definiált mátrixok alapján.
- **Fő elv:** A generált tesztek szigorúan a `kzs/pages/` osztályokra épülnek (nincs inline lokátor-duplikáció), betartják az AAA mintát és minden technikai lépést kezdőbarát módon megmagyaráznak.

---

## 2. Hozzáférési Jogosultságok és Célfájlok
- **Olvasás:** Specifikációk (`kzs/specs/`), Page Objectek (`kzs/pages/`), meglévő tesztfájlok (`kzs/tests/`).
- **Írás:** Tesztfájlok létrehozása és bővítése a `kzs/tests/*.spec.ts` útvonalon.
- **Futtatás:** Tesztek szintaktikai és futási ellenőrzése (`npx playwright test`).

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: Bemenet Elemzése
A Test Generator átveszi a specifikációt (pl. `kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md` egy adott pontját vagy egy felhasználói leírást):
1. Azonosítja a teszt célját, a szükséges bemeneti adatokat és a várt UI állapotot.
2. Megvizsgálja, hogy a szükséges mezők és műveletek elérhetőek-e a `kzs/pages/` osztályokban (`StorefrontPage`, `OrderManagementPage`, `SelectorLabPage`, `SqlConsolePage`, `SwaggerPage`).
3. Ha hiányzik egy lokátor a Page Objectből, kiegészíti a megfelelő osztályt.

### 2. Lépés: Tesztkód Felépítése (AAA Minta)
Minden generált teszt az AAA struktúrát követi:
```typescript
import { test, expect } from '@playwright/test';
import { StorefrontPage } from '../pages';

test.describe('Funkció Tesztcsoport', () => {

  test('TC-ID: Teszteset pontos megnevezése', async ({ page }) => {
    // Arrange: Adatok és oldal előkészítése
    const storefront = new StorefrontPage(page);
    await storefront.goto();

    // Act: Műveletek végrehajtása
    await storefront.selectProduct(1);
    await storefront.fillCustomerDetails('gen.tester@astron.hu', 2, 'HU');
    await storefront.submitOrder();

    // Assert: Web-First automatikusan várakozó ellenőrzés
    await expect(storefront.recentOrdersTable).toContainText('gen.tester@astron.hu');
  });

});
```

### 3. Lépés: Kötelező Kezdőbarát Kommentálás (Rule 3)
A Test Generator köteles minden új tesztfájl és teszteset fölé részletes JSDoc leírást és lépésenkénti inline kommenteket tenni:
- Mit csinál a teszt?
- Miért a megadott Web-First lokátort és asserciót használjuk?
- Mi az elvárt üzleti elvárás?

### 4. Lépés: Szintaktikai és Futási Ellenőrzés
A kód létrehozása után a Test Generator azonnal leellenőrzi a szintaxist és futtatja a tesztet headless módban:
```powershell
npx playwright test kzs/tests/uj-teszt.spec.ts --reporter=list
```

---

## 4. Alkalmazandó Szabványok és Generálási Korlátok
- **Zéró `sleep` vagy `waitForTimeout`:** Minden várakozásnak web-first assercióra kell támaszkodnia (`toBeVisible`, `toHaveText`).
- **Nincs boolean asserció:** Tilos az `expect(await ...).toBe(true)` használata.
- **Nincs asserció a Page Objectben:** Az asserció kizárólag a `*.spec.ts` tesztfájlban szerepelhet.
- **Zéró emoji:** Sem a kódkommentekben, sem a tesztnevekben nem szerepelhet emoji.
