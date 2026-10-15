# Tesztkészlet Részletes Magyarázata (TESTS_EXPLAINED.md)

Ez a dokumentum a keretrendszerben lévő mind a 15 aktív tesztet mutatja be kódblokkokkal, működési mechanizmussal és elvárt eredményekkel.

---

## 1. Unit Tesztek (Fájl: tests/unit/taskService.test.js)

A tesztelési piramis alsó szintje. Az üzleti logikát ellenőrzi a böngészőtől és a hálózattól elszigetelve, a Node.js 20 natív tesztmotorjával (`node:test`, `node:assert/strict`).

### Teszt 1: Bemeneti adatok validálása
```javascript
test('Unit Teszt 1: validateTask bemeneti adatok ellenőrzése (Happy path és hibás esetek)', () => {
  const emptyRes = validateTask({ title: '   ', priority: 'low' });
  assert.equal(emptyRes.valid, false, 'Az üres címnek érvénytelennek kell lennie');
  assert.ok(emptyRes.error.includes('nem lehet üres'), 'Megfelelő hibaüzenet elvárt');

  const invalidPriorityRes = validateTask({ title: 'Teszt feladat', priority: 'urgent' });
  assert.equal(invalidPriorityRes.valid, false);
  assert.ok(invalidPriorityRes.error.includes('Érvénytelen prioritás'));

  const validRes = validateTask({ title: 'Bevásárlás', priority: 'high' });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.error, undefined);
});
```
- **Mit vizsgál:** A `validateTask` tiszta függvény logikai szabályait.
- **Hogyan vizsgálja:** Három bemeneti esetet tesztel: csak szóközt tartalmazó címet, nem létező prioritást ('urgent'), valamint érvényes adatokat.
- **Elvárt eredmény:** Hibás bemenetekre `valid: false` és hibaüzenet, érvényes bemenetre `valid: true`.

---

### Teszt 2: Entitás létrehozása és alapértelmezett értékek
```javascript
test('Unit Teszt 2: createTask helyes mezőkkel és alapértelmezésekkel hoz létre feladatot', () => {
  const title = 'Új feature fejlesztése';
  const priority = 'high';

  const task = createTask(title, priority);

  assert.ok(task.id.startsWith('task_'), 'Egyedi azonosító generálása kötelező');
  assert.equal(task.title, title);
  assert.equal(task.priority, priority);
  assert.equal(task.completed, false, 'Alapértelmezésben a feladat nem lehet kész');
  assert.ok(typeof task.createdAt === 'string', 'Időbélyeg jelenléte kötelező');
});
```
- **Mit vizsgál:** A `createTask` objektum-összeállító logikáját.
- **Hogyan vizsgálja:** Meghívja a függvényt érvényes paraméterekkel, majd mezőnként ellenőrzi az eredményt.
- **Elvárt eredmény:** Egyedi `task_` prefixű azonosító, helyes mezőértékek, alapértelmezett `completed: false` státusz és ISO formátumú `createdAt` időbélyeg.

---

### Teszt 3: Kivételkezelés érvénytelen adatra
```javascript
test('Unit Teszt 3: createTask kivételt dob érvénytelen bemenet esetén', () => {
  assert.throws(
    () => {
      createTask('');
    },
    /nem lehet üres/,
    'A függvénynek Exception-t kell dobnia érvénytelen adatra'
  );
});
```
- **Mit vizsgál:** A belső hibakezelést hibás adatok esetén.
- **Hogyan vizsgálja:** Az `assert.throws` függvénnyel figyeli a futásidejű kivételdobást.
- **Elvárt eredmény:** Üres cím esetén a függvény nem adhat vissza csonka objektumot, hanem szándékosan hibát (`Error`) dob a megadott hibaüzenettel.

---

