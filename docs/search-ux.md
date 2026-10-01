# Search UX

How header search works and why. Read before changing anything under `features/product-search/` or `app/components/layout/header/SearchField.tsx`.

## Surfaces

One controller, three surfaces:

| Viewport | Surface | Component |
| --- | --- | --- |
| below `sm` (phones) | visible search bar in the header (a button) that opens a full-screen sheet | `SearchBarTrigger` + `SearchSheet` |
| `sm` and up (tablet, desktop) | wide field in the header with a suggestion popup | `SearchFieldDesktop` |
| both | shared state, debounce, cache, keyboard handling | `useSearchController` |

`SearchField.tsx` only composes them. SearchField.tsx and the bottom ActionBar stay in layout and import from `@/features/product-search`; SearchField also passes the suggestion server action (`searchProductsAutocomplete`) into `useSearchController`, so the feature never imports sanity-cms. The bottom action bar's search button (`#mobile-search-trigger`) opens the same sheet through the `search` URL param (`useSearchOverlay`).

## Contracts worth not breaking

- **History.** Opening the sheet pushes one entry (`?search=true`). Closing it calls `history.back()`. Navigating from inside the sheet uses `router.replace`, so Back returns to the page the shopper was on and never reopens the sheet.
- **Keyboard.** The layout viewport does not shrink when the on-screen keyboard opens (iOS Safari, Android Chrome). `SearchSheet` sizes itself from `visualViewport` (`useVisualViewportBox`) so the sticky "See all results" row always ends above the keyboard.
- **Combobox semantics.** The input is `role="combobox"` with `aria-activedescendant`. Options are real `<a href>` elements (`role="option"`) in one `role="listbox"`, so middle-click and "open in new tab" work. `aria-controls` is only set while the listbox exists. Options are reached with the arrow keys, not Tab.
- **One input element per surface, never two visible.** Ids come from `useId`; the desktop field is `display:none` below `sm`, and the popup does not render while the sheet is open.
- **Tap targets.** Every control on phones is at least 44px. The input fills its 44px row (`h-full`) so the whole row focuses it.
- **Tablet field.** On tablets (`sm`–`lg`) the header field is a 36px bar inside a 44px hit area (same pattern as the phone trigger: the form's own padding focuses the input, and the clear button keeps a 44px hit area). From `lg` the bar is 44px in the 64px header.
- **Popup sizing.** The desktop/tablet popup is exactly as wide as its field (no min-width). While the on-screen keyboard is open (`useVisualViewportBox().keyboardOpen`), its max height is derived from the visual viewport so the sticky "See all results" row stays above the keyboard; without a keyboard it uses the plain `dvh` cap.
- **Mobile input attributes.** `type="search"`, `inputMode="search"`, `enterKeyHint="search"`, autocorrect/autocapitalize/spellcheck off (model names such as "HD800S" must not be "fixed"), font-size 16px (no iOS zoom on focus).

## Behaviour summary

- Below 2 characters: recent searches (removable), category shortcuts, popular searches.
- From 2 characters: live product suggestions (150ms debounce, small in-memory cache, previous results stay visible while loading) with the matched text highlighted, and a trailing "See all results" option.
- Desktop shortcuts: `/` focuses the field, arrows move, Enter opens the highlighted option (or submits), Esc closes the popup, a second Esc clears the text.
- `/search`: compact heading on phones, 44px pagination buttons, and a no-query / no-results page that offers category and popular-search links instead of a dead end.
- `/search` filters and sort: filters use the same URL contract as the catalogue (`loadFilterSort` from `@/features/product-filtering`), limited to the category-agnostic `commercial` group (Price, Brand, In stock) because results span categories; the sidebar shows from `lg`, a Filters sheet below it. Facet counts, the price range and the result list are computed from the same in-memory matched set by `buildSearchResult` (features/product-search/domain/searchResults.ts), called from `searchProductsFull`, so counts always equal results. `sort` is NOT parsed by `loadFilterSort`: valid values are `relevance` (default, absent from the URL), `price-asc`, `price-desc`, `alpha-asc` (legacy `name-asc` accepted), validated in `searchProductsFull`'s result pipeline (`buildSearchResult`).

## Where things live

- `ui/`: components, `useSearchController`, `useSearchOverlay`, `recentSearches`, `searchLinks`
- `domain/`: pure logic — `highlight`, `suggestionEntries`, `detectSearchRedirect`, `searchScoring`, `searchResults`, `searchTypes`
- `config/`: `searchSuggestions` (category shortcuts, popular searches)
- `server.ts`: server-only scoring/result building for the fetcher — never import it from client code
- `index.ts`: client-safe public entry
- `__tests__/`: scoring spec, pagination spec; the live-Sanity spec stays in `tests/live/product-search/searchRobustness.spec.ts`

## Checking it

Dev-server checks that matter after a change: open the sheet at 390px and 320px wide with the keyboard up, press the browser Back button from the sheet, and Tab through the popup on desktop. The visual-viewport behaviour can be simulated by overriding `window.visualViewport` in an init script; real-device confirmation on iOS Safari and Android Chrome is still worth a minute. On tablet widths (640, 744, 768, 820, 1023) check the field spacing in the header, the popup's right edge at 640, and — on a real iPad or a `visualViewport` override — the "See all results" row above the keyboard.

On `/search?q=hd` tick a brand and confirm the toolbar count equals the brand's sidebar count, `q` survives, Back undoes one step, and Clear all keeps `q`; check the Filters sheet at 390 and 744 and the sidebar at 1024, 1280 and 1920.
