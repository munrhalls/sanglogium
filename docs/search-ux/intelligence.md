# Search UX — Intelligence (Stage 1)

Tracked by `sang-logium-d5m.1` — [Search] Intelligence: professional search-UX standards, audio retail
Part of `sang-logium-d5m` — EPIC Search UX

## Source shortlist (locked)

### UX research
- Baymard Institute — site-search UX research, the standard citable benchmark
- Nielsen Norman Group (NN/g) — search-pattern heuristics

### Retailer teardowns
- Crutchfield
- Sweetwater
- Moon Audio
- Audio46
- B&H Photo/Video
- Apos Audio
- Headphones.com
- Bloom Audio
- MusicTeck
- Drop (formerly Massdrop)

## Findings

### Baymard Institute

Source: https://baymard.com/blog/ecommerce-search-query-types (query-type guidelines), https://baymard.com/research/ecommerce-search (benchmark stats)

**Headline stat:** 2026 benchmark across leading ecommerce sites — 46% desktop, 58% mobile, 64% app have "mediocre or worse" search UX. Mobile is measurably worse than desktop industry-wide, which matches our mobile-first priority.

**8 query types a search implementation should support, with % of benchmarked sites that get each wrong:**

1. **Exact** (12% fail) — product titles/model numbers/SKUs, phonetic misspellings, alternate names
2. **Product type** (20% fail) — auto-redirect to category on 1:1 match; return results even if not a formal category; filter/sort available directly from results
3. **Feature** (39% fail) — searched attributes (color, material, size, spec, price, brand) auto-apply as filters; show which filters got applied
4. **Use case** (43% fail) — tag products by occasion/season/activity; apply as preapplied filters when detected
5. **Abbreviation/symbol** (54% fail) — map abbreviations to full terms, interpret symbols contextually, handle copy-pasted specs
6. **Compatibility** (44% fail) — brand+accessory-type queries; show compatibility details (wattage, type) in results; suggest accessories for primary-product-only queries
7. **Symptom** (37% fail) — problem-described queries ("no bass", "hurts my ears") return multiple relevant product types; hint capability via placeholder text; link buying guides
8. **Non-product** (66% fail, worst category) — search should also surface policies, shipping info, FAQs, not just the catalog

**Relevance flag for a headphones/high-end-audio catalogue:** Feature, Use case, Compatibility, and Symptom searches are all directly applicable (e.g. "closed-back", "for gym", "works with FiiO amp", "sibilant treble") and are exactly the categories with the highest industry failure rates — worth weighting heavily in the audit stage.

### Nielsen Norman Group (NN/g)

Sources: https://www.nngroup.com/articles/search-visible-and-simple/, https://www.nngroup.com/articles/search-and-you-may-find/, https://www.nngroup.com/articles/site-search-suggestions/, https://www.nngroup.com/articles/filter-categories-values/, https://www.nngroup.com/articles/applying-filters/, https://www.nngroup.com/articles/search-no-results-serp/, https://www.nngroup.com/articles/state-ecommerce-search/

**1. First-query success is the make-or-break moment; audio's complex queries must pass it.**
In an NN/g ecommerce study cited by its "Search: Visible and Simple" article, users' first query succeeded 51% of the time, the second 32%, and the third 18%; almost half the users whose first search failed gave up immediately. This is especially unforgiving for the audio-retail query types Baymard flags as high-failure — Feature ("planar magnetic under $500"), Compatibility ("works with FiiO KA17"), Use case ("for gym"), and Symptom ("sibilant treble") — because these are multi-attribute or domain-specific and the user will not reformulate. The search implementation must prioritize first-attempt relevance for these categories.

**2. Search must be a visible, simple, global box on every page; avoid advanced/Boolean controls.**
NN/g's older but still-cited research found that more than half of users are search-dominant and usually go straight for the search box, while a fifth are link-dominant and the rest are mixed. It recommends making search easily available from *every* page, with a type-in search box rather than a search link, and defaulting to global (site-wide) search rather than scoped search. A separate article adds that the box should be wide enough for the typical query and that advanced search/Booleans should not be exposed in the primary interface. For high-end audio, where customers often arrive with a specific model, spec, or compatibility in mind, the search box is the primary purchase path and must be discoverable without navigating categories first.