### Teszt 4: Állapotváltás és immutabilitás
```javascript
test('Unit Teszt 4: toggleTaskStatus állapotváltozás és immutabilitás vizsgálata', () => {
  const initialTask = {
    id: 't1',
    title: 'Teszt',
    priority: 'low',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  const toggled = toggleTaskStatus(initialTask);

  assert.equal(toggled.completed, true, 'A státusznak true-ra kell váltania');
  assert.ok(toggled.updatedAt, 'Az updatedAt mezőnek kitöltöttnek kell lennie');
  assert.notEqual(toggled, initialTask, 'Új objektumpéldányt kell visszaadnia (immutabilitás)');

  const toggledBack = toggleTaskStatus(toggled);
  assert.equal(toggledBack.completed, false, 'A státusznak vissza kell váltania false-ra');
});
```
- **Mit vizsgál:** A feladat befejezett státuszának logikai váltását.
- **Hogyan vizsgálja:** Meghívja a függvényt egy kezdeti objektummal, majd az eredményre újra meghívja.
- **Elvárt eredmény:** A `completed` mező értéke ellenkezőjére vált, megjelenik az `updatedAt` mező, új objektumreferencia jön létre (immutabilitás), és újabb hívásra visszavált eredeti állapotába.

---

### Teszt 5: Statisztikai számítás és szűrés pontossága
```javascript
test('Unit Teszt 5: calculateTaskStats és filterTasks adathalmaz kalkulációk pontossága', () => {
  const dummyTasks = [
    { id: '1', title: 'Task 1', completed: false },
    { id: '2', title: 'Task 2', completed: true },
    { id: '3', title: 'Task 3', completed: true },
  ];

  const activeOnly = filterTasks(dummyTasks, 'active');
  const completedOnly = filterTasks(dummyTasks, 'completed');
  assert.equal(activeOnly.length, 1, 'Aktív elemek száma hibás');
  assert.equal(completedOnly.length, 2, 'Befejezett elemek száma hibás');

  const stats = calculateTaskStats(dummyTasks);
  assert.equal(stats.total, 3, 'Összes elem számítása hibás');
  assert.equal(stats.completed, 2, 'Kész elemek számítása hibás');
  assert.equal(stats.active, 1, 'Aktív elemek számítása hibás');
  assert.equal(stats.percent, 67, 'Százalékos kerekítés hibás (2/3 -> 67%)');
});
```
- **Mit vizsgál:** A kollekciókon végzett szűrési és matematikai műveleteket.
- **Hogyan vizsgálja:** Ismert 3 elemű teszthalmazt ad át a szűrő és statisztikai függvényeknek.
- **Elvárt eredmény:** Pontos darabszámú szűrt listák (1 aktív, 2 kész), helyes aggregált darabszámok és pontos kerekített százalék (67%).

---

## 2. API Tesztek (Fájl: tests/api/tasks.api.spec.js)

A tesztelési piramis középső szintje. Közvetlen HTTP hívásokkal ellenőrzi a REST végpontokat, a JSON struktúrákat és a HTTP státuszkódokat a `TaskApiClient` osztályon keresztül.

### Teszt 6: Összes elem lekérése (GET /api/tasks)
```javascript
test('API Teszt 1 (Client): Összes feladat lekérése (GET /api/tasks -> 200 OK)', async () => {
  const response = await apiClient.getAllTasks();
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThanOrEqual(1);
  expect(body.data[0]).toHaveProperty('id');
  expect(body.data[0]).toHaveProperty('title');
});
```
- **Mit vizsgál:** A feladatlista végpont elérhetőségét és válaszstruktúráját.
- **Hogyan vizsgálja:** Meghívja az `apiClient.getAllTasks()` metódust.
- **Elvárt eredmény:** HTTP 200 státuszkód, `success: true` jelző és egy feladatokat tartalmazó JSON tömb.

---

### Teszt 7: Új feladat felvétele (POST /api/tasks)
```javascript
test('API Teszt 2 (Client): Új feladat sikeres létrehozása (POST /api/tasks -> 201 Created)', async () => {
  const payload = {
    title: 'Automated API Test Feladat (Client)',
    priority: 'high'
  };

  const response = await apiClient.createTask(payload);
  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.data.title).toBe(payload.title);
  expect(body.data.priority).toBe('high');
  expect(body.data.completed).toBe(false);
  expect(body.data).toHaveProperty('id');
});
```
- **Mit vizsgál:** Új entitás perzisztálását a szerveren.
- **Hogyan vizsgálja:** Érvényes JSON payloadot küld az `apiClient.createTask()` hívással.
- **Elvárt eredmény:** HTTP 201 Created státuszkód, a válaszban visszakapott objektum egyezik a küldött adatokkal és tartalmaz generált `id`-t.

