# 🛡️ Antigravity AI Project Constitution & Security Isolation Rules
### Playwright TypeScript QA Automation Workspace | Astron Edition
### STRICT ISOLATION & ZERO-DATA-EXFILTRATION DIRECTIVE

> ⚠️ **CRITICAL SECURITY DIRECTIVE FOR AI AGENTS (ANTIGRAVITY & GEMINI):**  
> You are operating within an enterprise client workspace for **Astron Informatikai Kft.**.  
> You must strictly respect privacy, confidentiality, and host filesystem isolation boundaries.  
> Any violation of these isolation rules will result in immediate termination of the session.

---

## 🔒 0. ABSOLUTE WORKSPACE ISOLATION & HOST BOUNDARIES (STRICT)

1. **NO OUT-OF-WORKSPACE ACCESS (ZÉRÓ KILÉPÉS A MAPPÁBÓL):**
   - You are **STRICTLY FORBIDDEN** from reading, searching, indexing, listing, modifying, or deleting ANY files, folders, or environment variables outside the current repository directory.
   - **Absolute Boundaries:**
     - ❌ **NEVER** touch `C:\Users\*` outside this specific repo folder (including Desktop, Downloads, Documents, Pictures, OneDrive).
     - ❌ **NEVER** inspect `%APPDATA%`, `%LOCALAPPDATA%`, `%USERPROFILE%`, or Windows System directories (`C:\Windows`, `C:\Program Files`).
     - ❌ **NEVER** inspect SSH keys (`~/.ssh`), Git credentials (`~/.gitconfig`, `~/.git-credentials`), VPN configurations, or browser history/cookies.
   - All tools (`view_file`, `replace_file_content`, `write_to_file`, `run_command`) must operate **EXCLUSIVELY within the current workspace root**.

2. **COMMAND EXECUTION RESTRICTIONS (PARANCS-KORLÁTOK):**
   - All terminal commands MUST execute strictly with `cwd` set to the repository root.
   - ❌ **NEVER** execute commands that navigate out (no `cd ..`, no commands referencing host paths).
   - ❌ **NEVER** scan local networks, open external listening ports, or transmit local file contents to third-party endpoints.
   - Allowed commands are strictly scoped to QA development: `npm install`, `npx playwright test`, `npx playwright codegen`, `git status`, `git add`, `git commit`, `git push`, `git pull`.

3. **CONFIDENTIALITY & CREDENTIAL PROTECTION:**
   - ❌ **NEVER** print, log, or echo enterprise passwords, tokens, API keys, or personal employee names in prompt replies or logs.
   - Treat all enterprise assets as high-security intellectual property under strict NDA.

---

## 🎭 1. Playwright Best Practices (Szigorú Szabályok)

### 📌 1.1 Lokátor Stratégia (Locator Rules)
* **Szabály:** Mindig web-first, szerepkör alapú lokátorokat használj:
  1. Elsődleges: `page.getByRole(...)`
  2. Másodlagos: `page.getByLabel(...)`, `page.getByPlaceholder(...)`, `page.getByTestId(...)`
* ❌ **TILOS:** SOHA ne használj nyers XPath-ot (pl. `//div[2]/button`) vagy törékeny CSS osztályokat (pl. `.btn-primary-2b`).
* ❌ **TILOS:** SOHA ne használj elavult `$` vagy `$$` függvényeket.

---

### 📌 1.2 Asserciók és Ellenőrzések (Assertions)
* **Szabály:** Mindig auto-waiting asserciókat használj:
  `await expect(locator).toBeVisible()`, `await expect(locator).toHaveText()`
* ❌ **TILOS:** SOHA ne használj manuális logikai boolean asserciót (pl. `expect(await locator.isVisible()).toBe(true)`).

---

### 📌 1.3 Várakozások Tiltása (No Manual Waits)
* ❌ **TILOS:** Szigorúan TILOS a `page.waitForTimeout()` vagy manuális alvás (`sleep()`).
* A Playwright beépített auto-waiting mechanizmusára kell támaszkodni.

---

## 🏗️ 2. Mappastruktúra & Page Object Model (POM)

### 📌 2.1 Könyvtárstruktúra
* Minden Page Object osztály a `/pages/` mappába kerül.
* Minden tesztfájl a `/tests/` mappába kerül.
* Minden specifikáció és emberi követelmény a `/specs/` mappába kerül.

### 📌 2.2 Page Object Tervezési Szabályok (POM Design)
* A lokátorokat a Page Object `constructor`-ában kell definiálni `readonly` kulcsszóval.
* A műveleteket (kattintás, kitöltés, navigáció) async metódusokban kell megvalósítani.
* ❌ **TILOS:** Szigorúan TILOS asserciót (`expect()`) tenni a Page Object osztály belsejébe! Az asserciók kizárólag a `*.spec.ts` tesztfájlokban élhetnek.

---

## 📝 3. Kódolási Stílus & TypeScript

* Tiszta, szigorúan típusos TypeScript (mindig definiáld a paraméterek és visszatérési értékek típusait).
* Mindig azonnal futtatható, drop-in kódblokkokat és teljes fájlokat generálj (ne hagyj hátra `// todo` vagy félkész kódrészeket).
