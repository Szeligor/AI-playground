# 🤖 Antigravity AI Project Rules & Standards (A Projekt QA Alkotmánya)
### Playwright TypeScript QA Automation Workspace | Astron Workshop Edition

> 💡 **MI EZ A FÁJL ÉS MIÉRT LÉTEZIK?**  
> Ez a repó legfontosabb vezérlő fájlja: a mi **Projekt Alkotmányunk**.  
> Az Antigravity és a Gemini mesterséges intelligencia minden egyes kérés előtt láthatatlanul elolvassa ezt a szabályzatot.  
> **Miért nem a chatbe írjuk ezeket minden nap?** Mert ha itt egyszer lefektetjük az ipari sztenderdeket, az AI soha nem fog törékeny, elavult vagy hibás tesztkódot generálni, és nem kell minden promptban 20 mondatban könyörögnünk neki.

---

## 🎭 1. Playwright Best Practices (Szigorú Szabályok & Miértek)

### 📌 1.1 Lokátor Stratégia (Locator Rules)
* **Szabály:** Mindig web-first, szerepkör alapú lokátorokat használj: `page.getByRole()`, `page.getByLabel()`, `page.getByPlaceholder()`, `page.getByTestId()`.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    Egy valódi emberi felhasználó sem a háttérben lévő HTML kódokat nézi, hanem gombokat keres, űrlapmezők címkéit olvassa. A `getByRole('button', { name: 'Submit' })` a felhasználó szemszögéből találja meg az elemet. A `getByTestId` pedig a tesztelő szent szerződése: egy olyan egyedi azonosító, amit kizárólag tesztelésre hoztunk létre, így a fejlesztő nem ronthatja el.

* **Szabály:** SOHA ne használj nyers XPath-ot vagy törékeny CSS osztályokat (pl. `page.locator('.btn-primary-2b')`).
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A CSS osztályok kizárólag a dizájnernek szólnak! Ha a marketing holnap úgy dönt, hogy a kék gomb helyett zöld gombot akar, a fejlesztő átírja a `.btn-blue` osztályt `.btn-green`-re. Ha a teszted a CSS-re épült, azonnal elhasal, pedig az oldal hibátlanul működik! Az XPath (`/div[2]/div/button`) pedig még rosszabb: ha egyetlen div-et betesznek az oldalra, a teszt azonnal elpusztul.

* **Szabály:** SOHA ne használj elavult `$` vagy `$$` függvényeket.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A `$` és `$$` a régi Selenium / Puppeteer korszakból maradt ránk. Nem várnak automatikusan a betöltődésre: ha az elem 5 milliszekundummal később jelenik meg, azonnal `null` értéket adnak vissza és elbukik a teszt. A modern `page.locator()` és `getBy*` ellenben beépítetten megvárja az elemet.

---

### 📌 1.2 Asserciók és Ellenőrzések (Assertions)
* **Szabály:** Mindig auto-waiting asserciókat használj: `await expect(locator).toBeVisible()`, `await expect(locator).toHaveText()`.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A web nem azonnali: hálózati kérések futnak, animációk mozognak. A Playwright auto-waiting asserciói nem adják fel az első ezredmásodpercben, hanem türelmesen, másodpercenként többször újrapróbálkoznak (alapértelmezetten 5 másodpercig), amíg a feltétel teljesül.

* **Szabály:** SOHA ne használj manuális logikai (boolean) asserciót (pl. `expect(await locator.isVisible()).toBe(true)`).
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    Ez a világ leggyakoribb kezdő automatizálási hibája!  
    1. Az `await locator.isVisible()` a másodperc tört részében ránéz a képernyőre. Ha a gomb még 100ms-ig éppen betöltődik, azonnal `false`-t ad vissza, és az `expect(false).toBe(true)` azonnal elbukik auto-waiting NÉLKÜL!  
    2. Ha elbukik, a hibaüzenet csak annyi lesz: *„Expected: true, Received: false”*. Ebből senki nem tudja megmondani, mi volt a baj. Az `expect(locator).toBeVisible()` viszont pontosan megmondja, melyik gomb hiányzott és hány másodpercig várt rá.

---

### 📌 1.3 Várakozások Tiltása (No Manual Waits)
* **Szabály:** Szigorúan TILOS a `page.waitForTimeout()` vagy manuális alvás (`sleep()`).
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A kézi alvás a tesztek rákkeltője! Ha beírsz egy 5 másodperces alvást (`waitForTimeout(5000)`), a teszt akkor is 5 másodpercig fog tétlenül ülni, ha a weboldal 100 milliszekundum alatt kész lett. Ha van 100 teszted a CI pipeline-ban, ez **több mint 8 perc teljesen felesleges várakozást** jelent minden egyes kódfrissítésnél. A Playwright lokátorai maguktól megvárják a kattinthatóságot (actionability checks).

---

## 🏗️ 2. Mappastruktúra & Page Object Model (POM)

### 📌 2.1 Könyvtárstruktúra Szabálya (Folder Layout)
* **Szabály:**
  * Minden Page Object osztály a `/pages/` mappába kerül.
  * Minden tesztfájl a `/tests/` mappába kerül.
  * Minden specifikáció és emberi követelmény a `/specs/` mappába kerül.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    Tiszta felelősségi körök: a `/specs/` mappa a termékmenedzser és a manuális tesztelő nyelve (magyar/angol üzleti szöveg), a `/pages/` mappa a felület technikai térképe, a `/tests/` pedig az üzleti forgatókönyvek végrehajtója. Így egy 50 fős csapat sem keveredik el a repóban.

### 📌 2.2 Page Object Tervezési Szabályok (POM Design)
* **Szabály:** A lokátorokat a Page Object `constructor`-ában kell definiálni `readonly` kulcsszóval.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    Egyetlen helyen van rögzítve, hogy hol található az email mező vagy a megrendelés gomb. A `readonly` biztosítja, hogy senki se tudja futás közben véletlenül átírni vagy felülcsapni a lokátor hivatkozását.

* **Szabály:** A műveleteket (kattintás, kitöltés, navigáció) async metódusokban kell megvalósítani.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A tesztfájl ne tudjon arról, hogy a jelszó mezőnek mi a pontos HTML ID-ja. A tesztfájl csak annyit akar mondani: `await loginPage.login('user', 'pass')`. Ez az absztrakció védi meg a teszteket a felületi változásoktól.

* **Szabály:** Szigorúan TILOS asserciót (`expect()`) tenni a Page Object osztály belsejébe!
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A Page Object a végrehajtó munkás (a távirányító). Az ítéletet (Asserció) mindig a bíró (a tesztfájl) hozza meg! Ha a Page Objectbe beépítenél egy ellenőrzést, hogy *„a megrendelés sikeres volt”*, akkor nem tudnál vele negatív tesztet írni egy szándékos elutasítás ellenőrzésére, mert a metódus azonnal elhasalna!

---

## 📝 3. Kódolási Stílus & TypeScript

* **Szabály:** Tiszta, szigorúan típusos TypeScript (mindig definiáld a paraméterek típusait).
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    A TypeScript megelőzi a buta hibákat még a futtatás előtt! Ha egy metódus számot vár darabszámnak (`qty: number`), a TypeScript azonnal pirossal aláhúzza, ha valaki véletlenül szöveget ad át neki.

* **Szabály:** Moduláris, drop-in kódblokkok.
  * 💡 **MIÉRT VAN ITT EZ A SZABÁLY?**  
    Az AI ne félkész kódvázlatokat és kommenteket generáljon (pl. `// ide jön a többi kód...`), hanem azonnal futtatható, teljes, biztonságos fájlokat.