---

### Teszt 8: Negatív teszt - Érvénytelen bemenet elutasítása
```javascript
test('API Teszt 3 (Client): Negatív teszt - Érvénytelen bemenet elutasítása (400 Bad Request)', async () => {
  const invalidPayload = { title: '   ', priority: 'low' };

  const response = await apiClient.createTask(invalidPayload);
  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.success).toBe(false);
  expect(body.error).toContain('nem lehet üres');
});
```
- **Mit vizsgál:** A szerveroldali bemenet-ellenőrzést.
- **Hogyan vizsgálja:** Szóközt tartalmazó érvénytelen címet küld a szervernek.
- **Elvárt eredmény:** HTTP 400 Bad Request státusz, `success: false` jelző és magyarázó hibaüzenet.

---

### Teszt 9: Részleges módosítás (PATCH /api/tasks/:id/toggle)
```javascript
test('API Teszt 4 (Client): Feladat státuszának átváltása (PATCH /api/tasks/:id/toggle -> 200 OK)', async () => {
  const listRes = await apiClient.getAllTasks();
  const tasks = (await listRes.json()).data;
  const targetTask = tasks[0];

  const toggleRes = await apiClient.toggleTaskStatus(targetTask.id);
  expect(toggleRes.status()).toBe(200);

  const toggleBody = await toggleRes.json();
  expect(toggleBody.success).toBe(true);
  expect(toggleBody.data.completed).toBe(!targetTask.completed);
});
```
- **Mit vizsgál:** Egy meglévő elem állapotának módosítását azonosító alapján.
- **Hogyan vizsgálja:** Lekéri az első elemet, majd elküldi a PATCH módosító kérést.
- **Elvárt eredmény:** HTTP 200 OK státusz és a `completed` mező értéke az eredeti ellentettjére változik.

---

### Teszt 10: Törlés és utólagos elérhetetlenség (DELETE /api/tasks/:id)
```javascript
test('API Teszt 5 (Client): Feladat törlése és elérhetetlenségének ellenőrzése (DELETE -> 200 OK, GET -> 404)', async () => {
  const createRes = await apiClient.createTask({ title: 'Törlendő elem', priority: 'low' });
  const createdId = (await createRes.json()).data.id;

  const deleteRes = await apiClient.deleteTask(createdId);
  expect(deleteRes.status()).toBe(200);

  const getRes = await apiClient.getTaskById(createdId);
  expect(getRes.status()).toBe(404);
});
```
- **Mit vizsgál:** Az elem törlését és a törlés utáni állapotintegritást.
- **Hogyan vizsgálja:** Létrehoz egy elemet, törli a DELETE hívással, majd kísérletet tesz a lekérésére GET-tel.
- **Elvárt eredmény:** A törlésre HTTP 200-at ad, az utólagos lekérésre kötelezően HTTP 404 Not Found választ küld a szerver.

---

## 3. E2E Tesztek (Fájl: tests/e2e/tasks.e2e.spec.js)

A tesztelési piramis legfelső szintje. Valós Chrome böngészőmotorban, a Page Object Model (`TaskTrackerPage`) osztályon keresztül hajtja végre a felhasználói interakciókat.

### Teszt 11: Kezdőoldal betöltődése és felületi elemek
```javascript
test('E2E Teszt 1 (POM): Kezdőoldal elemeinek és kezdeti állapotának ellenőrzése', async () => {
  await expect(taskPage.heading).toHaveText('TaskTracker Demo');
  await expect(taskPage.titleInput).toBeVisible();
  await expect(taskPage.prioritySelect).toBeVisible();
  await expect(taskPage.addButton).toBeVisible();

  await expect(taskPage.taskItems).toHaveCount(1);
  await expect(taskPage.taskItems.first()).toContainText('Első feladat kipróbálása');
  await expect(taskPage.totalCount).toHaveText('Összesen: 1');
  await expect(taskPage.completedCount).toHaveText('Kész: 0');
});
```
- **Mit vizsgál:** Az oldal vizuális és funkcionális alapállapotát.
- **Hogyan vizsgálja:** Megnyitja az oldalt, majd ellenőrzi a Page Object lokátorainak láthatóságát és értékeit.
- **Elvárt eredmény:** A címsor, a beviteli mezők, a gomb, az alapértelmezett kezdőelem és a számlálók láthatóak és helyes értékeket mutatnak.

