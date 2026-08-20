# End-User UX Acceptance Tests — Filters & Sorting

## 1. URL State & Navigation (The "Nuqs" UX)

These tests ensure that the routing feels invisible to the user while keeping their state perfectly preserved.

- **The "Share & Paste" Test:** If a user applies 4 filters and changes the sort order, copies the URL, and opens it in a fresh incognito window, the exact same products load instantly with all UI filter toggles visibly checked.
- **The "Back Button" Test:** Clicking the browser's native "Back" button undoes the last filter applied, rather than kicking the user entirely off the catalog page.
- **The "Clean URL" Test:** When a user clears all filters, the URL cleanly strips the query parameters (e.g., `?color=black` vanishes rather than lingering as an empty `?color=`).
- **The "Scroll Anchor" Test:** Applying a filter does not aggressively snap the user's viewport back to the top of the page, which causes them to lose their browsing position.

## 2. Interaction & Feedback (The "React 19" UX)

These tests ensure the UI feels instantaneous, even when server requests are happening in the background.

- **The "Optimistic Checkbox" Test:** When a user clicks a filter, the checkbox visually engages instantly. The product grid may show a brief loading state, but the interface never freezes or blocks the user from clicking a second filter immediately.
- **The "Debounced Slider" Test:** When a user drags a price slider, the product list does not wildly flash or attempt to update rapidly. It waits a fraction of a second after they stop dragging to fetch the new results.
- **The "Drawer vs. Live" Test (Mobile):** On mobile, where screen real estate is tight, selecting filters inside a dedicated drawer does not update the background grid until the user taps a definitive "Apply" button.

## 3. Logic & Accuracy (The "Sanity" UX)

These tests ensure the data rules make logical sense to a human shopper.

- **The "No Dead Ends" Test:** A user can never click a filter combination that results in a "0 products found" page. As filters are applied, incompatible remaining options are dynamically greyed out or hidden.
- **The "OR vs. AND" Test:**
  - Selecting multiple options within the same category expands results (e.g., checking "Nike" and "Adidas" shows products from either brand).
  - Selecting options across different categories narrows results (e.g., "Nike" AND "Size 10").
- **The "Human Language" Test:** Filter categories and labels use the shopper's mental model, not internal warehouse or CMS structural jargon.

## 4. Visual Layout

These tests verify that the current state of the store is always legible.

- **The "Active Pill" Test:** Every applied filter is duplicated as a highly visible "pill" or tag directly above the product grid, allowing the user to click an "X" to remove them without hunting through the sidebar.
- **The "Mobile Counter" Test:** On mobile, the button that opens the filter drawer clearly displays a numerical badge indicating exactly how many filters are currently active.
