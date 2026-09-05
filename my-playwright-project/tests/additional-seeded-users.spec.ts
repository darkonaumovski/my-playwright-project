import { expect, test } from '../fixtures';
import { demoPassword } from '../test-data/users';

test.describe('Seeded-user regression coverage', () => {
  test('problem_user exposes the current broken-image defect consistently', async ({ page, login }) => {
    await login.signIn('problem_user', demoPassword);
    const sources = await page.locator('[data-test="inventory-item"] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    expect(sources).toHaveLength(6);
    expect(new Set(sources).size).toBe(1);
    expect(sources[0]).toContain('sl-404');
  });

  test('visual_user exposes the current list/detail price inconsistency', async ({ login, inventory, productDetails }) => {
    await login.signIn('visual_user', demoPassword);
    const listPrice = await inventory.items.first().getByTestId('inventory-item-price').innerText();
    await inventory.openProduct(4);
    const detailPrice = await productDetails.price.innerText();
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
    test(`error_user add-to-cart behavior for ${slug}`, async ({ login, inventory, header }) => {
      await login.signIn('error_user', demoPassword);
      await inventory.addProduct(slug);
      const removeButton = inventory.removeButton(slug);
      if (shouldAdd) {
        await expect(removeButton).toBeVisible();
        await expect(header.cartBadge).toHaveText('1');
      } else {
        await expect(removeButton).toHaveCount(0);
        await expect(header.cartBadge).toHaveCount(0);
      }
    });
  }

  test('performance_glitch_user eventually reaches a usable inventory page', async ({ login, inventory }) => {
    test.setTimeout(60_000);
    await login.signIn('performance_glitch_user', demoPassword);
    await expect(inventory.inventoryList).toBeVisible();
    await expect(inventory.items).toHaveCount(6);
  });
});
