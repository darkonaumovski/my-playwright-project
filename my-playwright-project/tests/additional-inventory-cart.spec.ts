import { authenticatedTest as test, expect } from "../fixtures";
import { products } from "../test-data/products";

test.describe("Additional inventory and cart coverage", () => {
  test("keeps product identity paired through every sort order", async ({
    inventory,
  }) => {
    const expectedOrders = {
      az: products,
      za: [...products].reverse(),
      lohi: [
        products[4],
        products[1],
        products[2],
        products[5],
        products[0],
        products[3],
      ],
      hilo: [
        products[3],
        products[0],
        products[2],
        products[5],
        products[1],
        products[4],
      ],
    } as const;

    for (const [sort, expected] of Object.entries(expectedOrders)) {
      await inventory.sortSelect.selectOption(sort);
      await expect(inventory.sortSelect).toHaveValue(sort);
      await expect(inventory.items).toHaveCount(expected.length);
      const cards = await inventory.items.all();

      for (let index = 0; index < expected.length; index += 1) {
        await expect(
          cards[index].getByTestId("inventory-item-name"),
        ).toHaveText(expected[index].name);
        await expect(
          cards[index].getByTestId("inventory-item-price"),
        ).toHaveText(expected[index].price);
        await expect(cards[index].locator("img")).toHaveAttribute(
          "alt",
          expected[index].name,
        );
      }
    }
  });

  test("opens the matching detail page from image and title for every product", async ({
    page,
    inventory,
    productDetails,
  }) => {
    for (const product of products) {
      await inventory.goto();
      await inventory.openProduct(product.id, "img");
      await expect(page).toHaveURL(
        new RegExp(`inventory-item\\.html\\?id=${product.id}`),
      );
      await expect(productDetails.name).toHaveText(product.name);
      await expect(productDetails.price).toHaveText(product.price);
      await productDetails.backToProducts();

      await inventory.openProduct(product.id);
      await expect(page).toHaveURL(
        new RegExp(`inventory-item\\.html\\?id=${product.id}`),
      );
      await expect(productDetails.name).toHaveText(product.name);
      await expect(productDetails.price).toHaveText(product.price);
    }
  });

  test("prevents duplicate cart entries after repeated add attempts", async ({
    page,
    inventory,
    cart,
    header,
  }) => {
    const addButton = inventory.addButton("sauce-labs-backpack");
    await addButton.click();
    await expect(header.cartBadge).toHaveText("1");
    await expect(inventory.removeButton("sauce-labs-backpack")).toBeVisible();

    await inventory.removeProduct("sauce-labs-backpack");
    await inventory.addProduct("sauce-labs-backpack");
    await cart.goto();
    await expect(cart.cartItems).toHaveCount(1);
    await expect(
      page.getByText("Sauce Labs Backpack", { exact: true }),
    ).toBeVisible();
  });

  test("maintains cart row accuracy while removing middle and final items", async ({
    page,
    inventory,
    cart,
    header,
  }) => {
    for (const product of products.slice(0, 3)) {
      await inventory.addProduct(product.slug);
    }
    await cart.goto();
    await expect(cart.cartItems).toHaveCount(3);
    await expect(header.cartBadge).toHaveText("3");

    for (const product of products.slice(0, 3)) {
      const row = cart.cartItems.filter({ hasText: product.name });
      await expect(row.getByTestId(`remove-${product.slug}`)).toBeVisible();
    }

    await cart.removeProduct("sauce-labs-bike-light");
    await expect(cart.cartItems).toHaveCount(2);
    await expect(header.cartBadge).toHaveText("2");
    await expect(
      page.getByText("Sauce Labs Bike Light", { exact: true }),
    ).toHaveCount(0);

    await cart.removeProduct("sauce-labs-backpack");
    await cart.removeProduct("sauce-labs-bolt-t-shirt");
    await expect(cart.cartItems).toHaveCount(0);
    await expect(header.cartBadge).toHaveCount(0);
  });

  test("refreshes stale product actions after Reset App State", async ({
    page,
    inventory,
    header,
  }) => {
    await inventory.addProduct("sauce-labs-backpack");
    await header.openMenu();
    await header.resetAppState();
    await expect(header.cartBadge).toHaveCount(0);

    await page.reload();
    await expect(inventory.addButton("sauce-labs-backpack")).toBeVisible();
    await expect(inventory.removeButton("sauce-labs-backpack")).toHaveCount(0);
  });

  test("opens a cart item detail page with the correct Remove state", async ({
    page,
    inventory,
    cart,
    productDetails,
    header,
  }) => {
    await inventory.addProduct("sauce-labs-backpack");
    await cart.goto();
    await cart.openProduct("Sauce Labs Backpack");
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(productDetails.removeButton).toBeVisible();
    await productDetails.backToProducts();
    await expect(header.cartBadge).toHaveText("1");
  });
});
