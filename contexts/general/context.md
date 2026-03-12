System Constitution: Next 15, Tailwind 3, Sanity v3.
Environment: Windows 11 / PowerShell. Structure: No /src folder. Workspace: antigravity IDE.

Critical - Must remain fluid/interactable/performant/fast at 6x CPU throttle/3G slow network.

Everything should be kept as simple and robust as possible.

All code changes should be considered not in isolation but in system-coherence, system-fit first, and then in terms of individual change, in order to avoid changes that fix individual thing but disrupt system simplicity and coherence.

Safety: be mindful of assumptions, avoid shifting code unless you are 100%  clear 1 to 1 awareness of why that code exists and is the way it is. Beware changing something without deeper understanding of further relationships and perception of n-th level consequences of altering the existing relations.

Constraints: Highly performant, lean, works fast at even 6x cpu throttle/weak network setting in dev tools. Mobile responsive, semantic HTML, step-by-step verification of every step. Must aim at simplest possible solution * fully robust/professional. Must account for 2nd and 3rd order consequences - in terms of how implementation might complicate. Must assess options to now and avoid future complications.

Aspect Ratio Integrity: Always fetch metadata.dimensions from Sanity to provide Next.js with the base aspect ratio. Use the fill or sizes attribute to ensure the browser selects the correct srcset from the Sanity CDN.

Sanity image optimizations vs next/image optimizations sync strategy:
Zero-Conflict Optimization: Use next/image with a Custom Loader (@sanity/image-url).

1. THE SOURCE OF TRUTH
- Tailwind Config governs all visual logic (Typography, Colors, Spacing).
- The App is a 1440px rigid container; components must respect this boundary.

2. SYSTEM COHERENCE (The Sync Rule)
- System-Fit First: Every change must be assessed for its impact on the whole. No "local fixes" that create "global debt."
- Mechanical Awareness: 1-to-1 understanding of existing code is mandatory before alteration.
- Component Physics: Layout (Shelf) -> Structure (Track/Slide) -> Content (Product/Media). Logic flows downward.

- Gutters: Managed at the Layout level (Track/Slide), never the Component level (Product), to maintain snap-integrity.

4. PERFORMANCE
- Zero-Conflict Strategy: next/image + @sanity/image-url custom loader.
- CDN-First: All transforms (crop/rect) happen at the Sanity Edge to bypass Vercel load.
- Constraints: Must remain fluid/interactable/performant/fast at 6x CPU throttle/3G slow network.
