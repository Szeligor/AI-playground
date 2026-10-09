# Specifikáció: TC-02B - Érvénytelen Adatok Kombinatorikus Tesztelése (Invalid Data Matrix)

> 💡 **QA METODOLÓGIA: EQUIVALENCE PARTITIONING & NEGATIVE TESTING**  
> A rosszindulatú vagy figyelmetlen adatbevitel sokféle lehet: elgépelt e-mail címek (`nem-email`, `teszt@`), nullás vagy negatív darabszámok (`0`, `-5`), illetve ezek kombinációi.  
> Ez a specifikáció lefed minden olyan esetet, ahol **az adatok jelen vannak, de formailag vagy üzletileg hibásak**.

---

## 🌐 Céloldal (Target Environment)
* **URL:** `https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026`
* **Modul:** 🖥️ Storefront (UI)

---

## 📊 Hibás Adatok Kombinációs Mátrixa

| Eset ID | E-mail mező értéke | Darabszám értéke | Hiba jellege | Elvárt Eredmény |
| :--- | :--- | :--- | :--- | :--- |
| **TC-02B.1** | ❌ `rossz-email-formátum` | ✅ `1` (érvényes) | Egyetlen mező hibás (Szintaktikai email hiba) | Beküldés elutasítva (`typeMismatch`) |
| **TC-02B.2** | ❌ `hianyzo-kukac.hu` | ✅ `2` (érvényes) | Egyetlen mező hibás (Hiányzó `@` karakter) | Beküldés elutasítva |
| **TC-02B.3** | ✅ `helyes@astron.hu` | ❌ `0` | Egyetlen mező hibás (Alsó határérték alatti: `0 < min`) | Beküldés elutasítva / $0 Grand Total |
| **TC-02B.4** | ✅ `helyes@astron.hu` | ❌ `-5` | Egyetlen mező hibás (Negatív érték: `-5 < min`) | Beküldés elutasítva / negatív összeg tiltása |
| **TC-02B.5** | ❌ `rossz-email` | ❌ `0` | **Kettős hiba:** Szintaktikai email + Nulla darab | Beküldés elutasítva mindkét validáción |
| **TC-02B.6** | ❌ `rossz-email` | ❌ `-3` | **Kettős hiba:** Szintaktikai email + Negatív darab | Beküldés elutasítva mindkét validáción |
| **TC-02B.7** | ❌ `@astron.hu` (eleje hiányzik) | ❌ `0` | **Minden mező helytelen** | Tranzakció azonnal blokkolva |

---

## 📋 Részletes Tesztlépések (Test Steps)

### 🎯 Előfeltétel:
* Az oldal betöltve, tiszta Storefront felületen.

---

### 👣 1. Csoport: Csak az E-mail mező hibás (Darabszám rendben)
1. E-mail kitöltése: `invalid-user-no-at-sign`.
2. Darabszám kitöltése: `1`.
3. Kattintás a 'Place Subscription Order' gombra.
4. **Asserció:**
   * Az `emailInput` mezőre a böngésző HTML5 `typeMismatch` hibát jelez (`validity.typeMismatch === true`).
   * Alert ablak nem ugrik fel.
   * Nem történik hálózati rendelés beküldés.

---

### 👣 2. Csoport: Csak a Darabszám hibás (E-mail rendben)
1. E-mail kitöltése: `valid.qa@astron.hu`.
2. Darabszám kitöltése: `0`, majd `-5`.
3. Megfigyelés: Az összegzés (Order Summary) Grand Total értéke nem növekedhet érvényes pozitív összeggel.
4. Kattintás a 'Place Subscription Order' gombra.
5. **Asserció:**
   * A darabszám mező HTML5 `rangeUnderflow` hibát mutat (`validity.rangeUnderflow === true` a `min="1"` miatt).
   * Nem jön létre rendelés nulla vagy negatív licencszámmal.

---

### 👣 3. Csoport: Minden mező hibás egyszerre (Kombinált hiba)
1. E-mail kitöltése: `totally-invalid-format`.
2. Darabszám kitöltése: `-10`.
3. Kattintás a 'Place Subscription Order' gombra.
4. **Asserció:**
   * Az űrlap mindkét mezőre hibás validációs státuszt ad vissza.
   * A táblázatban nem jelenik meg új bejegyzés.
