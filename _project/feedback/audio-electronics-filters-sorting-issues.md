# Audio-Electronics Filters & Sorting — Issue List

Root goal (once organized into beads): take the filters + sorting experience on
/products/audio-electronics to 9+/10, professional level. Headphones' sidebar
(/products/headphones) is the cleaned reference — entries already deleted there
are candidates for removal on audio-electronics too, unless the removal reason
was headphones-specific data availability rather than a UX judgment call.

Execution note: analysis/planning only happens here. Devin executes.

---

## Issue 1 — Sidebar still shows entries headphones already deleted as bad UX

Sources read: `app/components/features/filters/FilterSidebar.tsx` (production
shell), `app/components/features/filters/facetRegistry.ts` (category → module
wiring), `lib/filter-sort/headphones/facetConfig.ts` (cleaned reference),
`app/(test)/poc/filter-sort/audio-electronics/lib/facetConfig.ts` (live AE
source — wired in via facetRegistry.ts despite the "poc" path).

**Deletion candidates on /products/audio-electronics — all user-confirmed:**

1. **Customer Rating** (4★ & up / 3★ & up)
   - Mechanism: `FilterSidebar.tsx:179` hardcodes
     `hideCustomerRating = pathname === '/products/headphones'` — only that
     one route hides it; every other category, including audio-electronics,
     still renders it.

2. **Awards / Recognition**
   - `lib/filter-sort/headphones/facetConfig.ts` comment: "Awards / Recognition
     removed from the headphones sidebar per UX cleanup" — same class of
     judgment-based removal as Customer Rating.
   - Still present and enabled in audio-electronics' facetConfig.ts (itemNo 4,
     commercial group).

3. **Condition** (New / Open-Box / Refurbished)

4. **Discount** (On Sale / Clearance)

5. **New Arrivals**
   - 3–5 were initially excluded here on the assumption that real backing
     schema data (unlike headphones, which has none) made them legitimate.
     User overrode that: "Not true. They are all to be deleted." The
     deletion bar is UX judgment, not data availability — see project memory
     `audio-electronics-filter-deletion-criteria`.

CURRENT STATUS: not started (analysis only; no code changed).
