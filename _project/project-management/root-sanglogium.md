sequence, major items:
- [x] Repo organization
- [] Data protection and system of record
- [] Catalogue data
- [] Discovery surfaces
- [] Basket
- [] Checkout
- [] Accounts
- [] Admin panel
- [] Live deployment and operation

Dependencies:
- Repo organization: none
- Data protection and system of record: Repo organization
- Catalogue data: Data protection and system of record (private dataset needs a read token)
- Discovery surfaces: Catalogue data
- Basket: Catalogue data
- Checkout: Data protection and system of record, Catalogue data, Basket
- Accounts: Data protection and system of record, Checkout (order history)
- Admin panel: Data protection and system of record, Catalogue data (price edits need freshness), Checkout (reads orders), Accounts (admin login)
- Live deployment and operation: all of the above
- Checkout, stock refund for oversold orders: Admin panel
- Accounts, deletion with orders: Admin panel





Objective, scope contracts, themes and DoD's per sequence item: 

Repo organization

objective: every later change extends one locked pattern instead of reshaping it
scope: structure of the whole repo (slices, platform, imports, records); nothing else

DoD:
theme One pattern
- [ ] node tools/check-turn.mjs --all exits 0, no violations — owner or campaign runner
- [ ] git ls-files -ci --exclude-standard prints nothing — owner

