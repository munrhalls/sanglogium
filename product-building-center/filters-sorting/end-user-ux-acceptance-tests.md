# End-User UX Acceptance Tests — Filters & Sorting
*Stack context: Next 15, React 19, nuqs, Sanity CMS*


SIMPLEST PRIMITIVES - THE CORE FUNDAMENTALS LIST OF END USER UX
[] -

//////////////////////////

COMPLETE LIST OF END USER UX
**URL, Sharing & History**
[] - When I apply filters and a sort order, copy the URL, and open it elsewhere, I see the same products, the same filters selected, and the same sort order.
[] - When I press the browser back button after applying a filter, I see the last filter restored to its previous state and the product grid return to the previous state.
[] - When I press the browser back button after changing sort order, I see the previous sort order restored.
[] - When I clear all filters, I see the URL return to the plain catalog address with no leftover filter details.
[] - When I remove a single filter from the URL or open a shared link with one filter, I see results matching exactly that one filter.

**Filter Selection & Feedback**
[] - When I click a filter checkbox, I see it is checked and the product grid updates to match.
[] - When I click several filters in rapid succession, I see each one become selected and the grid update to the combined result.
[] - When I change a filter, I see the product list stay near my current scroll position so I do not lose my place.
[] - When I change a filter or sort, I see a clear indication that new results are loading before they appear.
[] - When I select a filter that would leave zero matching products, I see that option shown as unavailable or removed.
[] - When I hover over or focus an unavailable filter option, I see a reason it cannot be selected, such as a "0 products" label.

**Sorting Experience**
[] - When I open the sort menu, I see clear labels like "Price: low to high", "Price: high to low", "Newest first", "Best selling", and "Featured".
[] - When I select a sort option, I see the product grid reorder to match and the active sort label shown near the product count.
[] - When I first load the catalog without choosing a sort, I see products in a sensible default order.
[] - When I combine sorting with filters, I see products first filtered, then sorted within the filtered set.
[] - When I copy a URL with a selected sort option, I see the recipient's page load with the same product order.
[] - When I press the browser back button after sorting, I see the previous sort order restored.
[] - When I sort on mobile, I see the sort control within easy reach and the product grid still visible.
[] - When I change sort order on mobile, I see the product list update and the new order reflected clearly.

**Time UX — Perceived Speed, Progress & Accuracy**
[] - When I change a filter or sort, I see the first small batch of matching products begin to appear in under 0.6 seconds, rather than waiting for the full list to load.
[] - When I change a filter or sort, I see products load in small batches and more appear as I scroll, not all at once.
[] - When many products match my filters, I see the first batch quickly and more products continue to appear as I scroll down.
[] - When I apply a new filter or sort while another batch is still loading, I see the product list switch to my latest choice, not the previous one.
[] - When I change a filter or sort, I can still interact with other filters and sort options while the page is loading.
[] - When I change a filter or sort after a previous change has already started loading, I see the controls respond immediately to my new input.
[] - When I change a filter or sort, I see the URL update immediately and the product list begin to match the new URL state.
[] - When I look at the product grid at any moment, I see products that match the current URL, the current filter pills, and the current sort label exactly.
[] - When I wait for more products to load, I see a clear but unobtrusive sign that more are coming.
[] - When I reach the end of the loaded products, I see the list stop cleanly without a confusing or endless spinner.
[] - When the connection is slow, I see the filter and sort controls remain usable while new results are still being fetched.
[] - When I combine multiple filters and a sort, I see the loaded products match all my latest choices and sort order, with no stale results mixed in.

**Filter Logic & Mental Model**
[] - When I select two options in the same category, such as two brands, I see products from either selected option.
[] - When I select options across different categories, such as a brand and a size, I see only products matching all selected categories.
[] - When I read filter category names, I see words that match my shopping vocabulary, not internal warehouse or system names.
[] - When I look at a filter option, I see a count showing how many products match that option with my current selection.
[] - When I select one filter, I see counts on the other options update to show only what is still possible.
[] - When I filter by an attribute such as color or size, I see only products that have a matching variant, and I see which variants are actually available.
**Active State & Visual Layout**
[] - When I apply a filter, I see a removable pill or chip above the product grid showing what I selected.
[] - When I apply multiple filters, I see the active pills in a clear order and I can remove any one of them with a single click.
[] - When I click "Clear all filters", I see all pills disappear and the product grid return to the unfiltered state.
[] - When I open the filter panel on mobile, I see how many filters are active and how many products match.
[] - When I scroll a long product grid on desktop, I see filter and sort controls remain easy to reach.
**Mobile-Specific UX**
[] - When I open the filter panel on mobile, I see where I am and I can return to the product list easily.
[] - When I close the filter panel on mobile without applying, I see my previous state preserved and I return to the same scroll position.
[] - When I apply filters on mobile, I see the panel close and the updated product grid.
[] - When I use the filter panel on mobile, I see the most important filters first and long lists organized so I can scan them.
**Empty, Error & Recovery**
[] - When I select a combination that leaves no products, I see a clear "No products found" message that explains why.
[] - When I see a "No products found" message, I see a single obvious way to clear all filters or adjust my selection.
[] - When I clear filters after seeing no results, I see the product grid return to showing products.
[] - When I cannot load new results, I see a friendly message and I can try again without losing my selected filters and sort.
**CMS Data & Human Language**
[] - When I filter by color, I see the actual color visually, such as a swatch, not just a text label.
[] - When I read filter labels, category names, and sort options, I see plain shopper language, not internal CMS schema names or codes.
[] - When I use filter options, I see choices that match the actual products in the store, including which variants are in stock.
[] - When I filter for an in-stock attribute, I see only products that actually have that attribute available to buy.
**Why this is better than the two earlier replies**
[] - Every item is a user action and an observable outcome. No "asynchronously", no "debouncing", no "re-render", no "query parameter" technical language. The Time UX section states user-perceived speed thresholds as user experience, not implementation.
[] - Sorting is treated as a first-class concern, not a single afterthought. It has its own section and is cross-referenced in URL, history, mobile, and share tests.
[] - It tests the shopper's mental model, not the code: OR within a category, AND across categories, human-readable labels, variant-aware results, and recovery from dead ends.
[] - It covers mobile as real UX, not just "responsive" as a buzzword: drawer behavior, scroll position, apply flow, sort control reachability.
- [ ] It avoids implementation prescriptions. It does not tell the developer how to build it; it tells the team what a user must experience.