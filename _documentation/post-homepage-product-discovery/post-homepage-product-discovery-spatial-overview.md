# Post-Homepage Product Discovery — Complete Spatial Overview

## 1. UX Considerations

### User Journey Paths
| Entry Point | User Intent | System Response |
|-------------|-------------|-----------------|
| Navigation click on leaf node | "I want to browse this specific category" | Load category page with filtered products |
| Navigation click on parent node | "I want to explore this product family" | Load category page with all descendant products |
| Direct URL access | "Return to a category I bookmarked/shared" | Resolve slug and load appropriate products |

### Core UX Patterns
- **Immediate feedback:** Navigation drawer closes on click, page transition begins
- **Progressive disclosure:** Parent categories show child navigation; leaf nodes show products
- **Visual continuity:** Category pages share homepage typography, spacing, and color system
- **Information scent:** Breadcrumbs show hierarchy; product cards show key differentiators (price, brand)
- **Performance:** Server-side fetch → instant render; no loading spinners for initial view

### Empty States
- **No products:** Display "No products in this category" with suggestion to browse parent category
- **Invalid slug:** Return 404 with link to main shop page
- **Network failure:** Next.js error boundary captures, shows generic error message

---

## 2. File & Folder Structure

```
app/
├── (store)/
│   ├── shop/
│   │   └── [...slug]/
│   │       ├── page.tsx              # Server Component — data fetch + layout
│   │       ├── loading.tsx           # Server Component — loading UI
│   │       └── error.tsx             # Client Component — error handling
│   └── layout.tsx                    # Server Component — provides catalogue data
├── components/
│   ├── features/
│   │   ├── products/
│   │   │   ├── ProductGrid.tsx       # Server Component — grid container
│   │   │   ├── ProductCard.tsx       # Server Component — card presentation
│   │   │   └── ProductCardSkeleton.tsx  # Server Component — loading placeholder
│   │   └── shop/
│   │       ├── ShopHeader.tsx        # Server Component — category title + breadcrumb
│   │       ├── Breadcrumb.tsx        # Server Component — path navigation
│   │       └── ShopLayout.tsx        # Server Component — page layout wrapper
│   └── ui/
│       ├── Price.tsx                 # Client Component — animated price display
│       ├── Badge.tsx                 # Server Component — category/brand badge
│       └── AspectRatio.tsx           # Server Component — image container
├── data/
│   ├── catalogue.ts                  # VFS functions (resolveSlugToId, unrollDescendantKeys)
│   └── catalogue-index.json          # Pre-built VFS index
├── sanity/
│   └── lib/
│       └── products/
│           └── getProductsByVfsKeys.ts  # Server Component — product fetcher
├── lib/
│   └── utils/
│       └── tailwind.ts               # cn() utility for class merging
└── types/
    └── product.ts                    # Product type definitions
```

---

## 3. Component Specifications

### 3.1 ProductGrid.tsx
**Type:** Server Component
**Purpose:** Responsive grid container for product cards

**Props Interface:**
```typescript
interface ProductGridProps {
  products: Product[];
  columns?: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4;
  };
  gap?: 'sm' | 'md' | 'lg';
}
```

**Rendered Structure:**
```
<section aria-label="Products">
  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {products.map(product => (
      <li key={product._id}>
        <ProductCard product={product} />
      </li>
    ))}
  </ul>
</section>
```

**Data Flow:**
- Input: Array of Product objects from `getProductsByVfsKeys()`
- Output: Grid of ProductCard components
- No internal state or client-side logic

---

### 3.2 ProductCard.tsx
**Type:** Server Component
**Purpose:** Individual product presentation in grid

**Props Interface:**
```typescript
interface ProductCardProps {
  product: Product;
  priority?: boolean;  // For Next.js image priority loading
}

interface Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  displayPrice: number;
  image: {
    asset: {
      _ref: string;
    };
    hotspot?: SanityImageHotspot;
  };
  slug: {
    current: string;
  };
}
```

**Rendered Structure:**
```
<article className="group">
  <a href={`/product/${product.slug.current}`}>
    <figure className="aspect-[4/3] relative overflow-hidden bg-gray-100">
      <Image
        src={urlFor(product.image).width(400).height(300).url()}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={priority}
      />
    </figure>
    <div className="mt-3 space-y-1">
      <p className="text-sm text-gray-500">{product.brand.name}</p>
      <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
      <Price value={product.displayPrice} className="font-semibold" />
    </div>
  </a>
</article>
```

**Data Consumption:**
- Product object passed via props
- Uses `@/sanity/lib/imageUrl.ts` for image URL generation
- Uses `@/components/ui/Price.tsx` for animated price display

---

### 3.3 ProductCardSkeleton.tsx
**Type:** Server Component
**Purpose:** Loading placeholder matching ProductCard dimensions

**Rendered Structure:**
```
<div className="animate-pulse">
  <div className="aspect-[4/3] bg-gray-200 rounded" />
  <div className="mt-3 space-y-2">
    <div className="h-4 bg-gray-200 rounded w-1/3" />  {/* Brand */}
    <div className="h-5 bg-gray-200 rounded w-full" />  {/* Name */}
    <div className="h-5 bg-gray-200 rounded w-1/4" />  {/* Price */}
  </div>
</div>
```

**Animation:** CSS `animate-pulse` (Tailwind default)

---

### 3.4 ShopHeader.tsx
**Type:** Server Component
**Purpose:** Category page header with breadcrumb and title

