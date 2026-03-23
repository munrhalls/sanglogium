# SANG-LOGIUM PERFORMANCE SPRINT — AGENT PROMPTS
## Feed these to Windsurf one at a time, in order. Do not skip or combine prompts.

---

## MODEL SELECTION GUIDANCE

**Recommended model: Claude Sonnet 4.5 (not Haiku 3.5)**

Use Haiku 3.5 for prompts marked `[HAIKU OK]` — simple, mechanical, single-file edits with no reasoning required.
Use Sonnet 4.5 for prompts marked `[SONNET REQUIRED]` — multi-file coordination, new architecture, or decisions that require understanding type contracts across files.

Haiku 3.5 **will cause regressions** on prompts C-1, C-5, and H-2. It does not reliably track type contracts across 9 files simultaneously and will produce plausible-looking but broken TypeScript. The cost difference for these specific prompts is not worth the regression risk.

---

## BEFORE YOU START — READ ONCE

Each prompt is self-contained. It includes:
- The exact files to touch
- The exact files that are FORBIDDEN to touch
- A binary verification step you run after the agent finishes
- A STOP condition — if verification fails, do not proceed to the next prompt

Never feed prompt N+1 until prompt N verification passes. These are ordered by dependency: later prompts assume earlier ones completed correctly.

---

---

# PROMPT L-1 `[HAIKU OK]`
## Remove dead SVG and archived assets from /public/

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Delete dead static assets from the /public/ directory that are never referenced by any component.

FILES TO DELETE — delete these files exactly:
- public/logo_desktop.svg
- public/logo_desktop (1).svg
- public/archived/ (entire directory and all its contents)
- public/images/archive/ (entire directory and all its contents)
- app/fonts/GeistVF.woff
- app/fonts/GeistMonoVF.woff

VERIFICATION BEFORE DELETING: For each file/directory, confirm it does not appear in any import statement or string reference in the app/ directory. Run:
  grep -r "logo_desktop" app/ --include="*.tsx" --include="*.ts"
  grep -r "GeistVF\|GeistMono\|localFont" app/ --include="*.tsx" --include="*.ts"
  grep -r "images/archive\|archived/" app/ --include="*.tsx" --include="*.ts"
If any grep returns a result, stop and report it. Do not delete that file.

FORBIDDEN: Do not touch any file outside of public/ and app/fonts/. Do not modify any .tsx, .ts, or .css file. Do not delete public/LOGO.svg, public/logo-orbit.svg, public/logo-orbit-white.svg, public/backgrounds/, public/icons/, or public/images/headphones-skeletal.png, public/images/audio-electronics-skeletal.png, public/images/accessories-skeletal.png.

DONE CONDITION: All listed files/directories are gone. The app builds without error (run: npm run build). No component import errors related to missing files.
```

---

# PROMPT L-2 `[HAIKU OK]`
## Remove dead imports: spotlightImg and featuredImg

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Remove unused static PNG imports from four homepage component files. These imports exist but the imported variable is never used in JSX.

FILES TO EDIT — only these four:
1. app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx
2. app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx
3. app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx
4. app/components/features/homepage/featured/Featured.tsx

IN EACH FILE: Find and remove the import line that imports a local PNG file. Specifically:
- In ProductSpotlight1.tsx: remove the line `import spotlightImg from './product_spotlight_transparent.png';`
- In ProductSpotlight2.tsx: remove the line `import spotlightImg from '../product-spotlight-1/product_spotlight_transparent.png';`
- In ProductSpotlight3.tsx: remove the line `import spotlightImg from '../product-spotlight-1/product_spotlight_transparent.png';`
- In Featured.tsx: remove the line `import featuredImg from './featured_transparent.png';`

Do NOT remove any other import. Do NOT change any JSX. Do NOT change any logic. Only remove those exact import lines.

FORBIDDEN: Do not touch any other file. Do not modify getSpotlight1Data.ts, getSpotlight2Data.ts, getSpotlight3Data.ts, getFeaturedProducts.ts, or any file outside the four listed above.

VERIFICATION: After editing, confirm the variable `spotlightImg` and `featuredImg` do not appear anywhere in those files. Run: grep -n "spotlightImg\|featuredImg" app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx app/components/features/homepage/featured/Featured.tsx
Expected result: no output. Run npm run build and confirm it succeeds.

DONE CONDITION: Zero grep results. Build passes.
```

