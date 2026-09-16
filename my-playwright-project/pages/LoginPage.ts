import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  get username() {
    return this.page.getByPlaceholder("Username");
  }

  get password() {
    return this.page.getByPlaceholder("Password");
  }

  get loginButton() {
    return this.page.getByRole("button", { name: "Login" });
  }

  get dismissErrorButton() {
    return this.page.getByTestId("error-button");
  }

  get errorMessage() {
    return this.page.getByTestId("error");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.goto();
    await this.login(username, password);
    await this.page.waitForURL("**/inventory.html");
  }
}
