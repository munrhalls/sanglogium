# Product Details Page Audit

## Executive Summary

This audit analyzes the current state of the product details page and provides systematic specifications for a robust, design-aligned implementation. The current implementation exists as a foundational skeleton with basic functionality but lacks design system alignment, full data utilization, and complete interactive features.

---

## 1. Current State Analysis

### 1.1 Page Structure

**Route**: `/app/(store)/product/[slug]/page.tsx`
- Server Component pattern (correct)
- Async params handling (Next.js 15 compliant)
- Metadata generation for SEO
- Simple pass-through to `ProductDetail` component

```tsx
// Current Implementation
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
```

### 1.2 Data Architecture

**Query Pattern**: `sanity/lib/products/getProductBySlug.ts`

**Current Data Model**:
```typescript
interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;           // Primary image
  images?: any[];       // Gallery images (not queried)
  slug: { current: string };
  description?: string;
  catalogueLocationKeys: string[];
  // Missing from query but available in schema:
  // - stock
  // - sku
  // - gallery (from schema)
  // - overviewFields[]
  // - specifications[]
}
```

**Schema Availability** (from `sanity/schemaTypes/productType.ts`):
- `name` ✅ (queried)
- `slug` ✅ (queried)
- `brand` ✅ (queried as object)
- `displayPrice` ✅ (queried)
- `stock` ❌ (NOT queried - needed for Add to Cart)
- `sku` ❌ (NOT queried - needed for product identification)
- `image` ✅ (queried)
- `gallery` ❌ (NOT queried - needed for image gallery)
- `catalogueLocationKeys` ✅ (queried)
- `overviewFields` ❌ (NOT queried - key product highlights)
- `specifications` ❌ (NOT queried - detailed specs table)
- `description` ✅ (queried)

### 1.3 Component Architecture

**ProductDetail Component** (`app/components/features/products/ProductDetail.tsx`):
- 2-column layout: Image Gallery (50%) | Product Info (50%)
- Uses `flex flex-col lg:flex-row` for responsive behavior
- Container constrained with `container mx-auto px-4 py-6`
- Props interface manually defined (should use Sanity-generated types)

**ImageGallery Component** (`app/components/features/products/ImageGallery.tsx`):
- Client Component ("use client")
- Single image display only (no thumbnail navigation)
- Uses `urlFor()` with 800x800 dimensions
- Aspect ratio: square (`aspect-square`)
- Missing: thumbnail strip, zoom functionality, multiple image support

**ProductInfo Component** (`app/components/features/products/ProductInfo.tsx`):
- Displays: brand (uppercase), name, price, description
- Placeholder Add to Cart button (disabled)
- Uses hardcoded Tailwind classes instead of design tokens
- Missing: stock indicator, SKU, overview fields, specifications, quantity selector

### 1.4 Design System Alignment Assessment

**Colors - MISMATCH**:
| Element | Current | Design Token | Status |
|---------|---------|--------------|--------|
| Brand text | `text-gray-600` | `text-brand-400` | ❌ Mismatch |
| Product name | `text-gray-900` | `text-headline` | ❌ Mismatch |
| Price | `text-2xl` | `type-price` | ✅ Correct |
| Button bg | `bg-black` | `btn-primary` | ❌ Mismatch |
| Description | `text-gray-700` | `text-body` | ❌ Mismatch |

**Typography - PARTIAL MATCH**:
- Brand uses: `text-sm uppercase tracking-wide` (should use `type-overline`)
- Name uses: `text-3xl font-bold` (should use `type-section-hed`)
- Price uses: Custom component `Price` ✅
- Description uses: `prose prose-sm` with `text-gray-700`

**Spacing - NEEDS ALIGNMENT**:
- Current: `space-y-6` between sections
- Design system: Uses consistent 4px grid (spacing.4, spacing.6, etc.)

**Components - MISSING**:
- No breadcrumbs on product page
- No stock availability indicator
- No quantity selector
- No thumbnail gallery navigation
- No specifications table
- No "Add to Cart" integration (disabled placeholder)

---

## 2. Design System Reference

### 2.1 Tailwind Config Tokens

