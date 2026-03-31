# Sprint 4: Filters & Sort (Layer 6A-B)

## Sprint Metadata

| Field | Value |
|-------|-------|
| **Sprint ID** | S4-FILTERS-SORT |
| **Layer** | L6A Sort + L6B Filter |
| **Estimated Time** | 6-8 hours |
| **Status** | READY FOR AI IMPLEMENTATION |
| **Dependencies** | Sprint 3 LOCKED — Real products rendering, URL routing working |

---

## Scope Contract

### DELIVERABLE STATE — DESKTOP (1280px)
Category page displays product grid with left sidebar containing filter checkboxes (Brand, Driver Type, etc.), sort dropdown top-right, active filter pills below header. Filters update URL and re-render products. Mobile: filters in slide-out drawer.

### DELIVERABLE STATE — MOBILE (375px)
Same functionality, sidebar becomes full-width slide-in drawer with overlay, sort dropdown above grid, grid is 2 columns.

### IN SCOPE
- FilterSidebar: Renders filters from CMS config, checkboxes update URL
- SortDropdown: 3 options (Price, Name, Newest), updates URL with direction
- ActiveFilters: Pills showing selected filters, removable
- URL state: `?f=field:value` and `?s=field:direction` params
- Server-side re-fetch when params change
- Mobile drawer: Slide-in with overlay, close button

### OUT OF SCOPE (Explicitly Forbidden)
- ❌ Price range slider (complex, defer)
- ❌ Multi-select beyond checkboxes
- ❌ Filter search/autocomplete
- ❌ Sort animations
- ❌ Filter persistence across sessions
- ❌ Complex filter logic (AND/OR toggles)

### FORBIDDEN SCOPE
- Do NOT use client-side state management (use URL as source of truth)
- Do NOT build generic filter abstraction — specific to product discovery only
- Do NOT add any styling until Layout pass is complete on ALL components

---

## 4-Layer Build Bus Methodology

This sprint follows strict 4-layer sequencing per component. No component proceeds to next layer until all components complete current layer.

```
Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only. No colors.
Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
Layer 4 — Interaction:  URL updates, drawer animation, hover states.
```

---

## Implementation Phases

### Phase 1: Layer 1 — Structure Pass (All Components)

**Goal:** Every component renders semantic HTML with debug borders only.

**Components:**
1. `FilterSidebar` — `<aside>` with `<form>` and checkbox groups
2. `SortDropdown` — `<select>` or custom dropdown structure
3. `ActiveFilters` — `<div>` with removable filter buttons
4. `FilterConfigProvider` — Server Component wrapper

**Structure Spec (Debug Mode):**
```tsx
// FilterSidebar Structure
<aside data-testid="filter-sidebar" className="border-2 border-red-500">
  <form>
    <fieldset>
      <legend>Brand</legend>
      <label><input type="checkbox" /> Sennheiser</label>
      <label><input type="checkbox" /> Sony</label>
    </fieldset>
  </form>
</aside>

// SortDropdown Structure
<div data-testid="sort-dropdown" className="border-2 border-blue-500">
  <select>
    <option>Featured</option>
    <option>Price: Low to High</option>
    <option>Price: High to Low</option>
  </select>
</div>

// ActiveFilters Structure
<div data-testid="active-filters" className="border-2 border-green-500">
  <button>Brand: Sennheiser ✕</button>
  <button>Clear All</button>
</div>
```

**DoD Layer 1:**
- [ ] All 4 components render with debug borders
- [ ] Semantic HTML validates (fieldset, legend, label, input)
- [ ] No Tailwind classes except `border-2 border-{color}-500`
- [ ] Components compose on page without layout (stack vertically)

---

### Phase 2: Layer 2 — Layout Pass (All Components)

**Goal:** Spatial positioning correct at all breakpoints. No colors.

**Layout Spec:**

```tsx
// FilterSidebar Layout
<aside className="w-full lg:w-[280px] lg:shrink-0 border-r lg:border-r border-gray-200">
  <div className="p-4 lg:p-6 space-y-6">
    {/* Filter groups */}
  </div>
</aside>

// SortDropdown Layout
<div className="flex justify-end mb-4">
  <div className="w-[200px]">
    {/* Select */}
  </div>
</div>

// ActiveFilters Layout
<div className="flex flex-wrap gap-2 mb-6">
  {/* Filter pills */}
</div>

// Page Layout Integration
<div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
  <FilterSidebar />
  <main className="flex-1 min-w-0">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <ShopHeader />
      <SortDropdown />
    </div>
    <ActiveFilters />
    <ProductGrid />
  </main>
</div>
```

