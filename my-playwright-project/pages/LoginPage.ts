import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get username() { return this.page.getByTestId('username'); }
  get password() { return this.page.getByTestId('password'); }
  get loginButton() { return this.page.getByTestId('login-button'); }
  get dismissErrorButton() { return this.page.getByTestId('error-button'); }
  get errorMessage() { return this.page.getByTestId('error'); }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/inventory/);
  }

  async signIn(username: string, password: string) {
    await this.goto();
    await this.login(username, password);
    await this.expectLoggedIn();
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