**Colors**:
```
brand: {
  50: "#FEFCFB", 100: "#FDF9F7", 200: "#FAEEE6", 300: "#F8E6D9",
  400: "#F6E3D5", 500: "#E8C9B5", 600: "#C9A18A", 700: "#151B1B",
  800: "#0D0F0F", 900: "#070808"
}
secondary: { 100-900 grayscale palette }
accent: { 100-800 gold palette (500: "#D4AF37") }
surface: {
  page: brand[700],      // #151B1B (page background)
  card: secondary[900],  // #1A1A19
  elevated: secondary[800], // #2E2E2D
  subtle: brand[800],    // #0D0F0F
  highlight: brand[200], // #FAEEE6
  productImage: brand[200] // #FAEEE6
}
text: {
  primary: brand[400],      // #F6E3D5
  secondary: secondary[400], // #C7C6C4
  caption: secondary[500],   // #9A9997
  headline: brand[400],       // #F6E3D5
  subtitle: secondary[300],  // #E5E4E2
  body: brand[200],         // #FAEEE6
  accent: accent[500],      // #D4AF37
  overline: accent[500],    // #D4AF37
  priceTag: secondary[300], // #E5E4E2
}
border: {
  primary: secondary[300],  // #E5E4E2
  secondary: secondary[700] // #4A4948
}
```

**Typography Scale**:
```
display-1: clamp(3rem, 4vw + 2rem, 5.625rem)     // Hero headlines
h1: clamp(1.6875rem, 2.25vw + 1.16rem, 3.1875rem) // Section headers
h2: clamp(1.25rem, 1.69vw + 0.854rem, 2.375rem)  // Subsections
h3: clamp(1.125rem, 1.03vw + 0.883rem, 1.8125rem) // Card titles
h4: clamp(1rem, 0.56vw + 0.868rem, 1.375rem)     // Metadata, prices
body: 16px/24px                                     // Body text
action: 14px/21px                                   // Buttons, CTAs
small: 12px/16px                                    // Captions
```

**UI Components Available**:
- `.btn-primary` - Gold background, dark text, hover states
- `.btn-secondary` - Transparent, bordered, hover fill
- `.btn-cart` - Shopping cart specific button
- `.btn-ghost` - Underlined text button
- `.card-base` - Standard card container
- `.type-*` - Typography utility classes
- `.section-header-anchor` - Decorative line prefix

### 2.2 Basket/Store Architecture

**Store**: `zustand` with `persist` middleware
**State Shape**:
```typescript
interface BasketItem {
  _id: string;
  name: string;
  displayPrice: number;
  stock: number;
  quantity: number;
  image: string;
}
```

**Actions**:
- `addItem(item)` - Adds item or increments quantity (respects stock)
- `removeItem(_id)` - Removes item from basket
- `updateQuantity(_id, quantity)` - Updates with min/max bounds
- `getTotal()` - Calculates basket total
- `clearBasket()` - Empties basket

**Integration Points**:
- `BasketControls` component exists for product cards
- Uses `event.preventDefault()` to prevent navigation when clicking add
- Toast notifications NOT implemented

---

## 3. Functional Requirements Specification

### 3.1 Core Data Requirements

**Must Query from Sanity**:
```groq
*[_type == "product" && slug.current == $slug] {
  _id,
  name,
  brand { _id, name },
  displayPrice,
  stock,              // NEW: Required for Add to Cart
  sku,                // NEW: Product identification
  image,
  gallery,            // NEW: Array of gallery images
  slug { current },
  description,
  overviewFields[],   // NEW: Key highlights
  specifications[],   // NEW: Detailed specs
  catalogueLocationKeys
}
```

### 3.2 Page Layout Specification

