import { expect, Page, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

async function login(page: Page, username: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, 'secret_sauce');
  await loginPage.expectLoggedIn();
}

test.describe('Seeded-user regression coverage', () => {
  test('problem_user exposes the current broken-image defect consistently', async ({ page }) => {
    await login(page, 'problem_user');
    const sources = await page.locator('[data-test="inventory-item"] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    expect(sources).toHaveLength(6);
    expect(new Set(sources).size).toBe(1);
    expect(sources[0]).toContain('sl-404');
  });

  test('visual_user exposes the current list/detail price inconsistency', async ({ page }) => {
    await login(page, 'visual_user');
    const listPrice = await page.getByTestId('inventory-item').first().getByTestId('inventory-item-price').innerText();
    await page.getByTestId('item-4-title-link').click();
    const detailPrice = await page.getByTestId('inventory-item-price').innerText();
    expect(listPrice).toMatch(/^\$\d+(?:\.\d{1,2})?$/);
    expect(detailPrice).toBe('$29.99');
    expect(listPrice).not.toBe(detailPrice);
  });

  for (const [slug, shouldAdd] of [
    ['sauce-labs-backpack', true],
    ['sauce-labs-bike-light', true],
    ['sauce-labs-bolt-t-shirt', false],
    ['sauce-labs-fleece-jacket', false],
    ['sauce-labs-onesie', true],
    ['test.allthethings()-t-shirt-(red)', false]
  ] as const) {
    test(`error_user add-to-cart behavior for ${slug}`, async ({ page }) => {
      await login(page, 'error_user');
      await page.getByTestId(`add-to-cart-${slug}`).click();
      const removeButton = page.getByTestId(`remove-${slug}`);
      if (shouldAdd) {
        await expect(removeButton).toBeVisible();
        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      } else {
        await expect(removeButton).toHaveCount(0);
        await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
      }
    });
  }

  test('performance_glitch_user eventually reaches a usable inventory page', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, 'performance_glitch_user');
    await expect(page.getByTestId('inventory-list')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
  });
});
