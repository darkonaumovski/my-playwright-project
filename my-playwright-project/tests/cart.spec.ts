import { authenticatedTest as test, expect } from '../fixtures';

test.describe('Cart', () => {
  test('shows an empty cart', async ({ page, inventory, cart }) => {
    await inventory.openCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByText('Your Cart')).toBeVisible();
    await expect(cart.cartItems).toHaveCount(0);
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  test('keeps multiple selected products with an accurate badge', async ({ inventory, cart }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.addProduct('sauce-labs-bike-light');
    await expect(inventory.cartBadge).toHaveText('2');
    await inventory.openCart();
    await expect(cart.cartItems).toHaveCount(2);
    await cart.expectProductVisible('Sauce Labs Backpack');
    await cart.expectProductVisible('Sauce Labs Bike Light');
  });

  test('removes an item from cart and clears the final cart badge', async ({ inventory, cart }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.removeProduct('sauce-labs-backpack');
    await expect(cart.cartItems).toHaveCount(0);
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  test('continues shopping while preserving the cart', async ({ inventory, cart }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.continueShopping();
    await expect(inventory.cartBadge).toHaveText('1');
    await expect(inventory.products).toBeVisible();
  });
});
