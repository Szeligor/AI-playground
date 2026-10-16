# Lessons Learnt - QA Automatizálási és Feltáró Tesztelési Tapasztalatok
### Astron Informatikai Kft. | Playwright QA Automation Workspace

Ez a dokumentum a keretrendszer fejlesztése, az E2E / API tesztelés, valamint a feltáró (exploratory) tesztelés során szerzett legfontosabb módszertani, technikai és minőségbiztosítási tanulságokat rögzíti.

---

## 1. A „100%-os Funkcionális Lefedettség” Illúziója (Specifikáció vs. Valóság)

### 1.1 A probléma felismerése
A kezdeti tesztkészlet 95 tesztesetet tartalmazott, amelyek 100%-ban lefedték a leírt üzleti specifikációkban (pl. `specs/storefront_order.md`, `kzs/specs/E2E_ENTERPRISE_SPECIFICATION.md`) található követelményeket. Ennek ellenére a manuális és feltáró tesztelés során 20 további valós hibát tártunk fel.

### 1.2 Mérnöki okok
1. **Követelmény-lefedettség (Requirement Traceability):** A formális tesztek azt igazolják, hogy amit a specifikáció leírt, az működik-e a megadott peremfeltételek mellett (Verification).
2. **Állapottér-lefedettség (State Space Coverage):** A felhasználói viselkedés nem lineáris. A specifikációk tipikusan hallgatnak a hibás állapotátmenetekről, az események felcseréléséről és a nem specifikált határesetekről.
3. **ISTQB alaptételek igazolódása:**
   - *1. Alapelv:* A tesztelés a hibák jelenlétét mutatja ki, nem a hibamentességet.
   - *2. Alapelv:* A kimerítő tesztelés lehetetlen.
   - *5. Alapelv (Növényvédőszer-paradoxon):* A mereven ismételt szkriptelt tesztek egy idő után nem találnak új hibákat.

---

## 2. A Teszt-Maszkolás Veszélye (Hamis Zöld Tesztek)

