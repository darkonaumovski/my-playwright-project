import { expect, Page } from '@playwright/test';
export class CartPage {
  constructor(private readonly page: Page) {}
  get checkoutButton() { return this.page.getByTestId('checkout'); }
  get continueShoppingButton() { return this.page.getByTestId('continue-shopping'); }
  get cartItems() { return this.page.getByTestId('inventory-item'); }
  async expectProductVisible(name: string) { await expect(this.page.getByText(name)).toBeVisible(); }
  async checkout() { await this.checkoutButton.click(); }
  async removeProduct(productSlug: string) { await this.page.getByTestId(`remove-${productSlug}`).click(); }
  async continueShopping() { await this.continueShoppingButton.click(); }
}
