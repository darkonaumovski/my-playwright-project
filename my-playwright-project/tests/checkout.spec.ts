import { authenticatedTest as test, expect } from '../fixtures';

test.describe('Checkout', () => {
  test('user can complete checkout', async ({ inventory, cart, checkout }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.expectProductVisible('Sauce Labs Backpack');
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();
  });

  test('requires every customer information field', async ({ page, inventory, cart, checkout }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.checkout();

    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: First Name is required');
    await checkout.firstName.fill('Test');
    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: Last Name is required');
    await checkout.lastName.fill('User');
    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('shows correct checkout totals and supports cancellation', async ({ page, inventory, cart, checkout }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');

    await expect(checkout.itemTotal).toHaveText('Item total: $29.99');
    await expect(checkout.taxTotal).toHaveText('Tax: $2.40');
    await expect(checkout.orderTotal).toHaveText('Total: $32.39');
    await checkout.cancel();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('returns home with an empty cart after checkout completion', async ({ page, inventory, cart, checkout, header }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();

    await checkout.backToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(header.cartBadge).toHaveCount(0);
  });

  test('generates a PDF order after checkout completion', async ({ inventory, cart, checkout }) => {
    await inventory.addProduct('sauce-labs-backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();

    const download = await checkout.downloadOrder();
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});
