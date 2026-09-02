import { expect, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { test } from '../fixtures';

async function addBackpackAndOpenCheckout(page: Page) {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('checkout').click();
}

test.describe('Additional checkout coverage', () => {
  test.beforeEach(async ({ loggedInPage }) => { void loggedInPage; });

  test('calculates multi-item subtotal, tax, and total numerically', async ({ page }) => {
    for (const slug of [
      'sauce-labs-backpack',
      'sauce-labs-bike-light',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-fleece-jacket',
      'sauce-labs-onesie',
      'test.allthethings()-t-shirt-(red)'
    ]) {
      await page.getByTestId(`add-to-cart-${slug}`).click();
    }
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('Test');
    await page.getByTestId('lastName').fill('User');
    await page.getByTestId('postalCode').fill('00-001');
    await page.getByTestId('continue').click();

    const currency = (text: string) => Number(text.replace(/[^\d.]/g, ''));
    const prices = await page.getByTestId('inventory-item-price').allTextContents();
    const subtotal = prices.reduce((sum, price) => sum + currency(price), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const shownSubtotal = currency(await page.getByTestId('subtotal-label').innerText());
    const shownTax = currency(await page.getByTestId('tax-label').innerText());
    const shownTotal = currency(await page.getByTestId('total-label').innerText());

    expect(shownSubtotal).toBeCloseTo(subtotal, 2);
    expect(shownTax).toBeCloseTo(tax, 2);
    expect(shownTotal).toBeCloseTo(total, 2);
    expect(shownTotal).toBeCloseTo(shownSubtotal + shownTax, 2);
  });

  test('retains checkout information while validating required fields', async ({ page }) => {
    await addBackpackAndOpenCheckout(page);
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');

    await page.getByTestId('firstName').fill('Zoë');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Last Name is required');
    await expect(page.getByTestId('firstName')).toHaveValue('Zoë');

    await page.getByTestId('lastName').fill("O'Neil");
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
    await expect(page.getByTestId('firstName')).toHaveValue('Zoë');
    await expect(page.getByTestId('lastName')).toHaveValue("O'Neil");
  });

  test('handles whitespace-only checkout data according to current demo behavior', async ({ page }) => {
    await addBackpackAndOpenCheckout(page);
    await page.getByTestId('firstName').fill('   ');
    await page.getByTestId('lastName').fill('   ');
    await page.getByTestId('postalCode').fill('   ');
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('cancels checkout without losing the cart', async ({ page }) => {
    await addBackpackAndOpenCheckout(page);
    await page.getByTestId('firstName').fill('Test');
    await page.getByTestId('lastName').fill('User');
    await page.getByTestId('postalCode').fill('00-001');
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.getByTestId('inventory-item')).toHaveCount(1);

    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('Test');
    await page.getByTestId('lastName').fill('User');
    await page.getByTestId('postalCode').fill('00-001');
    await page.getByTestId('continue').click();
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  });

  test('keeps completion idempotent and the cart empty after returning home', async ({ page }) => {
    await addBackpackAndOpenCheckout(page);
    await page.getByTestId('firstName').fill('Test');
    await page.getByTestId('lastName').fill('User');
    await page.getByTestId('postalCode').fill('00-001');
    await page.getByTestId('continue').click();
    await page.getByTestId('finish').click();
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });

  test('downloads a non-empty PDF with a valid PDF signature', async ({ page }) => {
    await addBackpackAndOpenCheckout(page);
    await page.getByTestId('firstName').fill('Test');
    await page.getByTestId('lastName').fill('User');
    await page.getByTestId('postalCode').fill('00-001');
    await page.getByTestId('continue').click();
    await page.getByTestId('finish').click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('generate-pdf-order').click()
    ]);
    expect(download.suggestedFilename()).toMatch(/^[\w.-]+\.pdf$/i);
    const filePath = await download.path();
    expect(filePath).not.toBeNull();
    const content = await readFile(filePath!);
    expect(content.length).toBeGreaterThan(100);
    expect(content.subarray(0, 4).toString()).toBe('%PDF');
  });
});
