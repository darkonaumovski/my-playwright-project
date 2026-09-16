# SauceDemo Playwright Test Automation

End-to-end test framework for [SauceDemo](https://www.saucedemo.com), built with Playwright and TypeScript. The suite exercises authentication, inventory, product details, cart behavior, checkout, shared navigation, seeded demo-user behavior, responsive layout, and browser-context isolation in Chromium and Firefox.

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

```bash
npm ci
npx playwright install
```

Playwright's Linux system dependencies may also be required in a fresh CI environment:

```bash
npx playwright install --with-deps
```

## Running the tests

```bash
# Run the complete suite in Chromium and Firefox
npm test

# Run with visible browser windows
npm run test:headed

# Open Playwright's interactive UI
npm run test:ui

# Type-check the framework without emitting files
npm run typecheck
```

Useful Playwright commands:

```bash
# Run one spec file
npx playwright test tests/checkout.spec.ts

# Run one browser project
npx playwright test --project=chromium

# Run tests whose title matches a phrase
npx playwright test -g "user can complete checkout"

# Open the latest HTML report
npx playwright show-report
```

## Configuration

The suite uses `https://www.saucedemo.com` and the public `standard_user` account by default. Override these values through environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `https://www.saucedemo.com` | Application under test |
| `TEST_USERNAME` | `standard_user` | Default authenticated-test account |
| `TEST_PASSWORD` | `secret_sauce` | Default authenticated-test password |
| `CI` | unset | Enables two retries, one worker, dot + HTML reporters, and rejects focused tests |

PowerShell example:

```powershell
$env:BASE_URL = 'https://www.saucedemo.com'
$env:TEST_USERNAME = 'standard_user'
$env:TEST_PASSWORD = 'secret_sauce'
npm test
```

Do not commit private credentials. SauceDemo's credentials in this repository are public test data supplied by the demo application.

## Project structure

```text
.
|-- fixtures.ts                 # Test-scoped page objects and login fixtures
|-- pages/                      # Page Object Models
|   |-- components/ShopHeader.ts
|   |-- LoginPage.ts
|   |-- InventoryPage.ts
|   |-- ProductDetailsPage.ts
|   |-- CartPage.ts
|   `-- CheckoutPage.ts
|-- test-data/                  # Shared users and product expectations
|-- tests/                      # Playwright scenarios
|-- playwright.config.ts        # Browser, reporter, artifact, and CI settings
`-- tsconfig.json               # Strict TypeScript configuration
```

Page objects contain reusable selectors and interactions. Business expectations stay in the tests. All fixtures are test-scoped, so each test receives an isolated browser page and fresh object instances.

## Fixtures

Use `authenticatedTest` for shopping flows that should start on the inventory page:

```typescript
import { authenticatedTest as test, expect } from '../fixtures';

test('adds an item', async ({ inventory, cart, header }) => {
  await inventory.addProduct('sauce-labs-backpack');
  await header.openCart();
  await expect(cart.cartItems).toHaveCount(1);
});
```

Use the regular `test` export for login, logged-out, or explicit seeded-account scenarios:

```typescript
import { test, expect } from '../fixtures';

test('shows a required username error', async ({ login }) => {
  await login.goto();
  await login.login('', '');
  await expect(login.errorMessage).toContainText('Username is required');
});
```

Available fixtures are `login`, `inventory`, `productDetails`, `cart`, `checkout`, `header`, `loggedInPage`, and configurable `credentials`.

## Coverage

The suite includes:

- Valid, invalid, locked, unusual-input, keyboard, and protected-route authentication cases
- Complete product catalogue, sorting, detail-page, add/remove, and duplicate-item checks
- Empty, single-item, and multi-item cart behavior and navigation
- Checkout validation, totals, cancellation, completion, idempotency, and PDF download checks
- Menu, logout, reset-state, external-link, responsive-layout, and session-isolation checks
- Regression coverage for SauceDemo's `problem_user`, `visual_user`, `error_user`, and `performance_glitch_user` seeded behaviors
- Desktop Chrome and Desktop Firefox projects

Some seeded accounts intentionally expose defects in SauceDemo. Their tests document the current demo behavior; they are not interchangeable with the standard happy-path account.

## Reports and debugging artifacts

The local reporter generates an HTML report in `playwright-report/`. On failure Playwright retains screenshots and videos; traces are captured on the first retry. Test artifacts are written beneath `test-results/`.

```bash
npx playwright show-report
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Adding tests

- Prefer `data-test` selectors; the configuration maps Playwright test IDs to that attribute.
- Add shared product or user expectations to `test-data/` instead of duplicating literals.
- Put reusable page interactions in the relevant page object or shared component.
- Keep assertions describing business behavior in spec files.
- Use `authenticatedTest` only when automatic login is part of the test precondition.
- Keep each scenario isolated and safe for parallel execution.

## Reference documentation

- [Framework architecture](FRAMEWORK_ARCHITECTURE.md)
- [QA test catalogue](QA_TEST_CATALOG.md)
- [Additional test scenarios](ADDITIONAL_TEST_SCENARIOS.md)
- [Test execution report](TEST_EXECUTION_REPORT.md)