**DoD Layer 2:**
- [ ] Desktop: Sidebar 280px fixed left, main content flexes
- [ ] Desktop: Sort dropdown top-right aligned with header
- [ ] Mobile: Sidebar hidden by default, full width when shown
- [ ] Mobile: Sort dropdown full width above grid
- [ ] ActiveFilters wrap correctly with gap-2
- [ ] Grid spacing preserved (24px gap between sidebar and products)
- [ ] No colors in code review (only border-gray-200 for structural separation)

---

### Phase 3: Layer 3 — Surface Pass (Per Component)

**Build order:** FilterSidebar → SortDropdown → ActiveFilters

**Surface Spec:**

```tsx
// FilterSidebar Surface
<aside className="... bg-brand-900 text-brand-100">
  <h3 className="text-small font-bold uppercase tracking-editorial text-brand-400 mb-4">
    Filters
  </h3>
  {/* Checkboxes styled with brand accent color */}
  <input className="accent-accent-500" />
</aside>

// SortDropdown Surface
<div className="relative">
  <select className="w-full bg-brand-800 text-brand-100 border border-brand-700 rounded-none px-4 py-2 appearance-none">
    {/* Options */}
  </select>
  {/* Custom arrow icon */}
</div>

// ActiveFilters Surface
<div className="flex flex-wrap gap-2">
  <button className="inline-flex items-center gap-2 px-3 py-1 bg-brand-800 text-brand-100 text-sm hover:bg-brand-700 transition-colors">
    <span>Brand: Sennheiser</span>
    <XIcon className="w-4 h-4" />
  </button>
  <button className="text-sm text-brand-400 hover:text-brand-300 underline">
    Clear all
  </button>
</div>
```

**DoD Layer 3 (per component):**
- [ ] Component uses design system tokens (brand-*, accent-*)
- [ ] Typography matches existing patterns (text-small, text-body)
- [ ] Hover states defined for interactive elements
- [ ] Mobile drawer has overlay backdrop styling

---

### Phase 4: Layer 4 — Interaction Pass (Per Component)

**Build order:** SortDropdown → ActiveFilters → FilterSidebar (mobile drawer last)

**Interaction Spec:**

```typescript
// SortDropdown Interaction
"use client";

interface SortDropdownProps {
  currentSort: string;
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'featured') {
      params.delete('s');
    } else {
      params.set('s', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="..."
    >
      <option value="featured">Featured</option>
      <option value="displayPrice:asc">Price: Low to High</option>
      <option value="displayPrice:desc">Price: High to Low</option>
      <option value="name:asc">Name: A-Z</option>
    </select>
  );
}
```

```typescript
// ActiveFilters Interaction
"use client";

interface ActiveFiltersProps {
  filters: Array<{ field: string; value: string; label: string }>;
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeFilter = (field: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const currentFilters = params.getAll('f');
    const newFilters = currentFilters.filter(f => f !== `${field}:${value}`);
    params.delete('f');
    newFilters.forEach(f => params.append('f', f));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('f');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map(({ field, value, label }) => (
        <button
          key={`${field}:${value}`}
          onClick={() => removeFilter(field, value)}
          className="..."
        >
          <span>{label}</span>
          <XIcon className="w-4 h-4" />
        </button>
      ))}
      <button onClick={clearAll} className="...">
        Clear all
      </button>
    </div>
  );
}
```

```typescript
// FilterSidebar Mobile Drawer
"use client";

export function FilterSidebar({ filters, isOpen, onClose }: FilterSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar with slide animation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[300px] lg:w-[280px]
        bg-brand-900 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="text-small font-bold uppercase">Filters</h3>
            <button onClick={onClose}>
              <XIcon />
            </button>
          </div>

          {/* Filter groups */}
        </div>
      </aside>
    </>
  );
}
```

**DoD Layer 4 (per component):**
- [ ] SortDropdown: URL updates with `?s=displayPrice:asc`
- [ ] SortDropdown: Server Component re-fetches with new params
- [ ] ActiveFilters: Clicking X removes filter from URL
- [ ] ActiveFilters: Clear all removes all filters
- [ ] FilterSidebar: Mobile drawer slides in/out (300ms ease-out)
- [ ] FilterSidebar: Overlay click closes drawer
- [ ] FilterSidebar: Checkboxes update URL with `?f=field:value`

---

## Data Layer Specifications

### Filter Configuration Schema

