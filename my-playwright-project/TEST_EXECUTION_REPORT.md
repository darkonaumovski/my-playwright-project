# Test execution report

**Application:** SauceDemo

**Base URL:** `https://www.saucedemo.com`

**Validation date:** 2026-09-16

**Projects:** Desktop Chrome and Desktop Firefox

## Results

| Check | Result |
| --- | --- |
| `npm install --save-dev ...` | Passed; 106 packages audited, 0 vulnerabilities |
| `npm run format` | Passed |
| `npm run lint` | Passed with no errors or warnings |
| `npm run typecheck` | Passed |
| `npx playwright test --list` | Passed; 126 executions in 11 files discovered |
| `npm test` | Passed; 126/126 across Chromium and Firefox in 2.0 minutes |

## Reproduction

```bash
npm ci
npx playwright install
npm run check
npm test
```

For a faster representative check:

```bash
npm run test:smoke -- --project=chromium
```

If browser tests fail in another environment, inspect `playwright-report/` and the retained traces in `test-results/` before changing retries or timeouts.
