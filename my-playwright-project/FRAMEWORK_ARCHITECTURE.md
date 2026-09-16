# Playwright framework architecture

## Assessment

The repository already had useful page objects, a shared header component, test-scoped fixtures, strict TypeScript, parallel-safe browser contexts, and broad behavior coverage. A wholesale rewrite was not justified.

### Critical

- `node_modules`, the generated HTML report, and Playwright run state were committed. They are now untracked and covered by `.gitignore`.

### High

- Runtime settings were duplicated across the Playwright config and fixture module. `config/environment.ts` now loads local overrides, validates URL and worker input, and provides one typed source of truth.
- The root fixture module combined object creation with two nested void login fixtures. `fixtures/index.ts` now exposes one side-effect-free base fixture and one explicit authenticated fixture.
- Action methods such as checkout completion also performed assertions. Actions and business expectations are now separated.
- The project had no lint or formatting gate. ESLint now performs type-aware TypeScript analysis plus Playwright-specific reliability checks, and Prettier enforces consistent formatting.

### Medium

- Several controls used test IDs despite having stable accessible roles or placeholders. Login, checkout, product-detail, cart, and navigation controls now use semantic locators where reliable.
- Cart-badge access leaked through `InventoryPage` even though it belongs to `ShopHeader`. Tests now use the component fixture directly.
- Repeated checkout customer data is centralized in `test-data/checkout.ts`.
- CI was forced to one worker and first-attempt local failures had no trace. Workers are now configurable and traces are retained on failure.
- A positional `.first()` selector in seeded-account coverage was replaced with an intentional product-card filter.

### Optional follow-ups

- Split the broad `additional-*` specifications by business feature if they continue to grow.
- Add a CI workflow after the team selects GitHub Actions, GitLab, Jenkins, or Azure DevOps.
- Introduce API clients only when a supported application API exists.
- Consider sharding after collecting CI duration and flake data; do not optimize from assumptions.

## Structure and responsibilities

```text
config/                    Validated environment and execution settings
fixtures/                  Typed test dependencies and authentication lifecycle
pages/                     Page-level user actions and locators
pages/components/          Reusable UI sections with a focused responsibility
test-data/                 Shared immutable expectations and inputs
tests/                     Arrange/Act/Assert business behavior
playwright.config.ts       Projects, concurrency, retries, reporters, artifacts
eslint.config.mjs          Type-aware and Playwright-specific static checks
```

No generic `BasePage` exists because sharing a `Page` constructor alone does not justify inheritance. `ShopHeader` is composed into `InventoryPage` for the `openCart` business action and is independently available as a fixture for header assertions.

Folders such as `api/`, `builders/`, `constants/`, and `types/` are deliberately absent. The current suite has no documented service API and no shared domain complexity that would make those layers useful.

## Fixture lifecycle

- Every page object is constructed lazily and scoped to one test.
- The base `test` export performs no navigation or login.
- `authenticatedTest` activates an automatic test-scoped login only for suites that opt in.
- Credentials are an overridable fixture option sourced from validated environment configuration.
- Worker-scoped authentication and `storageState` are not used because SauceDemo login is fast, the suite validates login behavior directly, and test-scoped state provides clear cart isolation.

## Selector policy

Semantic locators are preferred in this order: role, label, placeholder, meaningful text, and test ID. SauceDemo does not label every control, so stable `data-test` selectors remain in places such as product rows, cart badges, totals, and product-specific add/remove buttons. CSS is limited to intentional document-level checks where no user-facing locator exists.

## Reliability policy

- No fixed waits or forced clicks.
- Web-first assertions remain in tests.
- Download listeners are registered before clicks with `Promise.all`.
- Retries are CI-only and are not used to mask local failures.
- Failed attempts retain traces, screenshots, and video.
- Tests are fully parallel and use isolated browser contexts.
- A single scenario-specific timeout remains for SauceDemo's intentionally slow `performance_glitch_user`.

## Refactoring phases

1. Repository hygiene and baseline discovery.
2. Runtime configuration and fixture consolidation.
3. Representative POM and selector cleanup.
4. Test assertion ownership and duplicated-data cleanup.
5. Static quality gates and documentation.
6. Browser verification against the live application.

All phases are implemented. The final four-worker Chromium and Firefox matrix passed all 126 executions; see `TEST_EXECUTION_REPORT.md`.
