import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Navigation and shared controls', () => {
  test.beforeEach(async ({ loggedInPage }) => { void loggedInPage; });

  test('opens and closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await expect(page.getByTestId('logout-sidebar-link')).toBeVisible();
    await page.getByRole('button', { name: 'Close Menu' }).click();
    await expect(page.getByTestId('logout-sidebar-link')).not.toBeVisible();
  });

  test('resets the cart state', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addProductToCart('add-to-cart-sauce-labs-backpack');
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('reset-sidebar-link').click();
    await expect(inventory.cartBadge).toHaveCount(0);
    await inventory.openCart();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  });

  test('logs out and returns to the login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('logout-sidebar-link').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('exposes expected external and social destinations', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await expect(page.getByTestId('about-sidebar-link')).toHaveAttribute('href', 'https://saucelabs.com/');
    await expect(page.getByTestId('social-twitter')).toHaveAttribute('href', 'https://twitter.com/saucelabs');
    await expect(page.getByTestId('social-facebook')).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
    await expect(page.getByTestId('social-linkedin')).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
  });
});
