import { expect, test } from "../fixtures";
import { demoPassword } from "../test-data/users";

test.describe("Seeded-user regression coverage", () => {
  test("problem_user exposes the current broken-image defect consistently", async ({
    page,
    login,
  }) => {
    await login.signIn("problem_user", demoPassword);
    const sources = await page
      .locator('[data-test="inventory-item"] img')
      .evaluateAll((images) =>
        images.map((image) => image.getAttribute("src")),
      );
    expect(sources).toHaveLength(6);
    expect(new Set(sources).size).toBe(1);
    expect(sources[0]).toContain("sl-404");
  });

  test("visual_user exposes the current list/detail price inconsistency", async ({
    login,
    inventory,
    productDetails,
  }) => {
    await login.signIn("visual_user", demoPassword);
    const backpack = inventory.items.filter({ hasText: "Sauce Labs Backpack" });
    const listPriceLocator = backpack.getByTestId("inventory-item-price");
    await expect(listPriceLocator).toHaveText(/^\$\d+(?:\.\d{1,2})?$/);
    // The value must be captured before navigation because the shared locator resolves against the new page afterward.
    const listPrice = await listPriceLocator.innerText();
    await inventory.openProduct(4);
    await expect(productDetails.price).toHaveText("$29.99");
    // eslint-disable-next-line playwright/prefer-web-first-assertions
    expect(listPrice).not.toBe("$29.99");
  });

  for (const [slug, shouldAdd] of [
    ["sauce-labs-backpack", true],
    ["sauce-labs-bike-light", true],
    ["sauce-labs-bolt-t-shirt", false],
    ["sauce-labs-fleece-jacket", false],
    ["sauce-labs-onesie", true],
    ["test.allthethings()-t-shirt-(red)", false],
  ] as const) {
    test(`error_user add-to-cart behavior for ${slug}`, async ({
      login,
      inventory,
      header,
    }) => {
      await login.signIn("error_user", demoPassword);
      await inventory.addProduct(slug);
      await expect(inventory.removeButton(slug)).toHaveCount(shouldAdd ? 1 : 0);
      await expect(header.cartBadge).toHaveCount(shouldAdd ? 1 : 0);
    });
  }

  test("performance_glitch_user eventually reaches a usable inventory page", async ({
    login,
    inventory,
  }) => {
    test.setTimeout(60_000);
    await login.signIn("performance_glitch_user", demoPassword);
    await expect(inventory.inventoryList).toBeVisible();
    await expect(inventory.items).toHaveCount(6);
  });
});
