import { expect, Page, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

async function login(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.expectLoggedIn();
}

test.describe('Additional quality coverage', () => {
  test('dismisses the menu with Escape and keeps focus in the menu', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByTestId('inventory-sidebar-link')).toBeFocused();
    await page.getByRole('button', { name: 'Close Menu' }).press('Escape');
    await expect(page.getByRole('navigation')).toBeHidden();
  });

  test('keeps the inventory usable at a mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
      productCount: document.querySelectorAll('[data-test="inventory-item"]').length
    }));
    expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.productCount).toBe(6);
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    await expect(page.getByTestId('product-sort-container')).toBeVisible();
  });

  test('isolates carts between two browser contexts', async ({ browser }) => {
    const contextOne = await browser.newContext();
    const contextTwo = await browser.newContext();
    try {
      const pageOne = await contextOne.newPage();
      const pageTwo = await contextTwo.newPage();
      await login(pageOne);
      await login(pageTwo);
      await pageOne.getByTestId('add-to-cart-sauce-labs-backpack').click();
      await pageTwo.getByTestId('add-to-cart-sauce-labs-bike-light').click();

      await expect(pageOne.getByTestId('shopping-cart-badge')).toHaveText('1');
      await expect(pageTwo.getByTestId('shopping-cart-badge')).toHaveText('1');
      await pageOne.getByTestId('shopping-cart-link').click();
      await pageTwo.getByTestId('shopping-cart-link').click();
      await expect(pageOne.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
      await expect(pageOne.getByText('Sauce Labs Bike Light', { exact: true })).toHaveCount(0);
      await expect(pageTwo.getByText('Sauce Labs Bike Light', { exact: true })).toBeVisible();
      await expect(pageTwo.getByText('Sauce Labs Backpack', { exact: true })).toHaveCount(0);
    } finally {
      await contextOne.close();
      await contextTwo.close();
    }
  });
});
