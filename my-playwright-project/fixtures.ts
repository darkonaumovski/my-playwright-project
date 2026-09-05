import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ShopHeader } from './pages/components/ShopHeader';
import { demoPassword } from './test-data/users';

type Fixtures = {
  login: LoginPage;
  inventory: InventoryPage;
  cart: CartPage;
  checkout: CheckoutPage;
  productDetails: ProductDetailsPage;
  header: ShopHeader;
  loggedInPage: void;
};

type Options = {
  credentials: { username: string; password: string };
};

// Objects are lazy and test-scoped; constructing them never navigates or logs in.
export const test = base.extend<Fixtures & Options>({
  credentials: [{
    username: process.env.TEST_USERNAME ?? 'standard_user',
    password: process.env.TEST_PASSWORD ?? demoPassword
  }, { option: true }],
  login: async ({ page }, use) => { await use(new LoginPage(page)); },
  header: async ({ page }, use) => { await use(new ShopHeader(page)); },
  inventory: async ({ page, header }, use) => { await use(new InventoryPage(page, header)); },
  cart: async ({ page }, use) => { await use(new CartPage(page)); },
  checkout: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  productDetails: async ({ page }, use) => { await use(new ProductDetailsPage(page)); },
  // Kept for existing consumers that explicitly request the original fixture.
  loggedInPage: async ({ login, credentials }, use) => {
    await login.signIn(credentials.username, credentials.password);
    await use();
  }
});

// Opt in per suite. Guest, login and seeded-user tests use `test` instead.
export const authenticatedTest = test.extend<{ authenticated: void }>({
  authenticated: [async ({ loggedInPage }, use) => {
    void loggedInPage;
    await use();
  }, { auto: true }]
});

export { expect };