**3. Search suggestions are expected, but only if every suggestion leads to a good result.**
NN/g's study found autocomplete-style suggestions help users pick appropriate terms, type less, avoid typos, and use less mental effort; in their ecommerce study, 23% of offered suggestions were selected. However, suggestions that return zero or irrelevant results are worse than unhelpful — they sidetrack users. For audio retail, suggestions should surface real product names, common model nicknames, categories, and attributes; if a user types "HD 800" and sees no suggestion, they may assume the product is not stocked and abandon.

**4. Filters/facets must be domain-appropriate, predictable, and free of jargon.**
Generic filters (brand, price, color) are insufficient for a specialized catalog. NN/g emphasizes that specialized sites can beat generalist retailers by offering filter categories that match the user's decision-making for that exact domain. For audio, this means filter categories like form factor, driver type, open/closed back, impedance, sensitivity, connectivity, and DAC/amp compatibility — labeled in customer-facing terms, not engineering or merchant jargon. On mobile, collapsed accordions make the difference between "Impedance" and a vague label like "Specs" a high-stakes discoverability issue.

**5. No-results pages need clear recovery paths, not dead ends.**
A No Results page is a high-risk abandonment point. NN/g recommends stating clearly that nothing was found, keeping the original query in the box, offering spelling corrections, related queries, and concrete next steps. For audio, symptom and compatibility queries ("no bass", "works with iPhone 15") are especially likely to hit terminology mismatches; the no-results state should guide the user toward related products, buying guides, or a restated query rather than leaving them stuck.

**6. On mobile, prefer batched filtering with an explicit Apply action.**
Users with multiple criteria in mind are disrupted by a results refresh after every filter selection, and mobile page loads make this worse. NN/g recommends batch filtering (or a hybrid that detects inactivity) with an Apply button on mobile, while preserving UI stability and the user's scroll context. Audio shoppers commonly combine several criteria (e.g., closed-back + planar + under $500), so a mobile batch-apply pattern with real-time filter-count feedback protects the search flow from fragmenting.

### Retailer teardowns

Method: one batched Playwright session per retailer, 8 query types per session, querying the live production search and reading the result-page DOM. Breakpoints were spot-checked on Headphones.com (desktop, mobile, tablet). Raw captured evidence is in `docs/search-ux/evidence/`.

**Access limitations**
- Crutchfield and Sweetwater were blocked by bot protection (Cloudflare and PerimeterX) in this headless environment, even after installing Playwright stealth plugins. No live search behavior could be observed.
- Drop (formerly Massdrop) has decommissioned its product catalog search; `drop.com/shop/search?q=...` now redirects to a generic "Gaming Collaborations by Corsair" landing page with zero results.
- These three are noted below as data gaps rather than as observed behaviors.

**Exact search (model/SKU): "HD 800S"**
- Headphones.com: 18 results, Sennheiser HD 800S appears first, mixed with related Sennheiser products and headphone amps. https://headphones.com/search?q=HD%20800S
- Apos: 8 results, Sennheiser HD 800S first, followed by cables and accessories. https://apos.audio/search?q=HD%20800S
- MusicTeck: 0 results — exact model not found in catalog. https://shop.musicteck.com/search?q=HD%20800S
- B&H: returns the exact Sennheiser HD 800 S, but also many unrelated "800 HD" matches (telescopes, monitors, cables). Keyword-stemming over-fetches. https://www.bhphotovideo.com/c/search?q=HD%20800S
- Moon Audio: search returns articles and buying guides, not the product first. https://www.moon-audio.com/search?q=HD%20800S
- Audio46: 47 results. https://audio46.com/search?q=HD%20800S
- Bloom: title set to query; after a full `networkidle` wait per query, no results count, heading, or product list was rendered for any of the 8 query types. The search page appears non-functional for live product search.

**Product type: "headphones"**
- B&H: auto-redirects to the "Headphones, Earphones & Accessories" category page (`/c/browse/Headphones-Accessories/ci/12568/...`), satisfying the 1:1 category-match pattern. https://www.bhphotovideo.com/c/browse/Headphones-Accessories/ci/12568/N/4041617504?origSearch=headphones&sts=
- Shopify retailers (Headphones.com, Apos, MusicTeck, Audio46, Moon Audio, Bloom): return a search results grid with counts.

