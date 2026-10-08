# 🚀 Astron QA Automation Workshop - Windows Sandbox Készlet

Ez a csomag lehetővé teszi, hogy a workshop résztvevői egy teljesen **elszigetelt, biztonságos Windows Sandbox környezetben** dolgozzanak anélkül, hogy a gépükön lévő céges fájlokhoz vagy titkokhoz az AI hozzáférhetne.

---

## 📦 Mi van a csomagban?
1. **`astron_workshop_sandbox.wsb`**: A Sandbox indítófájl.
2. **`astron_sandbox_share` mappa tartalma**:
   - `antigravity_app/` - Standalone Antigravity 2.0 asztali alkalmazás
   - `antigravity_ide/` - Teljes Antigravity IDE (VS Code alapú)
   - `ms-playwright/` - Előre letöltött Playwright Chromium böngésző binárisok (offline start)
   - `project/` - A teljes gyakorlati tesztprojekt (Playwright + TypeScript + Page Object Model)
   - `ChromeSetup64.exe` - Offline Google Chrome telepítő
   - `install_tools.ps1` & `START_TELEPITES.bat` - Automatikus telepítő és összekötő motor

---

## 🛠️ Telepítés a résztvevők gépén (3 egyszerű lépés)

### 1. Lépés: Windows Sandbox bekapcsolása (ha még nincs)
A Windows Keresőbe írják be: **"Windows-szolgáltatások be- és kikapcsolása"** (vagy futtassák rendszergazdai PowerShellben):
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Containers-DisposableClientVM" -All
```
*(Ha kéri, újra kell indítani a gépet.)*

### 2. Lépés: A megosztott mappa elhelyezése
Másolják a letöltött **`astron_sandbox_share`** mappát közvetlenül a **`C:\`** meghajtó gyökerébe:
👉 `C:\astron_sandbox_share`

### 3. Lépés: Indítás!
Kattintsanak duplán az **`astron_workshop_sandbox.wsb`** fájlra!

---

## ⚡ Mi történik az indításkor?
A Sandbox automatikusan feláll és mindent elvégez:
- ✅ Feltelepíti csendben a Google Chrome-ot és bejegyzi a rendszerszintű protokollokat.
- ✅ Rendszerszinten összeköti az Antigravity 2.0-t az Antigravity IDE-vel.
- ✅ Átmásolja a Playwright böngészőket az AppData mappába.
- ✅ Csendben feltelepíti a Node.js-t és a Git-et.
- ✅ Beállítja a Git SChannel tanúsítványkezelést az Astron Bitbuckethez.
- ✅ Kirakja a parancsikonokat az asztalra.
- ✅ Elindítja az Antigravity IDE-t és az Antigravity 2.0-t a tesztprojekttel.

---

## 💾 Mentés & Perzisztencia
Minden munka, amit a Sandboxon belül az **`AstronWorkshop\project`** mappában végeznek, **közvetlenül a gazdagép `C:\astron_sandbox_share\project` mappájába mentődik**, így a Sandbox bezárásakor **semmilyen kód nem vész el!**

---

## 🔗 Bitbucket Repository & Tananyag szinkronizáció
A projekt előre konfigurált és össze van kötve az Astron belső Bitbucket szerverével:
- **Repo URL:** `https://bitbucket.astron.hu/scm/aiws/ai_workshop.git`
- **Projekt:** `AIWS` / `ai_workshop`
- **Beépített hitelesítés:** A Sandbox induláskor automatikusan beállítja a felhasználót (`bd2837.aiws`) és az SChannel Windows tanúsítványkezelést.

### Manuális frissítés / lehúzás bármikor a Sandbox termináljából:
```bash
cd C:\Users\WDAGUtilityAccount\Desktop\AstronWorkshop\project
git pull origin main
```

### Ha valaki teljesen nulláról szeretné leklónozni a saját gépére:
```bash
git clone https://bd2837.aiws@bitbucket.astron.hu/scm/aiws/ai_workshop.git
```
