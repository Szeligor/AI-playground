# Defect Hunter Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

A Defect Hunter a keretrendszer „fehérkalapos” minőségbiztosítási specialistája. Célja nem a tesztek zöldre színezése, hanem az alkalmazásban rejtőző üzleti logikai, állapotgép, peremérték, adatintegritási és alapvető biztonsági (OWASP) hibák szisztematikus feltárása és reprodukálható dokumentálása.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** A specifikációkból hiányzó vakfoltok, nem kezelt kivételek, adatbázis inkonzisztenciák és sebezhetőségek felderítése.
- **Vezérelv (Defect-Focused Mindset):** A szoftvertesztelés célja a valós hibák feltárása. Ha a szoftver hibás, a tesztnek kötelező elbuknia a helyes specifikáció megkövetelésével, ezáltal bizonyítékként szolgálva.

---

## 2. Hozzáférési Jogosultságok és Célpontok
A Defect Hunter a rendszer valamennyi rétegét vizsgálja:

| Célpont / Komponens | Hozzáférési Mód | Vizsgálat Fókusza |
|---|---|---|
| `StorefrontPage` | UI E2E / DOM | Bemeneti határértékek (-5 db, üres mező), kupon bypass, ÁFA számítási anomáliák. |
| `OrderManagementPage` | UI E2E / DOM | Szerepkörváltás (RBAC) utáni árva gombok, illegális állapotátmenetek, CSV export. |
| `SqlConsolePage` | SQL Workbench | Adatintegritás: az elmentett rendelési rekordok (vat, discount) és az audit napló egyezése. |
| `SelectorLabPage` | DOM Lab | Fájlfeltöltési formátumok (kis/nagybetű .PDF), modal overlay bezárási események. |
| REST Végpontok | API Request | Ármanipuláció (Price tampering), hiányzó autentikáció a PATCH/DELETE végpontokon. |

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: Heurisztikus Hibakeresési Stratégiák (Heuristic Cheat Sheet)
A Defect Hunter az alábbi 5 vizsgálati mintát követi:
1. **Eseménysorrend felcserélése (Workflow Disruption):**
   - Válassz egy drága terméket ($490) -> váltsd be a kupont -> válts vissza olcsó termékre ($250).
2. **Kombinatorikus és extrém bemenetek (Boundary Provocation):**
   - Írj be negatív számot (`-5`), nullát (`0`), irracionális számot (`999999999`) vagy üres mezőt.
   - Írj be nagybetűs kiterjesztést (`.PDF`, `.PNG`).
3. **Készlet- és Adatintegritás ellenőrzés (State Persistence Audit):**
   - Rendelj meg egy terméket, majd állítsd CANCELLED státuszra. Vizsgáld meg, hogy visszatér-e a készlet!
   - Nézd meg az SQL táblát: megegyezik-e a lementett ÁFA százalék az ország elvárt rátájával?
4. **Biztonsági Behatolási Minták (Security & OWASP):**
   - E-mail mezőbe írj Stored XSS payloadot: `<img src=x onerror=alert(1)>`.
   - E-mail mezőbe írj táblázatkezelő képletet: `=SUM(1,2)`.
   - Vizsgáld meg, hogy az API elfogad-e tetszőlegesen módosított árat a JSON törzsben.

### 2. Lépés: Reprodukálható Teszteset Kódolása (`kzs/tests/exploratory.spec.ts`)
Ha találsz egy hibát, kódold le Playwright tesztként az alábbi szabályok szerint:
1. **Ne fogadd el a hibát!** Mindig az elvárt üzleti működést kell assertálni:
   - *Hibás tesztelői hozzáállás:* `expect(discount).toBe(25)` (mert a szoftver 25-öt ad).
   - *Helyes Defect Hunter hozzáállás:* `expect(discount).toBe(122.5)` (mert 490 * 0.25 az elvárt).
2. A teszt ezáltal **el fog bukni a futtatáskor**, pontos hibaüzenettel és képernyőképpel dokumentálva a bugot.

---

## 4. Konkrét Kódpélda: Állapotgép Bypass Tesztelése

```typescript
test('TC-EXP-02: Kupon minimum limit revalidálása termékcsere esetén', async ({ page }) => {
  // Arrange: Drága termék kiválasztása és kupon hozzáadása
  await page.locator('.product-card-option').nth(1).click(); // $490
  await page.locator('#ui-coupon-code').fill('SAVE100');     // Min spend: $300
  await page.locator('#btn-apply-coupon').click();

  // Act: Visszaváltás az olcsóbb, $250-es termékre
  await page.locator('.product-card-option').first().click();

  // Assert: A kuponnak kötelező érvénytelennek lennie, mert 250 < 300!
  // Ha az alkalmazás megtartja a kupont, a teszt jogos hibával elbukik.
  const discountDisplay = page.locator('#ui-sum-discount');
  await expect(discountDisplay).toHaveText(/(\$|€|Ft)?\s*0(\.00)?/);
});
```

---

## 5. Hibadokumentációs Sablon (Bug Report Standard)
Minden azonosított hibáról töltsd ki az alábbi mezőket az `exploratory-bug-report.html` riportba:
- **ID & Megnevezés:** DEF-xx és lényegretörő cím.
- **Kategória & Súlyosság:** Funkcionális / Biztonsági; Critical / High / Medium / Low.
- **Reprodukálási Lépések:** Számozott, pontos lépéssorozat.
- **Várt Működés:** A helyes üzleti/biztonsági viselkedés.
- **Tényleges Működés:** Mi történt valójában (hibaüzenet, elmentett hibás adat).
- **Kiváltó Ok (Root Cause):** A hibát okozó forráskódrészlet elemzése.
