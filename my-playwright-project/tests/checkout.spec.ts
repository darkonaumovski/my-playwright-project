import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('user can complete checkout', async ({ page, loggedInPage }) => {
  void loggedInPage;
  const inventory = new InventoryPage(page);
  await inventory.addProductToCart('add-to-cart-sauce-labs-backpack');
  await inventory.openCart();
  const cart = new CartPage(page);
  await cart.expectProductVisible('Sauce Labs Backpack');
  await cart.checkout();
  const checkout = new CheckoutPage(page);
  await checkout.fillInformation('Test', 'User', '00-001');
  await checkout.finish();
});
