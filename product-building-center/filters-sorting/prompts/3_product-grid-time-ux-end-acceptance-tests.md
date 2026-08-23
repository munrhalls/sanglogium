# End-User UX Acceptance Tests — Product Grid Time UX

*Scope: one URL, `http://localhost:3000/products/headphones`, plain hard load — no filters, no sort, no pagination click. Purely the end-user time experience of the product grid loading and appearing.*

**Initial Response**
[] - When I open the products page, I see something appear immediately — placeholder cards for every row — with no blank white pause first.
[] - When I open the products page, I see the placeholder cards for all rows at once, not one row's placeholder appearing before the others.

**First Batch Speed**
[] - When I open the products page, I see the first row's real photos, names, and prices appear within well under a second.
[] - When the first row appears, I see its photos, names, and prices arrive together, not the names and prices appearing first with photos catching up later.

**Batch-by-Batch Arrival**
[] - When I watch the page load, I see the second row of real products appear visibly after the first row, not at the same instant.
[] - When I watch the page load, I see the third row of real products appear visibly after the second row, following the same pattern.
[] - When I watch the whole page load, I see products arrive as a series of visible steps — some now, more soon, more after that — never everything appearing in one single snap.
[] - When I watch the page load, I never experience a long silent wait followed by every row appearing at once.

**Repeatability**
[] - When I reload the page, I see the same pattern every time — a fast first row followed by visibly staggered later rows — not just on the first visit.
[] - When I reload the page right after a previous load, I see the same fast, staggered arrival again, with no slowdown or change in behavior.

**Slow Connection**
[] - When my connection is slow, I still see the first row of real products appear before I'd give up waiting, rather than a long blank stall.
[] - When my connection is slow, I still see later rows arrive one after another in visible steps, rather than everything stalling and then bursting in together.

**Scrolling & Continuity**
[] - When I scroll down while the page is still loading, I see rows that have already arrived, or I see a placeholder that is clearly about to be replaced — never an abrupt empty gap.
[] - When a row's real products replace its placeholder, I see the layout stay steady with no jump or shift in the page around it.
[] - When I look at the grid at any moment during loading, what I see always looks like real progress, never corruption — a later row occasionally finishing just before an earlier one is expected under real network variance, not a bug; the only failure this guards against is a long stall followed by everything appearing at once.
