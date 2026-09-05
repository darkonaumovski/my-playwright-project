import { authenticatedTest as test, expect } from '../fixtures';

test.describe('Navigation and shared controls', () => {
  test('opens and closes the menu', async ({ header }) => {
    await header.openMenu();
    await expect(header.logoutLink).toBeVisible();
    await header.closeMenu();
    await expect(header.logoutLink).not.toBeVisible();
  });

  test('resets the cart state', async ({ inventory, cart, header }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await header.openMenu();
    await header.resetAppState();
    await expect(inventory.cartBadge).toHaveCount(0);
    await inventory.openCart();
    await expect(cart.cartItems).toHaveCount(0);
  });

  test('logs out and returns to the login page', async ({ page, header }) => {
    await header.openMenu();
    await header.logout();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('exposes expected external and social destinations', async ({ page, header }) => {
    await header.openMenu();
    await expect(header.aboutLink).toHaveAttribute('href', 'https://saucelabs.com/');
    await expect(page.getByTestId('social-twitter')).toHaveAttribute('href', 'https://twitter.com/saucelabs');
    await expect(page.getByTestId('social-facebook')).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
    await expect(page.getByTestId('social-linkedin')).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
  });
});
