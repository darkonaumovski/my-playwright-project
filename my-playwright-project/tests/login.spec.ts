import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const password = 'secret_sauce';
const validUsers = [
  'standard_user',
  'problem_user',
  'performance_glitch_user',
  'error_user',
  'visual_user'
] as const;

test.describe('SauceDemo login', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  for (const username of validUsers) {
    test(`allows ${username} to log in`, async ({ page }) => {
      await login.login(username, password);
      await login.expectLoggedIn();
      await expect(page.getByText('Products')).toBeVisible();
    });
  }

  test('rejects the locked-out user', async ({ page }) => {
    await login.login('locked_out_user', password);
    await login.expectLoginError('Sorry, this user has been locked out');
    await expect(page).toHaveURL(/\/$/);
  });

  test('shows an error when both fields are empty', async ({ page }) => {
    await login.login('', '');
    await login.expectLoginError('Username is required');
  });

  test('shows an error when the username is empty', async ({ page }) => {
    await login.login('', password);
    await login.expectLoginError('Username is required');
  });

  test('shows an error when the password is empty', async ({ page }) => {
    await login.login('standard_user', '');
    await login.expectLoginError('Password is required');
  });

  test('rejects an unknown username', async ({ page }) => {
    await login.login('unknown_user', password);
    await login.expectLoginError('Username and password do not match any user');
  });

  test('rejects an incorrect password', async ({ page }) => {
    await login.login('standard_user', 'incorrect_password');
    await login.expectLoginError('Username and password do not match any user');
  });

  test('rejects a username with leading or trailing whitespace', async ({ page }) => {
    await login.login(' standard_user ', password);
    await login.expectLoginError('Username and password do not match any user');
  });

  test('treats usernames as case-sensitive', async ({ page }) => {
    await login.login('STANDARD_USER', password);
    await login.expectLoginError('Username and password do not match any user');
  });
});
