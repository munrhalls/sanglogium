# Research: VFS Architecture Augments for Breadcrumbs & Product Hierarchy

## Research Scope Contract
- **Topic:** VFS architecture changes needed to support full breadcrumb hierarchy
- **First Principles:** URL structure mirrors catalogue hierarchy, each level needs product query capability
- **Fundamentals:** VFS subtree queries, slug-to-ID resolution, breadcrumb path generation
- **Scope Boundary:** Focus on VFS functions, not UI components or pagination
- **Target Audience:** Developers implementing product hierarchy navigation
- **Decay Risk:** Low - catalogue structure changes infrequently

---

## Current State Analysis

### What Exists Today
1. **VFS Functions**: `getCatalogue()`, `resolveSlugToId()`, `unrollDescendantKeys()`
2. **Product Query**: `getProductsByVfsKeys()` - works with catalogue IDs
3. **Navigation**: `getCatalogueForNavigation()` - transforms VFS to navigation format
4. **Caching**: All VFS functions cached in `data/catalogue/cache.ts`

### What's Missing
1. **Root-level query**: Function to get ALL catalogue IDs for `/products` page
2. **Breadcrumb path generation**: Function to build full path from any slug
3. **Category/sub-category queries**: Functions to get subtree IDs by slug
4. **Route integration**: No dynamic routes for category levels

---

## Required VFS Architecture Augments

### 1. Root-Level Query Function
**Purpose**: Get ALL catalogue IDs for `/products` page
**Implementation**: 
```typescript
export const getAllCatalogueIds = (): string[] => {
  const data = catalogueIndex as CatalogueIndexData;
  return Object.keys(data.slotMetadataMap);
};
```

### 2. Breadcrumb Path Generator
**Purpose**: Given any slug, return full hierarchy path
**Implementation**:
```typescript
export interface BreadcrumbPath {
  href: string;
  label: string;
  slug?: string;
}

export const getBreadcrumbPath = (targetSlug: string): BreadcrumbPath[] => {
  // 1. Find target node in tree
  // 2. Walk up tree to root
  // 3. Build path array: Home → Products → Category → Sub-Category → Product
  // 4. Return array for breadcrumb rendering
};
```

### 3. Slug-to-Subtree Query
**Purpose**: Given any slug (category or sub-category), return all descendant IDs
**Implementation**:
```typescript
export const getSubtreeIdsBySlug = (slug: string): string[] => {
  const nodeId = resolveSlugToId(slug);
  if (!nodeId) return [];
  return unrollDescendantKeys(nodeId);
};
```

### 4. Hierarchy Walker
**Purpose**: Walk tree to find parent-child relationships
**Implementation**:
```typescript
export const findNodePath = (targetSlug: string): CatalogueTreeNode[] => {
  // Recursive tree walk to find path from root to target
};
```

---

## Data Flow Requirements

### For `/products` Page
1. Call `getAllCatalogueIds()` 
2. Pass to `getProductsByVfsKeys({ keys: allIds })`
3. Render paginated product grid

### For `/products/headphones` Page
1. Call `getSubtreeIdsBySlug('headphones')`
2. Pass to `getProductsByVfsKeys({ keys: subtreeIds })`
3. Render category products

### For `/products/headphones/open-back` Page
1. Call `getSubtreeIdsBySlug('open-back')`
2. Pass to `getProductsByVfsKeys({ keys: subtreeIds })`
3. Render sub-category products

### For Product Breadcrumbs
1. Call `getBreadcrumbPath('sennheiser-hd-560s')`
2. Render: Home → Products → headphones → open-back → Sennheiser HD 560S

---

## Integration Points

### New Route Structure Needed
```
app/(store)/products/page.tsx                    # Uses getAllCatalogueIds()
app/(store)/products/[category]/page.tsx          # Uses getSubtreeIdsBySlug(category)
app/(store)/products/[category]/[sub]/page.tsx    # Uses getSubtreeIdsBySlug(sub)
app/(store)/product/[slug]/page.tsx              # Uses getBreadcrumbPath(slug)
```

### Cache Strategy
All new functions should be cached following existing patterns:
- Root IDs: 24-hour cache (same as catalogue)
- Breadcrumb paths: 24-hour cache (static)
- Subtree queries: 24-hour cache (catalogue-dependent)

---

## Critical Dependencies

### VFS Data Integrity
The audit shows `slotMetadataMap` has critical flaws - missing intermediate nodes. This must be fixed before subtree queries work reliably.

### Build Script Consistency
The catalogue build script needs validation to ensure all tree nodes exist in `slotMetadataMap`.

### Slug Uniqueness
Assumes slugs are unique across the entire catalogue (currently true).

---

## Implementation Priority

### Phase 1: Core Functions
1. `getAllCatalogueIds()` - Simple, low risk
2. `getSubtreeIdsBySlug()` - Depends on working VFS
3. `getBreadcrumbPath()` - Most complex, needs tree walking

### Phase 2: Route Integration
1. Add dynamic routes for category levels
2. Integrate VFS functions with route handlers
3. Add breadcrumb component to product pages

### Phase 3: Testing & Validation
1. Test with real catalogue data
2. Verify breadcrumb accuracy
3. Performance testing for large product sets

---

## Risk Assessment

### High Risk
- **VFS Data Issues**: Current audit shows broken subtree functionality
- **Tree Walking Complexity**: Breadcrumb generation requires recursive tree traversal

### Medium Risk  
- **Cache Invalidation**: Need to clear caches when catalogue rebuilds
- **Slug Collisions**: Future catalogue changes might break uniqueness

### Low Risk
- **Function Implementation**: Straightforward extensions of existing patterns
- **Route Integration**: Standard Next.js dynamic routing

---

## Verification Requirements

### Functional Tests
- `/products` shows all products
- `/products/headphones` shows headphones category
- `/products/headphones/open-back` shows open-back sub-category  
- Breadcrumbs show correct hierarchy

### Performance Tests
- Subtree queries execute under 100ms
- Breadcrumb generation under 50ms
- Cache hit ratio > 95%

### Data Integrity Tests
- All catalogue IDs returned by root query
- Subtree queries include all expected products
- Breadcrumb paths match catalogue structure

---

## Conclusion

The VFS architecture needs **4 new core functions** to support breadcrumb hierarchy:
1. Root ID collection for all products page
2. Breadcrumb path generation for navigation
3. Slug-to-subtree queries for category pages  
4. Tree walking for hierarchy discovery

The foundation exists but **VFS data integrity must be fixed first** before these functions can work reliably. Once fixed, the implementation is straightforward extensions of existing patterns.