**Props Interface:**
```typescript
interface ShopHeaderProps {
  categoryName: string;
  categoryDescription?: string;
  productCount: number;
  breadcrumb: Array<{
    label: string;
    href: string;
  }>;
}
```

**Rendered Structure:**
```
<header className="py-8 md:py-12 border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <Breadcrumb items={breadcrumb} />
    <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">
      {categoryName}
    </h1>
    {categoryDescription && (
      <p className="mt-2 text-gray-600 max-w-2xl">{categoryDescription}</p>
    )}
    <p className="mt-4 text-sm text-gray-500">
      {productCount} product{productCount !== 1 ? 's' : ''}
    </p>
  </div>
</header>
```

---

### 3.5 Breadcrumb.tsx
**Type:** Server Component
**Purpose:** Hierarchical path navigation

**Props Interface:**
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
  }>;
}
```

**Rendered Structure:**
```
<nav aria-label="Breadcrumb">
  <ol className="flex items-center space-x-2 text-sm">
    <li><a href="/" className="text-gray-500 hover:text-gray-900">Home</a></li>
    <li className="text-gray-400">/</li>
    <li><a href="/shop" className="text-gray-500 hover:text-gray-900">Shop</a></li>
    {items.map((item, index) => (
      <li key={item.href} className="flex items-center">
        <span className="text-gray-400 mx-2">/</span>
        {index === items.length - 1 ? (
          <span className="text-gray-900 font-medium" aria-current="page">
            {item.label}
          </span>
        ) : (
          <a href={item.href} className="text-gray-500 hover:text-gray-900">
            {item.label}
          </a>
        )}
      </li>
    ))}
  </ol>
