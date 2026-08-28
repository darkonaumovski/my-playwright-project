# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: users.spec.ts >> user can view inventory
- Location: tests\users.spec.ts:4:5

# Error details

```
Test timeout of 30000ms exceeded while setting up "loggedInPage".
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('username')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Swag Labs
  - generic [ref=e5]:
    - generic [ref=e9]:
      - textbox "Username" [ref=e11]
      - textbox "Password" [ref=e13]
      - button "Login" [ref=e15] [cursor=pointer]
    - generic [ref=e17]:
      - generic [ref=e18]:
        - heading "Accepted usernames are:" [level=4] [ref=e19]
        - text: standard_userlocked_out_userproblem_userperformance_glitch_usererror_uservisual_user
      - generic [ref=e20]:
        - heading "Password for all users:" [level=4] [ref=e21]
        - text: secret_sauce
```

# Test source

```ts
  1  | import { expect, Page } from '@playwright/test';
  2  | 
  3  | export class LoginPage {
  4  |   constructor(private readonly page: Page) {}
  5  |   readonly username = this.page.getByTestId('username');
  6  |   readonly password = this.page.getByTestId('password');
  7  |   readonly loginButton = this.page.getByTestId('login-button');
  8  |   async goto() { await this.page.goto('/'); }
  9  |   async login(username: string, password: string) {
> 10 |     await this.username.fill(username);
     |                         ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  11 |     await this.password.fill(password);
  12 |     await this.loginButton.click();
  13 |   }
  14 |   async expectLoggedIn() { await expect(this.page).toHaveURL(/inventory/); }
  15 | }
  16 | 
```