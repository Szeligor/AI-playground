# TestAcademy Full-Stack QA Sandbox Alkalmazás Térkép & Page Object Modell (POM)

Alkalmazás URL: `https://testacademy.hu/qa-lab/e2e-app?pass=astron2026`

## 1. Az Alkalmazás Felépítése

Az alkalmazás egy 4 fő modulból álló interaktív Full-Stack tesztkörnyezet, közös memóriabeli relációs adatbázissal:

```
+-----------------------------------------------------------------------------------+
| Top Navigation: Brand | Tabs (Storefront, Selectors, API, SQL) | Reset DB | Guide |
+-----------------------------------------------------------------------------------+
| Trainer Toolbar: v2 Breaking Changes toggle | Flaky 503 simulation toggle         |
+-----------------------------------------------------------------------------------+
| [Tab 1: Storefront] | [Tab 2: Selector Lab] | [Tab 3: API Swagger] | [Tab 4: SQL] |
+-----------------------------------------------------------------------------------+
```

---

## 2. Page Object Model (POM) Könyvtárstruktúra

```
pages/
├── common/                     # Globális komponensek és keret
│   ├── BasePage.ts             # Alaposztály: URL és query paraméterkezelés (?pass, ?version, ?flaky)
│   ├── NavbarComponent.ts      # Felső fejléc és tab-váltó gombok, Reset DB
│   ├── GateComponent.ts        # Jelszóvédelmi overlay modal kezelése
│   └── TrainerToolbar.ts       # Tréner toolbar (v2 UI mód, Flaky szimuláció)
│
├── storefront/                 # 🖥️ 1. Modul: Frontend webáruház
│   └── StorefrontPage.ts       # Termékkártyák, rendelési űrlap, összegzés, élő rendelési tábla
│
├── selectors/                  # 🎯 2. Modul: Selector & DOM Lab
│   └── SelectorLabPage.ts      # Törékeny (anti-pattern) és Web-First golyóálló szelektorok, DOM újragenerálás
│
├── api-console/                # ⚡ 3. Modul: Interaktív Swagger API konzol
│   └── SwaggerPage.ts          # Szerepkör választó, GET / POST / PATCH / DELETE végpontok és válaszdobozok
│
├── sql/                        # 🗄️ 4. Modul: Live SQL adatbázis konzol
│   └── SqlConsolePage.ts       # SQL beviteli mező, gyorslekérdezések (chips), futtatás és eredménymegjelenítő
│
├── StorefrontPage.ts           # Visszafelé kompatibilis re-export
└── index.ts                    # Központi barrel export az összes POM osztályhoz
```

---

## 3. POM Osztályok és felelősségi körök

### `BasePage` (`pages/common/BasePage.ts`)
* **Cél:** Alapértelmezett navigáció és URL paraméterek kezelése (`pass`, `version=v2`, `flaky=true`, `unlocked=true`).

### `NavbarComponent` (`pages/common/NavbarComponent.ts`)
* **Cél:** A felső menüsáv kezelése.
* **Metódusok:** `switchToStorefront()`, `switchToSelectorLab()`, `switchToApiSwagger()`, `switchToSqlDatabase()`, `resetDatabase()`.

### `GateComponent` (`pages/common/GateComponent.ts`)
* **Cél:** A belépési kódot kérő `#gate-overlay` feloldása szükség esetén.
* **Metódusok:** `unlock(passcode: string)`.

### `TrainerToolbar` (`pages/common/TrainerToolbar.ts`)
* **Cél:** Tréning funkciók ki- és bekapcsolása.
* **Metódusok:** `toggleV2Mode(enable: boolean)`, `toggleFlakyMode(enable: boolean)`.

### `StorefrontPage` (`pages/storefront/StorefrontPage.ts`)
* **Cél:** Az E2E vásárlási folyamat automatizálása.
* **Web-First Lokátorok:** `emailInput`, `qtyInput`, `countrySelect`, `submitButton`, `recentOrdersTable`, `orderRows`.
* **Metódusok:** `selectProduct(idOrName)`, `fillOrderForm(email, qty, country)`, `submitOrder(email, qty, country)`, `getLatestOrderRow()`.

### `SelectorLabPage` (`pages/selectors/SelectorLabPage.ts`)
* **Cél:** Törékeny vs Web-First lokátorok demonstrációja és tesztelése.
* **Lokátorok:**
  * Clean: `cleanEmailInput`, `cleanModuleSelect`, `cleanSubmitButton`, `cleanFeedback`.
  * Fragile: `legacyEmailInput`, `legacyActionButtons`, `fragileSubmitButton`, `regenerateDomButton`.
* **Metódusok:** `openLab()`, `fillCleanForm()`, `submitCleanForm()`, `submitCleanOrder()`, `regenerateDom()`, `clickLegacyAction()`, `submitFragileForm()`.

### `SwaggerPage` (`pages/api-console/SwaggerPage.ts`)
* **Cél:** A beépített OpenAPI konzol automatizálása.
* **Lokátorok:** Szerepkörválasztó (`roleSelect`), Végpont fejlécek és végrehajtó gombok (GET, POST, PATCH, DELETE).
* **Metódusok:** `openApiConsole()`, `selectRole(role)`, `executeGetOrders()`, `executePostOrder(payload, idemKey)`, `executePatchStatus(id, status)`, `executeDeleteOrder(id)`.

### `SqlConsolePage` (`pages/sql/SqlConsolePage.ts`)
* **Cél:** A közvetlen SQL terminál és adatintegritás tesztelése.
* **Lokátorok:** `sqlTextarea`, `runQueryBtn`, gyorslekérdezések chipjei (`chipAllOrders`, `chipAllUsers`, stb.), `resultsTable`, `resultsRows`.
* **Metódusok:** `openSqlConsole()`, `runQuery(sql)`, `clickQuickQuery(chipName)`.
