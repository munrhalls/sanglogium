# NewestRelease Carousel — Intelligence, Plan & Execution Handoff

## 1. INTELLIGENCE GATHERED

### Component Location
`app/components/features/homepage/newest-release/NewestRelease.tsx`

### Current State (what's broken)
- Renders **one image only**: `backgroundImage = product.image ?? product.gallery?.[0]`
- No carousel. The image column is a bare `<div>` with a single `<Image>`.
- Prop type is incorrectly imported as `Spotlight1Data` (from spotlight-1), not `NewestReleaseData`.

### Data Layer — what's already correct
`app/lib/data/homepageBatch.ts` is the **actual data source** (not `getNewestRelease.ts`).

The GROQ query for `newestRelease` already fetches:
```groq
gallery[] { asset->{_id, url} }
```
So gallery images **are already being fetched from Sanity**. ✅

**Gap:** `processNewestReleaseData()` in `homepageBatch.ts` is a no-op. It does nothing — unlike the
spotlight equivalent which merges `image + gallery` into an `images[]` array. The `NewestReleaseProduct`
interface also lacks an `images?` field.

### Carousel Pattern (from ProductSpotlight1 — the reference)

**Data shape:** `product.images[]` — built by merging `[product.image, ...product.gallery]`

**5 carousel imports used:**
```ts
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
```

**Carousel usage pattern:**
```tsx
<Carousel itemsCount={product.images?.length || 1}
          breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }}
          className="w-full h-full overflow-visible">
  <CarouselTrack className="w-full h-full">
    {product.images?.map((image, idx) => (
      <CarouselSlide key={`${product._id}-${idx}`}
        className="aspect-square w-full flex items-center justify-center pb-4
                   opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out
                   data-[active=true]:opacity-100 data-[active=true]:scale-100">
        <Image src={image?.asset?._id ?? ""} ... />
      </CarouselSlide>
    ))}
  </CarouselTrack>
  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
    <div className="flex gap-2">
      <CarouselPrevious />
      <CarouselNext />
    </div>
    <CarouselDots />
  </div>
</Carousel>
```

**Image column in Spotlight1** (the container the carousel sits inside):
```tsx
<div className="w-full h-full bg-surface-productImage rounded-none flex items-center
                justify-center relative overflow-hidden border border-border-secondary">
```
Critical: `relative overflow-hidden` — required for absolute-positioned controls to work.

### NewestRelease Image Column (current)
```tsx
<div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px]
                bg-surface-productImage flex items-center justify-center p-6 lg:p-8">
```
Missing: `relative`, `overflow-hidden`. Has padding `p-6 lg:p-8` that must move into the slide.

### Tailwind Classes Confirmed
- `lg:flex-hero` → `flex: 0 0 42%` (defined in tailwind.config.ts `extend.flex`)
- `lg:flex-details` → `flex: 0 0 58%`
- Both are valid, defined. ✅

