import { authenticatedTest as test, expect } from "../fixtures";

test.describe("Inventory", () => {
  test("user can view inventory", async ({ inventory }) => {
    await expect(inventory.products).toBeVisible();
    await expect(inventory.inventoryList).toBeVisible();
  });
});
