# TestAcademy E2E Storefront Specifikáció
> 💡 **MI EZ A FÁJL ÉS MIÉRT ÍRJUK MEG ELŐRE?**  
> Ez a tesztelőnk "kottája". Az AI és az automatizálás zseniális végrehajtó, de üzleti szándék nélkül csak zajt csinál.  
> Ha Markdown (.md) formátumban rögzítjük a követelményeket, a specifikáció a verziókezelőbe (Git) kerül, a teljes csapat látja, és az AI pontosan ezekből az asserciókból fogja felépíteni az automata tesztet.

---

## 🌐 Céloldal (Target Environment)
* **URL:** `https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026`
  * 💡 **Miért a linkbe tesszük a kódot?** A `?pass=astron2026` automatikusan feloldja a környezetet, így a tesztelőnek és a robotnak nem kell minden egyes futásnál feleslegesen a lakat feloldásával bajlódnia.

---

## 📋 Teszteset Adatlap: TC-01 - Sikeres Licenc Vásárlás

### 🎯 1. Előfeltétel (Precondition):
* A felhasználó megnyitotta a storefront felületet és a feloldás sikeres.
  * 💡 **Miért kötelező rögzíteni?** A teszt nem a semmiből indul: egyértelmű kiindulási állapot kell a determinisztikus (mindig azonos kimenetű) futáshoz.

### 👣 2. Felhasználói Lépések (Test Steps):
1. **Termék Kiválasztása:** Kattintsunk az 1-es termékkártya kiválasztó gombjára (*QA Automation Runner License*).
   * 💡 **Miért?** Szimuláljuk, hogy a vásárló a kosárba helyez egy licencet.
2. **Megrendelő Email Megadása:** Töltsük ki a Megrendelő E-mail mezőt: `dan.tester@enterprise.io`.
   * 💡 **Miért fix tesztadat?** A tesztelésben kerüljük a véletlenszerűséget, amíg nem fuzzing tesztet írunk. Tudnunk kell, mit várunk vissza a táblázatban.
3. **Darabszám Beállítása:** Állítsuk a darabszámot `1`-re.
   * 💡 **Miért?** Explicit beállítás, hogy ne függjünk az űrlap alapértelmezett értékeitől.
4. **Megrendelés Beküldése:** Kattintsunk a 'Place Subscription Order' gombra.
   * 💡 **Miért?** Ez az esemény váltja ki a hálózati POST kérést és a rendelési tranzakciót.

### ⚖️ 3. Elvárt Eredmények & Asserciók (Expected Results):
1. **Alert Ablak Kezelése:** A böngésző natív alert ablaka megjelenik egy 'Order #...' visszaigazolási számmal, és a teszt lekezeli (elfogadja).
   * 💡 **Miért?** A böngészős alert megfagyasztja az oldalt, ha a tesztkód nem iratkozik fel rá előre (`page.on('dialog')`).
2. **Táblázat Megjelenése:** A 'Recent Orders' táblázat megjelenik és látható (`toBeVisible()`).
   * 💡 **Miért?** Bizonyítja, hogy a backend válasz megérkezett és a frontend renderelte az adatokat.
3. **Legfrissebb Sor Ellenőrzése:** A táblázat legelső sora tartalmazza az átadott email címet (`dan.tester@enterprise.io`) és a státusz `PENDING`.
   * 💡 **Miért pont az első sor?** Mert új rendeléskor az új tétel a táblázat tetejére fűződik be. Így még akkor is stabil a teszt, ha a táblázatban korábbi rendelések is szerepelnek.