**Structure** (Desktop: 2-column, Mobile: stacked):
```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home / Products / Category / Product Name   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │                         │  │ BRAND (overline)        │  │
│  │    IMAGE GALLERY        │  │ Product Name (H1)       │  │
│  │    - Main image         │  │ $Price (type-price)     │  │
│  │    - Thumbnail strip    │  │ SKU: XXX                │  │
│  │                         │  │ Stock: In Stock / N left│  │
│  │                         │  │                         │  │
│  │                         │  │ [Quantity Selector]     │  │
│  │                         │  │ [ADD TO CART]           │  │
│  │                         │  │                         │  │
│  │                         │  │ Overview Fields         │  │
│  │                         │  │ - Field: Value          │  │
│  │                         │  │ - Field: Value          │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  DESCRIPTION                                                │
│  [Product description prose]                                │
├─────────────────────────────────────────────────────────────┤
│  SPECIFICATIONS                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title        │ Value          │ Information (tooltip)│   │
│  ├──────────────┼────────────────┼─────────────────────┤   │
│  │ Spec 1       │ Value 1        │ Info text           │   │
│  │ Spec 2       │ Value 2        │ -                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Component Specifications

#### Breadcrumbs
- **Location**: Top of page, full width
- **Pattern**: Reuse `CategoryBreadcrumbs` with product name as final segment
- **Style**: `type-caption`, `text-secondary` → `text-primary` on hover

#### ImageGallery (Enhanced)
- **Main Image**: 600x600px, `object-cover`, `rounded-lg`
- **Thumbnail Strip**: Horizontal scroll below main image
  - 80x80px thumbnails
  - Active state: `border-2 border-brand-400`
  - Hover: `opacity-80`
- **No Image State**: `bg-surface-productImage` with placeholder icon
- **Client Component**: Yes (interactivity required)

#### ProductInfo (Enhanced)
- **Brand**: `type-overline`, uppercase, `text-accent-500`
- **Name**: `type-section-hed`, `text-headline`
- **Price**: `type-price`, `text-priceTag`
- **SKU**: `type-caption`, `text-secondary`
- **Stock Indicator**:
  - In Stock (>5): `text-success-500` + checkmark icon
  - Low Stock (1-5): `text-warning-500` + warning icon
  - Out of Stock (0): `text-error-500` + disabled Add to Cart
- **Quantity Selector**:
  - Min: 1
  - Max: min(10, stock)
  - Controls: `-` [display] `+` buttons
  - Style: `btn-secondary` for controls

#### AddToCartButton
- **States**:
  - Default: `btn-primary` with cart icon
  - Loading: Spinner animation
  - Success: Checkmark, "Added!" text
  - Error: Red border, error message
- **Integration**: Direct `useBasketStore.addItem()` call
- **Disabled**: When stock === 0

#### OverviewFields
- **Display**: Grid of 2-3 columns
- **Each Field**:
  - Title: `type-caption uppercase text-secondary`
  - Value: `type-body text-primary`
- **Data Source**: `product.overviewFields[]`

#### SpecificationsTable
- **Display**: Full-width table
- **Columns**: Title | Value | Information (optional tooltip)
- **Styling**:
  - Header row: `bg-surface-elevated`, `type-caption uppercase`
  - Rows: Alternating `bg-surface-card`
  - Borders: `border-secondary` (1px)
- **Responsive**: Horizontal scroll on mobile

#### Description
- **Style**: `prose prose-invert` (for dark background)
- **Typography**: `type-body`
- **Max Width**: `max-w-prose` for readability

### 3.4 Responsive Breakpoints

| Breakpoint | Layout | Gallery Size | Info Width |
|------------|--------|--------------|------------|
| < 768px (mobile) | Stacked | 100% width | 100% width |
| 768px - 1024px (tablet) | 2-column | 45% | 55% |
| > 1024px (desktop) | 2-column | 50% | 50% |

### 3.5 Loading State

**File**: `app/(store)/product/[slug]/loading.tsx`

**Current**: Basic pulse skeleton

**Required**:
- Match final layout structure exactly
- Use `animate-pulse` on `bg-surface-elevated`
- Skeleton heights proportional to content:
  - Brand: 16px
  - Name: 40px
  - Price: 24px
  - Description: 100px
  - Button: 48px

---

## 4. Data Flow Architecture

### 4.1 Server-Client Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  SERVER (Async)                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Page Params  │───▶│ GROQ Query   │───▶│ Product JSON │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                             │      │
│         │         serialize                           │      │
│         ▼                                             ▼      │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ProductDetail (Server Component)                       ││
│  │ - Passes product data as props                         ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
                              │
                              ▼ (props)
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Interactive)                                        │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ImageGallery ("use client")                             ││
│  │ - State: selectedImageIndex                            ││
│  │ - Event: onThumbnailClick                              ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │ AddToCartSection ("use client")                       ││
│  │ - State: quantity (1 to max)                           ││
│  │ - Store: useBasketStore                                ││
│  │ - Event: onAddToCart                                   ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Type Safety Requirements

**Current Issue**: Manual interfaces in components

**Required**:
- Use Sanity-generated types from `sanity.types.ts`
- Extend for component-specific props only

```typescript
// Import generated type
import { Product as SanityProduct } from '@/sanity.types';