---

# PROMPT L-3 `[HAIKU OK]`
## Remove styledComponents compiler flag and verify react-multi-carousel / axios / react-icons are unused

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Remove unused compiler configuration and confirm dead production dependencies.

STEP 1 — Edit next.config.ts:
Remove the entire `compiler` property block from the nextConfig object. It currently reads:
  compiler: { styledComponents: true },
Delete that line. Do not touch anything else in next.config.ts.

STEP 2 — Audit unused dependencies (do NOT edit package.json yet, only report):
Run these greps and report the output exactly:
  grep -r "react-multi-carousel" app/ --include="*.tsx" --include="*.ts" -l
  grep -r "from 'axios'\|from \"axios\"" app/(store) --include="*.tsx" --include="*.ts" -l
  grep -r "react-icons" app/(store) --include="*.tsx" --include="*.ts" -l

If ALL three greps return zero results (no files found), then ALSO edit package.json:
  - Move "react-multi-carousel" from dependencies to devDependencies (or remove it entirely if it is not used in any test or script file — check scripts/ and tests/ directories first)
  - Move "axios" from dependencies to devDependencies (same caveat — check scripts/ and tests/)
  - Move "react-icons" from dependencies to devDependencies (same caveat)

If any grep returns a result, do NOT modify package.json for that package. Report which file is using it.

FORBIDDEN: Do not touch any component file. Do not touch tailwind.config.ts. Do not remove any package that grep shows is actually imported somewhere.

VERIFICATION: npm run build must pass. npm run ts-check must pass.

DONE CONDITION: compiler block absent from next.config.ts. Build and type-check pass.
```

---

# PROMPT L-4 `[HAIKU OK]`
## Fix transition-all on .interactive-card + remove middleware '/' matcher

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Two small, independent fixes.

FIX 1 — app/globals.css:
Find the `.interactive-card` class definition. It currently contains `transition-all`. Replace only the transition property so it reads `transition-transform` instead. The full class should become:
  .interactive-card {
    @apply transition-transform duration-700 ease-out hover:scale-[1.03] hover:border-brand-400/40;
  }
Do not change any other class in globals.css.

FIX 2 — middleware.ts:
In the `matcher` array inside `export const config`, remove the entry `"/"` (the bare root path string). Leave all other matcher entries exactly as they are. The home page is fully public and does not require Clerk JWT verification on every request.

FORBIDDEN: Do not touch any other file. Do not modify any component. Do not remove any other matcher entry. Do not add any new logic to middleware.ts.

VERIFICATION:
- grep "transition-all" app/globals.css should return zero results for the interactive-card block
- grep '"/"' middleware.ts should return zero results
- npm run build must pass

DONE CONDITION: Both greps return zero results. Build passes.
```

---

# PROMPT M-1 `[HAIKU OK]`
## Disable Sanity stega in production

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Make Sanity's stega (visual editing overlay) conditional so it only activates in preview/draft environments, not in production.

FILE TO EDIT: sanity/lib/client.ts

CURRENT CODE (the stega block inside createClient):
  stega: {
    studioUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/studio`
      : "http://localhost:3000/studio",
  },

REPLACE IT WITH:
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview",
    studioUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/studio`
      : "http://localhost:3000/studio",
  },

That is the only change. Do not modify anything else in this file. Do not change the client, builder, urlFor, or sanityFetch exports.

FORBIDDEN: Do not touch any other file in the sanity/ directory. Do not touch any component. Do not touch next.config.ts.

VERIFICATION: The file diff shows exactly one new line added: `enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview",`. npm run build passes. npm run ts-check passes.

