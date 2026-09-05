import type { Page } from '@playwright/test';

export class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  get name() { return this.page.getByTestId('inventory-item-name'); }
  get price() { return this.page.getByTestId('inventory-item-price'); }
  get addButton() { return this.page.getByTestId('add-to-cart'); }
  get removeButton() { return this.page.getByTestId('remove'); }
  get backButton() { return this.page.getByTestId('back-to-products'); }

  async addToCart() { await this.addButton.click(); }
  async backToProducts() { await this.backButton.click(); }
}
