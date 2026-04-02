# Products Page Filter & Sort Consumption Trace

## Research Scope Contract
- **Topic:** Products page consumption of filtering and sorting parameters
- **First Principles:** URL state → server query → UI rendering → client interaction
- **Fundamentals:** Parameter parsing, GROQ translation, React streaming, nuqs state sync
- **Scope Boundary:** Only consumption flow - not filter generation or UI components
- **Target Audience:** Developers debugging filter/sort data flow
- **Decay Risk:** Low - core URL → query pattern is stable

---

## Build 2: Data Pass Consumption Flow

### 1. URL Parameter Ingestion (`page.tsx` lines 31-33)
```typescript
// Parse URL params
const sort = typeof query.sort === 'string' ? query.sort : 'featured';
const filters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];
```
**Input Examples:**
- `?sort=displayPrice:asc` → `sort = "displayPrice:asc"`
- `?f=brand:sennheiser&f=type:open-back` → `filters = ["brand:sennheiser", "type:open-back"]`
- `?f=` (empty) → `filters = []`

### 2. Product Query Execution (`page.tsx` lines 38-42)
```typescript
const productsPromise = getProductsByVfsKeys({
  keys: descendantKeys,
  sort,
  filters
});
```
**Consumption Pattern:**
- Pass-through of raw URL parameters to data layer
- No transformation or validation at page level
- Relies on `getProductsByVfsKeys` for processing

### 3. GROQ Query Building (`getProductsByVfsKeys.ts` lines 44-61)
```typescript
// Build sort clause
const [sortField, sortDir] = sort.split(':');
const orderClause = sort === 'featured'
  ? ''
  : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

// Build filter clause
const filterClause = filters.length > 0
  ? filters.map(f => {
      const [field, value] = f.split(':');
      if (field === 'brand') {
        return `&& brand->name == "${value}"`;
      }
      return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
    }).join(' ')
  : '';
```

**Critical Consumption Logic:**
- Sort: Splits on `:`, defaults to featured if no match
- Brand filters: Use GROQ dereference `brand->name`
- Other filters: Search in `overviewFields` OR `specifications` arrays
- No validation of field names - assumes they exist in schema

### 4. Data Streaming to Components (`page.tsx` lines 79-85)
```typescript
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductsSection
    productsPromise={productsPromise}
    filtersPromise={filtersPromise}
    categoryName={metadata.name}
  />
</Suspense>
```
**Consumption Handoff:**
- Products already filtered/sorted server-side
- Client receives pre-processed data
- No client-side filtering logic needed

---

## Build 3 Layer 4: Interactive Consumption

### 1. Client State Initialization (`CategoryPageClient.tsx` lines 44-54)
```typescript
// Parse active filters from URL for display purposes only
const activeFilters = useMemo(() => {
  const filterParams = searchParams.getAll('f');
  return filterParams.map(f => {
    const [field, value] = f.split(':');
    return { field, value };
  });
}, [searchParams]);
```
**Consumption Pattern:**
- URL already contains filter state from server
- Client parses for display, not for data fetching
- Products already filtered server-side

### 2. Sort Dropdown Consumption (`SortDropdown.tsx` lines 9-27)
```typescript
const currentSort = searchParams.get('sort') || 'featured';

const handleSortChange = (value: string) => {
  const params = new URLSearchParams(otherParamsString);
  if (value !== 'featured') {
    params.set('sort', value);
  }
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
  router.push(newUrl, { scroll: false });
};
```
**Interactive Consumption:**
- Reads current sort from URL
- Updates URL parameter on change
- Triggers server re-fetch via Next.js navigation

### 3. Filter State Sync (`useFilterNuqs.ts` lines 31-44)
```typescript
const [filters, setFilters] = useQueryState(
  "f",
  parseAsArrayOf(parseAsString)
    .withOptions({
      shallow: true,
      throttleMs: 50,
      clearOnDefault: true,
    })
    .withDefault([])
);
```
**Consumption Architecture:**
- `nuqs` manages URL state automatically
- Shallow routing prevents full page reload
- Throttled updates prevent browser rate-limiting

---

## Critical Consumption Points

### 1. Parameter Format Contract
**Sort:** `field:direction` (e.g., `displayPrice:asc`)
**Filters:** `field:value` (e.g., `brand:sennheiser`)
**Multiple filters:** `?f=brand:sennheiser&f=type:open-back`

### 2. Server-Client Data Contract
- Server: Fetches filtered data based on URL
- Client: Receives pre-filtered data, manages UI state only
- Synchronization: URL is single source of truth

### 3. Filter Processing Logic
```typescript
// Brand filters use dereference
if (field === 'brand') {
  return `&& brand->name == "${value}"`;
}

// Other filters search in two arrays
return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
```

### 4. Error Handling
- Invalid sort: Falls back to 'featured'
- Invalid filter format: Filter ignored in GROQ build
- Missing fields: GROQ query returns no results

## Verdict: **ROBUST CONSUMPTION** - Well-architected server-first pattern with clear separation of concerns
