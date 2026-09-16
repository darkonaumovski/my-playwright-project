# SauceDemo Playwright test automation

Maintainable end-to-end coverage for [SauceDemo](https://www.saucedemo.com) using Playwright and strict TypeScript. The suite covers authentication, inventory, product details, carts, checkout, navigation, responsive behavior, downloads, and the application's seeded defect accounts in Chromium and Firefox.

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

```bash
npm ci
npx playwright install
```

Linux CI runners may also need operating-system packages:

```bash
npx playwright install --with-deps
```

The framework has safe SauceDemo defaults. For local overrides, copy `.env.example` to `.env` and replace the placeholder values. `.env` is ignored by Git and loaded automatically; never commit private credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run every test in Chromium and Firefox |
| `npm run test:chromium` | Run the complete suite in Chromium only |
| `npm run test:smoke` | Run scenarios tagged `@smoke` |
| `npm run test:headed` | Run with visible browser windows |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run typecheck` | Run strict TypeScript validation without emitting files |
| `npm run lint` | Run typed TypeScript and Playwright lint rules |
| `npm run format` | Check TypeScript and JSON formatting |
| `npm run format:fix` | Apply formatting fixes |
| `npm run check` | Run formatting, linting, type checking, and test discovery |

Useful focused commands:

```bash
npx playwright test tests/checkout.spec.ts --project=chromium
npx playwright test -g "user can complete checkout"
npx playwright show-report
```

## Environment configuration

Runtime values are parsed and validated in `config/environment.ts`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `https://www.saucedemo.com` | Application URL; must use HTTP or HTTPS |
| `TEST_USERNAME` | `standard_user` | Account used by authenticated fixtures |
| `TEST_PASSWORD` | SauceDemo's public demo password | Password used by authenticated fixtures |
| `CI` | unset | Values `1`, `true`, or `yes` enable CI behavior |
| `CI_WORKERS` | Playwright default | Optional positive worker count |

CI mode rejects focused tests and enables two retries. Retries remain disabled locally. Worker count is configurable instead of being forced to one, so the same configuration works on small and large runners.

## Structure

```text
.
|-- config/
|   `-- environment.ts         # Validated runtime settings; no secrets logged
|-- fixtures/
|   `-- index.ts               # Typed test-scoped objects and authenticated test export
|-- pages/
|   |-- components/
|   |   `-- ShopHeader.ts      # Shared menu and cart header controls
|   |-- LoginPage.ts
|   |-- InventoryPage.ts
|   |-- ProductDetailsPage.ts
|   |-- CartPage.ts
|   `-- CheckoutPage.ts
|-- test-data/
|   |-- checkout.ts            # Shared checkout input
|   |-- products.ts            # Read-only catalogue expectations
|   `-- users.ts               # Public SauceDemo account data
|-- tests/                     # Behavior-focused specifications
|-- eslint.config.mjs          # Typed TypeScript and Playwright linting
|-- playwright.config.ts       # Projects, reporters, retries, and artifacts
`-- tsconfig.json              # Strict compiler settings
```

The repository is small enough that separate `api/`, `builders/`, `constants/`, and `types/` folders would add ceremony without demonstrated reuse. Add them only when a real service client or shared domain model appears.

## Fixtures and page objects

Import `authenticatedTest` for scenarios that start on the inventory page:

```typescript
import { authenticatedTest as test, expect } from "../fixtures";

test("adds an item", async ({ inventory, header }) => {
  await inventory.addProduct("sauce-labs-backpack");
  await expect(header.cartBadge).toHaveText("1");
});
```

Import `test` for login, guest-route, and explicit seeded-account coverage. Page-object actions do not contain test assertions. Tests own business expectations, while `LoginPage.signIn` uses a targeted URL wait so an authenticated fixture is ready before use.

Selectors prefer roles and placeholders. SauceDemo's stable `data-test` values remain appropriate where controls have no useful accessible name or where a product-specific action must be unique.

## API and network testing

SauceDemo does not expose a documented application API in this repository. Creating an `APIRequestContext` client or mocked endpoint would test an invented contract, so no `api/` layer or interception suite is included. If the application later gains a supported service API:

- create focused clients under `api/<domain>/` using a fixture-provided `APIRequestContext`;
- type the important request and response contracts;
- register precise `page.route()` handlers before the triggering action;
- keep mocked UI, API integration, and full E2E suites explicitly separated; and
- unroute temporary handlers after each scenario.

## Reports and debugging

Playwright writes artifacts to `test-results/` and the HTML report to `playwright-report/`; both are ignored. Failed attempts retain traces, screenshots, and videos.

```bash
npx playwright show-report
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## CI integration

No CI provider configuration exists in this repository. A provider job should run `npm ci`, install the required Playwright browsers, execute `npm run check`, then run the desired test command. Upload `playwright-report/` and `test-results/` when the test step fails. Do not use unconditional-success flags. Set `CI_WORKERS` or Playwright sharding according to runner capacity.

## Adding coverage

- Keep tests isolated and parallel-safe.
- Use the base `test` export unless authentication is truly a precondition.
- Add business actions to the responsible page or component, not to a generic base page.
- Keep assertions in specifications.
- Prefer web-first assertions and event-specific waits; do not add fixed sleeps.
- Add shared static expectations only after real duplication appears.

See [FRAMEWORK_ARCHITECTURE.md](FRAMEWORK_ARCHITECTURE.md) for the assessment and architectural rationale, and [TEST_EXECUTION_REPORT.md](TEST_EXECUTION_REPORT.md) for the latest validation status.
