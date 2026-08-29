import { expect, Page } from '@playwright/test';
export class InventoryPage {
  constructor(private readonly page: Page) {}
  get products() { return this.page.getByText('Products'); }
  get inventoryList() { return this.page.getByTestId('inventory-list'); }
  get cartLink() { return this.page.getByTestId('shopping-cart-link'); }
  get cartBadge() { return this.page.getByTestId('shopping-cart-badge'); }
  get sortSelect() { return this.page.getByTestId('product-sort-container'); }
  get itemNames() { return this.page.getByTestId('inventory-item-name'); }
  async expectLoaded() { await expect(this.products).toBeVisible(); await expect(this.inventoryList).toBeVisible(); }
  async addProductToCart(productTestId: string) { await this.page.getByTestId(productTestId).click(); }
  async openCart() { await this.cartLink.click(); }
  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') { await this.sortSelect.selectOption(value); }
  async openProduct(productId: number) { await this.page.getByTestId(`item-${productId}-title-link`).click(); }
}
