import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout', () => {
  let inventory: InventoryPage;
  let cart: CartPage;
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page, loggedInPage }) => {
    void loggedInPage;
    inventory = new InventoryPage(page);
    cart = new CartPage(page);
    checkout = new CheckoutPage(page);
  });

  test('user can complete checkout', async () => {
    await inventory.addProductToCart('add-to-cart-sauce-labs-backpack');
    await inventory.openCart();
    await cart.expectProductVisible('Sauce Labs Backpack');
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();
  });
});
