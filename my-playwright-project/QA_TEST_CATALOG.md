# SauceDemo QA Test Catalogue

## Scope and test data

- Base URL: `https://www.saucedemo.com`
- Standard happy-path user: `standard_user` / `secret_sauce`
- Other documented accounts: `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` (same password)
- Product catalogue: Backpack ($29.99), Bike Light ($9.99), Bolt T-Shirt ($15.99), Fleece Jacket ($49.99), Onesie ($7.99), and Test.allTheThings() T-Shirt ($15.99).
- Unless otherwise stated, start each case in a new browser context with no stored state. Use Chromium and Firefox at desktop width; rerun critical paths at mobile widths.

## Observed baseline

Live verification on 2026-08-29 confirmed login, the six-product inventory, the four sort options, product details, add/remove, cart, checkout validation, a $29.99 backpack total of $32.39 ($2.40 tax), completion, menu actions, and footer links. The existing suite covers all documented login cases, inventory visibility, and one checkout happy path in both configured browsers.

## Functional test cases

| ID | Scenario / priority | Preconditions | Steps | Expected assertions |
|---|---|---|---|---|
| LGN-01 | Valid standard-user login — P0 | At login page | Enter `standard_user` / `secret_sauce`; select **Login**. | URL is `/inventory.html`; Products heading, six product cards, sort control, cart icon and menu are visible; no error. |
| LGN-02 | Login by each available normal account — P1 | At login page | Repeat LGN-01 for `problem_user`, `performance_glitch_user`, `error_user`, and `visual_user`. | Each reaches inventory. Record visual, data, action, and timing differences as seeded-account defects, not as a generic pass only. |
| LGN-03 | Locked-out account — P0 | At login page | Enter `locked_out_user` / `secret_sauce`; submit. | User remains on `/`; error includes `Sorry, this user has been locked out`; inventory is not exposed through the login action. |
| LGN-04 | Both credentials blank — P0 | At login page | Submit empty fields. | Error is `Username is required`; focus/accessible error is exposed; no navigation. |
| LGN-05 | Username blank — P0 | At login page | Leave username blank; provide password; submit. | `Username is required`; password is not revealed. |
| LGN-06 | Password blank — P0 | At login page | Provide `standard_user`; leave password blank; submit. | `Password is required`; no navigation. |
| LGN-07 | Unknown user / wrong password — P0 | At login page | Submit an unknown username with valid password, then a known username with a wrong password. | Each returns the generic `Username and password do not match any user` error; errors do not disclose which field was invalid. |
| LGN-08 | Credential formatting — P1 | At login page | Try leading/trailing username spaces, uppercase username, whitespace-only values, long strings, special characters, and paste. | Current verified behaviour rejects spaced and uppercase usernames with generic invalid-credential error; no crash, script execution, or credential echo. |
| LGN-09 | Error lifecycle — P1 | Generate a login error | Close the error; correct fields; submit. | Close control removes the message; a successful retry clears error and reaches inventory. |
| LGN-10 | Password-field behaviour — P1 | At login page | Inspect and type a password; tab through fields; submit with Enter. | Password input type masks text, sensible tab order is username → password → Login, and Enter submits once. |
| INV-01 | Inventory content — P0 | Logged in | Inspect page. | Exactly six cards; every card has image, name, description, price, and Add to cart; displayed names/prices equal catalogue baseline. |
| INV-02 | Product sort by name — P1 | Logged in | Select `Name (A to Z)`, then `Name (Z to A)`. | A–Z order: Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings; Z–A is its reverse. |
| INV-03 | Product sort by price — P1 | Logged in | Select `Price (low to high)`, then `Price (high to low)`. | Low–high: Onesie, Bike Light, Bolt T-Shirt, Test.allTheThings, Backpack, Fleece Jacket; high–low is reverse. Each card’s content remains paired correctly after sorting. |
| INV-04 | Item detail through title and image — P1 | Logged in | For each product, open it once from the title and once from its image. | Both routes show the matching product name, description, price, image, action button, and **Back to products**; no cross-product data. |
| INV-05 | Detail return and sort preservation — P2 | Logged in, non-default sort | Open a product; select Back to products. | Returns to inventory without error; confirm the agreed behaviour for selected sort and cart state (currently test it rather than assume it). |
| INV-06 | Add one item from list — P0 | Logged in, empty cart | Add Backpack. | Its action changes to **Remove**; cart badge appears as `1`; cart contains one Backpack at $29.99. |
| INV-07 | Add one item from detail — P0 | Logged in, empty cart | Open Backpack; select Add to cart. | Action changes to **Remove**, badge is `1`; cart holds that product. |
| INV-08 | Add multiple distinct items — P0 | Logged in, empty cart | Add three different products from list/detail. | Badge is `3`; cart has exactly those items once each, in a predictable order, with correct names/prices. |
| INV-09 | Prevent duplicate add — P1 | One item already added | Attempt repeat Add / navigate away and back. | The same SKU cannot be duplicated; button state is Remove and badge/count do not increase. |
| INV-10 | Remove from inventory/detail — P0 | Item in cart | Select Remove from list; repeat from detail. | Item disappears from cart; badge decrements and is hidden at zero; button returns to Add to cart. |
| INV-11 | State persistence — P1 | Added items and/or selected sort | Navigate list ↔ detail ↔ cart ↔ list and refresh. | Cart quantity and item identity remain accurate. Record actual sort persistence; no item is silently lost or duplicated. |
| CRT-01 | Empty cart — P1 | Logged in, no items | Open cart. | `/cart.html`, title `Your Cart`, quantity/description headers, no item rows, no badge; Continue Shopping and Checkout are available. |
| CRT-02 | Cart line accuracy — P0 | Add one or many items | Open cart. | Each row has QTY `1`, correct title, description, price, and product-detail link. Badge equals line-item count. |
| CRT-03 | Remove from cart — P0 | Cart contains 1+ items | Remove a middle item; remove final item. | Only selected row disappears; remaining totals/count stay correct; final removal yields CRT-01 state. |
| CRT-04 | Continue Shopping — P1 | Cart page | Select Continue Shopping. | Returns to inventory; cart contents/badge are preserved. |
| CRT-05 | Product link from cart — P1 | Cart contains an item | Select item name. | Opens matching detail page; Add/Remove state reflects cart; Back returns safely. |
| CRT-06 | Checkout from empty/non-empty cart — P1 | Execute once with empty cart and once with products | Select Checkout. | Current application permits progression in both states. Capture this as expected demo behaviour or raise a product decision if business policy requires a non-empty-cart guard. |
| CHK-01 | Checkout information, valid input — P0 | Cart page | Checkout; enter First `Test`, Last `User`, Postal `00-001`; Continue. | URL `/checkout-step-two.html`; overview displays selected items and payment/shipping sections. |
| CHK-02 | Required information validation — P0 | Checkout step one | Submit blank; then fill first only; then first/last only. | Errors exactly: `First Name is required`, `Last Name is required`, `Postal Code is required`; values already entered are retained; user remains on step one. |
| CHK-03 | Information field boundaries — P1 | Checkout step one | Try whitespace-only, leading/trailing spaces, Unicode names, hyphen/apostrophe names, alphanumeric/postcode formats, maximum length, overlong input, HTML/script-like input. | Required fields cannot be bypassed; accepted input is safely rendered/encoded; validation matches agreed country/address rules (not silently corrupted). |
| CHK-04 | Step-one cancellation — P1 | Checkout step one | Enter data; select Cancel. | Returns to `/cart.html`; no order completed; cart items unchanged. |
| CHK-05 | Overview line items and maths — P0 | Cart contains Backpack | Complete step one. | Backpack row and $29.99 item total appear; tax is $2.40; total is $32.39; total equals item total + tax. Repeat for multi-item and each sort/order combination. |
| CHK-06 | Overview cancellation — P1 | Checkout overview | Select Cancel. | Returns to inventory; no success confirmation; define/check whether cart is retained according to product expectation. |
| CHK-07 | Complete order — P0 | Valid overview | Select Finish once. | URL `/checkout-complete.html`; heading `Thank you for your order!`; dispatch text and **Back Home** appear; cart badge is cleared. |
| CHK-08 | Completion idempotency — P1 | Completed order | Refresh, use Back, or attempt Finish repeatedly. | No duplicate order/confirmation side effect; navigation remains coherent; cart is not restored unexpectedly. |
| CHK-09 | Back Home — P1 | Completion page | Select Back Home. | Returns to `/inventory.html` with an empty badge/cart and usable product controls. |
| CHK-10 | PDF order generation — P2 | Completion page | Select **Generate PDF order**; wait for download/new page. | One non-empty PDF is generated; file type/name is safe; it represents the completed order and does not expose unrelated data. |
| NAV-01 | Menu open/close — P1 | Any logged-in page | Open Menu; close it with Close Menu, Escape, and click outside if supported. | Menu visibility toggles; links are keyboard reachable; focus does not get lost; page remains usable. |
| NAV-02 | All Items and Reset App State — P0 | Logged in with cart items | Open menu; select All Items; then Reset App State. | All Items routes to inventory. Reset clears badge/cart and resets applicable UI state without logging out; verified badge count is zero afterward. |
| NAV-03 | Logout and session — P0 | Logged in | Open menu; select Logout; use browser back and direct protected URLs. | Logout returns to `/`; authenticated UI/session state is cleared. The current demo still allows direct `/inventory.html` navigation after logout, so treat strict route protection as a product decision/security finding rather than asserting a redirect until requirements confirm it. |
| NAV-04 | About and footer legal/social links — P2 | Any app page | Open About, Twitter, Facebook, LinkedIn, Terms of Service, Privacy Policy. | Correct target URL opens without breaking source page; no 4xx/5xx; external-link warning/new-tab behaviour matches policy; keyboard labels are meaningful. |
| XBR-01 | Browser, viewport, and keyboard — P0 | All critical flows | Execute LGN-01, INV-06, CRT-03, CHK-07 in Chromium and Firefox; rerun desktop and mobile widths using mouse and keyboard only. | Same functional outcome; responsive UI has no clipped/overlapping controls; visible focus and logical tab order throughout. |
| A11Y-01 | Accessibility smoke test — P1 | Each route | Run automated scan and manual checks for labels, headings, contrast, focus, error announcement, and semantic buttons/links. | No critical WCAG 2.1 AA findings; form errors are announced and control names are available to assistive technology. |
| NFR-01 | Performance and resilience — P1 | Normal, slow 3G, and offline/failed request profiles | Measure login/inventory/checkout readiness; use performance_glitch_user; simulate assets/API failures. | Agreed timing SLA is met or labelled; user sees recoverable errors/loading state; no permanently disabled action or data corruption. |
| SEC-01 | Client-side security smoke — P0 | Login, checkout inputs, PDF/download and redirects | Use devtools/proxy and malicious strings; inspect URLs/storage. | HTTPS only; passwords are never logged or displayed; no reflected script execution; no sensitive order data persists after logout; external redirects are allowlisted. |

## Automation implementation notes

Prioritize P0 cases as independent Playwright tests. Use `data-test` locators already configured in `playwright.config.ts`; derive product cases from a product data array to avoid six copy-pasted tests. Keep test data isolated with a fresh context and reset state in teardown. Add calculations as numeric assertions (not string-only), add download assertions for `generate-pdf-order`, and capture screenshots/traces on failure.

The intentionally atypical accounts are especially useful for negative/regression coverage: run the same P0 purchase journey under each and assert the normal contract; any differing data, visual output, action, or unacceptable timing should be logged with account name, route, browser, screenshot, and trace.
