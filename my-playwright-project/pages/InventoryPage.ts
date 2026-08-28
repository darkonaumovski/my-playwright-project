import { expect, Page } from '@playwright/test';
export class InventoryPage {
  constructor(private readonly page: Page) {}
  get products() { return this.page.getByText('Products'); }
  get inventoryList() { return this.page.getByTestId('inventory-list'); }
  get cartLink() { return this.page.getByTestId('shopping-cart-link'); }
  async expectLoaded() { await expect(this.products).toBeVisible(); await expect(this.inventoryList).toBeVisible(); }
  async addProductToCart(productTestId: string) { await this.page.getByTestId(productTestId).click(); }
  async openCart() { await this.cartLink.click(); }
}