// Component props (minimal extension)
interface ProductDetailProps {
  product: SanityProduct;
}
```

---

## 5. Implementation Gaps

### 5.1 Data Layer Gaps

| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| 1 | `stock` not queried in `getProductBySlug` | Cannot show stock status, cannot validate Add to Cart | **Critical** |
| 2 | `gallery` not queried (only `images` field) | Cannot show multiple product images | **High** |
| 3 | `overviewFields` not queried | Missing key product highlights | **Medium** |
| 4 | `specifications` not queried | Missing detailed specs table | **Medium** |
| 5 | `sku` not queried | Missing product identification | **Low** |

### 5.2 Component Gaps

| # | Gap | Current State | Target State |
|---|-----|---------------|--------------|
| 1 | Breadcrumbs | Missing | Add breadcrumb navigation |
| 2 | Image Gallery | Single image only | Thumbnail navigation |
| 3 | Stock Indicator | Missing | Visual stock status |
| 4 | Quantity Selector | Missing | +/- controls with display |
| 5 | Add to Cart | Disabled placeholder | Functional with store integration |
| 6 | Overview Fields | Missing | Grid of key highlights |
| 7 | Specifications | Missing | Data table |
| 8 | Description | Plain text | Rich text rendering (if blockContent) |

### 5.3 Design System Gaps

| # | Gap | Location | Required Fix |
|---|-----|----------|--------------|
| 1 | Hardcoded colors | `ProductInfo.tsx` | Replace with `text-primary`, `text-secondary` |
| 2 | Missing typography classes | `ProductInfo.tsx` | Use `type-overline`, `type-section-hed` |
| 3 | Button styling | `ProductInfo.tsx` | Use `btn-primary` instead of `bg-black` |
| 4 | Loading state colors | `loading.tsx` | Use `bg-surface-elevated` |

---

## 6. Specification Summary

### 6.1 Target Architecture

**Files to Modify**:
1. `sanity/lib/products/getProductBySlug.ts` - Expand GROQ query
2. `app/components/features/products/ProductDetail.tsx` - Full redesign
3. `app/components/features/products/ProductInfo.tsx` - Design alignment + functionality
4. `app/components/features/products/ImageGallery.tsx` - Thumbnail navigation
5. `app/(store)/product/[slug]/loading.tsx` - Styled skeleton

**New Files to Create**:
1. `app/components/features/products/AddToCartButton.tsx` - Cart integration
2. `app/components/features/products/QuantitySelector.tsx` - Quantity controls
3. `app/components/features/products/SpecificationsTable.tsx` - Specs display
4. `app/components/features/products/OverviewFields.tsx` - Key highlights
5. `app/components/ui/breadcrumbs/ProductBreadcrumbs.tsx` - Product-specific crumbs

### 6.2 Build Order

**Pass 1: Data Layer**
1. Update `getProductBySlug` query with all required fields
2. Verify type generation with Sanity Typegen
3. Update `Product` interface exports

**Pass 2: Structure (Skeleton)**
1. Create component shell with debug borders
2. Implement loading.tsx with matching structure
3. Verify responsive breakpoints

**Pass 3: Data Integration**
1. Wire real data to all sections
2. Add null/empty state handling
3. Test with various product types

**Pass 4: Surface & Interaction**
1. Apply design tokens (colors, typography)
2. Implement Add to Cart functionality
3. Add ImageGallery interactivity
4. Implement quantity selector

### 6.3 Definition of Done

- [ ] GROQ query returns all required fields (stock, gallery, overview, specs)
- [ ] Design tokens applied consistently (no hardcoded colors)
- [ ] Image gallery shows thumbnails and supports navigation
- [ ] Stock status visible and accurate
- [ ] Quantity selector functional (1 to max stock)
- [ ] Add to Cart adds item to basket store
- [ ] Specifications table renders all specs
- [ ] Overview fields displayed in grid
- [ ] Breadcrumbs present and functional
- [ ] Loading skeleton matches final layout
- [ ] Responsive at all breakpoints
- [ ] Build passes without errors

---

## 7. Verification Commands

```bash
# Build verification
npm run build

# Type checking
npx tsc --noEmit

# Test product page functionality
npx playwright test --grep "product"

# Specific component tests (when written)
npx playwright test --grep "ProductDetail"
npx playwright test --grep "AddToCart"
```

---

## 8. References

**Design System**:
- `tailwind.config.ts` - Color tokens, typography, UI components
- `app/components/features/products/ProductCard.tsx` - Reference card styling
- `app/components/ui/breadcrumbs/CategoryBreadcrumbs.tsx` - Breadcrumb pattern

**Data Layer**:
- `sanity/schemaTypes/productType.ts` - Full schema definition
- `sanity/lib/products/getProductBySlug.ts` - Current query
- `sanity/lib/products/getProductsByVfsKeys.ts` - Reference query pattern

**State Management**:
- `store/store.ts` - Basket store implementation
- `app/components/features/basket/BasketControls.tsx` - Integration pattern

**Related Pages**:
- `app/(store)/products/[...slug]/page.tsx` - Category page (reference layout)
- `app/(store)/basket/page.tsx` - Basket page (flow destination)

---

*Audit Date: March 31, 2026*
*Auditor: Cascade AI*
*Status: Ready for Implementation Sprint*
