import { expect } from '@playwright/test';
import { test } from '../fixtures';

const products = [
  { id: 4, slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  { id: 0, slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' },
  { id: 1, slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  { id: 5, slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  { id: 2, slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: '$7.99' },
  { id: 3, slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' }
] as const;

test.describe('Additional inventory and cart coverage', () => {
  test.beforeEach(async ({ loggedInPage }) => { void loggedInPage; });

  test('keeps product identity paired through every sort order', async ({ page }) => {
    const expectedOrders = {
      az: products,
      za: [...products].reverse(),
      lohi: [products[4], products[1], products[2], products[5], products[0], products[3]],
      hilo: [products[3], products[0], products[2], products[5], products[1], products[4]]
    } as const;

    for (const [sort, expected] of Object.entries(expectedOrders)) {
      await page.getByTestId('product-sort-container').selectOption(sort);
      await expect(page.getByTestId('product-sort-container')).toHaveValue(sort);
      const cards = await page.getByTestId('inventory-item').all();
      expect(cards).toHaveLength(expected.length);

      for (let index = 0; index < expected.length; index += 1) {
        await expect(cards[index].getByTestId('inventory-item-name')).toHaveText(expected[index].name);
        await expect(cards[index].getByTestId('inventory-item-price')).toHaveText(expected[index].price);
        await expect(cards[index].locator('img')).toHaveAttribute('alt', expected[index].name);
      }
    }
  });

  test('opens the matching detail page from image and title for every product', async ({ page }) => {
    for (const product of products) {
      await page.goto('/inventory.html');
      await page.getByTestId(`item-${product.id}-img-link`).click();
      await expect(page).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${product.id}`));
      await expect(page.getByTestId('inventory-item-name')).toHaveText(product.name);
      await expect(page.getByTestId('inventory-item-price')).toHaveText(product.price);
      await page.getByTestId('back-to-products').click();

      await page.getByTestId(`item-${product.id}-title-link`).click();
      await expect(page).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${product.id}`));
      await expect(page.getByTestId('inventory-item-name')).toHaveText(product.name);
      await expect(page.getByTestId('inventory-item-price')).toHaveText(product.price);
    }
  });

  test('prevents duplicate cart entries after repeated add attempts', async ({ page }) => {
    const addButton = page.getByTestId('add-to-cart-sauce-labs-backpack');
    await addButton.click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();

    await page.getByTestId('remove-sauce-labs-backpack').click();
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.goto('/cart.html');
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
  });

  test('maintains cart row accuracy while removing middle and final items', async ({ page }) => {
    for (const product of products.slice(0, 3)) {
      await page.getByTestId(`add-to-cart-${product.slug}`).click();
    }
    await page.goto('/cart.html');
    await expect(page.getByTestId('inventory-item')).toHaveCount(3);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('3');

    for (const product of products.slice(0, 3)) {
      const row = page.getByTestId('inventory-item').filter({ hasText: product.name });
      await expect(row.getByTestId(`remove-${product.slug}`)).toBeVisible();
    }

    await page.getByTestId('remove-sauce-labs-bike-light').click();
    await expect(page.getByTestId('inventory-item')).toHaveCount(2);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
    await expect(page.getByText('Sauce Labs Bike Light', { exact: true })).toHaveCount(0);

    await page.getByTestId('remove-sauce-labs-backpack').click();
    await page.getByTestId('remove-sauce-labs-bolt-t-shirt').click();
    await expect(page.getByTestId('inventory-item')).toHaveCount(0);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });

  test('refreshes stale product actions after Reset App State', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('reset-sidebar-link').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('add-to-cart-sauce-labs-backpack')).toBeVisible();
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveCount(0);
  });

  test('opens a cart item detail page with the correct Remove state', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.goto('/cart.html');
    await page.getByText('Sauce Labs Backpack', { exact: true }).click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(page.getByTestId('remove')).toBeVisible();
    await page.getByTestId('back-to-products').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });
});
