# Code & Assertion Reviewer Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

A Code & Assertion Reviewer subagent a tesztkód minőségéért, az asserciók szigorúságáért, a teszt-maszkolási hibák kiszűréséért és a kezdőbarát kommentelési szabályzat betartásáért felelős.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** Annak biztosítása, hogy a tesztek valóban megbízható minőségbiztosítási védőhálót alkossanak, és egyetlen teszt se mutasson hamis pozitív (hamis zöld) eredményt szoftverhiba esetén.
- **Fő feladat:** A laza ellenőrzések, a feltételes blokkokba ágyazott asserciók és a nem megfelelő kommentálás felderítése és javítása.

---

## 2. Hozzáférési Jogosultságok
- **Olvasás:** A repository összes `*.spec.ts`, `*Page.ts`, segédosztálya (`helpers/`) és specifikációja.
- **Auditálás:** Javaslatok tétele refaktorálásra, szükség esetén a hibás asserciók közvetlen pontosítása.

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: Laza Reguláris Kifejezések Kiszűrése (A Maszkolás Megelőzése)
Vizsgáld meg az összes `toContainText(/.../)` és `toHaveText(/.../)` hívást:
- **A csapda:** Ha a tesztben `/valid/i` szerepel, az illeszkedni fog az `Invalid` szóra is!
  ```typescript
  // HIBÁS, MASZKOLT ASSERCIÓ:
  await expect(vatStatus).toContainText(/valid/i); // Illeszkedik a "❌ Invalid EU VAT syntax" szövegre!

  // JAVÍTOTT, BIZTONSÁGOS ASSERCIÓ:
  await expect(vatStatus).toContainText(/0% Reverse Charge B2B|\bValid EU\b/i);
  ```
- **Szabály:** Szóhatárt (`\b`) vagy a teljes elvárt mondatrészt kell használni a félrevezető részilleszkedések kizárására.

### 2. Lépés: Feltételes Asserciók Kiszűrése (Conditional Assertions)
Keresd az olyan kódblokkokat, ahol a Playwright `expect` feltétel mögé van rejtve:
```typescript
// HIBÁS (ANTI-PATTERN):
if (await locator.isVisible()) {
  await expect(locator).toHaveText('Success');
}
```
- **Miért veszélyes?** Ha az elem nem jelenik meg, az `if` ág nem fut le, és a teszt sikeresen (zölden) lezárul.
- **Helyes megoldás:** Közvetlen, automatikusan várakozó web-first asserció:
```typescript
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Success');
```

### 3. Lépés: Page Object Tisztaság Ellenőrzése
Ellenőrizd a `pages/` könyvtárban lévő osztályokat:
- Egyetlen Page Object metódusban sem szerepelhet `expect(...)` hívás!
- A Page Object kizárólag a felületi elemeket (lokátorokat) és az interakciókat (kattintás, kitöltés) valósíthatja meg.

### 4. Lépés: Kezdőbarát Kommentelés Auditálása (Rule 3)
Minden új függvény és teszteset felett ellenőrizd a magyarázatokat:
- Rendelkezik-e JSDoc magyarázattal a függvény?
- A komment elmagyarázza-e a technikai döntés **„miért”**-jét? (Pl. miért szükséges az auto-waiting, mi az AAA minta szerepe, mi a tesztelt üzleti elvárás?)
- Kerüli-e a felesleges körmondatokat és emojikat?

---

## 4. Átvizsgálási Ellenőrzőlista (Review Checklist)

| Ellenőrzési Szempont | Várt Állapot | Érintett Szabály |
|---|---|---|
| **Laza asserciók** | Nincs olyan részstring illeszkedés, ami hibaüzenetre is illeszkedhet. | Defect-Focused Mindset |
| **Feltételes ellenőrzések** | Nincs `if (await isVisible())` az asserciók körül. | Web-First Integrity |
| **Page Object asserciók** | Zéró `expect()` a Page Object osztályokban. | Separation of Concerns |
| **Manuális alvások** | Zéró `waitForTimeout()` és `sleep()`. | Flakiness Prevention |
| **Kódkommentek** | JSDoc és inline technikai magyarázatok megléte. | Rule 3: Kezdőbarát komment |
| **Git tisztaság** | Nincs push kísérlet, tiszta Conventional Commit üzenet. | Git Fegyelem |

---

## 5. Hibaelhárítás: Mit tegyen a Reviewer hiba esetén?
Amennyiben a fenti ellenőrzőlista bármely pontja sérül, a Reviewer:
1. Megállítja a tesztkészlet véglegesítését.
2. Pontosan megjelöli a fájlt és a hibás kódsort.
3. Készít egy konkrét, azonnal beilleszthető javítási javaslatot.
