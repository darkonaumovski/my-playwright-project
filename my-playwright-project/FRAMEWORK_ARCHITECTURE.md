# Playwright framework architecture

## Review findings

The original framework had one fixture module and four distinct Page Object classes, rather than duplicate class definitions. Duplication was in how those objects were created and bypassed:

| Before | Refactor |
| --- | --- |
| Seven suites requested a void login fixture through repetitive beforeEach hooks | Authenticated suites import authenticatedTest; login runs once per test |
| Five suites stored Page Objects in mutable describe-scope variables | Lazy, test-scoped Page Object fixtures |
| Login navigation/submission/readiness repeated in fixtures and two local helpers | LoginPage.signIn owns the successful-login sequence |
| Tests repeated menu, cart badge, product detail and checkout selectors | ShopHeader, ProductDetailsPage and expanded existing Page Objects |
| Product catalogue and demo account data repeated across tests | Shared readonly test-data modules |
| Two PDF tests independently coordinated download events | CheckoutPage.downloadOrder registers the event before clicking |

The inventory smoke test in users.spec.ts overlaps with the catalogue test. It remains in place to preserve the existing test inventory.

## Structure

```text
fixtures.ts                  Test-scoped object construction and authentication
pages/
  LoginPage.ts               Raw login controls and successful sign-in
  InventoryPage.ts           Catalogue, sorting and product actions
  ProductDetailsPage.ts      Detail-page controls
  CartPage.ts                Cart navigation and actions
  CheckoutPage.ts            Information, overview and completion actions
  components/ShopHeader.ts   Shared menu and cart controls
test-data/
  products.ts                Product identity and expected prices
  users.ts                   Public demo password and accepted accounts
tests/                       Scenarios and business assertions
playwright.config.ts         Browser projects, URL and execution settings
```

Page Objects use composition for shared controls. InventoryPage delegates its existing cart accessors to ShopHeader. A generic BasePage is unnecessary for this framework: the pages have different responsibilities, and sharing a Page constructor alone does not justify inheritance.

## Writing tests

Use the authenticated export for ordinary shopping scenarios:

```typescript
import { authenticatedTest as test, expect } from '../fixtures';

test('adds a product to the cart', async ({ inventory, cart, header }) => {
  await inventory.addProduct('sauce-labs-backpack');
  await header.openCart();
  await expect(cart.cartItems).toHaveCount(1);
});
```

Use the guest export for login, protected-route and explicit account scenarios:

```typescript
import { test, expect } from '../fixtures';
import { demoPassword } from '../test-data/users';

test('shows the locked-account error', async ({ login }) => {
  await login.goto();
  await login.login('locked_out_user', demoPassword);
  await expect(login.errorMessage).toContainText('locked out');
});
```

Constructing or requesting a Page Object does not navigate. The guest export only logs in if a test explicitly requests loggedInPage. The authenticated export activates that same fixture automatically. Playwright resolves its dependencies once per test, so requesting loggedInPage as well does not log in twice.

Authenticated credentials retain the TEST_USERNAME and TEST_PASSWORD environment defaults and can be overridden with test.use({ credentials: { username, password } }). Seeded-account tests continue to select their exact public demo credentials explicitly.

All objects use the test's isolated page/context. The two-context isolation scenario deliberately constructs objects for its own pages and closes both contexts in finally. No shared storage state or worker-level login was introduced, preserving cart isolation and UI login coverage.

Keep business expectations in tests; reuse Page Object locators and actions. Direct page access remains appropriate for route assertions, viewport inspection, keyboard focus and scoped product-row checks. Keep checkout validation fields individually accessible. enterInformation fills without submitting; the existing fillInformation method still fills and submits.

## Compatibility

Existing Page Object class names, constructors and methods remain available. In particular, InventoryPage.addProductToCart still accepts a full test ID, while the new addProduct accepts a product slug. LoginPage.login still only submits the current form. The original loggedInPage fixture remains supported.

All 63 scenarios and both browser projects are retained, for 126 executions. No test was removed, skipped or marked as an expected failure; assertions and account-specific expectations were preserved. The refactor does not change dependencies, browser configuration, retries or timeouts.

## Validation

Executed on 2026-09-05 against https://www.saucedemo.com:

- `npm run typecheck`: passed.
- `tsc --noEmit --noUnusedLocals --noUnusedParameters`: passed.
- Full suite with four workers: **126 passed (1.5 minutes)**, 63 each in Chromium and Firefox, with no retries or skips.
- Before/after discovery: identical test names and browser projects (126 executions).
- All existing assertion matchers and expected arguments preserved across the 11 spec files.
- `git diff --check`: passed.

HTML report: [Refactor test run](playwright-report/refactor/index.html). This uses a separate output folder so the existing tracked report is not overwritten. The report is generated output and remains ignored by Git.

The migration exposed a missing fixture parameter during TypeScript validation; it was corrected before the browser run. No browser-test failures remained.
