import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type Fixtures = { loggedInPage: void };
export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.TEST_USERNAME ?? 'standard_user', process.env.TEST_PASSWORD ?? 'secret_sauce');
    await login.expectLoggedIn();
    await use();
  }
});
export { expect };
