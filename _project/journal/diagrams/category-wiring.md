# Diagram: category-wiring bug and fix

Source: this session's own reads of `app/components/features/filters/
FilterSidebar.tsx`, `FilterControls.tsx`, `ActiveFilterChips.tsx`,
`SortBar.tsx`, `SortDropdown.tsx`, and `app/(store)/products/[...slug]/
page.tsx`, before and after this session's edits (section 7 of the
companion session journal).

## Before (found this session, all three category routes)

```mermaid
graph LR
    P1["/products/headphones"] --> FS
    P2["/products/audio-electronics"] --> FS
    P3["/products/accessories"] --> FS
    FS["FilterSidebar.tsx<br/>(shared component,<br/>all 3 routes)"] -->|"static import,<br/>no category param"| HC["headphones/lib/facetConfig.ts"]
    AEC["audio-electronics/lib/facetConfig.ts"]
    ACC["accessories/lib/facetConfig.ts"]
    style AEC stroke-dasharray: 5 5
    style ACC stroke-dasharray: 5 5
```
Dashed nodes: files existed, contained populated data (checked directly),
were never imported by any production component (checked via grep across
`app/components/`).

## After (this session's edit)

```mermaid
graph LR
    P1["/products/headphones<br/>slug[0]='headphones'"] --> R
    P2["/products/audio-electronics<br/>slug[0]='audio-electronics'"] --> R
    P3["/products/accessories<br/>slug[0]='accessories'"] --> R
    R["facetRegistry.ts<br/>getFacetModule(category)"] -->|category='headphones'| HC["headphones/lib/facetConfig.ts<br/>+ useFilterParam"]
    R -->|category='audio-electronics'| AEC["audio-electronics/lib/facetConfig.ts<br/>+ useFilterParam"]
    R -->|category='accessories'| ACC["accessories/lib/facetConfig.ts<br/>+ useFilterParam"]
```
`category` is computed once, in `app/(store)/products/[...slug]/page.tsx`,
from `slug[0]`, and passed as a prop to `FilterSidebar`, `FilterControls`
(via `FilterSidebar`'s render), `ActiveFilterChips`, `SortBar`, and
`SortDropdown`. `app/(store)/products/page.tsx` (the all-products route,
one route, no single category) was not modified; it does not pass a
`category` prop, and `getFacetModule` defaults to `'headphones'` when none
is given — the same behavior that route had before this session, checked
by reading its `<FilterSidebar>` call site directly.

## Separate, related bug found the same session: dual URL-param maps

```mermaid
graph TD
    subgraph "Client (browser)"
        CC["FilterControls.tsx components"] --> CH["headphones/lib/useFilterParam.ts"]
        CH --> CP["headphones/lib/filterSortParams.ts<br/>(POC-local parser map)"]
    end
    subgraph "Server (RSC, page.tsx)"
        SP["[...slug]/page.tsx: loadFilterSort(query)"] --> SPP["lib/catalogue/filterSortParams.ts<br/>(production parser map)"]
    end
    CP -.same URL, different parser map.-> SPP
```
Before this session's edit to `lib/catalogue/filterSortParams.ts` (adding
the five range facets' `Min`/`Max` parsers), the client-side map already
had entries for these — meaning the range sliders visibly moved and wrote
to the URL, while the server-side map did not parse those same URL keys,
so `buildProductQuery` never received them and no product was ever
filtered by them. This is stated as the assistant's diagnosis, reached by
tracing both files' contents directly; not independently reproduced by
loading the pre-fix code in a browser.
