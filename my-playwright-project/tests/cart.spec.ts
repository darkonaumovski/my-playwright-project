import { authenticatedTest as test, expect } from "../fixtures";

test.describe("Cart", () => {
  test(
    "shows an empty cart",
    { tag: ["@smoke", "@e2e"] },
    async ({ page, inventory, cart, header }) => {
      await inventory.openCart();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.getByText("Your Cart", { exact: true })).toBeVisible();
      await expect(cart.cartItems).toHaveCount(0);
      await expect(header.cartBadge).toHaveCount(0);
    },
  );

  test("keeps multiple selected products with an accurate badge", async ({
    inventory,
    cart,
    header,
  }) => {
    await inventory.addProduct("sauce-labs-backpack");
    await inventory.addProduct("sauce-labs-bike-light");
    await expect(header.cartBadge).toHaveText("2");
    await inventory.openCart();
    await expect(cart.cartItems).toHaveCount(2);
    await expect(cart.productLink("Sauce Labs Backpack")).toBeVisible();
    await expect(cart.productLink("Sauce Labs Bike Light")).toBeVisible();
  });

  test("removes an item from cart and clears the final cart badge", async ({
    inventory,
    cart,
    header,
  }) => {
    await inventory.addProduct("sauce-labs-backpack");
    await inventory.openCart();
    await cart.removeProduct("sauce-labs-backpack");
    await expect(cart.cartItems).toHaveCount(0);
    await expect(header.cartBadge).toHaveCount(0);
  });

  test("continues shopping while preserving the cart", async ({
    inventory,
    cart,
    header,
  }) => {
    await inventory.addProduct("sauce-labs-backpack");
    await inventory.openCart();
    await cart.continueShopping();
    await expect(header.cartBadge).toHaveText("1");
    await expect(inventory.products).toBeVisible();
  });
});