```typescript
// sanity/schemaTypes/filterConfigType.ts (if needed)
// Or fetch from existing category metadata

interface FilterConfig {
  field: string;           // e.g., "brand", "driverType"
  label: string;           // e.g., "Brand", "Driver Type"
  type: 'checkbox' | 'select';
  options: Array<{
    value: string;
    label: string;
    count?: number;        // Product count for this option
  }>;
}

// GROQ query for filter config
const FILTER_CONFIG_QUERY = `*[_type == "categoryFilter" && categoryId == $categoryId][0] {
  filters[] {
    field,
    label,
    type,
    options[] {
      value,
      label,
      "count": count(*[_type == "product" && references(^._id) && ^.field in catalogueLocationKeys])
    }
  }
}`;
```

### Updated Product Query

```typescript
// sanity/lib/products/getProductsByVfsKeys.ts

interface GetProductsOptions {
  keys: string[];
  sort?: string;           // "displayPrice:asc", "name:desc", etc.
  filters?: Array<{        // [{ field: "brand", value: "Sennheiser" }]
    field: string;
    value: string;
  }>;
}

export async function getProductsByVfsKeys({
  keys,
  sort = 'featured',
  filters = []
}: GetProductsOptions): Promise<Product[]> {
  // Build sort clause
  const [sortField, sortDir] = sort.split(':');
  const orderClause = sort === 'featured'
    ? ''
    : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

  // Build filter clause
  const filterClause = filters.length > 0
    ? filters.map(f => `&& ${f.field} == "${f.value}"`).join(' ')
    : '';

  const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} {
    _id,
    name,
    brand,
    displayPrice,
    image,
    slug { current },
    catalogueLocationKeys
  }`;

  return sanityFetch({ query, params: { keys } });
}
```

### URL Parameter Parsing

```typescript
// lib/filters/urlParams.ts

import { ReadonlyURLSearchParams } from 'next/navigation';

export interface FilterState {
  sort: string;
  filters: Array<{ field: string; value: string }>;
}

export function parseFilterParams(searchParams: ReadonlyURLSearchParams): FilterState {
  // Sort: ?s=displayPrice:asc
  const sort = searchParams.get('s') || 'featured';

  // Filters: ?f=brand:Sennheiser&f=driverType:Dynamic
  const filterParams = searchParams.getAll('f');
  const filters = filterParams.map(f => {
    const [field, value] = f.split(':');
    return { field, value };
  });

  return { sort, filters };
}

export function buildFilterLabel(field: string, value: string): string {
  // Human-readable labels
  const labels: Record<string, Record<string, string>> = {
    brand: {
      'sennheiser': 'Sennheiser',
      'sony': 'Sony',
      'focal': 'Focal',
      // ...
    },
    driverType: {
      'dynamic': 'Dynamic',
      'planar': 'Planar Magnetic',
      // ...
    }
  };

  return labels[field]?.[value.toLowerCase()] || value;
}
```

---

## Files to Create/Modify

```
app/
├── (store)/
│   └── products/
│       └── [...slug]/
│           └── page.tsx              # MODIFY: Accept searchParams
├── components/
│   └── features/
│       ├── filters/
│       │   ├── FilterSidebar.tsx         # L1-L4
│       │   ├── SortDropdown.tsx          # L1-L4
│       │   ├── ActiveFilters.tsx         # L1-L4
│       │   ├── MobileFilterToggle.tsx    # Button to open drawer
│       │   ├── FilterConfigProvider.tsx  # Server Component
│       │   └── __tests__/
│       │       ├── FilterSidebar.test.tsx
│       │       ├── SortDropdown.test.tsx
│       │       └── ActiveFilters.test.tsx
│       └── products/
│           └── page.tsx              # MODIFY: Add filter components

lib/
├── filters/
│   ├── urlParams.ts                  # parseFilterParams, buildFilterLabel
│   └── __tests__/
│       └── urlParams.test.ts
└── sanity/
    └── products/
        ├── getProductsByVfsKeys.ts   # MODIFY: Add sort/filter params
        ├── getFilterConfig.ts        # NEW: Fetch CMS filter config
        └── __tests__/
            └── getProductsByVfsKeys.test.ts
```

---

## Test Specifications

### Unit Tests

```typescript
// tests/filters/urlParams.test.ts
describe('Filter URL Params', () => {
  it('parses sort parameter', () => {
    const params = new URLSearchParams('s=displayPrice:asc');
    const result = parseFilterParams(params);
    expect(result.sort).toBe('displayPrice:asc');
  });

  it('parses multiple filters', () => {
    const params = new URLSearchParams('f=brand:Sennheiser&f=driverType:Dynamic');
    const result = parseFilterParams(params);
    expect(result.filters).toHaveLength(2);
    expect(result.filters[0]).toEqual({ field: 'brand', value: 'Sennheiser' });
  });

  it('defaults to featured sort', () => {
    const params = new URLSearchParams('');
    const result = parseFilterParams(params);
    expect(result.sort).toBe('featured');
  });
});
```

### Component Tests

```typescript
// app/components/features/filters/__tests__/SortDropdown.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

