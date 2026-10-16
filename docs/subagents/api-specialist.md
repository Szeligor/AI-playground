# API Specialist Subagent Szerepkör
### Astron Informatikai Kft. | Playwright QA Automation Workspace

Az API Specialist a böngésző nélküli, gyors REST API integrációs tesztekért és az API Service Object kliensekért felelős.

---

## 1. Felelősségi Kör
- **API Service Objectek készítése (`api/clients/`):**
  - REST végpontok metódusszintű enkapszulációja (`getOrder()`, `createOrder()`, `updateStatus()`).
  - Playwright `APIRequestContext` használata.
- **API Tesztek készítése (`tests/*api*.spec.ts`):**
  - Státuszkódok ellenőrzése (`expect(res.status()).toBe(200)`).
  - JSON válaszstruktúra és mezőtípusok validálása.
  - Negatív ágak és hibakódok (400, 401, 404, 422) ellenőrzése.
- **Gyors és izolált futtatás:**
  - A tesztek böngésző inicializálása nélkül futnak a Playwright `api` projektjében.

---

## 2. Kódolási Sablon

```typescript
import { test, expect } from '@playwright/test';

test.describe('Order Management REST API', () => {
  test('POST /api/orders - Új megrendelés létrehozása és séma validáció', async ({ request }) => {
    // Act: API hívás indítása
    const response = await request.post('/api/orders', {
      data: {
        email: 'api.tester@astron.hu',
        productId: 1,
        qty: 2,
        country: 'HU'
      }
    });

    // Assert: HTTP státuszkód és JSON válasz ellenőrzése
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('orderId');
    expect(body.status).toBe('PENDING');
  });
});
```
