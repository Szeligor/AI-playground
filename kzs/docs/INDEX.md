# Astron QA Automation Workspace - Master Dokumentációs Térkép & Index
### Astron Informatikai Kft. | Playwright QA Automation Framework | kzs Modul

Ez a master index fogja össze a teljes tesztelési keretrendszer dokumentációs struktúráját, elválasztva a gyökérbeli rendszerkonfigurációkat és a felhasználói (`kzs/`) modul dokumentumait.

---

## 1. Rendszerszintű Alkotmányok és Futtatói Direktívák (Root)

| Fájl | Cél és Szerepkör | Célközönség |
|---|---|---|
| [AGENTS.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/AGENTS.md) | Általános QA keretrendszer szabályzat, POM architektúra, Web-First lokátorok, Git fegyelem és Defect-Focused Mindset. | Minden AI ágens (Cursor, Copilot, Claude, Devin). |
| [GEMINI.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/GEMINI.md) | Google Gemini & Antigravity runtime direktívák, Playwright MCP protokoll, Plan Mode, subagensek delegálása. | Google Gemini és Antigravity runtime. |
| [PROFILE.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/PROFILE.md) | Felhasználói profil, kommunikációs korlátok (tömörség, zéró emoji), kezdőbarát kódkommentelési szabály. | Minden interakció és kódgenerálás. |

---

## 2. A Felhasználó Saját QA Dokumentációja (`kzs/docs/`)

A felhasználó munkájához és tesztelési folyamataihoz tartozó összes dokumentum a `kzs/docs/` almappába van strukturálva:

### 2.1 Minőségbiztosítási Tanulságok és Hibaelemzések
- **[kzs/docs/LESSONS_LEARNED.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/LESSONS_LEARNED.md):**
  - A 100%-os specifikáció-lefedettség illúziója (Specifikáció vs. Valóság).
  - A teszt-maszkolás veszélyei és javítása (`TC-SF-07` laza regex csapda és feltételes asserciók).
  - Feltáró (exploratory) tesztelési minták és 20 valós hiba technikai okai.
  - Adatintegritási szakadék a UI és az SQL adatbázis között.

### 2.2 Tesztmagyarázatok és Esettárak
- **[kzs/docs/TESTS_EXPLAINED.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/TESTS_EXPLAINED.md):** A keretrendszerben lévő tesztek részletes, kódblokkokkal illusztrált magyarázata.
- **[kzs/docs/TEST_CASES.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/TEST_CASES.md):** E2E és integrációs tesztesetek katalógusa.
- **[kzs/docs/UNIT_TEST_CASES.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/UNIT_TEST_CASES.md):** Független unit tesztek specifikációja és leírása.
- **[kzs/docs/NEWTESTCASE.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/NEWTESTCASE.md):** Sablon prompt új teszteset és Page Object generálásához.

---

## 3. Multi-Agent Subagent Architektúra és How-To Útmutatók (`kzs/docs/subagents/`)

A specializált al-ágensek teljes leírása, Page Object hozzáférési mátrixa és lépésről lépésre követhető How-To útmutatói:

| Subagent Dokumentum | Szerepkör | Fő Felelősség & Hozzáférések |
|---|---|---|
| **[kzs/docs/subagents/README.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/README.md)** | Multi-Agent Áttekintés | Teljes architektúrális Mermaid diagram, Page Object hozzáférési mátrix és együttműködési workflow. |
| **[kzs/docs/subagents/qa-orchestrator.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/qa-orchestrator.md)** | QA Orchestrator How-To | Igényfogadás, dekompozíció, delegálás, Plan Mode és eredmények szintézise. |
| **[kzs/docs/subagents/test-planner.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/test-planner.md)** | Test Planner How-To | Követelményelemzés, BVA határértékek, ekvivalencia partícionálás és tesztmátrixok. |
| **[kzs/docs/subagents/e2e-specialist.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/e2e-specialist.md)** | E2E Specialist How-To | `StorefrontPage`, `OrderManagementPage`, `SelectorLabPage` automatizálás, AAA minta, Web-First lokátorok. |
| **[kzs/docs/subagents/api-specialist.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/api-specialist.md)** | API Specialist How-To | REST API végpontok, `SwaggerPage`, Service Object réteg és séma validáció. |
| **[kzs/docs/subagents/defect-hunter.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/defect-hunter.md)** | Defect Hunter How-To | Exploratory tesztelés, negatív határesetek, állapotgép-rések, Stored XSS és adatintegritás. |
| **[kzs/docs/subagents/code-reviewer.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/docs/subagents/code-reviewer.md)** | Code Reviewer How-To | Asserció integritás audit, teszt-maszkolás kiszűrése és kezdőbarát kommentelés ellenőrzése. |

---

## 4. Vállalati Specifikációk és Követelmények

- **[kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md):** A teljes vállalati E2E teszteset specifikáció (TC-01 .. TC-70).
- **[specs/storefront_order.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/storefront_order.md):** Webshop rendelési folyamat alapkövetelményei.
- **[specs/e2e_architecture_map.md](file:///c:/Users/WDAGUtilityAccount/Desktop/AstronWorkshop/project/specs/e2e_architecture_map.md):** E2E architektúra térkép.
