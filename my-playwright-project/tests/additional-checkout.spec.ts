import { products } from '../test-data/products';
import type { InventoryPage } from '../pages/InventoryPage';
import type { CartPage } from '../pages/CartPage';
import { readFile } from 'node:fs/promises';
import { authenticatedTest as test, expect } from '../fixtures';

async function addBackpackAndOpenCheckout(inventory: InventoryPage, cart: CartPage) {
  await inventory.addProduct('sauce-labs-backpack');
  await inventory.openCart();
  await cart.checkout();
}

test.describe('Additional checkout coverage', () => {
  test('calculates multi-item subtotal, tax, and total numerically', async ({ inventory, cart, checkout, header }) => {
    for (const product of products) {
      await inventory.addProduct(product.slug);
    }
    await header.openCart();
    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');

    const currency = (text: string) => Number(text.replace(/[^\d.]/g, ''));
    const prices = await checkout.itemPrices.allTextContents();
    const subtotal = prices.reduce((sum, price) => sum + currency(price), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const shownSubtotal = currency(await checkout.itemTotal.innerText());
    const shownTax = currency(await checkout.taxTotal.innerText());
    const shownTotal = currency(await checkout.orderTotal.innerText());

    expect(shownSubtotal).toBeCloseTo(subtotal, 2);
    expect(shownTax).toBeCloseTo(tax, 2);
    expect(shownTotal).toBeCloseTo(total, 2);
    expect(shownTotal).toBeCloseTo(shownSubtotal + shownTax, 2);
  });

  test('retains checkout information while validating required fields', async ({ inventory, cart, checkout }) => {
    await addBackpackAndOpenCheckout(inventory, cart);
    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: First Name is required');

    await checkout.firstName.fill('Zoë');
    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: Last Name is required');
    await expect(checkout.firstName).toHaveValue('Zoë');

    await checkout.lastName.fill("O'Neil");
    await checkout.continueButton.click();
    await expect(checkout.errorMessage).toHaveText('Error: Postal Code is required');
    await expect(checkout.firstName).toHaveValue('Zoë');
    await expect(checkout.lastName).toHaveValue("O'Neil");
  });

  test('handles whitespace-only checkout data according to current demo behavior', async ({ page, inventory, cart, checkout }) => {
    await addBackpackAndOpenCheckout(inventory, cart);
    await checkout.fillInformation('   ', '   ', '   ');
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('cancels checkout without losing the cart', async ({ page, inventory, cart, checkout, header }) => {
    await addBackpackAndOpenCheckout(inventory, cart);
    await checkout.enterInformation('Test', 'User', '00-001');
    await checkout.cancel();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cart.cartItems).toHaveCount(1);

    await cart.checkout();
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.cancel();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('keeps completion idempotent and the cart empty after returning home', async ({ page, inventory, cart, checkout, header }) => {
    await addBackpackAndOpenCheckout(inventory, cart);
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();
    await expect(checkout.confirmation).toBeVisible();
    await page.reload();
    await expect(checkout.confirmation).toBeVisible();
    await checkout.backToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(header.cartBadge).toHaveCount(0);
  });

  test('downloads a non-empty PDF with a valid PDF signature', async ({ inventory, cart, checkout }) => {
    await addBackpackAndOpenCheckout(inventory, cart);
    await checkout.fillInformation('Test', 'User', '00-001');
    await checkout.finish();

    const download = await checkout.downloadOrder();
    expect(download.suggestedFilename()).toMatch(/^[\w.-]+\.pdf$/i);
    const filePath = await download.path();
    expect(filePath).not.toBeNull();
    const content = await readFile(filePath!);
    expect(content.length).toBeGreaterThan(100);
    expect(content.subarray(0, 4).toString()).toBe('%PDF');
  });
});
