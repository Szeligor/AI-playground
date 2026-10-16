# API Specialist Subagent - Részletes How-To és Működési Útmutató
### Astron Informatikai Kft. | Playwright QA Automation Workspace | kzs Modul

Az API Specialist subagent a böngésző nélküli, mikromásodperces futási idejű REST API integrációs tesztekért és az API Service Object kliensekért felelős.

---

## 1. Szerepkör és Célkitűzés
- **Cél:** A backend szolgáltatások, REST végpontok, HTTP válaszkódok, JSON kontraktusok és jogosultsági szintek gyors és robusztus automatizált ellenőrzése.
- **Elsődleges fókusz:** Playwright natív `request` fixture használata (böngésző indítási overhead nélkül), API Service Object architektúra, részletes státusz- és payload validáció.

---

## 2. Hozzáférési Jogosultságok és Végpont Mátrix
Az API Specialist az alábbi komponensekért és fájlokért felelős:

| Komponens / Fájl | Elérési Út | Kezelt Terület |
|---|---|---|
| `SwaggerPage.ts` | `pages/api-console/SwaggerPage.ts` | Az in-page Swagger/OpenAPI interaktív tesztkonzol kezelése. |
| `OrderApiClient.ts` | `api/clients/OrderApiClient.ts` | REST API Service Object a rendelési végpontokhoz. |
| API Tesztek | `kzs/tests/api.spec.ts`, `tests/*api*.spec.ts` | A Playwright `api` projektjében futó API specifikációk. |
| Végpontok | `/api/orders`, `/api/orders/:id/status`, `/api/inventory` | Megrendelések lekérése, létrehozása, státuszfrissítése, készletkezelés. |

---

## 3. Lépésről Lépésre Végrehajtási Útmutató (How-To)

### 1. Lépés: API Service Object Létrehozása / Karbantartása
Az API hívásokat nem a tesztfájlban lévő nyers stringekkel végezzük, hanem típusos Service Object osztályokon keresztül:
1. Az osztály constructorában vedd át a Playwright `APIRequestContext` példányát.
2. Definiálj async metódusokat minden REST végponthoz (pl. `createOrder(payload)`, `patchStatus(id, status)`).
3. Térj vissza a nyers `APIResponse` objektummal (hogy a tesztfájl ellenőrizhesse a státuszt és a fejléceket).

### 2. Lépés: API Teszteset Írása a Playwright `api` Projektben
1. Használd a beépített `{ request }` fixture-t (ne hozz létre böngészőt!).
2. Építsd fel az AAA mintát:
   - **Arrange:** Tesztadatok, payload objektum összeállítása.
   - **Act:** API végpont meghívása a Service Objecten keresztül vagy közvetlenül a `request.post()` segítségével.
   - **Assert:** Státuszkód, JSON válaszstruktúra, és konkrét mezőértékek ellenőrzése.

---

## 4. Teljes, Szabványos Kódpélda

### API Service Object (`api/clients/OrderApiClient.ts`):
```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';

export interface CreateOrderPayload {
  email: string;
  productId: number;
  qty: number;
  country: 'US' | 'DE' | 'HU';
}

export class OrderApiClient {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Új megrendelést hoz létre a REST API végponton keresztül.
   */
  async createOrder(payload: CreateOrderPayload): Promise<APIResponse> {
    return this.request.post('/api/orders', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Megrendelés státuszát frissíti.
   */
  async updateOrderStatus(orderId: number, status: string, token?: string): Promise<APIResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.request.patch(`/api/orders/${orderId}/status`, {
      data: { status },
      headers,
    });
  }
}
```

### API Teszt Specifikáció (`kzs/tests/api.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import { OrderApiClient } from '../../api/clients/OrderApiClient';

test.describe('Order Management REST API Tesztek', () => {

  test('TC-API-01: Új rendelés létrehozása és séma validáció', async ({ request }) => {
    // Arrange: Kliens és tesztadatok előkészítése
    const client = new OrderApiClient(request);
    const payload = {
      email: 'api.enterprise@astron.hu',
      productId: 1,
      qty: 2,
      country: 'HU' as const,
    };

    // Act: Rendelés beküldése
    const response = await client.createOrder(payload);

    // Assert: HTTP státuszkód és válaszséma ellenőrzése
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('PENDING');
    expect(body.email).toBe(payload.email);
  });

  test('TC-API-02: Érvénytelen darabszám negatív teszt (400 Bad Request)', async ({ request }) => {
    const client = new OrderApiClient(request);
    const response = await client.createOrder({
      email: 'invalid@astron.hu',
      productId: 1,
      qty: -5,
      country: 'HU',
    });

    // Szigorú asserció: a backendnek el kell utasítania a hibás adatot
    expect(response.status()).toBe(400);
  });

});
```

---

## 5. Futtatás és Hibaelhárítás
Az API tesztek azonnal, böngésző nélkül futtathatók:
```powershell
npx playwright test kzs/tests/api.spec.ts --project=api --reporter=list
```
- **Hiba esetén (pl. 401 Unauthorized vagy 404 Not Found):** Mindig írasd ki a válasz törzsét (`console.log(await response.text())`) a hiba okának tisztázására, és ellenőrizd az URL báziscímet a `playwright.config.ts`-ben.
