import { test, expect } from '../fixtures';
import { demoPassword as password, validUsers } from '../test-data/users';

test.describe('SauceDemo login', () => {
  test.beforeEach(async ({ login }) => {
    await login.goto();
  });

  for (const username of validUsers) {
    test(`allows ${username} to log in`, async ({ page, login }) => {
      await login.login(username, password);
      await login.expectLoggedIn();
      await expect(page.getByText('Products')).toBeVisible();
    });
  }

  test('rejects the locked-out user', async ({ page, login }) => {
    await login.login('locked_out_user', password);
    await login.expectLoginError('Sorry, this user has been locked out');
    await expect(page).toHaveURL(/\/$/);
  });

  test('shows an error when both fields are empty', async ({ login }) => {
    await login.login('', '');
    await login.expectLoginError('Username is required');
  });

  test('shows an error when the username is empty', async ({ login }) => {
    await login.login('', password);
    await login.expectLoginError('Username is required');
  });

  test('shows an error when the password is empty', async ({ login }) => {
    await login.login('standard_user', '');
    await login.expectLoginError('Password is required');
  });

  test('rejects an unknown username', async ({ login }) => {
    await login.login('unknown_user', password);
    await login.expectLoginError('Username and password do not match any user');
  });

  test('rejects an incorrect password', async ({ login }) => {
    await login.login('standard_user', 'incorrect_password');
    await login.expectLoginError('Username and password do not match any user');
  });

  test('rejects a username with leading or trailing whitespace', async ({ login }) => {
    await login.login(' standard_user ', password);
    await login.expectLoginError('Username and password do not match any user');
  });

  test('treats usernames as case-sensitive', async ({ login }) => {
    await login.login('STANDARD_USER', password);
    await login.expectLoginError('Username and password do not match any user');
  });
});
