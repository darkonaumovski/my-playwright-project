# Additional Automatable Test Scenarios

Application: SauceDemo
Baseline reviewed: existing Playwright suite plus live application review on 2026-09-02
Suggested implementation: add these as independent tests using fresh contexts; use the existing page objects and data-test selectors.

The current suite already covers the main login matrix, one inventory view, basic sorting, one product detail, basic cart operations, one checkout journey, reset/logout, and PDF download. The cases below target unautomated branches, stronger assertions, cross-flow state, seeded-user regressions, accessibility, and resilience.

## Highest-value additions

| ID | Priority | Scenario | Automated steps | Expected result |
|---|---|---|---|---|
| ADD-AUTH-01 | P0 | Protected-route guard matrix | Log out, then navigate directly to inventory, product detail, cart, both checkout pages, and completion | Every protected route redirects to `/`; the login page exposes the matching access error and no protected content |
| ADD-AUTH-02 | P1 | Login error lifecycle | Submit invalid credentials; close the error; submit valid credentials | Error close control removes the message; valid retry reaches inventory and leaves no stale error |
| ADD-AUTH-03 | P1 | Keyboard login contract | Tab from Username through Password to Login; submit with Enter; inspect password input | Logical focus order; password type is `password`; Enter submits once; validation and navigation match mouse behavior |
| ADD-AUTH-04 | P1 | Credential robustness matrix | Parameterize whitespace-only, leading/trailing spaces, case changes, long values, special characters, and pasted values | No crash, credential echo, script execution, or account enumeration; invalid values remain on login with the generic error |
| ADD-INV-01 | P0 | Complete product identity mapping | For all six products, open by image and title; compare detail name, description, price, image, and ID with the selected inventory card | Both entry points resolve to the same SKU and all fields remain paired |
| ADD-INV-02 | P0 | Product action matrix | For every product, add from inventory, verify badge/cart row, remove, then repeat from detail | Add/Remove state, badge, and cart row are correct for every SKU and route |
| ADD-INV-03 | P1 | Duplicate and rapid-add protection | Double-click an Add button and repeat after list/detail/cart navigation and refresh | One SKU occurs once; badge does not over-count; final action is Remove |
| ADD-INV-04 | P1 | Sort invariants | Apply all four sort options; assert name/price/description/image pairing, selected option, and cart state | Correct order for every option; no product data crosses cards; cart identity is unchanged |
| ADD-INV-05 | P1 | State persistence and reset refresh | Add multiple products, change sort, navigate list/detail/cart, reload, use Reset App State, reload again | Cart and badge persist when expected; reset clears both; rendered action buttons also return to Add after refresh |
| ADD-CART-01 | P0 | Cart line-item contract | Add three products, open cart, inspect every row, remove the middle row, then the final row | QTY, name, description, price, links, row count, and badge stay accurate; empty cart hides the badge |
| ADD-CART-02 | P1 | Cart navigation and history | Open a cart product link, return with Back to products, use Continue Shopping, then browser Back/Forward | Correct product/page is restored without losing cart contents or duplicating items |
| ADD-CART-03 | P1 | Empty-cart checkout policy | Open Checkout from an empty cart and record the resulting route/content | Behavior is explicitly asserted as either allowed demo behavior or a required non-empty-cart guard |
| ADD-CHK-01 | P0 | Multi-item totals and rounding | Check out each product alone and a multi-item basket; calculate subtotal, 8% tax, and total numerically | Displayed totals equal calculated values to two decimals and are independent of inventory sort order |
| ADD-CHK-02 | P0 | Checkout validation retention | Submit blank, first-only, and first/last-only forms; inspect field values, focus, URL, and error text after each | Exact required-field error; entered values remain; user stays on step one; focus/error state is usable |
| ADD-CHK-03 | P1 | Checkout input boundary matrix | Submit whitespace-only, Unicode, hyphen/apostrophe, alphanumeric, very long, and HTML/script-like values | Required-field policy is consistent; accepted values render safely; no script executes or data is silently corrupted |
| ADD-CHK-04 | P1 | Cancellation and recovery | Cancel from information and overview pages; revisit cart and resume checkout | No order completion; cart policy is consistent and documented; no stale form or overview data leaks into a new journey |
| ADD-CHK-05 | P1 | Completion idempotency | Finish once; refresh; use Back Home; attempt browser Back/Forward and direct completion URL | One coherent completion state; no duplicate confirmation/order side effect; cart remains empty |
| ADD-CHK-06 | P2 | PDF semantic verification | Finish a multi-item order, download the PDF, inspect file size/type/text, and compare order contents | Exactly one non-empty PDF contains only the completed order, correct products, totals, and safe filename |
| ADD-NAV-01 | P1 | Menu keyboard and dismissal | Open menu; traverse links by keyboard; press Escape; reopen and click the page outside the menu | Focus is logical and visible; Escape closes; outside-click behavior is asserted according to product policy |
| ADD-NAV-02 | P1 | Menu routing from every page | Open menu from inventory, detail, cart, checkout, and completion; use All Items and Reset | Menu is usable on every route; All Items reaches inventory; reset does not log the user out |
| ADD-NAV-03 | P2 | Legal/social link contract | Assert Terms, Privacy, About, Twitter, Facebook, and LinkedIn href/target; verify new-tab behavior where applicable | URLs are exact, external links use the agreed target policy, and the source app remains usable |

## Seeded-account regression matrix

Run the standard purchase smoke journey for every accepted account, but retain account-specific assertions rather than treating all accounts as equivalent.

