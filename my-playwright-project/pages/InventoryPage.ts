import type { Page } from "@playwright/test";
import { ShopHeader } from "./components/ShopHeader";

export class InventoryPage {
  constructor(
    private readonly page: Page,
    readonly header = new ShopHeader(page),
  ) {}

  get products() {
    return this.page.getByText("Products", { exact: true });
  }

  get inventoryList() {
    return this.page.getByTestId("inventory-list");
  }

  get sortSelect() {
    return this.page.getByTestId("product-sort-container");
  }

  get itemNames() {
    return this.page.getByTestId("inventory-item-name");
  }

  get items() {
    return this.page.getByTestId("inventory-item");
  }

  addButton(slug: string) {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  removeButton(slug: string) {
    return this.page.getByTestId(`remove-${slug}`);
  }

  async goto(): Promise<void> {
    await this.page.goto("/inventory.html");
  }

  async addProduct(slug: string): Promise<void> {
    await this.addButton(slug).click();
  }

  async removeProduct(slug: string): Promise<void> {
    await this.removeButton(slug).click();
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }

  async sortBy(value: "az" | "za" | "lohi" | "hilo"): Promise<void> {
    await this.sortSelect.selectOption(value);
  }

  async openProduct(
    productId: number,
    via: "title" | "img" = "title",
  ): Promise<void> {
    await this.page.getByTestId(`item-${productId}-${via}-link`).click();
    await this.page.getByRole("button", { name: "Back to products" }).waitFor();
  }
}
