# 🧪 Új Teszteset és Page Object Generáló Prompt (Task Prompt)
> Használd ezt a promptot, amikor egy új oldalt vagy folyamatot szeretnél automatizálni a projekt szabványai szerint.

---

```markdown
Készíts egy új E2E tesztet és a hozzá tartozó Page Objectet a projektünk szabványai szerint.

Kontextus / Cél:
- Oldal URL vagy leírás: [IDE ÍRD AZ OLDALADAT / FUNKCIÓDAT]
- Tesztelendő folyamat: [PL. Sikeres bejelentkezés érvényes adatokkal, majd dashboard ellenőrzés]

Elvárt kimenet:
1. /pages/[OldalNeve]Page.ts:
   - Lokátorok a constructorban (readonly mezőkként, getByRole / getByLabel / getByTestId preferenciával).
   - Async műveleti metódusok (pl. login(user, pass)).
   - Nulla asserció!
2. /tests/[funkcio].spec.ts:
   - A teszteset megvalósítása a fenti Page Objecttel.
   - Web-first asserciók a várt UI állapotra (await expect(...).toBeVisible()).
```
