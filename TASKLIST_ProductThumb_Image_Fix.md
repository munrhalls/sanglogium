# IMPLEMENTATION TASKLIST: ProductThumb Image Optimization Fix
**Priority:** CRITICAL (Blocking Production)  
**Component:** `app/components/features/products/ProductThumb.tsx`  
**Violation:** Using `next/image` without custom loader bypasses Sanity CDN

---

## CURRENT STATE (VIOLATING)

**File:** `app/components/features/products/ProductThumb.tsx:45-51`

```typescript
import Image from "next/image";

<Image
  src={imageUrl(product.image).url()}  // ❌ Sanity URL passed directly
  alt={product?.name}
  height={300}  // ❌ Hardcoded - ignores metadata.dimensions
  width={300}   // ❌ Hardcoded - ignores metadata.dimensions
  className="aspect-square rounded-sm"
/>
```

**Architectural Violations:**
1. ❌ Next.js image optimization server handles transforms (not Sanity CDN)
2. ❌ No custom loader configured for `@sanity/image-url`
3. ❌ Hardcoded dimensions ignore `metadata.dimensions` from Sanity
4. ❌ Hotspot/crop data (`.rect()`) not applied

---

## TARGET STATE (COMPLIANT)

**Goal:** Use Sanity CDN for ALL image transformations

**Approach A: Use `<img>` with Sanity CDN (Recommended for simplicity)**
```typescript
<img
  src={imageUrl(product.image)
    .width(400)
    .height(400)
    .fit('crop')
    .auto('format')
    .quality(75)
    .url()}
  alt={product.name}
  loading="lazy"
  className="aspect-square w-full rounded-sm"
/>
```

**Approach B: Use `next/image` with custom loader (If Next.js Image features needed)**
```typescript
<Image
  src={imageUrl(product.image).url()}
  loader={({ src, width }) => 
    imageUrl(product.image)
      .width(width)
      .auto('format')
      .quality(75)
      .url()
  }
  width={product.image.asset.metadata.dimensions.width}
  height={product.image.asset.dimensions.height}
  alt={product.name}
  className="rounded-sm"
/>
```

---

## TASK BREAKDOWN

### Phase 1: Analysis (5 min)
- [ ] **Task 1.1:** Verify current Product props include image metadata
  - Check: Does `product.image.asset.metadata.dimensions` exist in type?
  - File: `sanity.types.ts` - verify `SanityImageAsset` has `metadata`
  - If NO: Query needs to be updated to fetch metadata

- [ ] **Task 1.2:** Verify `imageUrl` helper supports all needed transformations
  - File: `lib/sanity/imageUrl.ts`
  - Check: `.width()`, `.height()`, `.fit()`, `.auto()`, `.quality()` available

### Phase 2: Query Update (10 min) - IF NEEDED
- [ ] **Task 2.1:** Update GROQ to fetch image metadata
  - File: `sanity/lib/products/getSelectedProducts.ts` OR `getAllProducts.ts`
  - Add to query:
    ```groq
    image {
      asset-> {
        _id,
        metadata {
          dimensions { width, height, aspectRatio }
        }
      }
    }
    ```

### Phase 3: Component Update (15 min)
- [ ] **Task 3.1:** Replace `next/image` import with `<img>`
  - Remove: `import Image from "next/image";`
  - Keep: `import { imageUrl } from "@/lib/sanity/imageUrl";`

- [ ] **Task 3.2:** Implement responsive image with Sanity CDN
  - Replace Image component with `<img>`
  - Use `imageUrl()` builder with proper transformations:
    - `.width(400)` for display size
    - `.auto('format')` for WebP conversion
    - `.quality(75)` for optimization
    - `.fit('crop')` for aspect ratio handling

- [ ] **Task 3.3:** Add loading="lazy" for performance
  - Native lazy loading attribute

### Phase 4: Type Safety (5 min)
- [ ] **Task 4.1:** Verify type imports still valid
  - Check: `Product` type from `@/sanity.types` includes image shape
  - Check: No TypeScript errors after changes

### Phase 5: Testing (10 min)
- [ ] **Task 5.1:** Verify images load correctly in dev
  - Run `npm run dev`
  - Navigate to `/products/headphones/open-back`
  - Check: Product images render
  - Check: Network tab shows Sanity CDN URLs

- [ ] **Task 5.2:** Verify image transformations
  - Check: URLs contain `?w=400&q=75&fm=webp`
  - Check: Images are WebP format
  - Check: Responsive sizing works

- [ ] **Task 5.3:** Verify no visual regression
  - Compare: Before/after image quality
  - Compare: Layout stability (no CLS)
  - Compare: Hover states still work

### Phase 6: Documentation (5 min)
- [ ] **Task 6.1:** Update component JSDoc
  - Document: Image optimization approach
  - Document: Sanity CDN usage

- [ ] **Task 6.2:** Remove TODO comment if applicable
  - Line 21: Check if TODO about component organization still relevant

---

## DECISION POINTS

### Decision 1: Approach Selection
**Question:** Use `<img>` or `next/image` with custom loader?

**Choose `<img>` if:**
- Don't need Next.js Image optimization features
- Want simplest implementation
- OK with standard lazy loading

**Choose `next/image` if:**
- Need Next.js Image placeholder/blur features
- Need automatic srcset generation
- Need priority loading for above-fold images

**Recommendation:** `<img>` with Sanity CDN - simpler, meets all requirements

### Decision 2: Fixed vs Responsive Sizing
**Question:** Hardcode 400x400 or use metadata dimensions?

**Use Fixed (400x400) if:**
- Grid layout requires consistent sizing
- OK with some distortion on non-square images

**Use Metadata if:**
- Want to preserve original aspect ratio
- Have mixed portrait/landscape images

**Recommendation:** Fixed 400x400 with `.fit('crop')` for consistency

---

## VERIFICATION CHECKLIST

After implementation, verify:
- [ ] ✅ No `import Image from "next/image"` in ProductThumb.tsx
- [ ] ✅ Images loaded from `cdn.sanity.io` domain
- [ ] ✅ URLs contain transformation params (`?w=400&q=75&fm=webp`)
- [ ] ✅ TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] ✅ No visual regression in product grid
- [ ] ✅ Lazy loading works (images load as scrolled)
- [ ] ✅ Constraint compliance: "Sanity CDN handles ALL transformations"

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Layout shift (CLS) | Use `aspect-square` class for placeholder |
| Missing metadata | Add fallback dimensions (300x300) |
| Type errors | Regenerate types: `cd sanity && npx sanity typegen generate` |
| Broken images | Keep fallback image URL logic |

---

## ESTIMATED TIME

| Phase | Time |
|-------|------|
| Analysis | 5 min |
| Query Update | 10 min (if needed) |
| Component Update | 15 min |
| Type Safety | 5 min |
| Testing | 10 min |
| Documentation | 5 min |
| **Total** | **30-50 min** |

---

## SUCCESS CRITERIA

**Definition of Done:**
1. ProductThumb.tsx uses Sanity CDN for image delivery
2. No Next.js Image optimization server involvement
3. All images properly sized and optimized
4. TypeScript compilation clean
5. No visual regression
6. Master Audit can update Image Optimization grade from D to A+

---

## NEXT STEP

**Execute Task 1.1:** Verify current Product props include image metadata
- Read `sanity.types.ts`
- Check `Product` type structure for `image.asset.metadata`
- Determine if query updates needed

**Then proceed to implementation...**