</nav>
```

---

### 3.6 ShopLayout.tsx
**Type:** Server Component
**Purpose:** Page layout wrapper for shop pages

**Props Interface:**
```typescript
interface ShopLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;  // Future: filters
}
```

**Rendered Structure:**
```
<div className="min-h-screen bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex gap-8">
      {sidebar && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  </div>
</div>
```

---

### 3.7 Price.tsx (Client Component)
**Type:** Client Component
**Purpose:** Animated price display with currency formatting

**Props Interface:**
```typescript
interface PriceProps {
  value: number;
  currency?: 'USD' | 'EUR' | 'GBP';
  className?: string;
}
```

**Data Consumption:**
- Price value from product.displayPrice
- Uses `Intl.NumberFormat` for currency formatting

**Animation:**
- Count-up animation on mount (300ms duration)
- Uses `framer-motion` for animation

---

## 4. Data Layer

### 4.1 Data Sources

| Source | Type | Purpose | Location |
|--------|------|---------|----------|
| `catalogue-index.json` | Static JSON | VFS pre-built index | `data/catalogue-index.json` |
| Sanity CMS | API | Product data, category metadata | `sanity/lib/client.ts` |

### 4.2 Data Imports

**VFS Functions:**
```typescript
import {
  resolveSlugToId,
  unrollDescendantKeys,
  getCatalogueMetadata
} from '@/data/catalogue';
```

**Product Fetcher:**
```typescript
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
```

**Image URL Builder:**
```typescript
import { urlFor } from '@/sanity/lib/imageUrl';
```

### 4.3 Data Consumers

| Component | Data Source | Data Type |
|-----------|-------------|-----------|
| `page.tsx` | `getProductsByVfsKeys()` | `Product[]` |
| `ShopHeader.tsx` | `getCatalogueMetadata()` | `CategoryMetadata` |
| `Breadcrumb.tsx` | `catalogue-index.json` | `BreadcrumbItem[]` |
| `ProductCard.tsx` | Props from `ProductGrid` | `Product` |
| `ProductGrid.tsx` | Props from `page.tsx` | `Product[]` |

### 4.4 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         URL /shop/[...slug]                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    app/(store)/shop/[...slug]/page.tsx              │
│                           (Server Component)                        │
├─────────────────────────────────────────────────────────────────────┤
│  1. Extract leaf slug from params.slug                              │
│  2. resolveSlugToId(slug) → slotId                                  │
│  3. If not found → notFound()                                       │
│  4. unrollDescendantKeys(slotId) → slotIds[]                        │
│  5. getProductsByVfsKeys(slotIds) → products[]                      │
│  6. getCatalogueMetadata(slotId) → metadata                         │
│  7. Build breadcrumb from slotId path                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Render Component Tree                          │
├─────────────────────────────────────────────────────────────────────┤
│  <ShopLayout>                                                       │
│    <ShopHeader title={metadata.name} breadcrumb={breadcrumb} />       │
│    <ProductGrid products={products}>                                │
│      {products.map(p => <ProductCard product={p} />)}               │
│    </ProductGrid>                                                   │
│  </ShopLayout>                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Server/Client Boundaries

### Server Components (Default)
| Component | Boundary Reason |
|-----------|-----------------|
| `page.tsx` | Data fetching, async operations |
| `ProductGrid.tsx` | No interactivity, pure layout |
| `ProductCard.tsx` | Image optimization via Next.js Image |
| `ShopHeader.tsx` | Static layout, no state |
| `Breadcrumb.tsx` | Static navigation links |
| `ProductCardSkeleton.tsx` | No interactivity |
| `ShopLayout.tsx` | Layout structure only |

### Client Components (Explicit "use client")
| Component | Reason for Client |
|-----------|-------------------|
| `Price.tsx` | Animation requires `useEffect` and `framer-motion` |
| `error.tsx` | Error boundary requires client-side React |

---

## 6. Render Tree

```
Root Layout (Server)
  └── Store Layout (Server)
        └── Shop Page (Server)
              ├── ShopLayout (Server)
              │     ├── ShopHeader (Server)
              │     │     └── Breadcrumb (Server)
              │     └── ProductGrid (Server)
              │           └── ProductCard (Server) × N
              │                 ├── Image (Next.js optimized)
              │                 └── Price (Client)
              └── loading.tsx (Server — Suspense fallback)
                    └── ProductCardSkeleton (Server) × 8
```

---

## 7. Styling Specifications

### 7.1 Design System Tokens (Inherited from Homepage)

**Typography:**
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page title | System | 30px/36px (md/lg) | 700 | 1.2 |
| Card title | System | 16px | 500 | 1.4 |
| Brand name | System | 14px | 400 | 1.4 |
| Price | System | 16px | 600 | 1.2 |
| Breadcrumb | System | 14px | 400 | 1.4 |

**Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `gray-900` | Headings |
| `--color-text-secondary` | `gray-600` | Descriptions |
| `--color-text-muted` | `gray-500` | Brand names, meta |
| `--color-border` | `gray-200` | Dividers |
| `--color-bg-skeleton` | `gray-200` | Loading placeholders |

**Spacing:**
| Token | Value | Usage |
|-------|-------|-------|
| `gap-sm` | `16px` | Mobile grid gap |
| `gap-md` | `24px` | Tablet+ grid gap |
| `py-section` | `32px/48px` | Section vertical padding |
| `px-container` | `16px/24px/32px` | Container horizontal padding |

### 7.2 Component Styles

**ProductGrid:**
```
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

**ProductCard Image Container:**
```
aspect-[4/3] relative overflow-hidden bg-gray-100 rounded-lg
```

**ProductCard Hover State:**
```
group-hover:scale-105 transition-transform duration-300
```

**ShopHeader:**
```
py-8 md:py-12 border-b border-gray-200
```

**Breadcrumb Link:**
```
text-gray-500 hover:text-gray-900 transition-colors
```

### 7.3 Skeleton Styles

**Pulse Animation:**
```
animate-pulse bg-gray-200 rounded
```

---

## 8. Responsive Web Design (RWD)

### 8.1 Breakpoint Strategy

| Breakpoint | Width | Grid Columns | Container Padding |
|------------|-------|--------------|-------------------|
| Mobile | < 768px | 2 | 16px |
| Tablet | 768px–1023px | 3 | 24px |
| Desktop | 1024px–1439px | 4 | 32px |
| Wide | ≥ 1440px | 4 | 32px (max-width: 1280px) |

### 8.2 Responsive Behavior Per Component

**ProductGrid:**
- Mobile: 2 columns, gap-4
- Tablet: 3 columns, gap-6
- Desktop: 4 columns, gap-6

**ProductCard:**
- Image aspect ratio maintained at 4:3 across all breakpoints
- Title clamped to 2 lines (line-clamp-2)
- Font sizes scale with container (text-sm → text-base)

**ShopHeader:**
- Title: text-3xl → text-4xl
- Padding: py-8 → py-12
- Description hidden on mobile if space constrained

**Breadcrumb:**
- Visible on all breakpoints
- Truncates with ellipsis on very long paths (mobile)

---

## 9. Animations

### 9.1 Loading Skeletons

**Pulse Animation:**
- Animation: `animate-pulse`
- Duration: 2s (Tailwind default)
- Timing: ease-in-out
- Applied to: `ProductCardSkeleton` container

### 9.2 Product Card Hover

**Image Zoom:**
- Trigger: `group-hover`
- Transform: `scale-105`
- Duration: 300ms
- Easing: ease-out
- Applied to: ProductCard image

### 9.3 Price Display

**Count-up Animation:**
- Library: `framer-motion`
- Duration: 300ms
- Easing: ease-out
- From: 0
- To: actual price value

### 9.4 Page Transitions

**Next.js Default:**
- No custom transitions (instant navigation)
- Loading state shown via `loading.tsx`

---

## 10. Type Definitions

```typescript
// types/product.ts

export interface Product {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  displayPrice: number;
  image: {
    asset: {
      _ref: string;
    };
    hotspot?: {
      x: number;
      y: number;
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  catalogueLocationKeys: string[];
}

export interface CategoryMetadata {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  type: 'header' | 'link';
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}
```

---

## 11. Key Implementation Notes

### Server Component Discipline
- **No** `useState`, `useEffect`, `useContext`
- **No** browser APIs (window, document)
- **No** event handlers (onClick, onSubmit)
- **Yes** async data fetching
- **Yes** direct DB/CMS queries

### Image Optimization
- Always use Next.js `Image` component
- Provide `sizes` prop for responsive optimization
- Use Sanity CDN with `urlFor()` builder
- Maintain aspect ratio with CSS

### Error Handling
- Use `notFound()` for invalid slugs
- Use `error.tsx` for runtime errors
- Log errors server-side before returning fallback

### Performance Targets
- TTFB: < 200ms (server response)
- FCP: < 1.5s (first contentful paint)
- LCP: < 2.5s (largest contentful paint)

---

## 12. Verification Checklist

| Aspect | Verification Method |
|--------|---------------------|
| Data flow | 3 URLs return correct product counts |
| Responsive | Visual check at 375px, 768px, 1024px, 1440px |
| Accessibility | Keyboard navigation, screen reader labels |
| Performance | Lighthouse score ≥ 90 |
| Visual coherence | Side-by-side comparison with homepage |

---

## 13. Filters and Sorting Architecture

### 13.1 Data Sources

| Source | Type | Purpose | Schema |
|--------|------|---------|--------|
| `categoryFilters` document | CMS | Filter configuration per category | `sanity/schemaTypes/categoryFiltersType.ts` |
| `productType` fields | CMS | Filterable product data | `sanity/schemaTypes/productType.ts` |
| URL search params | Runtime | Active filter state | `URLSearchParams` |
| VFS slot ID | Runtime | Category context | `data/catalogue-index.json` |

### 13.2 CMS Schema — Category Filters

**Document Type:** `categoryFilters`

**Fields:**
```typescript
{
  title: string;                    // "Headphones Filters"
  categoryKey: string;              // VFS slot ID: "ugyeto8653n495dpf89nzoar"
  filters: {
    filterItems: Array<{
      name: string;                 // "Driver Type"
      type: 'checkbox' | 'radio' | 'multiselect' | 'range' | 'boolean';
      filterCategory: 'regular' | 'overview' | 'specifications' | 'range';
      field: string;                // "driverType" — maps to product field
      options?: string[];           // ["Dynamic", "Planar", "BA", "Electrostatic"]
      defaultValue?: string;
      min?: number;                 // For range filters
      max?: number;
      isMinOnly?: boolean;
      step?: number;
    }>;
  };
}
```

**Example Filter Set (Headphones):**
```typescript
{
  title: "Headphones",
  categoryKey: "ugyeto8653n495dpf89nzoar",
  filters: {
    filterItems: [
      { name: "Driver Type", type: "checkbox", field: "driverType",
        options: ["Dynamic", "Planar Magnetic", "Balanced Armature", "Electrostatic"] },
      { name: "Design", type: "checkbox", field: "designType",
        options: ["Open-Back", "Closed-Back", "Semi-Open"] },
      { name: "Price Range", type: "range", field: "displayPrice",
        min: 0, max: 5000, step: 50 },
      { name: "Wireless", type: "boolean", field: "isWireless" }
    ]
  }
}
```

### 13.3 CMS Schema — Sortables (Products)

**Sortable Fields (Global — All Categories):**
| Field | Type | Label |
|-------|------|-------|
| `displayPrice` | number | Price |
| `name` | string | Name |
| `createdAt` | datetime | Newest |
| `popularity` | number | Popularity |
| `rating` | number | Rating |

**Category-Specific Sortables:**
- Fetched via `getSortablesForCategoryPath(catalogueKeys)`
- Defined in CMS per category basis
- Merged with global sortables at runtime

### 13.4 Filter Types & UI Mapping

| Filter Type | UI Component | Interaction Pattern |
|-------------|--------------|---------------------|
| `checkbox` | Checklist with counts | Multi-select, OR within group |
| `radio` | Radio button group | Single select only |
| `multiselect` | Combobox dropdown | Multi-select, searchable |
| `range` | Dual-thumb slider | Min/max bounds |
| `boolean` | Toggle switch | On/off only |

### 13.5 Data Contracts

**FilterConfig Type:**
```typescript
// sanity/lib/url/parseUrlToFilterConfig.ts
export type FilterConfig = {
  categories?: string[];
  price?: {
    min?: number;
    max?: number;
  };
  colors?: string[];
  sizes?: string[];
  [key: string]: string[] | undefined;  // Dynamic filter fields
};
```

**SortConfig Type:**
```typescript
export type SortConfig = {
  field: 'displayPrice' | 'name' | 'createdAt' | 'popularity' | 'rating' | string;
  direction: 'asc' | 'desc';
};
```

**ActiveFilters State (Nuqs):**
```typescript
type ActiveFilters = {
  f: string;  // Compressed filter state: "driverType:Dynamic,Planar|design:Open-Back"
  s: string;  // Sort: "displayPrice:desc"
  p: string;  // Page: "2"
};
```

### 13.6 Server Function Layer (To Be Designed)

**Status:** Legacy functions deleted. New architecture needed.

**Required Functions:**
```typescript
// sanity/lib/products/getCategoryFilters.ts
// Fetch filter configuration for a category from CMS
// Returns: FilterConfiguration[]

// sanity/lib/products/getSortableFields.ts
// Fetch sortable fields (global + category-specific)
// Returns: SortableField[]

// sanity/lib/products/getProductsByFilters.ts
// Fetch products with filters and sorting applied
// Returns: { products: Product[], total: number }
```

**Design Principles:**
- Single-responsibility functions
- Server Components only
- No client-side filtering (all in GROQ)
- Composable filter building

### 13.7 GROQ Query Structure (Filtered Products)

```groq
*[_type == "product"
  && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
  && ($minPrice == null || displayPrice >= $minPrice)
  && ($maxPrice == null || displayPrice <= $maxPrice)
  && ($driverType == null || driverType in $driverType)
  && ($designType == null || designType in $designType)
  // ... additional dynamic filters
]
| order($sortField $sortDirection)
[$start...$end] {
  _id, name, brand, displayPrice, image, slug
}
```

### 13.8 Folder & File Structure (Filters)

```
app/
├── (store)/
│   └── shop/
│       └── [...slug]/
│           └── page.tsx              # Accepts searchParams, passes to components
├── components/
│   ├── features/
│   │   └── filters/
│   │       ├── FilterSidebar.tsx       # Client Component — filter UI container
│   │       ├── FilterGroup.tsx         # Client Component — individual filter group
│   │       ├── CheckboxFilter.tsx      # Client Component — checkbox list
│   │       ├── RangeFilter.tsx         # Client Component — dual-slider
│   │       ├── ActiveFilters.tsx       # Client Component — pill badges
│   │       └── SortDropdown.tsx        # Client Component — sort selector
│   └── ui/
│       ├── Checkbox.tsx                # Client Component — custom design system
│       ├── Slider.tsx                  # Client Component — custom dual-thumb
│       └── Badge.tsx                   # Server/Client — custom filter pill
├── lib/
│   └── filters/
│       ├── filterEncoder.ts            # Pure function — compress filters to URL
│       ├── filterDecoder.ts            # Pure function — parse URL to filters
│       ├── applyFilters.ts             # Pure function — filter products client-side
│       └── buildFilterGroq.ts          # Pure function — build GROQ from config
├── sanity/
│   └── lib/
│       └── products/
│           └── getProductBySlug.ts   # Server function — fetch single product
└── types/
    └── filters.ts                    # FilterConfig, SortConfig, FilterType
```

### 13.9 Component Specifications — Filters

#### FilterSidebar.tsx
**Type:** Client Component
**Purpose:** Filter UI container with collapsible groups

**Props:**
```typescript
interface FilterSidebarProps {
  filters: FilterConfiguration[];
  activeFilters: FilterConfig;
  productCount: number;
  onFilterChange: (filters: FilterConfig) => void;
}
```

**Rendered Structure:**
```
<aside className="w-64 flex-shrink-0">
  <div className="sticky top-4 space-y-6">
    <ActiveFilters filters={activeFilters} onRemove={...} />

    {filters.map(filter => (
      <FilterGroup key={filter.name} title={filter.name}>
        {filter.type === 'checkbox' && <CheckboxFilter {...filter} />}
        {filter.type === 'range' && <RangeFilter {...filter} />}
        {filter.type === 'boolean' && <BooleanFilter {...filter} />}
      </FilterGroup>
    ))}
  </div>
</aside>
```

#### SortDropdown.tsx
**Type:** Client Component

**Props:**
```typescript
interface SortDropdownProps {
  sortables: SortableField[];
  currentSort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
}
```

**State Encoding:**
```typescript
// URL: ?s=displayPrice:desc
const sortParam = 'displayPrice:desc';
const [field, direction] = sortParam.split(':');
```

### 13.10 Nuqs State Architecture

**Hook:** `useFilterSearchParams()`

```typescript
// lib/filters/useFilterSearchParams.ts
"use client";

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export function useFilterSearchParams() {
  // Compressed filter state: ?f=driverType:Dynamic,Planar|price:100,500
  const [filterString, setFilterString] = useQueryState('f', parseAsString);

  // Sort state: ?s=displayPrice:desc
  const [sortString, setSortString] = useQueryState('s', parseAsString.withDefault('createdAt:desc'));

  // Pagination: ?p=2
  const [page, setPage] = useQueryState('p', parseAsInteger.withDefault(1));

  // Parse compressed strings to objects
  const filters = useMemo(() => decodeFilters(filterString), [filterString]);
  const sort = useMemo(() => decodeSort(sortString), [sortString]);

  return {
    filters,
    sort,
    page,
    setFilters: (f) => setFilterString(encodeFilters(f)),
    setSort: (s) => setSortString(encodeSort(s)),
    setPage
  };
}
```

**Encoding/Decoding:**
```typescript
// ?f=driverType:Dynamic,Planar|price:100,500
decodeFilters("driverType:Dynamic,Planar|price:100,500");
// Returns: { driverType: ["Dynamic", "Planar"], price: { min: 100, max: 500 } }

encodeFilters({ driverType: ["Dynamic"], design: ["Open-Back"] });
// Returns: "driverType:Dynamic|design:Open-Back"
```

---

## 14. State Management Architecture

### 14.1 State Philosophy

**Rule:** All state is URL state (Nuqs). No React state for navigation/filtering.

**Rationale:**
- Shareable URLs with exact filter/sort context
- Browser back/forward works naturally
- Server Components can read initial state from URL
- No state hydration mismatches

### 14.2 State Types & Locations

| State Type | Location | Library | Example |
|------------|----------|---------|---------|
| **Navigation State** | URL | Nuqs | `?f=driverType:Dynamic` |
| **UI State (ephemeral)** | Component | useState | Mobile filter drawer open |
| **Server Cache** | Server | React cache() | Product query results |
| **Data Cache** | Client | Nuqs built-in | Parsed filter object |

### 14.3 Complete State Possibilities Matrix

| State Variable | Type | URL Key | Default | Valid Values |
|----------------|------|---------|---------|--------------|
| `filters` | Object | `f` | `{}` | Any FilterConfig |
| `sort` | Object | `s` | `createdAt:desc` | `field:direction` format |
| `page` | Number | `p` | `1` | Integer ≥ 1 |
| `view` | String | `v` | `grid` | `grid`, `list` |
| `search` | String | `q` | `""` | Any string |
| `layout` | String | `layout` | `standard` | `standard`, `compact` |

### 14.4 End-to-End State Flow

#### User Action → State Update

```
User checks "Dynamic" checkbox
         ↓
CheckboxFilter onChange fires
         ↓
useFilterSearchParams().setFilters() called
         ↓
Nuqs encodes: { driverType: ["Dynamic"] } → "f=driverType:Dynamic"
         ↓
URL updated: /shop/headphones?f=driverType:Dynamic
         ↓
Next.js router triggers re-render
         ↓
page.tsx receives new searchParams
         ↓
Server Component re-fetches with new filters
         ↓
ProductGrid receives new products prop
         ↓
React renders updated grid
```

#### Server Component State Access

```typescript
// app/(store)/shop/[...slug]/page.tsx
export default async function CategoryPage({
  params,
  searchParams  // ← Nuqs state accessible here
}: {
  params: { slug: string[] };
  searchParams: { f?: string; s?: string; p?: string };
}) {
  // Decode Nuqs state
  const filters = searchParams.f ? decodeFilters(searchParams.f) : {};
  const sort = searchParams.s ? decodeSort(searchParams.s) : { field: 'createdAt', direction: 'desc' };
  const page = parseInt(searchParams.p || '1', 10);

  // Fetch with state
  const { products, total } = await getFilteredProducts(
    catalogueKeys,
    filters,
    sort,
    page
  );

  return <ProductGrid products={products} />;
}
```

#### Client Component State Access

```typescript
// components/features/filters/FilterSidebar.tsx
"use client";

export function FilterSidebar({ filterConfig }: { filterConfig: FilterConfiguration[] }) {
  const { filters, setFilters } = useFilterSearchParams();

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const current = filters[field] || [];
    const updated = checked
      ? [...current, value]
      : current.filter(v => v !== value);

    setFilters({ ...filters, [field]: updated });
  };

  return (
    <div>
      {filterConfig.map(filter => (
        <CheckboxGroup
          key={filter.field}
          options={filter.options}
          selected={filters[filter.field] || []}
          onChange={(value, checked) => handleCheckboxChange(filter.field, value, checked)}
        />
      ))}
    </div>
  );
}
```

### 14.5 State Trigger Matrix

| Component | Triggers | State Key | Side Effects |
|-----------|----------|-----------|--------------|
| CheckboxFilter | onChange | `f` | URL update, page re-render, products re-fetch |
| RangeFilter | onChange (debounced) | `f` | URL update, page reset to 1 |
| SortDropdown | onSelect | `s` | URL update, products re-sort |
| Pagination | onClick | `p` | URL update, scroll to top, fetch page |
| ViewToggle | onClick | `v` | URL update, grid layout change |
| ClearFilters | onClick | `f` | URL cleared, reset to defaults |

### 14.6 Nuqs Configuration

**Root Layout Wrapper:**
```typescript
// app/(store)/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      {children}
    </NuqsAdapter>
  );
}
```

**Page Configuration:**
```typescript
// app/(store)/shop/[...slug]/page.tsx
export const dynamic = 'force-dynamic';  // Required for searchParams
```

---

## 15. Product Details Page

### 15.1 Data Contract

**Product Type (Full):**
```typescript
interface ProductDetail {
  _id: string;
  name: string;
  slug: { current: string };
  brand: {
    _id: string;
    name: string;
    slug: string;
    logo?: ImageAsset;
  };
  displayPrice: number;
  compareAtPrice?: number;
  images: Array<{
    asset: ImageAsset;
    alt?: string;
    hotspot?: SanityImageHotspot;
  }>;
  description: PortableTextBlock[];  // Sanity rich text
  specifications: Array<{
    name: string;
    value: string;
    unit?: string;
  }>;
  inStock: boolean;
  inventoryQuantity: number;
  catalogueLocationKeys: string[];
  relatedProducts: string[];  // Product IDs
  reviews: Array<{
    rating: number;
    title: string;
    body: string;
    author: string;
    date: string;
  }>;
  tags: string[];
  features: string[];
  inTheBox: string[];
  warranty: {
    duration: number;
    unit: 'month' | 'year';
    description: string;
  };
}
```

**Data Sources:**
| Field | Source | Query Type |
|-------|--------|------------|
| Basic info | Sanity product document | GROQ by slug |
| Images | Sanity CDN | Direct URL |
| Stock status | Sanity + real-time check | GROQ |
| Reviews | Separate reviews document | GROQ by product ID |
| Related products | `relatedProducts` array | GROQ by IDs |
| Breadcrumb | VFS via catalogueLocationKeys | Client-side lookup |

### 15.2 Folder & File Structure

```
app/
├── (store)/
│   └── product/
│       └── [slug]/
│           ├── page.tsx              # Server Component — data fetch
│           ├── loading.tsx           # Server Component — skeleton
│           └── error.tsx             # Client Component — error UI
├── components/
│   ├── features/
│   │   └── product-detail/
│   │       ├── ProductDetailLayout.tsx     # Server Component — 2-column layout
│   │       ├── ImageGallery.tsx              # Client Component — carousel + zoom
│   │       ├── ProductInfo.tsx               # Server Component — title, brand, price
│   │       ├── AddToCartButton.tsx           # Client Component — cart integration
│   │       ├── ProductDescription.tsx        # Server Component — rich text
│   │       ├── SpecificationsTable.tsx       # Server Component — spec list
│   │       ├── InTheBox.tsx                  # Server Component — included items
│   │       ├── ReviewsSection.tsx            # Client Component — reviews + form
│   │       ├── RelatedProducts.tsx           # Server Component — carousel
│   │       └── Breadcrumb.tsx                # Server Component — navigation
│   └── ui/
│       ├── Checkbox.tsx                # Client Component — custom design system
│       ├── Slider.tsx                  # Client Component — custom design system
│       ├── Badge.tsx                   # Client Component — custom design system
│       └── QuantitySelector.tsx      # Client Component — custom design system
├── lib/
│   └── product/
│       └── getRelatedProducts.ts     # Pure function — filter by category
└── sanity/
    └── lib/
        └── products/
            └── getProductBySlug.ts   # Server function
```

### 15.3 Component Specifications — Product Detail

#### ProductDetailLayout.tsx
**Type:** Server Component
**Purpose:** 2-column responsive layout (image left, info right)

**Props:**
```typescript
interface ProductDetailLayoutProps {
  product: ProductDetail;
  relatedProducts: Product[];
}
```

**Rendered Structure:**
```
<article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <Breadcrumb items={buildBreadcrumb(product.catalogueLocationKeys)} />

  <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
    {/* Left: Image Gallery */}
    <div className="lg:col-start-1">
      <ImageGallery images={product.images} />
    </div>

    {/* Right: Product Info */}
    <div className="mt-8 lg:mt-0 lg:col-start-2">
      <ProductInfo product={product} />
      <AddToCartButton product={product} />

      <Accordion>
        <AccordionItem title="Description">
          <ProductDescription content={product.description} />
        </AccordionItem>
        <AccordionItem title="Specifications">
          <SpecificationsTable specs={product.specifications} />
        </AccordionItem>
        <AccordionItem title="In the Box">
          <InTheBox items={product.inTheBox} />
        </AccordionItem>
      </Accordion>
    </div>
  </div>

  {/* Reviews Section */}
  <ReviewsSection
    reviews={product.reviews}
    productId={product._id}
  />

  {/* Related Products */}
  <RelatedProducts products={relatedProducts} />
</article>
```

**Responsive Breakpoints:**
| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column, stacked |
| Tablet+ | 2-column (image 55%, info 45%) |
| Wide | 2-column with increased gap |

---

#### ImageGallery.tsx
**Type:** Client Component
**Purpose:** Image carousel with thumbnail navigation and zoom

**Props:**
```typescript
interface ImageGalleryProps {
  images: Array<{
    asset: ImageAsset;
    alt?: string;
  }>;
}
```

**State (Internal):**
```typescript
const [activeIndex, setActiveIndex] = useState(0);
const [isZoomed, setIsZoomed] = useState(false);
const [zoomPosition, setZoomPosition] = useState({ x: 0.5, y: 0.5 });
```

**Rendered Structure:**
```
<div className="space-y-4">
  {/* Main Image */}
  <div
    className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
    onClick={() => setIsZoomed(true)}
  >
    <Image
      src={urlFor(images[activeIndex]).width(800).height(800).url()}
      alt={images[activeIndex].alt}
      fill
      className="object-cover"
      priority
    />

    {isZoomed && (
      <ZoomImage
        src={urlFor(images[activeIndex]).width(1600).height(1600).url()}
        position={zoomPosition}
        onClose={() => setIsZoomed(false)}
      />
    )}
  </div>

  {/* Thumbnails */}
  <div className="flex space-x-2 overflow-x-auto">
    {images.map((img, idx) => (
      <button
        key={idx}
        onClick={() => setActiveIndex(idx)}
        className={cn(
          "w-20 h-20 flex-shrink-0 rounded-md overflow-hidden",
          idx === activeIndex ? "ring-2 ring-black" : "opacity-70"
        )}
      >
        <Image
          src={urlFor(img).width(80).height(80).url()}
          alt={`View ${idx + 1}`}
          width={80}
          height={80}
          className="object-cover"
        />
      </button>
    ))}
  </div>
</div>
```

**Animations:**
- Thumbnail hover: opacity transition (200ms)
- Active thumbnail: ring animation (300ms)
- Image crossfade: CSS opacity transition (150ms)
- Zoom: scale transform (300ms ease-out)

---

#### ProductInfo.tsx
**Type:** Server Component
**Purpose:** Product metadata display (title, brand, price, availability)

**Rendered Structure:**
```
<div className="space-y-4">
  {/* Brand */}
  <a
    href={`/brand/${product.brand.slug}`}
    className="text-sm text-gray-500 hover:text-gray-900"
  >
    {product.brand.name}
  </a>

  {/* Title */}
  <h1 className="text-3xl font-bold text-gray-900">
    {product.name}
  </h1>

  {/* Price */}
  <div className="flex items-baseline space-x-2">
    <Price value={product.displayPrice} className="text-2xl font-semibold" />
    {product.compareAtPrice && (
      <>
        <Price value={product.compareAtPrice} className="text-lg text-gray-400 line-through" />
        <Badge variant="sale">
          {Math.round((1 - product.displayPrice / product.compareAtPrice) * 100)}% off
        </Badge>
      </>
    )}
  </div>

  {/* Availability */}
  <div className="flex items-center space-x-2">
    <div className={cn(
      "w-2 h-2 rounded-full",
      product.inStock ? "bg-green-500" : "bg-red-500"
    )} />
    <span className={cn(
      "text-sm font-medium",
      product.inStock ? "text-green-600" : "text-red-600"
    )}>
      {product.inStock ? `In stock (${product.inventoryQuantity} available)` : 'Out of stock'}
    </span>
  </div>

  {/* Features list */}
  <ul className="space-y-1 text-sm text-gray-600">
    {product.features.map(feature => (
      <li key={feature} className="flex items-center">
        <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
        {feature}
      </li>
    ))}
  </ul>
</div>
```

---

#### AddToCartButton.tsx
**Type:** Client Component
**Purpose:** Cart integration with quantity selection

**State:**
```typescript
const [quantity, setQuantity] = useState(1);
const [isAdding, setIsAdding] = useState(false);
```

**Rendered Structure:**
```
<div className="flex items-center space-x-4">
  <QuantitySelector
    value={quantity}
    min={1}
    max={product.inventoryQuantity}
    onChange={setQuantity}
  />

  <button
    onClick={handleAddToCart}
    disabled={!product.inStock || isAdding}
    className={cn(
      "flex-1 py-3 px-6 rounded-lg font-semibold transition-colors",
      product.inStock
        ? "bg-black text-white hover:bg-gray-800"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    )}
  >
    {isAdding ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
  </button>
</div>
```

---

#### RelatedProducts.tsx
**Type:** Server Component
**Purpose:** Horizontal scroll of related products

**Data Logic:**
```typescript
// lib/product/getRelatedProducts.ts
export function getRelatedProducts(
  product: ProductDetail,
  allProducts: Product[]
): Product[] {
  // Priority 1: Use explicit relatedProducts array
  if (product.relatedProducts?.length > 0) {
    return allProducts.filter(p =>
      product.relatedProducts.includes(p._id)
    ).slice(0, 4);
  }

  // Priority 2: Same category, similar price
  return allProducts
    .filter(p =>
      p._id !== product._id &&
      p.catalogueLocationKeys.some(key =>
        product.catalogueLocationKeys.includes(key)
      )
    )
    .sort((a, b) =>
      Math.abs(a.displayPrice - product.displayPrice) -
      Math.abs(b.displayPrice - product.displayPrice)
    )
    .slice(0, 4);
}
```

**Rendered Structure:**
```
<section className="mt-16">
  <h2 className="text-2xl font-bold mb-6">You may also like</h2>

  <div className="flex space-x-4 overflow-x-auto pb-4">
    {relatedProducts.map(product => (
      <div key={product._id} className="w-64 flex-shrink-0">
        <ProductCard product={product} />
      </div>
    ))}
  </div>
</section>
```

### 15.4 Server/Client Boundary Map

| Component | Type | Reason |
|-----------|------|--------|
| page.tsx | Server | Data fetch by slug |
| ProductDetailLayout | Server | Layout structure |
| ImageGallery | Client | Interactive carousel, zoom |
| ProductInfo | Server | Static display |
| AddToCartButton | Client | Cart state, click handlers |
| ProductDescription | Server | Rich text rendering |
| SpecificationsTable | Server | Static data |
| InTheBox | Server | Static list |
| ReviewsSection | Client | Form submission, interactivity |
| RelatedProducts | Server | Data pass-through |
| Breadcrumb | Server | VFS lookup |

### 15.5 URL Structure

| URL Pattern | Example | Purpose |
|-------------|---------|---------|
| `/product/[slug]` | `/product/sennheiser-hd800s` | Product detail page |
| `/product/[slug]?r=123` | — | Scroll to review #123 |

### 15.6 Data Fetch Strategy

```typescript
// sanity/lib/products/getProductBySlug.ts
import { sanityFetch } from '@/sanity/lib/client';
import { cache } from 'react';
import groq from 'groq';

export const getProductBySlug = cache(async (slug: string) => {
  return sanityFetch({
    query: groq`*[_type == "product" && slug.current == $slug][0] {
      _id, name, slug, brand, displayPrice, compareAtPrice,
      images, description, specifications, inStock, inventoryQuantity,
      catalogueLocationKeys, relatedProducts, tags, features, inTheBox, warranty,
      "reviews": *[_type == "review" && product._ref == ^._id] {
        rating, title, body, author, date
      }
    }`,
    params: { slug }
  });
});
```

---

## 16. Complete Type Definitions

```typescript
// types/product-discovery.ts

// === FILTERS ===
export type FilterType = 'checkbox' | 'radio' | 'multiselect' | 'range' | 'boolean';
export type FilterCategory = 'regular' | 'overview' | 'specifications' | 'range';

export interface FilterConfiguration {
  name: string;
  type: FilterType;
  filterCategory?: FilterCategory;
  field: string;
  options?: string[];
  defaultValue?: string;
  min?: number;
  max?: number;
  isMinOnly?: boolean;
  step?: number;
}

export interface CategoryFiltersDocument {
  _id: string;
  title: string;
  categoryKey: string;
  filters: {
    filterItems: FilterConfiguration[];
  };
}

export type FilterConfig = {
  categories?: string[];
  price?: { min?: number; max?: number };
  colors?: string[];
  sizes?: string[];
  [key: string]: string[] | { min?: number; max?: number } | undefined;
};

// === SORTING ===
export interface SortableField {
  field: string;
  label: string;
  type: 'number' | 'string' | 'date';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// === STATE ===
export interface SearchParamsState {
  f?: string;  // Encoded filters
  s?: string;  // Encoded sort
  p?: string;  // Page number
  v?: string;  // View mode (grid/list)
  q?: string;  // Search query
}

// === PRODUCT DETAIL ===
export interface ProductDetail extends Product {
  compareAtPrice?: number;
  images: Array<{
    asset: ImageAsset;
    alt?: string;
    hotspot?: SanityImageHotspot;
  }>;
  description: PortableTextBlock[];
  specifications: Array<{ name: string; value: string; unit?: string }>;
  inStock: boolean;
  inventoryQuantity: number;
  relatedProducts: string[];
  reviews: Review[];
  tags: string[];
  features: string[];
  inTheBox: string[];
  warranty: {
    duration: number;
    unit: 'month' | 'year';
    description: string;
  };
}

export interface Review {
  _id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
  verified: boolean;
}
```
