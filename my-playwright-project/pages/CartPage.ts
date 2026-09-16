import type { Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  get checkoutButton() {
    return this.page.getByRole("button", { name: "Checkout" });
  }

  get continueShoppingButton() {
    return this.page.getByRole("button", { name: "Continue Shopping" });
  }

  get cartItems() {
    return this.page.getByTestId("inventory-item");
  }

  productLink(name: string) {
    return this.page.getByRole("button", {
      name: `View details for ${name}`,
      exact: true,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/cart.html");
  }

  async openProduct(name: string): Promise<void> {
    await this.productLink(name).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async removeProduct(productSlug: string): Promise<void> {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
