# 🚀 Playwright + TypeScript Framework Scaffolding Prompt
> Használd ezt a promptot egy új, üres projekt indításakor, hogy az AI azonnal felépítse a teljes ipari szabványú keretrendszervázat.

---

```markdown
Kérlek, hozz létre egy nulláról induló, azonnal futtatható Playwright + TypeScript E2E tesztautomatizálási keretrendszert az alábbi specifikáció alapján:

1. Projekt inicializáció:
   - Hozz létre egy package.json fájlt TypeScript és @playwright/test függőségekkel, valamint npm futtató scriptekkel (test, test:headed, report).
   - Készíts egy playwright.config.ts fájlt:
     - testDir: './tests'
     - HTML és list reporter beállítása
     - Trace és screenshot rögzítése hiba esetén (on-failure)
     - Multi-projekt támogatás (Chromium böngésző és külön API projekt)
     - Állítható baseURL környezeti változóból

2. Mappastruktúra és alaposztályok:
   - /pages/common/BasePage.ts: Alap navigációs metódusok és közös környezeti beállítások.
   - /pages/: Egy minta Page Object (pl. LoginPage vagy CheckoutPage), ahol a lokátorok a constructorban vannak definiálva, és nincsenek benne expect() hívások.
   - /tests/: Egy minta *.spec.ts tesztfájl, amely példát mutat:
     - A Page Object példányosítására
     - Web-first szelektorokra (getByRole, getByLabel)
     - Tiszta async/await auto-waiting asserciókra

Kizárólag teljes, azonnal futtatható kódblokkokat és fájlstruktúrát generálj!
```