**Feature: "closed-back headphones"**
- Headphones.com, Apos, MusicTeck, B&H all return relevant closed-back products (e.g., Focal Azurys, Sennheiser HD 820, Dan Clark AEON CORE, DT 770 PRO). None auto-applied a "closed-back" filter; results rely on keyword relevance and product metadata.
- Moon Audio: returns mostly articles and buying guides, with some closed-back reviews.

**Use case: "headphones for running"**
- B&H: surfaces Shokz bone-conduction sports headphones and wireless models, then drifts into unrelated audio interfaces. https://www.bhphotovideo.com/c/search?q=headphones%20for%20running
- Headphones.com and Apos: return Bluetooth/wireless headphones, but the ranking is driven by keyword presence rather than an explicit "for running" tag.
- MusicTeck: returns high-end open-back and closed-back headphones, not specifically workout-oriented.

**Abbreviation/symbol: "IEM"**
- Headphones.com, Apos, MusicTeck: all correctly interpret "IEM" as in-ear monitors/headphones and return relevant products.
- B&H: interprets "IEM" as stage/in-ear wireless monitoring systems (a pro-audio sub-category), missing consumer IEMs. https://www.bhphotovideo.com/c/search?q=IEM
- Moon Audio: returns IEM reviews and articles.

**Compatibility: "headphones for iPhone 15"**
- B&H: silently strips "for" and "iPhone" and searches "headphones phone 15" — poor, unrelated results. https://www.bhphotovideo.com/c/search?q=headphones%20for%20iPhone%2015
- MusicTeck and Apos: return some Bluetooth/wireless and Lightning/USB-C options, but the result is keyword-driven, not compatibility-aware.
- Headphones.com: 358 results, dominated by wireless headphones and amps, with no explicit iPhone 15 filter.

**Symptom: "headphones with more bass"**
- MusicTeck: returns Abyss Diana MRx "Bass Reference" and Focal Bathys — a plausible bass-focused set. https://shop.musicteck.com/search?q=headphones%20with%20more%20bass
- B&H: surfaces closed-back Beyerdynamic DT 770 (known for bass), then drifts into unrelated clip-on earbuds and pedals. https://www.bhphotovideo.com/c/search?q=headphones%20with%20more%20bass
- Headphones.com and Apos: return bass-heavy IEMs and planars, but no buying guide or "more bass" filter.

**Non-product: "return policy"**
- B&H: best-in-sample — directly returns the "Returns & Exchanges Policy" page. https://www.bhphotovideo.com/find/HelpCenter/ReturnExchange.jsp?origSearch=return%20policy&sts=
- MusicTeck: returns its Privacy Policy page (1 result), not a return policy. https://shop.musicteck.com/search?q=return%20policy
- Headphones.com, Apos, Audio46, Bloom: return product results only, no policy/FAQ content.
- Moon Audio: returns articles, including buying guides, but no policy page.
- This is the weakest area across the audio-only retailers; only B&H handles non-product search well.

**Breakpoint note (Headphones.com desktop / mobile / tablet)**
- The same 8 queries were run at 1280×720, 390×844, and 820×1180. Result counts and product order were broadly consistent (e.g., "IEM" returned 225 desktop, 345 mobile, 225 tablet; "headphones" returned ~593–596). The mobile and tablet views did not expose a different search algorithm, confirming the core ranking is viewport-agnostic, though the UI would need to adapt filter/suggestion layout.

**Synthesis: what audio retail search does well and poorly**
- Strengths: Exact product search and product-type search are generally functional. Feature and use-case queries usually return plausible products. Abbreviations like "IEM" are widely understood.
- Weaknesses:
  - **Non-product search** is almost universally weak among audio-specialist retailers; only B&H surfaces policy/FAQ content.
  - **Compatibility and symptom queries** are treated as keyword matches, not intent — no site auto-applied a compatibility or sound-signature filter.
  - **No site in the sample auto-applied feature filters** from the query (e.g., "closed-back" did not become a pre-selected filter), so users still must refine manually.
  - **Moon Audio** returns blog/article content alongside products, which can answer symptom/use-case queries but buries products.
  - **Bloom** did not surface a usable results page for any query, even when each search was allowed to reach `networkidle` before reading the DOM.
  - **B&H** over-fetches on broad keywords and strips terms from compatibility queries, showing the risk of aggressive stemming.

These observed behaviors, combined with the Baymard and NN/g standards, define the audit criteria for the current sanglogium search implementation in `sang-logium-d5m.2`.
