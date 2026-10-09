# Specifikáció: TC-02C - Hibák Utáni Sikeres Vásárlás (Happy Path Recovery)

> 💡 **QA METODOLÓGIA: ERROR RECOVERY & TRANZAKCIÓS KONZISZTENCIA**  
> Egy professzionális e-kereskedelmi vagy vállalati rendszer legfontosabb erénye, hogy ha a felhasználó hibásan próbált kitölteni egy űrlapot, majd **javítja az adatait, a rendszer azonnal és hibamentesen helyreálljon**, feladja a rendelést, és konzisztensen lementse az adatbázisba.

---

## 🌐 Céloldal (Target Environment)
* **URL:** `https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026`
* **Modul:** 🖥️ Storefront (UI)

---

## 📋 Teszt Eset: TC-02C - Teljes Helyreállítás és Sikeres Megrendelés

### 🎯 1. Előfeltételek (Preconditions):
1. A böngésző megnyitotta a Storefront felületet.
2. A korábbi hibás vagy üres állapotok megtisztításra kerülnek.

---

### 👣 2. Felhasználói Lépések (Test Steps):

1. **Termék Kiválasztása:**
   * Kattintsunk a 2-es termékre: *Enterprise Load Testing Engine* ($490 / hó).
   * *Megfigyelés:* A termékkártya megkapja a `.selected` kiemelést.

2. **Érvényes Megrendelői Adatok Megadása (Kézi bevitel szimuláció):**
   * **E-mail cím:** Töröljük a mezőt, majd gépeljük be: `recovery.tester@astron.hu`.
   * **Darabszám:** Töröljük a mezőt, majd gépeljük be: `2`.
   * **Számlázási Ország:** Válasszuk ki: `HU` (Hungary - HUF).

3. **Dinamikus Kosár Ellenőrzése (Beküldés előtt):**
   * A kiválasztott termék neve: *Enterprise Load Testing Engine*.
   * Alapár: `$490`.
   * Mennyiség: `2 units`.
   * Számított Grand Total: **$980** ($490 × 2).

4. **Megrendelés Leadása:**
   * Kattintsunk a 'Place Subscription Order' (`[data-testid="checkout-btn"]`) gombra.

---

### ⚖️ 3. Elvárt Eredmények & Asserciók (Expected Results):

1. **Böngésző Alert Dialógus:**
   * A Playwright automatikusan elkapja a natív alert ablakot (`page.on('dialog')`).
   * Az alert üzenet tartalmazza: `Order #` azonosítót és `Status: PENDING` megerősítést.
   * A dialógus elfogadásra kerül (`dialog.accept()`).

2. **Élő Adatbázis Táblázat (Live Database Orders):**
   * A táblázat legelső sora azonnal frissül (`toBeVisible()`).
   * Az első sorban szerepelnie kell:
     * Felhasználó email: `recovery.tester@astron.hu`
     * Végösszeg: `$980`
     * Státusz: `PENDING`

3. **Státusz jelvény (Badge):**
   * A státusz cella a `.badge-PENDING` osztályt és stílust viseli.
