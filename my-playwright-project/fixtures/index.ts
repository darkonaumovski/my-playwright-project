import { test as base, expect } from "@playwright/test";

import { environment, type Credentials } from "../config/environment";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ShopHeader } from "../pages/components/ShopHeader";

type PageObjects = {
  login: LoginPage;
  inventory: InventoryPage;
  cart: CartPage;
  checkout: CheckoutPage;
  productDetails: ProductDetailsPage;
  header: ShopHeader;
};

type TestOptions = {
  credentials: Credentials;
};

// Page objects are lazy and test-scoped. Constructing one has no side effects.
export const test = base.extend<PageObjects & TestOptions>({
  credentials: [environment.credentials, { option: true }],
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  header: async ({ page }, use) => {
    await use(new ShopHeader(page));
  },
  inventory: async ({ page, header }, use) => {
    await use(new InventoryPage(page, header));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  productDetails: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
});

// Authenticated suites opt in explicitly; guest tests keep the side-effect-free base fixture.
export const authenticatedTest = test.extend<{ authenticatedSession: void }>({
  authenticatedSession: [
    async ({ login, credentials }, use) => {
      await login.signIn(credentials.username, credentials.password);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
