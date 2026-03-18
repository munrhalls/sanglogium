# Scope: Homepage Singleton Data Pass

## Purpose
Replace mock data across the homepage with real Sanity data driven by a new "Homepage" Singleton document. This document acts as a centralized curation hub containing arrays of Product references (IDs) for each homepage section, allowing editors strict control over merchandising selection and ordering.

## Deliverable State
1. A single Sanity schema `homepage` exists, containing reference arrays/fields for every dynamic homepage section.
2. The Sanity Desk Structure exposes this Singleton correctly (not as a list of documents).
3. Every homepage component (Featured, Spotlights, IemsGallery, NewestRelease, Dacs, Accessories) independently fetches its specific slice of data from the `homepage` document using an `async` Server Component pattern and its own GROQ query.
4. The homepage is fully ISR cached (`revalidate = 3600`).
5. Zero mock data remains on the homepage.

## In Scope
- Creating `sanity/schemaTypes/homepage.ts` (or equivalent schema location).
- Updating `sanity/structure.ts` (or desk config) to render the Homepage singleton.
- Updating GROQ queries in `Featured`, `ProductSpotlight1/2/3`, `IemsGallery`, `NewestRelease`, `Dacs`, and `Accessories` to query `*[_type == "homepage"][0].<fieldName>->`.
- TypeScript interface definitions per component.
- Mapping the fetched data to the existing JSX layouts.

## Out of Scope
- Modifying the core `product` schema.
- Modifying the `catalogue` schemas.
- Modifying the `Hero` component.
- Any CSS layout or design changes (layouts are locked).
- Creating shared generic fetching hooks (each component owns its query).

## Strictly Forbidden
- DO NOT touch the Hero component.
- DO NOT convert Server Components to Client Components (`"use client"`).
- DO NOT use Suspense boundaries on the homepage.
- DO NOT mix comments into the finalized component code.

## Exit Gates / Tests
- **Gate 1 (Backend):** The "Homepage" document appears in Sanity Studio, allowing editors to select products for all sections.
- **Gate 2 (Architecture):** `app/page.tsx` has `export const revalidate = 3600`.
- **Gate 3 (Component Integration):** Each component successfully renders its assigned products in the browser without console errors.