### 2.1 A laza reguláris kifejezések csapdája (TC-SF-07)
- **Hiba az alkalmazásban:** Az EU VAT validáció hibás regexet használt: `/^(HU|DE|AT|FR)d{8,9}$/`. A hiányzó `\` miatt a szoftver 'd' betűket várt számjegyek helyett, így minden valós adószámot elutasított.
- **Hiba a tesztben:** A tesztben lévő asserció a következő volt:
  ```typescript
  await expect(vatStatus).toContainText(/mentesített|valid|reverse charge|0%/i);
  ```
- **A maszkolás mechanizmusa:** Az alkalmazás az `"Invalid EU VAT syntax"` hibaüzenetet adta vissza. Mivel az `Invalid` szó tartalmazza a `valid` karakterláncot, a Playwright `/valid/i` reguláris kifejezése illeszkedett a hibaszövegre. A teszt zöld maradt, elrejtve a valós szoftverhibát.
- **Szabály és javítás:** Mindig szigorú szóhatárokat kell használni (`/\bValid\b/i`), vagy a teljes specifikus mondatra kell asszertálni:
  ```typescript
  await expect(vatStatus).toContainText(/0% Reverse Charge B2B|\bValid EU\b/i);
  ```

### 2.2 Feltételes ellenőrzések veszélye (Conditional Assertions)
- Ha a tesztben az ellenőrzés feltétel mögé van rejtve:
  ```typescript
  if (await locator.isVisible()) {
    await expect(locator).toHaveText('...');
  }
  ```
  Ha az elem késik, elcsúszik vagy hibásan meg sem jelenik, a blokk nem fut le. A teszt zölden fejeződik be anélkül, hogy tényleges ellenőrzést hajtott volna végre.
- **Szabály:** Web-first lokátorokkal közvetlenül a Playwright auto-waiting mechanizmusára kell építeni:
  ```typescript
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText('...');
  ```

---

## 3. Feltáró (Exploratory) Hibaminták és Határesetek

A feltáró tesztelés során azonosított hibák típusai és tanulságai:

### 3.1 Állapotgép és Eseménylánc Anomáliák (Workflow Anomalies)
- **Kupon minimum kosárérték kijátszása (SAVE100 bypass):**
  - A felhasználó egy drága terméknél ($490) beváltja a $300 minimum limithez kötött kupont.
  - Ezt követően visszavált egy olcsóbb termékre ($250).
  - A felület nem futtatja le újra a kosár-revalidációt, így a kupon érvényes marad ($150-ért elvihető a termék).
  - *Tanulság:* Minden termék- vagy mennyiségváltoztatáskor a kosár teljes állapotát újra kell értékelni.

### 3.2 Bemeneti Határérték és Típus-konverziós Hibák
- **Negatív darabszám (-5 db):**
  - Negatív mennyiség submitálása esetén a háttérlogika szorzása miatt negatív végösszegű megrendelés jött létre, a raktárkészlet pedig megnövekedett (készlet- és pénzügyi anomália).
- **Csendes kerekítés hibaüzenet helyett:**
  - Az üresen hagyott darabszám mező nem adott kötelező mező validációs hibát, hanem a `parseInt(...) || 1` kód miatt csendben 1 db-os rendelést hozott létre.

### 3.3 Aszinkron Állapotok és Erőforrás-gazdálkodás
- **Készlet visszavételezésének elmaradása (Restock Leak):**
  - Rendelés lemondásakor (Cancelled) vagy visszatérítésekor (Refunded) a megrendelés státusza módosult, de a levont raktárkészletet a rendszer nem írta vissza a készletnyilvántartásba.

### 3.4 Felületi Állapotfrissítés (Stale DOM)
- **RBAC jogosultságváltás re-render hiánya:**
  - Adminisztrátorról Junior QA-ra váltáskor a törlés és visszatérítés gombok láthatóak maradtak, mert az aktorváltó esemény nem hívta meg a táblázat renderelő függvényét.
- **Termékkártya készletszámláló DOM inkonzisztencia:**
  - Vásárlás után a táblázat frissült, de a termékkártyán lévő készletszöveg elavult maradt oldalújratöltésig.

---

## 4. Adatintegritás: A Felület és az Adatbázis Különbsége

A csak felületi (UI) tesztelés nem nyújt garanciát az adatintegritásra:
1. **Torzult ÁFA rögzítés:** A felületen a választott országnak megfelelő ÁFA mérték (DE: 19%, US: 0%) jelent meg, de az adatbázisban a megrendelés objektum fix 27%-ot kapott (`vat: isVatExempt ? 0 : 27`).
2. **Százalékos kupon elszámolási hiba:** A 25%-os kupon összegét a felület helyesen vonta le, de a mentett rekordban a `discount` mező értéke literálisan a 25 szám lett a számított dollárkedvezmény ($122.50) helyett.
- **Tanulság:** A tesztelésnek a perzisztens réteget (SQL lekérdezések vagy API válaszok) is ellenőriznie kell az üzletileg kritikus pénzügyi mezőknél.

---

## 5. Biztonsági Peremfeltételek a Funkcionális QA-ban

A klasszikus funkcionális tesztelés nem tekinthet el az alapvető biztonsági sérülékenységektől:
- **Stored XSS (OWASP A03 / CWE-79):** Az e-mail mezőbe írt kódok az `innerHTML` használata miatt lefutottak a felületen.
- **CSV Formula Injection (CWE-1236):** Az `=SUM(...)` jellegű szövegek szűretlenül kerültek a letölthető CSV fájlba.
- **API Price Tampering:** A backend nem ellenőrizte a beküldött termékárat a katalógus alapján, kliensoldali manipulációt engedve.
- **Hiányzó hitelesítés:** A státuszmódosító PATCH végpont token nélkül bárki által hívható volt.

---

## 6. Verziókezelési és Környezeti Fegyelem

1. **Távoli Git Push Szigorú Tiltása:** Autonóm ágensek nem indíthatnak önkényes `git push` parancsot az éles ágak védelmében.
2. **Kötelező Lokális Commit Lépésenként:** Minden fájlmódosítást azonnal lokálisan rögzíteni kell (`git add .` és `git commit -m "..."`).
3. **Shell-specifikus parancsszintaxis:** Windows PowerShell alatt a parancsok összefűzése pontosvesszővel (`;`) történik, a POSIX-féle `&&` szintaxishibát okoz.
4. **Bináris elérési utak:** Olyan környezetben, ahol a rendszer PATH hiányos, a segédeszközöket (pl. `C:\Program Files\Git\cmd\git.exe`) abszolút elérési úttal kell meghívni.
