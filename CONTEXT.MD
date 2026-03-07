Context: Next 15, Tailwind 3, sanity v3, react 18, all icons are phosphor icons and sometimes, custom assets (e.g. logo dots for carousel). Tailwind config defines typography scale (utilizes clamp), colors, spacing, breakpoints, etc. Workspace: antigravity IDE. Folders: no src folder.
Safety: be mindful of assumptions, avoid shifting code unless you are 100%  clear 1 to 1 awareness of why that code exists and is the way it is. Beware changing something without deeper understanding of further relationships and perception of n-th level consequences of altering the existing relations.
Constraints: Highly performant, lean, works fast at even 6x cpu throttle/weak network setting in dev tools. Mobile responsive, semantic HTML, step-by-step verification of every step. Must aim at simplest possible solution * fully robust/professional. Must account for 2nd and 3rd order consequences - in terms of how implementation might complicate. Must assess options to now and avoid future complications.



// Homepage features context
The App Wrapper handles 1440px. The Shelf handles py-20.


// Context When images are present

Sanity image optimizations vs next/image optimizations sync strategy:
Zero-Conflict Optimization: Use next/image with a Custom Loader (@sanity/image-url).

CDN Offloading: Direct all transformation requests (width, quality, format) to Sanity's API to bypass the Next.js image optimization server, reducing server load and improving TTFB.

Aspect Ratio Integrity: Always fetch metadata.dimensions from Sanity to provide Next.js with the base aspect ratio. Use the fill or sizes attribute to ensure the browser selects the correct srcset from the Sanity CDN.

Hotspot/Crop: Apply Sanity's .rect() parameters within the loader so the browser never downloads pixels that are cropped out of the design.