---

### Teszt 12: Új feladat hozzáadása felületről
```javascript
test('E2E Teszt 2 (POM): Új feladat felvétele a Page Object addTask metódusával', async () => {
  const taskName = 'POM Alapon Létrehozott Feladat';

  await taskPage.addTask(taskName, 'high');

  await expect(taskPage.titleInput).toHaveValue('');

  const createdTask = taskPage.getTaskItemByTitle(taskName);
  await expect(createdTask).toBeVisible();
  await expect(createdTask.locator('.priority-badge')).toHaveText('high');
  await expect(taskPage.totalCount).toHaveText('Összesen: 2');
});
```
- **Mit vizsgál:** A felvételi folyamat felületi végrehajtását.
- **Hogyan vizsgálja:** Meghívja a `taskPage.addTask()` metódust névvel és prioritással.
- **Elvárt eredmény:** A beviteli mező kiürül, az új elem megjelenik a listában a prioritás jelvénnyel, és a számláló 2-re növekszik.

---

### Teszt 13: Negatív teszt - Validációs hiba üres űrlapküldéskor
```javascript
test('E2E Teszt 3 (POM): Negatív teszt - Validációs hiba üres űrlapküldéskor', async () => {
  await taskPage.addTask('');

  await expect(taskPage.errorMessage).toBeVisible();
  await expect(taskPage.errorMessage).toContainText('Kérlek adj meg egy feladat címet!');
  await expect(taskPage.totalCount).toHaveText('Összesen: 1');
});
```
- **Mit vizsgál:** A hibavisszajelzés megjelenését a felületen.
- **Hogyan vizsgálja:** Üres értékkel küldi be az űrlapot az `addTask('')` metóduson keresztül.
- **Elvárt eredmény:** Megjelenik a piros hibaüzenet a megfelelő szöveggel, és nem jön létre új elem (a számláló 1 marad).

---

### Teszt 14: Checkbox állapotváltás és CSS stílusváltozás
```javascript
test('E2E Teszt 4 (POM): Feladat befejezettnek jelölése (Checkbox toggle)', async () => {
  const firstTask = taskPage.taskItems.first();
  const checkbox = firstTask.locator('.task-checkbox');
  const title = firstTask.locator('.task-title');

  await expect(checkbox).not.toBeChecked();
  await expect(title).not.toHaveClass(/completed/);

  await taskPage.toggleTaskCheckbox(0);

  await expect(title).toHaveClass(/completed/);
  await expect(taskPage.completedCount).toHaveText('Kész: 1');
});
```
- **Mit vizsgál:** A feladat befejezetté tételét és a felületi eseménykezelést.
- **Hogyan vizsgálja:** Rákattint az első elem checkboxára a `toggleTaskCheckbox(0)` hívással.
- **Elvárt eredmény:** A checkbox bepipálódik, a cím megkapja a `.completed` áthúzott CSS osztályt, és a fejlécben a kész számláló értéke 1-re vált.

---

### Teszt 15: Elem törlése és üres állapot (Empty State)
```javascript
test('E2E Teszt 5 (POM): Feladat törlése és üres állapot (Empty State) kezelése', async () => {
  await taskPage.deleteTask(0);

  await expect(taskPage.taskItems).toHaveCount(0);

  await expect(taskPage.emptyState).toBeVisible();
  await expect(taskPage.emptyState).toHaveText('Nincs megjeleníthető feladat.');
  await expect(taskPage.totalCount).toHaveText('Összesen: 0');
});
```
- **Mit vizsgál:** Az elem törlését és az üres lista felületi állapotát.
- **Hogyan vizsgálja:** Rákattint a törlés gombra a `deleteTask(0)` hívással.
- **Elvárt eredmény:** A lista elemeinek száma 0 lesz, megjelenik az üres állapot felirata, és az összesítő számláló 0-ra vált.
