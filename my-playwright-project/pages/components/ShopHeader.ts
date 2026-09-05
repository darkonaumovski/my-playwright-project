import type { Page } from '@playwright/test';

export class ShopHeader {
  constructor(private readonly page: Page) {}

  get cartLink() { return this.page.getByTestId('shopping-cart-link'); }
  get cartBadge() { return this.page.getByTestId('shopping-cart-badge'); }
  get openMenuButton() { return this.page.getByRole('button', { name: 'Open Menu' }); }
  get closeMenuButton() { return this.page.getByRole('button', { name: 'Close Menu' }); }
  get navigation() { return this.page.getByRole('navigation'); }
  get allItemsLink() { return this.page.getByTestId('inventory-sidebar-link'); }
  get logoutLink() { return this.page.getByTestId('logout-sidebar-link'); }
  get resetLink() { return this.page.getByTestId('reset-sidebar-link'); }
  get aboutLink() { return this.page.getByTestId('about-sidebar-link'); }

  async openCart() { await this.cartLink.click(); }
  async openMenu() { await this.openMenuButton.click(); }
  async closeMenu() { await this.closeMenuButton.click(); }
  async resetAppState() { await this.resetLink.click(); }
  async logout() { await this.logoutLink.click(); }
}
