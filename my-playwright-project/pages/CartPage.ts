import { expect, Page } from '@playwright/test';
export class CartPage {
  constructor(private readonly page: Page) {}
  get checkoutButton() { return this.page.getByTestId('checkout'); }
  async expectProductVisible(name: string) { await expect(this.page.getByText(name)).toBeVisible(); }
  async checkout() { await this.checkoutButton.click(); }
}
