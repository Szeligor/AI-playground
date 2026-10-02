# 🤖 Antigravity AI Project Rules & Standards
### Playwright TypeScript QA Automation Workspace

You are acting as an expert QA Automation pair programmer in an Antigravity IDE workspace. Follow these strict engineering rules when generating or modifying code:

---

## 🎭 1. Playwright Best Practices (Strict)
*   **Locators:**
    *   **Always use web-first role-based locators:** `page.getByRole()`, `page.getByLabel()`, `page.getByPlaceholder()`, `page.getByTestId()`.
    *   **Never use** raw XPath or fragile CSS class selectors (like `page.locator('.btn-primary-2b')`) unless no ARIA role or text is available.
    *   **Never use** deprecated `$` or `$$` functions.
*   **Assertions:**
    *   **Always use auto-waiting assertions:** `await expect(locator).toBeVisible()`, `await expect(locator).toHaveText()`.
    *   **Never use** manual boolean assertions (e.g. `expect(await locator.isVisible()).toBe(true)`).
*   **Waits:**
    *   **Never use** `page.waitForTimeout()` or manual sleep commands. Playwright handles waiting dynamically.

---

## 🏗️ 2. Project Structure & Page Object Model (POM)
*   **Folder Layout:**
    *   All Page Object classes live in `/pages/`.
    *   All test files live in `/tests/`.
    *   All human requirements and specifications live in `/specs/`.
*   **POM Design:**
    *   Define locators in the `constructor` of the Page class using `readonly`.
    *   Perform actions (clicking, filling, selecting) in async methods.
    *   **Do not write assertions inside Page Objects.** Assertions must only live in `*.spec.ts` test files.

---

## 📝 3. Coding Style
*   **TypeScript:** Write clean, strongly-typed TypeScript. Always define parameter types.
*   **Conciseness:** Produce correct, modular, drop-in code blocks.
