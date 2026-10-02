# SauceDemo Login Specifikáció
URL: https://www.saucedemo.com/

## Szabályok és Követelmények:
- Kizárólag web-first, szerepkör- és címkealapú lokátorokat használj (getByRole, getByLabel, getByPlaceholder)!
- Nyers XPath és CSS osztályszelektort szigorúan tilos használni.
- Page Object Model (POM) minta szerint dolgozz:
  - Locators a constructorban `readonly` mezőként.
  - Műveletek (fill, click) async metódusokban.
  - Page Objecten belül NORMÁL esetben NINCS asserció.
- Asserciók kizárólag a `tests/login.spec.ts` tesztfájlban lehetnek, automatikusan várakozó `expect(locator).toBeVisible()` formában.

## Tesztesetek:
1. **Sikeres bejelentkezés (Happy Path):**
   - Felhasználónév: `standard_user`
   - Jelszó: `secret_sauce`
   - Elvárt eredmény: Sikeres átirányítás a `/inventory.html` oldalra, és a "Products" (Termékek) főcím láthatóvá válik.

2. **Zárolt felhasználó hibaüzenet (Negative Test):**
   - Felhasználónév: `locked_out_user`
   - Jelszó: `secret_sauce`
   - Elvárt eredmény: Megjelenik a hibaüzenet a felületen: "Epic sadface: Sorry, this user has been locked out."