describe('SortDropdown', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/products/headphones');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('updates URL when sort changes', () => {
    render(<SortDropdown currentSort="featured" />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'displayPrice:asc' }
    });
    expect(mockPush).toHaveBeenCalledWith('/products/headphones?s=displayPrice:asc');
  });
});
```

### E2E Tests

```typescript
// tests/integration/filters.e2e.test.ts
describe('Filter & Sort E2E', () => {
  it('E2E-01: Filter by brand updates product count', async () => {
    const products = await getProductsByVfsKeys({
      keys: ['o7c6baiuobsr7ni2y2vf22sh'],
      filters: [{ field: 'brand', value: 'Sennheiser' }]
    });
    // Verify only Sennheiser products returned
    products.forEach(p => expect(p.brand?.name).toBe('Sennheiser'));
  });

  it('E2E-02: Sort by price ascending', async () => {
    const products = await getProductsByVfsKeys({
      keys: ['o7c6baiuobsr7ni2y2vf22sh'],
      sort: 'displayPrice:asc'
    });
    // Verify ascending order
    for (let i = 1; i < products.length; i++) {
      expect(products[i].displayPrice).toBeGreaterThanOrEqual(products[i-1].displayPrice);
    }
  });
});
```

---

## Manual Verification Matrix

### Layer 1 Verification
- [ ] **L1-01:** All filter components render with debug borders (red/blue/green)
- [ ] **L1-02:** Semantic HTML validates in DevTools (fieldset, legend, label)
- [ ] **L1-03:** Components stack vertically without layout classes

### Layer 2 Verification
- [ ] **L2-01:** Desktop: Sidebar 280px fixed, main content flexes
- [ ] **L2-02:** Mobile (375px): Sidebar hidden, main content full width
- [ ] **L2-03:** Sort dropdown positioned top-right of product grid
- [ ] **L2-04:** Active filters wrap with gap-2 spacing
- [ ] **L2-05:** No color classes in code (only border-gray-200)

### Layer 3 Verification
- [ ] **L3-01:** FilterSidebar uses brand-900 background, brand-100 text
- [ ] **L3-02:** Checkboxes have accent-accent-500 styling
- [ ] **L3-03:** Sort dropdown styled with brand design system tokens
- [ ] **L3-04:** Active filter pills have hover state (bg-brand-700)
- [ ] **L3-05:** Mobile drawer overlay has bg-black/50 backdrop

### Layer 4 Verification (Journey Tests)
- [ ] **Journey S4-01:** Sort "Price: Low to High" → URL `?s=displayPrice:asc`, products reorder
- [ ] **Journey S4-02:** Check "Sennheiser" filter → URL `?f=brand:Sennheiser`, count decreases
- [ ] **Journey S4-03:** Multiple filters → URL `?f=brand:Sennheiser&f=driverType:Dynamic`
- [ ] **Journey S4-04:** Click filter pill X → filter removed from URL, products update
- [ ] **Journey S4-05:** Click "Clear all" → all filters removed, URL clean
- [ ] **Journey S4-06:** Mobile: Tap "Filters" → drawer slides in, overlay appears
- [ ] **Journey S4-07:** Mobile: Tap overlay or X → drawer slides out
- [ ] **Journey S4-08:** Copy URL with filters → new tab → same filters applied
- [ ] **Journey S4-09:** Filter to 0 results → empty state with "Clear all filters" button

### Final Lockdown
- [ ] All automated tests passing (6+ tests)
- [ ] All 9 journey tests completed
- [ ] Desktop (1280px) layout verified
- [ ] Mobile (375px) layout verified
- [ ] 0 console errors
- [ ] URL shareability confirmed

---

## AI Implementation Protocol

**Per Layer:**
1. **You** verify previous layer is LOCKED
2. **AI** implements ONE layer for ALL components
3. **You** run visual verification, mark layer complete
4. Proceed to next layer

**Constraints:**
- NO component proceeds to next layer until ALL components complete current layer
- NO colors in Layout pass
- NO logic in Structure pass
- NO animations in Surface pass

**Rejection Criteria:**
- Mixed layers in single file
- Client component without "use client"
- URL state managed via useState instead of URL params

---

## Next Sprint Trigger

**Sprint 5 is UNLOCKED when:**
1. Sprint 4 reaches LOCKED status
2. All 4 layers complete on all components
3. User verifies all 9 journey tests
4. User comments: `LOCKED [date] — User: [name]`

**Sprint 5 Scope:** L6C Product Detail enhancements — Related products carousel, full specs table, reviews integration

---

*Ready for AI execution. Begin with Layer 1 — Structure Pass.*