theme Import integrity
- [ ] no ../ import under features/, app/, platform/, studio/ (grep from "../ and from '../ returns zero lines) — owner

theme Records match the code
- [ ] ADRs tracked only under ADR/, none under docs/ — owner: git ls-files ADR docs
- [ ] docs/ADR named nowhere in tracked files; ADR/ listed in the model's root allowlist, homes table and naming exemption — owner: grep, section 3 of docs/organizational-pattern.md
- [ ] CLAUDE.md feature map names exactly the directories under features/; performance not called admin — owner: ls features
- [ ] git status prints nothing on main (basket/checkout edits, org-gate.yml, lockfile, .gitignore committed or dropped) — owner



Data protection and system of record

objective: personal data (names, emails, addresses) unreachable without authentication; each record has one owner and one write path
scope: Sanity dataset access, tokens, order and profile writes, account export and deletion; system of record is Sanity

DoD:
theme Anonymous access
- [ ] dataset is private — owner: Sanity manage → API → Datasets
- [ ] anonymous query for order, userProfile and one product returns an authorization error — owner: browser, no token
- [ ] no client-safe file (ui/, state/, url/, core/, index.ts, 'use client') imports a Sanity client or reads a token — owner: grep
- [ ] exactly two tokens, read-only and write, server env only, no NEXT_PUBLIC_, none in the repo — owner: Sanity tokens, Vercel env, grep
- [ ] CORS lists only the app's origins and the Studio — owner: Sanity manage → API → CORS
- [ ] home, listing, product page, search, test-mode order and a production build all work on the private dataset (today prebuild has no token) — owner: localhost:3000 and deployed site

theme Single system of record
- [ ] order and userProfile each have one owning slice holding schema and every write — node tools/check-turn.mjs
- [ ] data inventory lists every store of personal data and its fields (Sanity, auth store, Stripe, Resend, others) — owner: checks against each dashboard

theme Account export and deletion
- [ ] deleting a test account leaves no personal data: profile removed, orders anonymised, no auth row — owner: Sanity Vision query by test email, auth store
- [ ] exporting a test account returns profile, addresses, orders — owner: file from /api/account/export



Catalogue data

objective: every product and category the UI shows is complete, fast at 1000+ products, fresh after a CMS edit
scope: category tree (data/catalogue-index.json, tree only) and live product documents

DoD:
theme Completeness
- [ ] every product has every field the UI renders (image, price, brand, category, specs, stock)
- [ ] build fails on orphaned catalogueLocationKeys (today it only warns)
- [ ] no test products in the production dataset (build skips names containing "test")

theme Scale
- [ ] filter, facet and search latency at 1000+ products measured against a written limit

theme Freshness
- [ ] category edit reaches the storefront without a manual rebuild and deploy (today /api/revalidate revalidates a tag nothing reads)
- [ ] /api/revalidate rejects requests without a secret
- [ ] product edit reaches the storefront within a written time



Discovery surfaces

objective: listings, filters, brand pages, search, product page and homepage show correct data and degrade clearly
scope: /, /products, /products/[...slug], /brand/[slug], /product/[slug], /search

DoD:
theme Route correctness
- [ ] each route renders correct data

theme Filter and sort
- [ ] every facet and sort proven against the live CMS (today two proof scripts)

theme Search
- [ ] relevance, suggestions, history, keyboard and screen-reader contracts of docs/search-ux.md hold

theme Product detail
- [ ] product page has JSON-LD structured data (today none)
- [ ] brand page has generateMetadata
- [ ] one availability rule on product page and basket (today stock vs stock − reservedStock)

theme Empty, error, slow
- [ ] error.tsx and loading.tsx on /brand/[slug] and /products
- [ ] no-results state shown



Basket

objective: shopper always sees live price and stock and knows each limit on reaching it
scope: browser basket store, /api/basket/products, basket page; guests and signed-in alike

DoD:
theme Live data
- [ ] price and stock shown are live
- [ ] a price or stock change between basket and payment is announced

theme Hard limits
- [ ] maximum lines and quantity per line defined (today none)
- [ ] each limit shown to the shopper on reaching it
- [ ] /api/basket/products caps the ids list



Checkout

objective: every payment becomes exactly one correct order at the right price, and every failure ends in a clear state
scope: address, shipping, payment, return handler, webhook, order placement; order of themes: Price authority first

DoD:
theme Price authority
- [ ] shipping cost derived on the server from the carrier rate, not from saveShippingAction input (today any positive integer is charged)
- [ ] parcel data for /api/basket/shipping-rates derived on the server, not client-sent
- [ ] order records the price charged; items + shipping = payment amount, asserted (today price re-read at order time)
- [ ] VAT rule written down (today fixed 23% of total)

theme Payment to order chain
- [ ] every succeeded payment has exactly one order and every order one succeeded payment, through retry, duplicate, crash, missed webhook — owner: Stripe test-mode scenarios
- [ ] a succeeded payment with no order is found and fixed automatically (today nothing sweeps)
- [ ] order failure in the return handler and confirmation-email failure are logged

theme Stock integrity
- [ ] stock checked when the payment is created
- [ ] no unit sells twice

theme Payment security
- [ ] rate limits on /api/trace, /api/basket/shipping-rates, /api/address/autocomplete, /api/newsletter/subscribe
- [ ] no personal data in the event log (today an invalid email is logged)

theme Address and shipping
- [ ] destination countries sold to decided and written down
- [ ] address validation and rates work for each (today TERYT/Google, Poland-centric)
- [ ] order stores state and country as separate correct values (today both from regionCode)

theme Failure paths
- [ ] declined card, expired session, double click, back button, network drop, stock gone, invalid address each end in a clear recoverable state

theme Hard limits
- [ ] largest payable order measured and equal to the basket limit (today about a dozen lines may fail on Stripe's 500-character metadata and the 4 KB cookie)
- [ ] money-path verification method decided: owner-run Stripe test-mode on localhost:3000, or an approved proof script



Accounts

objective: customer can sign up, sign in, see correct history and data, and export their data
scope: auth flows, account pages, guest-order merge, export

DoD:
theme Auth flows
- [ ] sign-in, sign-up and reset rate limits hold across serverless instances (today no storage, per-instance memory)
- [ ] every account page and action re-checks the session (middleware checks cookie presence only)

theme Account data
- [ ] order history, addresses, wishlist show the right data
- [ ] guest orders merge on sign-in



Admin panel

objective: owner reads what customers do, sees what drives and lessens sales, changes the store from one place, and sees whether the change worked
scope: replaces app/(admin) (placeholder layout, /manager, /packer; deleted); four screens: sales explorer, customer journey, products, orders; content editing stays in Sanity Studio; shopper events in a first-party Turso table; synthetic demo sales history; out: customer segments, cohorts, geography beyond the country filter, coupons, partial refunds, abandoned-basket recovery, wishlist analytics, scheduled reports, CSV export, multi-user audit identity

DoD:
theme Access
- [ ] admin role exists; only it enters, enforced server-side on every page and action

theme Sales explorer
- [ ] metric: revenue, units, orders, average order value
- [ ] any from–to date range (presets 30 days, 3, 6, 12, 24 months, all time), never capped; bucket follows the range; compared with the equal-length range before
- [ ] filter by categories, brands, products, countries
- [ ] split by none, category, brand, product, country: line per value plus ranked table with change vs previous range
- [ ] isolate one value, compare several, or combine as one total
- [ ] every price, stock, featured, visibility change and campaign (whole span) shows on the chart on its date
- [ ] figures equal the true sums over paid, non-refunded orders for any range, filter, split, also after a product changes category or brand
- [ ] all-time range stays fast with 24 months of orders

theme Customer journey
- [ ] stages visited → viewed a product → added to basket → started checkout → completed address → chose shipping → reached payment → paid, each with count, % of previous, % of all visits, drop-off
- [ ] same range, filter, split controls as the sales explorer
- [ ] products table category → brand → product, expandable, columns viewed → added → started checkout → paid with counts and step rates, weakest step flagged against category average
- [ ] sort on any column; step rates selectable as chart metrics
- [ ] search terms ranked by count, no-result terms flagged
- [ ] each stage captured once per real action, no personal data, no storefront slowdown; percentages follow exactly

theme Products and campaigns
- [ ] inline edit of price, stock, featured priority, visibility from any product row
- [ ] time-boxed percentage campaign on products, brands or categories; listing, product page, basket and amount charged show the same price, start and stop on their dates
- [ ] low-stock list ordered by days of stock left at recent sales rate
- [ ] every change visible on the storefront promptly

theme Orders
- [ ] awaiting-fulfilment list; lookup by order number or email
- [ ] mark shipped with tracking number, customer emailed
- [ ] cancel with full Stripe refund, idempotent, consistent with Stripe

theme Demo data and flow
- [ ] script creates 24 months of synthetic paid orders (seasonality, different category trends), flagged demo, purgeable
- [ ] owner goes from a signal to the lever and back to the result without leaving the panel



Checkout: stock refund for oversold orders

objective: a customer who paid for stock that no longer exists is made whole
scope: oversold lines found at order placement; refund through the Admin panel's Stripe refund

DoD:
theme Oversold order
- [ ] a paid line with too little stock is flagged on the order (today only a log line order_stock_insufficient)
- [ ] the owner sees it in the Admin panel orders list
- [ ] the customer is told and refunded in full for the missing line

Accounts: deletion with orders

objective: a customer with orders can delete their account without leaving personal data
scope: account deletion, open-order rule, order anonymisation

DoD:
theme Open-order rule

theme Complete deletion
- [ ] a failed profile removal or order anonymisation during deletion is surfaced and retried, not only logged



Live deployment and operation

objective: app deploys repeatably, owner sees failures, no unfinished page is reachable
scope: release workflow, environment, monitoring, production routes, storefront UX thresholds; the Lighthouse report is an app page, not admin

DoD:
theme Reproducible release
- [ ] deploy runs on a supported Node version and a pinned Vercel CLI (today Node 20, deprecated 2026-10-01, vercel@latest)
- [ ] env variables and secrets documented by name and matching the code (.env.example)

theme Failure visibility
- [ ] owner is alerted on webhook failure, order failure and site down (today Sentry init only, failures end as log lines)

theme No placeholders
- [ ] no unfinished page reachable in production (/manager, /packer, admin layout showing "layout")
- [ ] performance page behind the admin role, on a route outside app/(admin)

theme Storefront UX quality
- [ ] numeric mobile, accessibility and performance thresholds written down
- [ ] storefront meets them — owner: Lighthouse report
