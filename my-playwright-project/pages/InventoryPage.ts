import { expect, Page } from '@playwright/test';
import { ShopHeader } from './components/ShopHeader';

export class InventoryPage {
  constructor(private readonly page: Page, readonly header = new ShopHeader(page)) {}
  get products() { return this.page.getByText('Products'); }
  get inventoryList() { return this.page.getByTestId('inventory-list'); }
  get cartLink() { return this.header.cartLink; }
  get cartBadge() { return this.header.cartBadge; }
  get sortSelect() { return this.page.getByTestId('product-sort-container'); }
  get itemNames() { return this.page.getByTestId('inventory-item-name'); }
  get items() { return this.page.getByTestId('inventory-item'); }
  addButton(slug: string) { return this.page.getByTestId('add-to-cart-' + slug); }
  removeButton(slug: string) { return this.page.getByTestId('remove-' + slug); }
  async goto() { await this.page.goto('/inventory.html'); }
  async addProduct(slug: string) { await this.addButton(slug).click(); }
  async removeProduct(slug: string) { await this.removeButton(slug).click(); }
  async expectLoaded() { await expect(this.products).toBeVisible(); await expect(this.inventoryList).toBeVisible(); }
  async addProductToCart(productTestId: string) { await this.page.getByTestId(productTestId).click(); }
  async openCart() { await this.header.openCart(); }
  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') { await this.sortSelect.selectOption(value); }
  async openProduct(productId: number, via: 'title' | 'img' = 'title') { await this.page.getByTestId(`item-${productId}-${via}-link`).click(); }
}
