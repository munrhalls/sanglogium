Replace the entire content of
_project/SCOPE/refactor-featured-spotlight.md
with exactly this:

# Refactor: RedesignFeaturedAndProductSpotlight → Separate Components

## Current State
Featured and ProductSpotlight1 are merged into one file:
RedesignFeaturedAndProductSpotlight.tsx (or similar).
This file exists because both components were developed together
during a cohesive design test. The visual design is complete.
No changes to appearance, logic, or props are needed.

## Deliverable State
Two separate component folders exist inside
app/components/features/homepage/:

app/components/features/homepage/featured/
  Featured.tsx           ← the featured carousel component
  types.ts               ← TypeScript interfaces for Featured
  index.ts               ← re-export for clean imports

app/components/features/homepage/product-spotlight-1/
  ProductSpotlight1.tsx  ← the product spotlight component
  types.ts               ← TypeScript interfaces for ProductSpotlight1
  index.ts               ← re-export for clean imports

The original RedesignFeaturedAndProductSpotlight file and folder
are deleted after migration.

The import in the page that currently uses
RedesignFeaturedAndProductSpotlight is updated to import
Featured and ProductSpotlight1 separately.

No visual change. No logic change. No prop change.
The browser renders identically before and after.

## File Structure Rules
Each component folder contains exactly:
- One main component .tsx file
- One types.ts file (TypeScript interfaces only)
- One index.ts file (re-export only)
Nothing else. No subfolders. No shared folders.

## In Scope
- Moving Featured JSX into its own folder and file
- Moving ProductSpotlight1 JSX into its own folder and file
- Extracting TypeScript interfaces into types.ts per component
- Creating index.ts re-exports per component
- Updating the page import from RedesignFeaturedAndProductSpotlight
  to Featured and ProductSpotlight1
- Deleting the original merged file and folder

## Out of Scope
- Any change to JSX structure
- Any change to props or TypeScript interfaces beyond moving them
- Any change to Tailwind classes or styling
- Any change to logic or data flow
- Creating any shared folders between the two components
- Improving or optimizing either component in any way

## Forbidden Scope
- DO NOT change any className on any element
- DO NOT change any JSX nesting or structure
- DO NOT create any shared/ or common/ folders
- DO NOT touch Hero or any other component
- DO NOT add any new functionality
- DO NOT change any existing import paths except the one
  page-level import that references the merged component

## Architecture Decisions
- No shared abstractions between Featured and ProductSpotlight1
- Each component is fully self-contained in its folder
- types.ts contains interfaces only — no component code
- index.ts contains one re-export line only

CONSTRAINTS:
- Replace the entire file with exactly this content
- Do not touch any other file