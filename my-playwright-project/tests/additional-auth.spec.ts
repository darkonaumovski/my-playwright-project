import { expect, test } from "../fixtures";
import { demoPassword as password } from "../test-data/users";

test.describe("Additional authentication coverage", () => {
  test("guards every protected route when logged out", async ({
    page,
    login,
  }) => {
    const protectedRoutes = [
      "/inventory.html",
      "/inventory-item.html?id=4",
      "/cart.html",
      "/checkout-step-one.html",
      "/checkout-step-two.html",
      "/checkout-complete.html",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/$/);
      await expect(login.errorMessage).toContainText(
        `You can only access '${route.split("?")[0]}' when you are logged in`,
      );
    }
  });

  test("dismisses a login error and clears it after a successful retry", async ({
    page,
    login,
  }) => {
    await login.goto();
    await login.login("unknown_user", password);
    await expect(login.errorMessage).toBeVisible();

    await login.dismissErrorButton.click();
    await expect(login.errorMessage).toHaveCount(0);

    await login.login("standard_user", password);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(login.errorMessage).toHaveCount(0);
  });

  test("supports keyboard login and masks the password", async ({
    page,
    login,
  }) => {
    await login.goto();

    await login.username.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("id", "password");
    await expect(login.password).toHaveAttribute("type", "password");

    await login.password.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("id", "login-button");
    await login.username.fill("standard_user");
    await login.password.fill(password);
    await login.password.press("Enter");
    await expect(page).toHaveURL(/inventory\.html/);
  });

  for (const value of [
    "   ",
    "standard_user_extra_long_value_".repeat(10),
    "<script>alert(1)</script>",
    "user/name?x=1",
  ]) {
    test(`handles unusual username input safely: ${value.slice(0, 18)}`, async ({
      page,
      login,
    }) => {
      await login.goto();
      await login.login(value, password);
      await expect(login.errorMessage).toContainText(
        "Username and password do not match any user",
      );
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("body")).not.toContainText(
        "<script>alert(1)</script>",
      );
    });
  }
});
