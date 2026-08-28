import { expect, Page } from '@playwright/test';
export class InventoryPage {
  constructor(private readonly page: Page) {}
  readonly products = this.page.getByText('Products');
  readonly inventoryList = this.page.getByTestId('inventory-list');
  readonly cartLink = this.page.getByTestId('shopping-cart-link');
  async expectLoaded() { await expect(this.products).toBeVisible(); await expect(this.inventoryList).toBeVisible(); }
  async addProductToCart(productTestId: string) { await this.page.getByTestId(productTestId).click(); }
  async openCart() { await this.cartLink.click(); }
}
