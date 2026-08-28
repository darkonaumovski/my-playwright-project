import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}
  readonly username = this.page.getByTestId('username');
  readonly password = this.page.getByTestId('password');
  readonly loginButton = this.page.getByTestId('login-button');
  async goto() { await this.page.goto('/'); }
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
  async expectLoggedIn() { await expect(this.page).toHaveURL(/inventory/); }
}
