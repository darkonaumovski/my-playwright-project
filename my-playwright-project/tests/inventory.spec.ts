import { authenticatedTest as test, expect } from '../fixtures';
import { products as catalogue } from '../test-data/products';

const products = catalogue.map(product => product.name);

test.describe('Inventory', () => {
  test('shows the complete product catalogue', async ({ page, inventory }) => {
    await inventory.expectLoaded();
    await expect(inventory.items).toHaveCount(6);
    await expect(inventory.itemNames).toHaveText(products);
    await expect(page.getByTestId(/add-to-cart-/)).toHaveCount(6);
  });

  test('sorts products by name and price', async ({ inventory }) => {
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

  test('opens a matching product detail page and returns to products', async ({ page, inventory, productDetails }) => {
    await inventory.openProduct(4);
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(productDetails.name).toHaveText('Sauce Labs Backpack');
    await expect(productDetails.price).toHaveText('$29.99');
    await productDetails.backToProducts();
    await inventory.expectLoaded();
  });

  test('adds and removes a product from inventory', async ({ inventory }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(inventory.removeButton('sauce-labs-backpack')).toBeVisible();

    await inventory.removeProduct('sauce-labs-backpack');
    await expect(inventory.cartBadge).toHaveCount(0);
    await expect(inventory.addButton('sauce-labs-backpack')).toBeVisible();
  });

  test('adds a product from its detail page', async ({ inventory, productDetails }) => {
    await inventory.openProduct(4);
    await productDetails.addToCart();
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(productDetails.removeButton).toBeVisible();
  });
});
