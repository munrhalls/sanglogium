# Data Pass — Homepage Components

## Purpose
Define the unified fetching architecture for all homepage components
except Hero (Hero is locked and excluded from this scope entirely).

## Deliverable State
Every homepage component (Featured, ProductSpotlight 1/2/3,
IemsGallery, NewestRelease, Dacs, Accessories) fetches its own
Sanity data via an independent async server component and a
dedicated GROQ query function. All fetches are parallel.
Page loads at build time via ISR.

## Architecture Decision — LOCKED
Pattern: async React Server Component + dedicated GROQ query per component.
Page-level: export const revalidate = 3600 in app/page.tsx.
No Suspense boundaries on homepage (all content is static, not dynamic).
No shared fetch hooks. No waterfall. No client-side fetching.
Each component owns its query. Each query requests only the fields
that component needs — nothing more.

## In Scope
- One GROQ query function per component
- TypeScript interface per component defining exactly what fields it needs
- async server component pattern applied to every component
- revalidate = 3600 on the homepage page.tsx

## Out of Scope
- Hero component — completely excluded, do not touch
- Image optimization of any kind
- Search functionality
- Any client-side state or interactivity
- Pagination or infinite scroll

## Forbidden Scope
- Do not touch Hero in any way
- Do not add loading states or Suspense to static components
- Do not create shared fetch utilities or hooks
- Do not fetch fields the component does not render