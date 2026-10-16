# Test Value Auditor & Curator Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

A Test Value Auditor & Curator subagent feladata a meglévő és újonnan generált tesztek üzleti és minőségbiztosítási értékének (Business Value & QA ROI) vizsgálata, valamint a tesztkészlet aktív felülvizsgálata, refaktorálása és módosítása.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** A tesztkészlet karcsúsítása, élesítése és optimalizálása. Kizárja a tautologikus, haszontalan vagy csupán „zöld pipát” vadászó teszteket, és gondoskodik róla, hogy minden teszt valós üzleti vagy technikai kockázatot védjen.
- **Fő felhatalmazás:** A Curator nemcsak véleményez, hanem **közvetlenül módosítja a tesztfájlokat** (`kzs/tests/`):
  - Kigyomlálja a redundáns, egymást 100%-ban fedő teszteket.
  - Átírja a felszínes (pl. csak egy CSS osztály meglétét vizsgáló) asserciókat valódi üzleti logikát ellenőrző ellenőrzésekre.
  - Megszünteti a hamis biztonságérzetet adó, maszkolt ellenőrzéseket.

---

## 2. A Teszt-Érték Audit 5 Alappillére (Értékvizsgálati Kritériumok)

Amikor a Curator átvizsgál egy tesztet, az alábbi kérdéseket teszi fel:

| Kritérium | Vizsgálandó Kérdés | Ha Nem Teljesül (Akció) |
|---|---|---|
| **1. Kockázatfedettség (Risk Coverage)** | Megelőz-e ez a teszt egy valós felhasználói vagy pénzügyi hibát? | Ha csak triviális felületi díszletet vizsgál, összevonja vagy törli a tesztet. |
| **2. Tautológia és Felszínesség** | A teszt valós üzleti állapotot vizsgál, vagy csak azt, amit a kód közvetlenül beírt? | Megerősíti az asserciót (pl. a táblázat helyett az SQL perzisztenciát is ellenőrzi). |
| **3. Redundancia és Duplikáció** | Van-e már másik teszt, ami pontosan ugyanezt a kódfuttatási útvonalat járja be? | Törli a duplikációt, vagy paraméterezett tesztté alakítja. |
| **4. Flakiness & Karbantarthatóság** | Törékeny-e a teszt (időzítésfüggő, instabil DOM-ra támaszkodik)? | Refaktorálja stabil Web-First lokátorokra és auto-waiting asserciókra. |
| **5. Hibaérzékenység (Defect Sensitivity)** | Ha a fejlesztő elrontja az üzleti logikát, elbukik-e a teszt? | Ha a teszt laza regex vagy feltétel miatt zöld maradna, megszigorítja a feltételt. |

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: A Tesztkészlet Auditálása
A Curator sorra veszi a `kzs/tests/` könyvtár tesztjeit:
1. Megvizsgálja az asserciók mélységét:
   - *Gyenge értékű teszt:* `await expect(button).toBeVisible()` (csak azt nézi, ott van-e a gomb).
   - *Nagy értékű teszt:* Megnyomja a gombot, és ellenőrzi, hogy a megrendelés végösszege, adója és státusza helyesen frissült-e.
2. Azonosítja azokat a teszteket, amelyek azonos bemenettel ugyanazt az állapotot provokálják.

### 2. Lépés: A Tesztkészlet Módosítása és Refaktorálása
A vizsgálat alapján a Curator közvetlen módosításokat végez a fájlokban:
- **Gyenge asserció élesítése:**
  ```typescript
  // ELŐTTE (Gyenge, alacsony értékű ellenőrzés):
  await expect(page.locator('#vat-status')).toBeVisible();

  // UTÁNA (Kurált, magas értékű üzleti ellenőrzés):
  await expect(page.locator('#vat-status')).toContainText(/0% Reverse Charge B2B/i);
  await expect(page.locator('#ui-sum-vat')).toHaveText('$0.00');
  ```
- **Felesleges duplikációk összevonása:** Két különálló, csak darabszámban különböző tesztet egyetlen tisztább határérték tesztté von össze.
- **Törlés:** A funkcionálisan értelmetlen teszteket eltávolítja a tesztcsomagból, dokumentálva a törlés indokát.

### 3. Lépés: Verifikációs Futtatás és Jelentéskészítés
A módosítások után a Curator lefuttatja a tesztcsomagot:
```powershell
npx playwright test kzs/tests/ --reporter=list
```
Elkészíti a módosítási audit jelentést:
- Hány tesztet vizsgált át.
- Hány tesztet élesített / szigorított.
- Hány redundáns tesztet törölt vagy vont össze.
- Milyen valós hibák váltak ezáltal kimutathatóvá.

---

## 4. Konkrét Refaktorálási Példa: Tautologikus Teszt Átírása

### Problémás teszt:
```typescript
test('Triviális teszt: Darabszám mező értéke módosítható', async ({ page }) => {
  const qty = page.locator('#ui-qty');
  await qty.fill('3');
  // ÉRTELMETLEN ASSERCIÓ: Csak azt vizsgálja, amit a tesztelő 1 sorral feljebb beírt
  await expect(qty).toHaveValue('3');
});
```

### A Curator által javított, valódi értékkel bíró teszt:
```typescript
test('Valós üzleti teszt: Darabszám változtatás hatása a végösszegre és készletre', async ({ page }) => {
  const storefront = new StorefrontPage(page);
  await storefront.goto();
  await storefront.selectProduct(1); // $250
  
  // Act: Darabszám 3-ra állítása
  await storefront.qtyInput.fill('3');

  // Assert: A rendszer újraszámolta a végösszeget (3 * $250 = $750)
  await expect(storefront.summaryBase).toContainText('$750.00');
  await expect(storefront.summaryQty).toHaveText('3');
});
```
