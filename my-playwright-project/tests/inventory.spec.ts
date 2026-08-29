import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';

const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)'
];

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page, loggedInPage }) => {
    void loggedInPage;
    inventory = new InventoryPage(page);
  });

  test('shows the complete product catalogue', async ({ page }) => {
    await inventory.expectLoaded();
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
    await expect(inventory.itemNames).toHaveText(products);
    await expect(page.getByTestId(/add-to-cart-/)).toHaveCount(6);
  });

  test('sorts products by name and price', async () => {
    await inventory.sortBy('za');
    await expect(inventory.itemNames).toHaveText([...products].reverse());

    await inventory.sortBy('lohi');
    await expect(inventory.itemNames).toHaveText([
      'Sauce Labs Onesie', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)', 'Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'
    ]);

    await inventory.sortBy('hilo');
    await expect(inventory.itemNames).toHaveText([
      'Sauce Labs Fleece Jacket', 'Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)', 'Sauce Labs Bike Light', 'Sauce Labs Onesie'
    ]);
  });

  test('opens a matching product detail page and returns to products', async ({ page }) => {
    await inventory.openProduct(4);
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
    await expect(page.getByTestId('inventory-item-price')).toHaveText('$29.99');
    await page.getByTestId('back-to-products').click();
    await inventory.expectLoaded();
  });

  test('adds and removes a product from inventory', async ({ page }) => {
    await inventory.addProductToCart('add-to-cart-sauce-labs-backpack');
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();

    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(inventory.cartBadge).toHaveCount(0);
    await expect(page.getByTestId('add-to-cart-sauce-labs-backpack')).toBeVisible();
  });

  test('adds a product from its detail page', async ({ page }) => {
    await inventory.openProduct(4);
    await page.getByTestId('add-to-cart').click();
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(page.getByTestId('remove')).toBeVisible();
  });
});