### Layout Difference vs Spotlight
NewestRelease uses full-bleed `flex flex-col lg:flex-row` (not spotlight's `grid grid-cols-2`).
Right column is dark `bg-brand-800`. Image column is cream `bg-surface-productImage`.
This layout is **preserved as-is** — only the image rendering inside the column changes.

---

## 2. GAP / RED FLAG SCAN

| # | Item | Status |
|---|------|--------|
| 1 | Gallery data already fetched in GROQ | ✅ No change needed |
| 2 | `processNewestReleaseData()` is a no-op → `images[]` never built | ⚠️ Must fix |
| 3 | `NewestReleaseProduct` lacks `images?` field | ⚠️ Must fix |
| 4 | Image column missing `relative overflow-hidden` | ⚠️ Must fix (carousel controls need it) |
| 5 | Image column padding `p-6 lg:p-8` must move to slide | ⚠️ Must fix |
| 6 | `aspect-square` from Spotlight1 slide is wrong for NewestRelease | ⚠️ Use `h-full` instead |
| 7 | `mix-blend-multiply` in Spotlight1 images — wrong for dark bg NewestRelease | ⚠️ Omit it (bg is cream `surface-productImage` — actually fine, keep it) |
| 8 | Prop type `Spotlight1Data` vs `NewestReleaseData` | Note only — both work at runtime; fix for correctness |
| 9 | `getNewestRelease.ts` standalone file — not used by page | Ignore — do not touch |
| 10 | Sanity schema — `gallery` field already exists on products | ✅ No change needed |

**Verdict:** 2 files to change. Zero risky moves. Zero schema changes.

---

## 3. PLAN — EXACT CHANGES

### File A: `app/lib/data/homepageBatch.ts`

**Change 1:** Add `images?` field to `NewestReleaseProduct` interface (line ~136):
```ts
// BEFORE
export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string; };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}

// AFTER — add images? field
export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string; };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery: Array<{ asset: { _id: string; url: string }; alt?: string }>;
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}
```

**Change 2:** Replace no-op `processNewestReleaseData()` with actual merge logic (line ~413):
```ts
// BEFORE
function processNewestReleaseData(data: NewestReleaseData | null): NewestReleaseData | null {
  // NewestReleaseData already has gallery in productRef, matches expected shape
  return data;
}

// AFTER
function processNewestReleaseData(data: NewestReleaseData | null): NewestReleaseData | null {
  if (!data || !data.productRef) return data;

  const product = data.productRef;
  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return {
    ...data,
    productRef: { ...product, images }
  };
}
```

---

### File B: `app/components/features/homepage/newest-release/NewestRelease.tsx`

**Full rewrite** (component only — keeping same layout skeleton):

```tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NewestReleaseData } from "@/app/lib/data/homepageBatch";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface NewestReleaseProps {
  newestReleaseData: NewestReleaseData | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle } = newestReleaseData;
  const images = product.images ?? (product.image ? [product.image] : []);

  return (
    <article className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">

        {/* Image column — carousel */}
        <div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px] bg-surface-productImage relative overflow-hidden">
          <Carousel
            itemsCount={images.length || 1}
            breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }}
            className="w-full h-full overflow-visible"
          >
            <CarouselTrack className="w-full h-full">
              {images.map((image, idx) => (
                <CarouselSlide
                  key={`${product._id}-${idx}`}
                  className="h-full w-full flex items-center justify-center p-6 lg:p-8
                             opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out
                             data-[active=true]:opacity-100 data-[active=true]:scale-100"
                >
                  <div className="max-w-[400px] w-full mx-auto">
                    <Image
                      src={image?.asset?._id ?? ""}
                      alt={product.name}
                      width={1024}
                      height={1024}
                      priority={idx === 0}
                      className="object-contain w-full h-auto"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                  </div>
                </CarouselSlide>
              ))}
            </CarouselTrack>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                <div className="flex gap-2">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
                <CarouselDots />
              </div>
            )}
          </Carousel>
        </div>

        {/* Text column — unchanged */}
        <div className="w-full lg:flex-details bg-brand-800 flex flex-col justify-center">
          <div className="w-full py-12 lg:py-24 px-8 lg:px-16">
            <div className="max-w-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="type-overline text-accent-500">New Release</span>
                  <span className="type-section-caption">{product.brand.name}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="type-hero-headline text-brand-400">
                    {promoTitle || product.name}
                  </h2>
                  <h3 className="type-hero-sub">
                    {promoSubtitle || product.name}
                  </h3>
                </div>

                {product.price_data?.unit_amount && (
                  <p className="type-price">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.price_data.currency?.toUpperCase() ?? "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(product.price_data.unit_amount / 100)}
                  </p>
                )}

                <Link
                  href={`/product/${product.slug}`}
                  className="btn-ghost self-start"
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
```

**Key differences from old component:**
- Import: `NewestReleaseData` from `homepageBatch` instead of `Spotlight1Data`
- Image column: added `relative overflow-hidden`, removed `flex items-center justify-center p-6 lg:p-8` (padding moved into slide)
- Carousel wraps all images; `images[]` falls back to `[product.image]` if processing somehow failed
- Controls only render when `images.length > 1` (clean UX for single-image products)
- Slide uses `h-full w-full` instead of `aspect-square` (preserves column height)

---

## 4. FILES TO CHANGE — SUMMARY

| File | Change type | Lines affected |
|------|-------------|----------------|
| `app/lib/data/homepageBatch.ts` | Add field to interface + fix function | ~5 lines each |
| `app/components/features/homepage/newest-release/NewestRelease.tsx` | Full rewrite | Full file |

**Files NOT touched:**
- `app/components/features/homepage/newest-release/getNewestRelease.ts` — standalone, not used
- `app/components/features/homepage/newest-release/types.ts` — unused legacy types
- All carousel components — complete and correct
- `app/(store)/page.tsx` — no change
- `app/(store)/lib/fetchHomepageData.ts` — no change
- Any Sanity schema

---

## 5. PHASES FOR DEVIN (FREE MODEL)

### Phase 1 — Fix data layer in `homepageBatch.ts`

**Task 1.1** — Add `images?` to `NewestReleaseProduct` interface

In file `app/lib/data/homepageBatch.ts`, find the `NewestReleaseProduct` interface
(currently ends with `gallery: Array<...>`). Add one line after the `gallery` field:
```ts
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
```

**Task 1.2** — Fix `processNewestReleaseData()`

In the same file, find `processNewestReleaseData`. Replace its entire body with:
```ts
function processNewestReleaseData(data: NewestReleaseData | null): NewestReleaseData | null {
  if (!data || !data.productRef) return data;

  const product = data.productRef;
  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return {
    ...data,
    productRef: { ...product, images }
  };
}
```

---

### Phase 2 — Rewrite `NewestRelease.tsx`

Replace the entire file `app/components/features/homepage/newest-release/NewestRelease.tsx`
with the exact code shown in Plan → File B above.

Do not modify any other file.

---

### Phase 3 — Verify

1. Run `npm run build` (or `next build`) — must complete with zero TypeScript errors
2. If build passes, run dev server and navigate to homepage
3. Confirm NewestRelease section shows carousel with prev/next buttons and dots
4. Confirm single-image products hide the controls (images.length > 1 guard)
5. Confirm layout (cream left column, dark right column) is unchanged

---

## 6. CONSTRAINTS & RULES FOR DEVIN

- **Only touch the 2 files listed.** Do not refactor, rename, or touch any other file.
- **Do not change the GROQ query** — gallery is already fetched.
- **Do not change Sanity schemas.**
- **Do not change carousel components** (`CarouselRoot`, `CarouselTrack`, `CarouselSlide`, `CarouselControls`, `CarouselContext`).
- **Do not remove or change the text column** (right side of NewestRelease) — only the left image column changes.
- **Use exact imports** as specified — import `NewestReleaseData` from `@/app/lib/data/homepageBatch`.
- If TypeScript errors appear after changes, fix them only by adjusting the 2 files above.
- If build fails for any other reason, **stop and report** rather than making additional changes.