DONE CONDITION: stega.enabled is present and conditional. Build and type-check pass.
```

---

# PROMPT M-2 `[HAIKU OK]`
## Fix IemCard and DacCard priority flags — remove eager loading on below-fold cards

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Remove incorrect `priority` flags from product card images that are below the fold on initial page load. These cards compete with the actual LCP element (the Hero image) for browser preload bandwidth.

FILES TO EDIT — only these two:
1. app/components/features/homepage/iems-gallery/IemCard.tsx
2. app/components/features/homepage/dacs/DacCard.tsx

FOR IemCard.tsx:
Find the <Image> component. It currently has:
  priority={idx < 4}
  loading={idx < 4 ? "eager" : "lazy"}
Replace both props with:
  loading="lazy"
Remove the priority prop entirely. Do not change any other prop on the Image component.

FOR DacCard.tsx:
Find the <Image> component. It currently has:
  priority={idx < 4}
  loading={idx < 4 ? "eager" : "lazy"}
Replace both props with:
  loading="lazy"
Remove the priority prop entirely. Do not change any other prop on the Image component.

Also check app/components/features/homepage/accessories/AccessoryCard.tsx — if it has the same pattern (priority={idx < 4}), apply the same fix there too.

FORBIDDEN: Do not touch Hero.tsx. Do not touch Featured.tsx (the Featured carousel's first card correctly uses priority={idx === 0} — leave it). Do not modify any other component. Do not touch any fetch function or data file.

VERIFICATION:
  grep -n "priority" app/components/features/homepage/iems-gallery/IemCard.tsx
  grep -n "priority" app/components/features/homepage/dacs/DacCard.tsx
  grep -n "priority" app/components/features/homepage/accessories/AccessoryCard.tsx
All three should return zero results (priority prop fully removed). npm run build passes.

DONE CONDITION: Zero priority occurrences in those three files. Build passes.
```

---

# PROMPT M-3 `[HAIKU OK]`
## Fix netlify.toml: remove conflicting /_next/image cache header override

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Remove a cache header override in netlify.toml that conflicts with Next.js 15's built-in image cache management. The next.config.ts already sets minimumCacheTTL: 31536000 which controls this correctly.

FILE TO EDIT: netlify.toml

FIND AND REMOVE this entire block (4 lines including the [[headers]] directive and its values):
  [[headers]]
    for = "/_next/image*"
    [headers.values]
      Cache-Control = "public, max-age=604800, immutable"

