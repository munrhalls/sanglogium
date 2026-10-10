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
