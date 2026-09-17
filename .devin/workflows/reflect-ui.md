---
description: Reflect the real UI at any target URL — what exists and what happens on interaction, factual only
---

# /reflect-ui [URL]

**Input:** any URL (e.g. `http://localhost:3000/products/headphones`, `http://localhost:3000/checkout`, `http://localhost:3000/admin/orders`)
**Output:** `_project/reflect-ui-[slug].md` — `[slug]` = URL's last path segment

## Execution Steps

1. **Navigate & verify:** Load [URL]. Wait for loading indicators/async data to settle, then scroll the full page once to surface lazy-loaded content. Confirm real content rendered (not blank/error/skeleton). If not, reload once; if still not, stop and record `Loaded: FAILED — <reason>` instead of inventing data.
2. **Scope:** Inventory and test only the page's main/unique content. Shared global chrome (header nav, footer, cookie/consent banner) gets one line noting it's present — not enumerated or tested — unless the target URL's own purpose is that chrome itself.
3. **Inventory — "what is there":** Walk the main content in DOM/visual top-to-bottom order. List every interactive element: buttons, links, checkboxes, radios, toggles, range/sliders, dropdowns/selects, text inputs, tabs, accordions, modal/dialog triggers, carousel/pagination controls, form fields. For each, record: exact visible label/text, element type as observed (never presumed), current/default state, and every available option/value where applicable. Custom (non-native) dropdowns/menus whose options aren't in the DOM until opened: open first, read the real option list, then note the closed/default state.
4. **Behavior — per element, in the order inventoried:** run the interaction(s) matching its observed type (table below) and record before → after: resulting URL, and what visibly changed. "No visible change" is itself a valid, required result — never a reason to drop the row. If an action reveals a new interactive element not already in the Inventory, add it to the Inventory now and give it its own Behavior row too.

| Type | Interaction(s) to run |
|---|---|
| Button | click once |
| Link | click; note destination |
| Checkbox/radio | select 1; if multi-select works, add a 2nd; then clear |
| Range/slider | set one mid value, then one extreme; then reset |
| Toggle/switch | turn on, then off |
| Dropdown/select | every option if ≤5, else first 3 |
| Text input | enter one typical value; note any live response; then clear |
| Tabs | click each tab; note what panel shows |
| Accordion/expandable | expand; note revealed content; collapse |
| Modal/dialog trigger | open; note content; close; note resulting state |
| Carousel/pagination | advance one step; note change; go back |
| Form | fill each field with one typical value; submit — UNLESS destructive (step 5) |
| Other (date picker, upload, drag-and-drop, hover-only menu, etc.) | run its single most obvious interaction; if none is obvious, mark `NOT-EXECUTED (type unclear)` |

For any interaction that changes a list/grid of items: record the resulting count AND the first 2-3 visible items exactly as rendered — count alone is not enough.

5. **Destructive-action guard:** Never execute anything irreversible or that: makes a real payment/order, deletes or alters persistent data, sends a real email/message, changes an account/permission, or otherwise leaves the app or an external system changed outside this observation session. Treat as destructive: completing checkout/payment, deleting/canceling an order or account, admin actions on other users' data, any form that emails/messages a real recipient or subscribes them to a list (contact, newsletter, "request a callback"). Safe to execute: adding to cart, applying a filter, typing into a live search box, opening/closing UI. For anything destructive: record the control's existence/label from step 3 only, mark it `NOT-EXECUTED (destructive)`, and do not click/submit it.
6. **Anomalies:** anywhere something breaks or looks wrong (console error, URL not updating, dead control, layout break, content not matching the action taken) — record exactly what was observed and where. Omit entirely where nothing is wrong — this "omit if nothing wrong" rule applies only to Anomalies, it never excuses dropping a required Behavior row.

## Rules
- Every element listed in Inventory MUST appear in Behavior, or be marked `NOT-EXECUTED (destructive)` / `NOT-EXECUTED (type unclear)` — nothing skipped, nothing invented.
- Document only what is directly observed. No fixes, no code edits, no opinions on correctness or intent.
- DOM/text/ARIA/URL/console first. Screenshot only if an element's state truly can't be read any other way.
- No filler lines ("worked as expected") in Anomalies — absence of an anomaly entry means it worked.

## Output Format
Illustrative only — a real run contains rows only for what's actually present on that URL.

```markdown
# UI Reflection — [slug]
URL: [URL]
Loaded: OK
Global chrome: header nav + footer present (not enumerated)

## Inventory
| Element | Type | Label | State/Options |
|---|---|---|---|
| Brand filter | checkbox list | "Brand" | Sony, Bose, JBL — none selected |
| Add to cart | button | "Add to Cart" | enabled |
| Newsletter signup | text input + button | "Subscribe" | field empty, button enabled |

## Behavior
| Element | Action | Result | URL |
|---|---|---|---|
| Brand filter | select Sony | 12 items shown (was 48): Item A, Item B, Item C | ?brand=sony |
| Add to cart | click | cart count 0 → 1, mini-cart opened | (unchanged) |
| Newsletter signup | — | NOT-EXECUTED (destructive) | — |

## Anomalies
- (none, or one line per observed issue)
```