Do not touch any other block in netlify.toml. Leave the /static/* block and the /*.ico block exactly as they are.

FORBIDDEN: Do not touch next.config.ts. Do not touch any component. Do not touch any other file.

VERIFICATION: grep "next/image" netlify.toml should return zero results. The file should still contain the [[plugins]] block and the /static/* headers block. npm run build passes.

DONE CONDITION: Zero matches for "next/image" in netlify.toml. Build passes.
```

---

# PROMPT C-4 `[HAIKU OK]`
## Fix CatalogueNavbar hero images: add sizes prop, remove priority

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: The catalogue navigation bar renders three decorative skeleton images (headphones, audio-electronics, accessories) each with `priority` and no `sizes` prop. These images are hidden on mobile (lg:flex on the parent nav), load eagerly before the hero, and without `sizes` Next.js requests them at full viewport width. Fix both issues.

FILE TO EDIT: app/components/layout/catalogue/hero/HeroImage.tsx

CURRENT Image component:
  <Image
    src={data.imageUrl}
    alt={data.label}
    fill
    className="object-contain rounded-none"
    priority
  />

REPLACE WITH:
  <Image
    src={data.imageUrl}
    alt={data.label}
    fill
    className="object-contain rounded-none"
    loading="lazy"
    sizes="(max-width: 1024px) 0px, (max-width: 1280px) 288px, 400px"
  />

Explanation of sizes: the catalogue navbar is hidden below 1024px (so 0px there), at lg-touch it is max 288px wide, at lg-desktop it is max 400px wide.

FORBIDDEN: Do not touch data.ts. Do not touch CatalogueNavbar.tsx. Do not touch SliceHero.tsx. Do not touch the catalogue PNG files in public/images/. Do not convert the PNGs to WebP (that is a separate build-time task outside this agent's scope).

VERIFICATION:
  grep -n "priority" app/components/layout/catalogue/hero/HeroImage.tsx
Should return zero results. The file should contain `loading="lazy"` and `sizes=`. npm run build passes.

DONE CONDITION: priority absent, sizes present, loading="lazy" present. Build passes.
```

---

# PROMPT C-3 `[SONNET REQUIRED]`
## Replace fractal_ring.webp CSS backgrounds with lazy Next Image components

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Four homepage section components use `fractal_ring.webp` as a Tailwind arbitrary CSS background-image. This bypasses Next.js image optimization, cannot be lazy-loaded, and is not deduped across sections. Replace the CSS background div with a Next.js <Image> component using loading="lazy" in all four files.

FILES TO EDIT — exactly these four:
1. app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx
2. app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx
3. app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx
4. app/components/features/homepage/newest-release/NewestRelease.tsx

IN EACH FILE, find this div (it may have slightly different className ordering but the bg-[url('/fractal_ring.webp')] is the identifier):
  <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0" />

REPLACE IT WITH (add the import and JSX):

First, add this import at the top of the file with the other imports:
  import Image from "next/image";

Note: if the file already imports Image from "next-sanity/image", use a named import alias:
  import NextImage from "next/image";
  and use <NextImage ...> in the JSX below.

Then replace the div with:
  <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none z-0 overflow-hidden">
    <Image
      src="/backgrounds/fractal_ring.webp"
      alt=""
      fill
      loading="lazy"
      sizes="100vw"
      className="object-cover object-right-bottom"
      aria-hidden="true"
    />
  </div>

IMPORTANT: The fractal_ring.webp file is located at public/backgrounds/fractal_ring.webp so the correct src is "/backgrounds/fractal_ring.webp".

FORBIDDEN: Do not change any other part of any component's JSX. Do not touch any fetch function. Do not touch getSpotlight1Data.ts, getSpotlight2Data.ts, getSpotlight3Data.ts, getNewestRelease.ts. Do not modify globals.css or tailwind.config.ts.

VERIFICATION:
  grep -rn "bg-\[url.*fractal_ring" app/components/features/homepage/ --include="*.tsx"
Expected result: zero matches. Then:
  grep -rn "fractal_ring" app/components/features/homepage/ --include="*.tsx"
Should show only the new Image src="/backgrounds/fractal_ring.webp" references.
npm run build must pass. npm run ts-check must pass.

DONE CONDITION: Zero CSS bg-[url] references to fractal_ring. Four Image components with loading="lazy" present. Build and type-check pass.
```

---

# PROMPT C-2 `[SONNET REQUIRED]`
## Optimize all Sanity image URLs — add .width().auto('format').quality() to every urlFor call on the homepage

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: Every Sanity image on the homepage is fetched via bare `urlFor(source).url()` calls. This causes Sanity CDN to return the original full-resolution image regardless of the viewport. Add appropriate width, format, and quality parameters to every urlFor call in homepage components.

The @sanity/image-url builder supports chaining: urlFor(source).width(N).auto('format').quality(75).url()

FILES TO EDIT — only these files inside app/components/features/homepage/:
1. hero/Hero.tsx
2. featured/Featured.tsx  
3. product-spotlight-1/ProductSpotlight1.tsx
4. product-spotlight-2/ProductSpotlight2.tsx
5. product-spotlight-3/ProductSpotlight3.tsx
6. iems-gallery/IemCard.tsx
7. newest-release/NewestRelease.tsx
8. dacs/DacCard.tsx
9. accessories/AccessoryCard.tsx

RULES FOR WIDTH SELECTION — use these exact widths:

Hero.tsx — mobile image:
  urlFor(mobileBackgroundImage).width(828).auto('format').quality(85).url()
Hero.tsx — desktop image:
  urlFor(data.backgroundImage).width(1920).auto('format').quality(85).url()
  (Hero uses quality(85) not 75 because it is the LCP element and visible degradation matters)

Featured.tsx — product card image inside FeaturedCard:
  urlFor(product.image).width(450).auto('format').quality(75).url()

ProductSpotlight1.tsx — carousel product images:
  urlFor(image).width(800).auto('format').quality(75).url()

ProductSpotlight2.tsx — carousel product images:
  urlFor(image).width(800).auto('format').quality(75).url()

ProductSpotlight3.tsx — product image (non-carousel if present):
  urlFor(image).width(800).auto('format').quality(75).url()
  (Apply to whatever urlFor call(s) are present in this file)

IemCard.tsx — gallery grid image:
  urlFor(product.image).width(400).auto('format').quality(75).url()

NewestRelease.tsx — carousel product images:
  urlFor(image).width(800).auto('format').quality(75).url()

DacCard.tsx — product card image:
  urlFor(item.image).width(400).auto('format').quality(75).url()

AccessoryCard.tsx — product card image:
  urlFor(item.image).width(400).auto('format').quality(75).url()

DO NOT CHANGE: Do not modify the urlFor helper in sanity/lib/image.ts. Do not modify the sanityFetch function. Do not change any Image component props other than src. Do not change component logic, fetch calls, types, or layout.

FORBIDDEN: Do not touch any file outside the 9 listed above. Do not touch sanity/lib/image.ts or sanity/lib/client.ts.

VERIFICATION:
  grep -rn "urlFor.*\.url()" app/components/features/homepage/ --include="*.tsx"
Every result should show .width(...).auto('format').quality(...) before the .url() call.
  grep -rn "urlFor\(.*\)\.url()" app/components/features/homepage/ --include="*.tsx"
This should return ZERO results (bare .url() with nothing chained before it).
npm run build passes. npm run ts-check passes.

DONE CONDITION: Zero bare urlFor().url() calls in homepage components. All 9 files have width+format+quality chains. Build and type-check pass.
```

---

# PROMPT C-1 `[SONNET REQUIRED]`
## Parallelize all homepage data fetches with Promise.all in page.tsx

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

TASK: The home page (app/(store)/page.tsx) currently renders 9 async server components each of which independently awaits a Sanity fetch. Because React RSC renders top-to-bottom, these execute serially — each waits for the previous to complete before starting. Replace this with a single parallel Promise.all at the page level, then pass the fetched data as props to each section component.

This requires changes in two groups of files:

GROUP A — The section components that currently self-fetch (make them accept data as props):
1. app/components/features/homepage/hero/Hero.tsx
2. app/components/features/homepage/featured/Featured.tsx
3. app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx
4. app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx
5. app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx
6. app/components/features/homepage/iems-gallery/IemsGallery.tsx
7. app/components/features/homepage/newest-release/NewestRelease.tsx
8. app/components/features/homepage/dacs/Dacs.tsx
9. app/components/features/homepage/accessories/Accessories.tsx

GROUP B — The page that orchestrates:
10. app/(store)/page.tsx

APPROACH — for each section component in Group A:

Step 1: Remove the internal data fetch call (e.g. `const data = await getHeroData()` at the top of the component function).

Step 2: Add a typed props interface. Use the existing return types from the get* functions. Example for Hero:
  import { HeroData } from './types'; // already exists
  interface HeroProps { data: HeroData | null }
  export default function Hero({ data }: HeroProps) { ... }

Step 3: Keep all existing JSX exactly as-is. The only thing changing is WHERE the data comes from (prop instead of internal fetch).

Step 4: Keep all existing imports EXCEPT the import of the get* fetch function (which can be removed from the component file since the page will handle fetching).

EXISTING TYPES to reference for props:
- Hero: The component already has `HeroData` and `SanityImage` types in ./types — use HeroData | null
- Featured: return type of getFeaturedProducts() is FeaturedProduct[] — use FeaturedProduct[]
- ProductSpotlight1/2/3: return type of getSpotlight1/2/3Data() is Spotlight1Data | null
- IemsGallery: return type of getIemProducts() is IemProduct[]
- NewestRelease: return type of getNewestRelease() is NewestReleaseData | null
- Dacs: return type of getDacProducts() is DacProduct[]
- Accessories: return type of getAccessoryProducts() is AccessoryData

APPROACH for page.tsx (GROUP B):

Replace the current page.tsx content with a parallel fetch + prop-passing pattern:

```tsx
import { getHeroData } from "@/sanity/lib/hero/getHeroData";
import { getFeaturedProducts } from "@/app/components/features/homepage/featured/getFeaturedProducts";
import { getSpotlight1Data } from "@/app/components/features/homepage/product-spotlight-1/getSpotlight1Data";
import { getSpotlight2Data } from "@/app/components/features/homepage/product-spotlight-2/getSpotlight2Data";
import { getSpotlight3Data } from "@/app/components/features/homepage/product-spotlight-3/getSpotlight3Data";
import { getIemProducts } from "@/app/components/features/homepage/iems-gallery/getIemProducts";
import { getNewestRelease } from "@/app/components/features/homepage/newest-release/getNewestRelease";
import { getDacProducts } from "@/app/components/features/homepage/dacs/getDacProducts";
import { getAccessoryProducts } from "@/app/components/features/homepage/accessories/getAccessoryProducts";

import Hero from "@/app/components/features/homepage/hero/Hero";
import Featured from "@/app/components/features/homepage/featured";
import ProductSpotlight1 from "@/app/components/features/homepage/product-spotlight-1";
import ProductSpotlight2 from "@/app/components/features/homepage/product-spotlight-2/ProductSpotlight2";
import ProductSpotlight3 from "@/app/components/features/homepage/product-spotlight-3/ProductSpotlight3";
import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";
import NewestRelease from "@/app/components/features/homepage/newest-release/NewestRelease";
import Dacs from "@/app/components/features/homepage/dacs/Dacs";
import Accessories from "@/app/components/features/homepage/accessories/Accessories";
import Shelf from "@/app/components/layout/general/Shelf";

export const revalidate = 3600;

export default async function HomePage() {
  const [
    heroData,
    featuredProducts,
    spotlight1Data,
    spotlight2Data,
    spotlight3Data,
    iemProducts,
    newestReleaseData,
    dacProducts,
    accessoryData,
  ] = await Promise.all([
    getHeroData(),
    getFeaturedProducts(),
    getSpotlight1Data(),
    getSpotlight2Data(),
    getSpotlight3Data(),
    getIemProducts(),
    getNewestRelease(),
    getDacProducts(),
    getAccessoryProducts(),
  ]);

  return (
    <div>
      <Hero data={heroData} />

      <Shelf>
        <Featured data={featuredProducts} />
      </Shelf>

      <Shelf>
        <ProductSpotlight1 data={spotlight1Data} />
        <ProductSpotlight2 data={spotlight2Data} />
        <ProductSpotlight3 data={spotlight3Data} />
      </Shelf>

      <Shelf>
        <IemsGallery products={iemProducts} />
      </Shelf>

      <Shelf>
        <NewestRelease data={newestReleaseData} />
      </Shelf>

      <Shelf>
        <Dacs products={dacProducts} />
      </Shelf>

      <Shelf>
        <Accessories data={accessoryData} />
      </Shelf>
    </div>
  );
}
```

IMPORTANT NOTES:
- IemsGallery currently calls its prop `products` internally — match whatever internal variable name it uses when you convert it to accept props
- Dacs currently calls its internal fetch result `products` — match it
- Accessories currently calls getAccessoryProducts() and destructures `{ cables, earpads, storage }` — the prop can be the full AccessoryData object and the component can destructure from it
- getAccessoryProducts() internally uses Promise.all already — that's fine, keep it as-is
- Keep the `export const revalidate = 3600` on page.tsx
- Do NOT add Suspense wrappers — the existing layout.tsx Suspense around DrawersManager is sufficient for that boundary; the page-level components are all server components and will stream correctly

FORBIDDEN: Do not modify any get*Data.ts fetch function files. Do not modify the Shelf component. Do not modify the layout.tsx. Do not add "use client" to any component. Do not restructure any component's JSX.

VERIFICATION:
1. npm run ts-check — must return zero errors
2. npm run build — must succeed
3. grep -n "await get" app/\(store\)/page.tsx — should return zero results (no direct awaits in page.tsx anymore)
4. grep -n "Promise.all" app/\(store\)/page.tsx — should return one result
5. grep -n "await getHeroData\|await getFeaturedProducts\|await getSpotlight\|await getIemProducts\|await getNewestRelease\|await getDacProducts\|await getAccessoryProducts" app/components/features/homepage/ -r --include="*.tsx" — should return zero results (fetches removed from components)

DONE CONDITION: All 5 verification checks pass.
```

---

# PROMPT H-1 `[SONNET REQUIRED]`
## Fix Hero double priority preload — single image strategy with proper art direction

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

CONTEXT: This prompt must run AFTER the Promise.all parallelization prompt (C-1) has been applied, because Hero.tsx now accepts data as a prop.

TASK: The Hero component renders two Next.js <Image> components simultaneously — one for mobile (hidden on md+) and one for desktop (hidden below md). Both carry the `priority` flag, which causes the browser to inject TWO preload links in the <head> and download both images regardless of the actual viewport. On mobile this wastes the entire desktop hero image download. On desktop this wastes the mobile image.

FILE TO EDIT: app/components/features/homepage/hero/Hero.tsx

CURRENT PROBLEMATIC PATTERN:
  <Image
    src={urlFor(mobileBackgroundImage)...url()}
    ...
    priority
    className="block ... md:hidden"
  />
  <Image
    src={urlFor(data.backgroundImage)...url()}
    ...
    priority
    className="hidden ... md:block"
  />

SOLUTION: Keep both Image components (CSS-based art direction is acceptable) but remove `priority` from the desktop image. The mobile image is the LCP on mobile, the desktop image is the LCP on desktop — but the browser will only render one of them. Give priority only to the mobile image (it covers more users and is statistically the dominant LCP candidate), and let the desktop image load eagerly via loading="eager" without a preload link:

REPLACE the two Image components with:
  <Image
    src={urlFor(mobileBackgroundImage).width(828).auto('format').quality(85).url()}
    alt={mobileBackgroundImage.alt || "Hero Image"}
    fill
    priority
    className={cn("block object-cover rounded-none", "md:hidden")}
    sizes="100vw"
    quality={90}
    style={{ objectPosition: getPosition(mobileBackgroundImage) }}
  />

  <Image
    src={urlFor(data.backgroundImage).width(1920).auto('format').quality(85).url()}
    alt={data.backgroundImage.alt || "Hero Image"}
    fill
    loading="eager"
    className={cn("hidden object-cover rounded-none", "md:block")}
    sizes="100vw"
    quality={90}
    style={{ objectPosition: getPosition(data.backgroundImage) }}
  />

Note: the urlFor chains should already be present from the C-2 prompt. If they are not (i.e. you see bare .url() calls), add the chains as shown.

FORBIDDEN: Do not change the getPosition function. Do not change the section wrapper. Do not change the text/CTA overlay. Do not change the gradient div. Do not touch any other component.

VERIFICATION:
  grep -n "priority" app/components/features/homepage/hero/Hero.tsx
Expected: exactly ONE result (on the mobile image only, not the desktop image).
npm run build passes.

DONE CONDITION: Exactly one priority prop in Hero.tsx. Build passes.
```

---

# PROMPT H-2 `[SONNET REQUIRED]`
## Stream real auth state in Header via Suspense + async server component

```
You are working on the sang-logium Next.js 15 e-commerce codebase.

CONTEXT: The Header component currently hardcodes isAuthenticated={false} and cartCount={0}, meaning every user sees a "logged out" header on every page load, including users who are authenticated. This is a correctness defect that also causes CLS when the real state loads client-side.

TASK: Refactor the header auth/cart display to use a Suspense boundary with an async server component that reads real auth state.

FILES TO CREATE (new files):
1. app/components/layout/header/NavbarActionsServer.tsx — async RSC that fetches real auth state
2. app/components/layout/header/NavbarActionsSkeleton.tsx — skeleton for Suspense fallback

FILES TO EDIT:
3. app/components/layout/header/Header.tsx — add Suspense boundary

DO NOT EDIT: NavbarActions.tsx (the existing client component — it stays as-is, receiving props)

STEP 1 — Create NavbarActionsServer.tsx:

```tsx
import { auth } from "@clerk/nextjs/server";
import NavbarActions from "./NavbarActions";

export default async function NavbarActionsServer() {
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  // Cart count: hardcode 0 for now — cart state is managed client-side via Zustand
  // A future prompt will wire up real cart count; this prompt only fixes auth state
  const cartCount = 0;

  return <NavbarActions isAuthenticated={isAuthenticated} cartCount={cartCount} />;
}
```

STEP 2 — Create NavbarActionsSkeleton.tsx:

```tsx
import { cn } from "@/lib/utils/tailwind";

export default function NavbarActionsSkeleton() {
  return (
    <div className={cn("ml-6 hidden items-center gap-6", "lg:flex")}>
      <div className="h-6 w-6 rounded bg-brand-800/40 animate-pulse" />
      <div className="h-6 w-6 rounded bg-brand-800/40 animate-pulse" />
    </div>
  );
}
```

STEP 3 — Edit Header.tsx:

Add import for Suspense, NavbarActionsServer, and NavbarActionsSkeleton. Replace the current `<NavbarActions isAuthenticated={false} cartCount={0} />` line with:

```tsx
<Suspense fallback={<NavbarActionsSkeleton />}>
  <NavbarActionsServer />
</Suspense>
```

The final Header.tsx should look like:
```tsx
import { cn } from "@/lib/utils/tailwind";
import BrandLogo from "./BrandLogo";
import Searchbar from "./Searchbar";
import NavbarActionsServer from "./NavbarActionsServer";
import NavbarActionsSkeleton from "./NavbarActionsSkeleton";
import { Suspense } from "react";

export default function Header() {
  return (
    <header
      className={cn(
        "sticky left-0 right-0 top-0 z-50",
        "flex h-[var(--mobile-header-h)] shrink-0 items-center justify-around gap-4 lg:h-[var(--desktop-header-h)]",
        "bg-brand-900 text-cap"
      )}
    >
      <BrandLogo />
      <Searchbar />
      <Suspense fallback={<NavbarActionsSkeleton />}>
        <NavbarActionsServer />
      </Suspense>
    </header>
  );
}
```

FORBIDDEN: Do not modify NavbarActions.tsx. Do not add "use client" to Header.tsx, NavbarActionsServer.tsx, or NavbarActionsSkeleton.tsx. Do not modify Searchbar.tsx or BrandLogo.tsx. Do not touch middleware.ts.

VERIFICATION:
1. grep -n "isAuthenticated={false}" app/components/layout/header/Header.tsx — must return zero results
2. grep -n "Suspense" app/components/layout/header/Header.tsx — must return one result
3. npm run ts-check — zero errors
4. npm run build — passes

DONE CONDITION: All 4 checks pass. No hardcoded false in Header.tsx.
```

---

---

## EXECUTION ORDER SUMMARY

Run these prompts in this exact sequence. Tick each box only after its verification passes.

```
[ ] L-1  — Delete dead public assets and font files         [HAIKU OK]
[ ] L-2  — Remove dead spotlightImg/featuredImg imports     [HAIKU OK]
[ ] L-3  — Remove styledComponents flag, audit dead deps    [HAIKU OK]
[ ] L-4  — Fix transition-all, remove '/' from middleware   [HAIKU OK]
[ ] M-1  — Disable stega in production                      [HAIKU OK]
[ ] M-2  — Remove priority from IemCard/DacCard/AccessoryCard [HAIKU OK]
[ ] M-3  — Remove conflicting netlify.toml image header     [HAIKU OK]
[ ] C-4  — Fix CatalogueNavbar image: lazy + sizes          [HAIKU OK]
[ ] C-3  — Replace fractal_ring CSS backgrounds with Image  [SONNET REQUIRED]
[ ] C-2  — Add width/format/quality to all urlFor calls     [SONNET REQUIRED]
[ ] C-1  — Parallelize homepage fetches via Promise.all     [SONNET REQUIRED]
[ ] H-1  — Fix Hero double priority preload                 [SONNET REQUIRED]
[ ] H-2  — Stream real auth state in Header via Suspense    [SONNET REQUIRED]
```

**H-1 depends on C-1.** Do not run H-1 before C-1 is complete.
**C-2 and C-3 are independent of C-1** — they can technically run before it, but run in the listed order to avoid confusion.

---

## WHAT IS NOT IN THESE PROMPTS (DEFERRED)

These items from the audit are real issues but require decisions or build-time tooling outside an agent's scope:

- **Converting catalogue PNGs to WebP** — requires running `cwebp` or `squoosh` on the three skeleton images and updating the `data.ts` imageUrl strings. Do this manually before or after the sprint: `cwebp -q 80 -resize 400 400 public/images/headphones-skeletal.png -o public/images/headphones-skeletal.webp` etc.
- **Per-section Sanity cache tags (DoD M-3 from audit)** — requires updating the Sanity `/api/revalidate` endpoint logic alongside the fetch functions. Architectural decision: defer to a separate sprint.
- **Wiring real cart count into NavbarActionsServer** — cart is Zustand client state; bridging it to SSR requires a cookie-based cart token strategy. Deferred.
```
