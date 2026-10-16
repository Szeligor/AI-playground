# Markdown Dokumentációs Térkép & Rendszerindex
### Astron Informatikai Kft. | Playwright QA Automation Workspace

Ez a dokumentum a repositoryban található összes Markdown (`.md`) fájl strukturált indexét és kapcsolati hálóját tartalmazza.

---

## 1. Rendszerszintű Alkotmányok és Direktívák

| Fájl | Cél és Szerepkör | Célközönség |
|---|---|---|
| [AGENTS.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/AGENTS.md) | Általános QA keretrendszer szabályzat, POM architektúra, Web-First szabályok, Git fegyelem. | Minden AI ágens (Cursor, Copilot, Claude, Devin). |
| [GEMINI.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/GEMINI.md) | Google Gemini & Antigravity runtime direktívák, Playwright MCP protokoll, Plan Mode, subagensek. | Google Gemini és Antigravity runtime. |
| [PROFILE.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/PROFILE.md) | Felhasználói szakmai profil, kommunikációs korlátok (zéró emoji, tömörség), kezdőbarát kommentelési szabály. | Minden interakció és kódgenerálás. |

---

## 2. Minőségbiztosítási Tanulságok és Tapasztalatok

| Fájl | Leírás |
|---|---|
| [docs/LESSONS_LEARNED.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/LESSONS_LEARNED.md) | A 100%-os specifikáció-lefedettség illúziója, a teszt-maszkolás veszélyei (`TC-SF-07`), feltárt hibák elemzése és módszertani tapasztalatok. |

---

## 3. Multi-Agent és Subagent Architektúra

| Fájl | Szerepkör / Terület |
|---|---|
| [docs/subagents/README.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/README.md) | Multi-Agent QA csapat felépítése, munkafolyamat és koordinációs modell. |
| [docs/subagents/qa-orchestrator.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/qa-orchestrator.md) | Vezető koordinátor, feladatbontás és szintézis. |
| [docs/subagents/test-planner.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/test-planner.md) | Követelményelemzés, BVA, ekvivalencia-osztályok és tesztmátrix tervezés. |
| [docs/subagents/e2e-specialist.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/e2e-specialist.md) | Playwright UI E2E automatizálás, Page Object Model (POM) fejlesztés. |
| [docs/subagents/api-specialist.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/api-specialist.md) | REST API integrációs tesztek és Service Object réteg. |
| [docs/subagents/defect-hunter.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/defect-hunter.md) | Feltáró (exploratory) tesztelés, állapotgép-anomáliák és OWASP sérülékenységek. |
| [docs/subagents/code-reviewer.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/docs/subagents/code-reviewer.md) | Asserció-integritás audit, teszt-maszkolás kiszűrése és kódkommentelés ellenőrzése. |

---

## 4. Követelmények és Specifikációk

| Fájl | Tartalom |
|---|---|
| [kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md) | Teljes vállalati E2E teszteset specifikáció (TC-01 .. TC-70). |
| [specs/storefront_order.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/storefront_order.md) | Storefront megrendelés követelményleírás és elfogadási kritériumok. |
| [specs/e2e_architecture_map.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/e2e_architecture_map.md) | E2E architektúra térkép és tesztprojektek struktúrája. |
| [specs/TC-02A_empty_fields_combinatorics.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/TC-02A_empty_fields_combinatorics.md) | Üres mezők kombinatorikai tesztjei. |
| [specs/TC-02B_invalid_data_combinatorics.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/TC-02B_invalid_data_combinatorics.md) | Érvénytelen bemeneti adatok kombinatorikája. |
| [specs/TC-02C_happy_path_recovery.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/TC-02C_happy_path_recovery.md) | Sikeres rendelés és helyreállítási ágak. |

---

## 5. Tesztkészlet és Prompt Segédletek

| Fájl | Leírás |
|---|---|
| [TESTS_EXPLAINED.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/TESTS_EXPLAINED.md) | A keretrendszer tesztjeinek részletes, kezdőbarát technikai magyarázata. |
| [TEST_CASES.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/TEST_CASES.md) | E2E és integrációs tesztesetek listája. |
| [UNIT_TEST_CASES.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/UNIT_TEST_CASES.md) | Független unit tesztek dokumentációja. |
| [NEWTESTCASE.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/NEWTESTCASE.md) | Új teszteset és Page Object generáló prompt sablon. |
