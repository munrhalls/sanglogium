SCOPE BOUNDARY — READ FIRST

This document only covers styling for "filters and sorting" components. Before touching any file, check which list below it's on.

IN SCOPE — style these files, nothing else:
- app/components/features/filters/FilterSidebar.tsx
- app/components/features/filters/MobileFilterDrawer.tsx
- app/components/features/filters/MobileControlsBar.tsx
- app/components/features/filters/ActiveFilters.tsx
- app/components/features/filters/SortDropdown.tsx
- app/components/features/filters/PriceRangeSlider.tsx
- app/components/features/filters/StockMinimumSlider.tsx
- app/components/skeletons/FilterSidebarSkeleton.tsx
- app/components/ui/Checkbox.tsx (only checkbox used anywhere in the app; exists for filters even though it lives outside the filters folder)
- app/(store)/products/[...slug]/FilterSection.tsx
- app/(store)/products/[...slug]/ProductsSection.tsx
- app/(store)/products/[...slug]/ProductsToolbar.tsx
- app/(store)/products/[...slug]/SortAndCountBar.tsx

These are the ONLY files this style guide describes (sections 1–10 below). Every className, color, spacing value, and breakpoint in this document belongs to one of these files.

OUT OF SCOPE — do not restyle, do not "improve," do not touch beyond the single boundary line noted:
- app/(store)/products/[...slug]/page.tsx — the two-column grid wrapper (`grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8`) is the ONLY line that belongs to this scope, because it sets the 240px sidebar column width. Nothing else in page.tsx (breadcrumbs, ShopHeader, StreamedProductGrid, EmptyResults, Pagination, page padding) is filters/sorting styling.
- app/(store)/products/[...slug]/StreamedProductGrid.tsx, ProductRow.tsx, ProductRowSkeleton.tsx — product grid rendering, not filters/sorting.
- app/components/features/products/* (ShopHeader, EmptyResults, Pagination, ProductGrid, ProductCard, etc.) — none of these are filters/sorting components, even though Pagination and EmptyResults render right next to the sort bar on the same page.
- app/components/ui/breadcrumbs/CategoryBreadcrumbs.tsx — page chrome, not filters/sorting.

Rule of thumb: if a component's job is to narrow/reorder the product list (checkboxes, sliders, sort select, active-filter chips, the mobile drawer, the desktop sidebar shell, their skeleton) it's in scope. If its job is to display or paginate the resulting products, or to lay out the page around them, it's out of scope — touch it only at the single boundary line called out above, if at all.

---

Component tree

Page grid (desktop/tablet-touch ≥1024px wide)
Sidebar (filters)
Main column
Breadcrumbs + header
Sort & count bar
Desktop: sort dropdown + count row
Mobile: mobile controls bar → opens mobile drawer
Active filter chips row
Mobile filter drawer (bottom sheet, mobile/tablet-narrow only)
Price range slider
Stock minimum slider
Collapsible filter groups (checkboxes)
Product grid
Pagination

1. Page layout

Below 1024px: single column, sidebar hidden entirely.
At 1024px and up (both "short-screen laptop" and "tall desktop" breakpoints): two-column grid, fixed 240px sidebar column + flexible content column, 32px gap between them, columns stretch to equal height.
Page content capped at a max content width, centered, with 16px side padding on mobile growing to 32px on medium screens and up, 48px bottom padding.

2. Desktop sidebar (filters)

Sticky under the header, scrolls independently once content overflows, no visible scrollbar, 24px top padding, aligns to the top of its grid row.
Card look: elevated surface background, thin secondary-color border, small rounded corners, 24px padding all around, 24px vertical spacing between sections.
While a filter change is pending: whole card dims to 60% opacity.
"Filters" label styled as a small caps/overline in accent gold color.
If any filters are active: a summary row above the controls — small gray caption text ("N filters applied") on the left, underlined gold "Clear all" link on the right.

3. Filter group (checkbox list) — used in both sidebar and mobile drawer

Group label is a clickable toggle button (collapse/expand), gold overline-style text, with a −/+ indicator on the right; hover turns label to primary text color.
Collapsed groups hide their option list entirely; default state is expanded.
Option list: 8px vertical gap between checkbox rows.

4. Checkbox (unchecked / checked states)

Box: 16×16px, rounded-sm corners, 1px border.
Unchecked: transparent background, primary border color; on row hover, border turns accent gold.
Checked: solid accent-gold background and border, with a white/dark checkmark icon (checkmark color is the dark brand background color, so it reads as a "punched out" mark on gold).
Keyboard focus: 2px gold outline with offset, shown only on focus-visible (not on mouse click).
Label text: body-size text, turns primary/brighter on row hover.
Optional trailing count badge: small gray caption text, pushed to the far right.
Disabled (zero-count, unselected) option: entire row at 50% opacity, not-allowed cursor.

5. Price range / stock sliders (shared style)

Section header: gold overline label + small circular "reset" icon button to the right (clock/undo icon, 16px).
Reset button: gold and hoverable when the filter is active; gray and 50%-opacity/disabled-looking when inactive.
Each slider row: small caption label on the left ("Min"/"Max"/"Minimum Stock"), current value on the right in matching caption gray.
Track: thin horizontal bar, 8px tall, fully rounded, no native browser styling.
Active (filter applied): gold fill up to the handle position, dark charcoal remainder.
Inactive (default/no filter): gray fill up to handle, darker gray remainder, whole track at 60% opacity.
Two stacked slider rows for price (Min, Max) with 16px gap between them; single row for stock minimum.

6. Mobile controls bar (below 1024px only)

Horizontal row, 12px gaps between items, 16px left/right padding, 16px bottom margin.
"Filters" button: takes remaining flexible width, secondary button style, centered icon+label, shows active-filter count in parentheses when >0. Icon is a 16px "sliders" glyph.
Sort dropdown: same row, also flexible width.
Product count: fixed-width text at the end, small gray caption, shows "(Loading...)" suffix while a filter change is pending.

7. Mobile filter drawer (bottom sheet, below 1024px only)

Full-width overlay: dark backdrop covering the whole screen behind it.
Drawer itself: pinned to the bottom of the screen, max 85% viewport height, rounded top corners only, slides up/down with a smooth transition (translated fully off-screen when closed).
Header row inside drawer: "Filters" title on the left, "Done" close button on the right, bottom border separator, 16px padding.
Scrollable body below header: 16px padding, vertical scroll for overflow, contains the same price slider / stock slider / checkbox groups as the desktop sidebar, 24px spacing between sections.

8. Active filter chips

Wrapping horizontal row, 8px gaps, 24px bottom margin.
Each chip: pill-shaped button, small border (brand-tone), small rounded-lg corners, small caption text, small "×" remove icon after the label, hover lightens the border.
Trailing "Clear all": plain underlined gold text link, no pill background.

9. Sort dropdown

Small caption "Sort by" label next to a native <select> styled as a bordered input control; same component reused in both the desktop sort bar and the mobile controls bar.

10. Loading skeleton (sidebar, while filters are loading)

Same width as the real sidebar, pulsing/shimmer animation.
Three repeated fake filter groups: a short gray bar for the group title, then 4 fake checkbox rows each (small gray square + gray text bar).