| ID | Priority | Account / behavior | Automated assertion |
|---|---|---|---|
| ADD-USER-01 | P1 | `problem_user` asset integrity | All six product images load successfully and each image source matches its product; current live behavior returns the same `sl-404` asset for all six |
| ADD-USER-02 | P1 | `visual_user` price consistency | Inventory, detail, cart, overview, and PDF show the same product price within one journey; current live behavior changes list prices on reload and showed a list/detail mismatch for Backpack |
| ADD-USER-03 | P1 | `visual_user` visual contract | Assert no overlap, clipping, unexpected colors, missing images, or horizontal overflow at desktop and mobile breakpoints; compare screenshots only where visual variance is intentional |
| ADD-USER-04 | P1 | `error_user` product-action matrix | Add each SKU independently and assert badge, button state, and cart row; current live behavior did not add Bolt T-Shirt, Fleece Jacket, or Test.allTheThings() T-Shirt while other tested SKUs added |
| ADD-USER-05 | P1 | `performance_glitch_user` readiness SLA | Measure login and first usable inventory state with a generous but explicit threshold; assert no permanently blocked controls, missing data, or duplicate submission |
| ADD-USER-06 | P1 | Account journey parity | For each normal account, run add/cart/checkout/finish and compare product data, totals, completion, and timing against `standard_user`; differences are reported with account, route, browser, screenshot, and trace |

## Cross-browser, responsive, accessibility, and resilience

| ID | Priority | Scenario | Automated steps | Expected result |
|---|---|---|---|---|
| ADD-XBR-01 | P0 | Critical-flow browser matrix | Run login, add, cart removal, checkout, and completion in Chromium and Firefox at desktop and mobile sizes | Same functional result; no clipped controls, broken navigation, or browser-specific data mismatch |
| ADD-XBR-02 | P1 | Breakpoint layout matrix | Validate 320, 375, 768, and 1280px widths on login, inventory, detail, cart, checkout, and completion | No horizontal overflow; cards, buttons, menu, form fields, totals, and footer remain usable |
| ADD-XBR-03 | P1 | Browser history state | Exercise Back/Forward across login, detail, cart, checkout, and completion, with and without cart contents | History never exposes stale authenticated data, resurrects a completed cart, or lands on a contradictory page |
| ADD-ISO-01 | P1 | Context/session isolation | In two fresh browser contexts, log in separately and add different products; logout in one context | Cart, account state, reset, and logout in one context do not affect the other |
| ADD-A11Y-01 | P1 | Route accessibility smoke | Run axe or equivalent plus assertions for labels, heading hierarchy, landmarks, button/link names, focus visibility, and contrast on every route | No critical WCAG 2.1 AA findings; all controls have usable names and focus order |
| ADD-A11Y-02 | P1 | Error announcement | Trigger login and checkout errors; inspect role/live-region/association and keyboard focus | Error is announced to assistive technology, associated with its field or form, dismissible by keyboard, and not dependent on color alone |
| ADD-A11Y-03 | P1 | Keyboard-only purchase | Complete login, add product, open cart, checkout, and finish using Tab/Enter/Space only | Every action is reachable in a logical order; focus is never trapped or lost |
| ADD-NFR-01 | P1 | Asset/request failure recovery | Block or fail selected image/static requests and delay critical requests | User sees a recoverable state; no broken permanent spinner, silent data corruption, or unusable action |
| ADD-NFR-02 | P2 | Performance budget | Measure navigation and usable-control readiness for login, inventory, cart, and checkout under normal and throttled conditions | Agreed SLA is met or the account/network condition is clearly surfaced |
| ADD-SEC-01 | P0 | Input and redirect security smoke | Use encoded HTML/script strings in login and checkout; inspect rendered DOM, URLs, console, and post-logout navigation | No script execution, unsafe reflection, sensitive data in URLs/logs, or unapproved external redirects |

## Live observations to turn into regression tests

- `problem_user`: all six inventory image elements used the same broken `/assets/sl-404-...jpg` asset.
- `visual_user`: inventory prices changed between reloads; Backpack showed `$68.05` in the list, `$29.99` on detail, and `$52.59` after returning to the list. Cart and checkout then used `$29.99`.
- `error_user`: after a fresh reload, Backpack, Bike Light, and Onesie added successfully; Bolt T-Shirt, Fleece Jacket, and Test.allTheThings() T-Shirt did not change badge/button state.
- Reset App State cleared the cart badge but left already-rendered product buttons stale until refresh.
- Whitespace-only First Name, Last Name, and Postal Code values advanced to checkout overview. Assert the desired trim/reject policy explicitly.
- Escape closed the menu. Clicking the page's Products text did not close it; assert the intended outside-click policy rather than assuming one.
- After logout, direct navigation to all six known protected routes redirected to `/` with a route-specific “You can only access ... when you are logged in” error. This supersedes the older execution-report observation that direct inventory navigation remained possible.
- Checkout overview currently exposes no native heading element in the inspected DOM, and the login error heading lacked `role`/`aria-live`; these are strong candidates for accessibility regression checks.

## Implementation notes

- Keep product data in one array containing ID, slug, expected name, description, price, and image source.
- Use a fresh context per test; use UI Reset App State only when the scenario is specifically testing reset behavior.
- For totals, parse currency and assert numeric arithmetic with a two-decimal rounding helper.
- Re-query dynamic Add/Remove locators after every click; a locator list captured before a click can become stale when the button changes.
- For seeded users, mark intentional defects with account and route metadata so the suite distinguishes a known seeded variation from a regression.
- Store trace/screenshot/video on failure for visual-user and performance-glitch cases; avoid asserting exact timing without an agreed threshold.
