import type { Page } from "@playwright/test";

export class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  get name() {
    return this.page.getByTestId("inventory-item-name");
  }

  get price() {
    return this.page.getByTestId("inventory-item-price");
  }

  get addButton() {
    return this.page.getByRole("button", { name: "Add to cart" });
  }

  get removeButton() {
    return this.page.getByRole("button", { name: "Remove" });
  }

  get backButton() {
    return this.page.getByRole("button", { name: "Back to products" });
  }

  async addToCart(): Promise<void> {
    await this.addButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
