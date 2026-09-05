import { expect, test } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { demoPassword } from '../test-data/users';

test.describe('Additional quality coverage', () => {
  test('dismisses the menu with Escape and keeps focus in the menu', async ({ login, header }) => {
    await login.signIn('standard_user', demoPassword);
    await header.openMenu();
    await expect(header.navigation).toBeVisible();
    await expect(header.allItemsLink).toBeFocused();
    await header.closeMenuButton.press('Escape');
    await expect(header.navigation).toBeHidden();
  });

  test('keeps the inventory usable at a mobile viewport without horizontal overflow', async ({ page, login, header, inventory }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login.signIn('standard_user', demoPassword);
    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
      productCount: document.querySelectorAll('[data-test="inventory-item"]').length
    }));
    expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.productCount).toBe(6);
    await expect(header.openMenuButton).toBeVisible();
    await expect(inventory.sortSelect).toBeVisible();
  });

  test('isolates carts between two browser contexts', async ({ browser }) => {
    const contextOne = await browser.newContext();
    const contextTwo = await browser.newContext();
    try {
      const pageOne = await contextOne.newPage();
      const pageTwo = await contextTwo.newPage();
      await new LoginPage(pageOne).signIn('standard_user', demoPassword);
      const inventoryOne = new InventoryPage(pageOne);
      await new LoginPage(pageTwo).signIn('standard_user', demoPassword);
      const inventoryTwo = new InventoryPage(pageTwo);
      await inventoryOne.addProduct('sauce-labs-backpack');
      await inventoryTwo.addProduct('sauce-labs-bike-light');

      await expect(inventoryOne.cartBadge).toHaveText('1');
      await expect(inventoryTwo.cartBadge).toHaveText('1');
      await inventoryOne.openCart();
      await inventoryTwo.openCart();
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
