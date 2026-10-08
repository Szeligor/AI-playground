# Specifikáció: TC-02A - Üres Mezők Kombinatorikus Tesztelése (Empty Fields Matrix)

> 💡 **QA METODOLÓGIA: DÖNTÉSI TÁBLA & BOUNDARY TESTING**  
> Amikor egy űrlapon több beviteli mező található, nem elég csak egyetlen mezőt üresen tesztelni.  
> A kombinatorikus tesztelés garantálja, hogy **bármelyik mező vagy mezőkombináció hiányában** az űrlap védekezik, és nem enged át félkész vagy inkonzisztens tranzakciót.

---

## 🌐 Céloldal (Target Environment)
* **URL:** `https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026`
* **Modul:** 🖥️ Storefront (UI)
* **Érintett mezők:**
  1. `ui-email` (`[data-testid="email-input"]`) – Kötelező (`required`), `type="email"`
  2. `ui-qty` (`[data-testid="qty-input"]`) – `type="number"`, `min="1"`

---

## 📊 Kombinatorikus Mátrix (Döntési Tábla)

| Eset ID | E-mail mező állapota | Darabszám mező állapota | Elvárt Beküldési Eredmény | Elvárt Validációs Hiba |
| :--- | :--- | :--- | :--- | :--- |
| **TC-02A.1** | ❌ Üres (`""`) | ❌ Üres (`""`) | **Elutasítva** (Nem küldhető be) | E-mail: `valueMissing` (`required`) |
| **TC-02A.2** | ❌ Üres (`""`) | ✅ Kitöltve (`1`) | **Elutasítva** (Nem küldhető be) | E-mail: `valueMissing` (`required`) |
| **TC-02A.3** | ✅ Kitöltve (`test@astron.hu`) | ❌ Üres (`""`) | **Elutasítva** (Nem küldhető be) | Darabszám: hiányzó számérték |

---

## 📋 Részletes Tesztlépések (Test Steps)

### 🎯 Előfeltétel:
1. Az oldal betöltődött `https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026`.
2. A teszt inicializálásként kitisztítja a mezőket (`emailInput.clear()`, `qtyInput.clear()`).

---

### 👣 1. Forgatókönyv: TC-02A.1 – Teljesen üres űrlap
1. Mindkét mező kiürítve (`emailInput.clear()`, `qtyInput.clear()`).
2. Kattintás a 'Place Subscription Order' gombra.
3. **Asserció:**
   * A böngésző alert ablaka **nem** nyílik meg.
   * Az `emailInput` HTML5 `validity.valueMissing` állapota `true`.
   * A *Live Database Orders* táblázat sorainak száma változatlan marad.

---

### 👣 2. Forgatókönyv: TC-02A.2 – Csak az E-mail üres, a Darabszám kitöltve
1. Az E-mail mező üresen hagyva (`""`).
2. A Darabszám mezőbe értéket írunk: `2`.
3. Kattintás a 'Place Subscription Order' gombra.
4. **Asserció:**
   * A böngésző alert ablaka **nem** nyílik meg.
   * Az `emailInput` fókuszba kerül, validációja sikertelen (`validity.valid === false`).
   * Új rendelési sor nem generálódik a táblázatban.

---

### 👣 3. Forgatókönyv: TC-02A.3 – E-mail kitöltve, de a Darabszám üres
1. Az E-mail mezőbe érvényes címet írunk: `test@astron.hu`.
2. A Darabszám mezőt teljesen kiürítjük (`clear()`).
3. Kattintás a 'Place Subscription Order' gombra.
4. **Asserció:**
   * A kosár Grand Total értéke $0-ra ugrik vagy érvénytelen marad.
   * A böngésző megakadályozza az érvénytelen tranzakciót.
   * A *Live Database Orders* táblázatba nem kerül be rekord $0 értékkel.
