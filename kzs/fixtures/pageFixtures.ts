import { test as baseTest, expect } from '@playwright/test';
import {
  StorefrontPage,
  OrderManagementPage,
  SelectorLabPage,
  SqlConsolePage,
  SwaggerPage,
} from '../pages';

/**
 * Custom Page Object Fixtures típusdefiníció
 */
export type CustomFixtures = {
  storefrontPage: StorefrontPage;
  orderManagementPage: OrderManagementPage;
  selectorLabPage: SelectorLabPage;
  sqlConsolePage: SqlConsolePage;
  swaggerPage: SwaggerPage;
};

/**
 * Playwright test kiterjesztése automatikus Page Object példányosítással.
 * Használatával a tesztek közvetlenül megkapják a felkészített Page Objecteket.
 */
export const test = baseTest.extend<CustomFixtures>({
  storefrontPage: async ({ page }, use) => {
    const storefront = new StorefrontPage(page);
    await use(storefront);
  },

  orderManagementPage: async ({ page }, use) => {
    const orderManagement = new OrderManagementPage(page);
    await use(orderManagement);
  },

  selectorLabPage: async ({ page }, use) => {
    const selectorLab = new SelectorLabPage(page);
    await use(selectorLab);
  },

  sqlConsolePage: async ({ page }, use) => {
    const sqlConsole = new SqlConsolePage(page);
    await use(sqlConsole);
  },

  swaggerPage: async ({ page }, use) => {
    const swagger = new SwaggerPage(page);
    await use(swagger);
  },
});

export { expect };
