# Theme 03: Sanity CMS & GROQ

## SangLogium Context
Sanity is the content backend. GROQ queries power every data fetch. Schema design determines query complexity. The VFS depends on Sanity's hierarchical document structure.

**Critical Files:**
- `sanity/schemaTypes/productType.ts` — 500+ products schema
- `sanity/schemaTypes/orderType.ts` — Complex order structure
- `sanity/schemaTypes/catalogueItemType.ts` — VFS tree structure
- `sanity/lib/products/getSelectedProducts.ts` — Complex GROQ assembly
- `sanity/lib/client.ts` — Sanity client configuration

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

#### Schema Design
- [ ] What is the difference between `type: 'document'` and `type: 'object'`?
- [ ] How do you create self-referential relationships (categories with parents)?
- [ ] What is a `weak` reference and when should you use it?
- [ ] How do you validate field values in Sanity?
- [ ] What are `preview` configurations for?

#### GROQ Fundamentals
- [ ] What does `*[_type == "product"]` return?
- [ ] How do you filter by nested field values?
- [ ] What is the difference between `->` and `=>`?
- [ ] How do you order results in GROQ?
- [ ] What does `count()` do in a filter?

#### Advanced GROQ
- [ ] How do you check if an array contains a value?
- [ ] What is the `coalesce()` function for?
- [ ] How do you do conditional projections?
- [ ] What is `match` used for in GROQ?
- [ ] How do you paginate with GROQ?

#### SangLogium-Specific
- [ ] How does the VFS query use GROQ?
- [ ] What is the `catalogueLocationKeys` field for?
- [ ] How are product specifications stored and queried?
- [ ] How does the order status field use enums?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Schema Design Patterns

**Document vs Object:**
```typescript
// Document: Top-level, has _id, queryable
defineType({
  name: 'product',
  type: 'document',
  // ...
})

// Object: Embedded, no _id, reusable
defineType({
  name: 'specification',
  type: 'object',
  // ...
})
```

**References:**
```typescript
// Strong reference (default)
defineField({
  name: 'category',
  type: 'reference',
  to: [{ type: 'catalogueItem' }],
  // Product cannot exist without valid category
})

// Weak reference
defineField({
  name: 'productRef',
  type: 'reference',
  to: [{ type: 'product' }],
  weak: true, // Survives if product deleted
})
```

**Arrays of Objects:**
```typescript
defineField({
  name: 'specifications',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'value', type: 'string' }),
      ]
    })
  ]
})
```

**Self-Referential (VFS Pattern):**
```typescript
defineField({
  name: 'parent',
  type: 'reference',
  to: [{ type: 'catalogueItem' }], // References same type
  description: 'Forms recursive tree graph'
})
```

---

### Module 2: GROQ Query Patterns

**Basic Filtering:**
```groq
*[_type == "product" && defined(price)]
```

**Projections (Select Fields):**
```groq
*[_type == "product"] {
  _id,
  name,
  "slug": slug.current,
  price,
  "categoryName": category->title
}
```

**Array Operations:**
```groq
// Contains check (VFS pattern)
*[_type == "product" && "headphones/open-back" in catalogueLocationKeys]

// Count with filter
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]

// Array element access
*[_type == "product"].specifications[0].value
```

**Conditional Logic:**
```groq
*[_type == "product"] {
  name,
  "status": defined(salePrice) ? "on_sale" : "regular",
  "discount": coalesce(compareAtPrice - price, 0)
}
```

**Ordering & Pagination:**
```groq
*[_type == "product"]
  | order(price desc)
  [$start...$end]
```

---

### Module 3: SangLogium-Specific Patterns

**VFS Product Query:**
```groq
// Get all products in a category subtree
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]
  | order(name asc)
```

**Complex Filter Assembly:**
```typescript
// SangLogium builds GROQ dynamically
const pathQuery = catalogueKeys.length > 0 
  ? ` && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0` 
  : "";

const assembledQuery = `*[_type == "product"${pathQuery}`;
// Then adds filter clauses, sorting, projections
```

**Coalesce for Defaults:**
```groq
// Used in sorting when data might be missing
{
  ...,
  "sortValue": coalesce(
    specifications[title match "Frequency Response"][0].value,
    "100Hz"
  )
}
| order(sortValue asc)
```

---

### Module 4: Performance & Best Practices

**Query Optimization:**
1. **Limit early**: Use `[$start...$end]` not client-side slicing
2. **Project lean**: Only fetch fields you need
3. **Avoid deep nesting**: Multiple `->` traversals are expensive
4. **Index fields**: Mark frequently filtered fields for indexing

**Caching Strategy:**
```typescript
// Tag-based revalidation
sanityFetch({
  query: PRODUCTS_QUERY,
  next: { tags: ['products', `category:${categoryId}`] }
});

// Revalidate by tag
revalidateTag('products');
```

---

## Layer 2: Integration Examination

### Integration Challenge 1: VFS + GROQ

**Scenario:** Build the product query for a category page

**Requirements:**
1. Accept array of VFS keys as parameter
2. Return products matching ANY of the keys (OR logic)
3. Support additional filters (price range, brand, etc.)
4. Support sorting by different fields
5. Implement pagination

**Given VFS Structure:**
```typescript
const keys = ['headphones', 'headphones/open-back', 'headphones/open-back/sennheiser'];
```

**Query Must:**
- Find products where `catalogueLocationKeys` overlaps with input keys
- Apply price filter if provided
- Apply brand filter if provided
- Sort by specified field and direction
- Return paginated results with total count

**Verification:**
- [ ] Query returns correct products for test keys
- [ ] Filters combine correctly (AND logic between different filters)
- [ ] Sorting works for all specified fields
- [ ] Pagination returns correct slice

---

### Integration Challenge 2: Dynamic GROQ Builder

**Scenario:** Create a type-safe GROQ query builder

**Requirements:**
1. Accept filter configuration object
2. Build GROQ string dynamically
3. Maintain type safety for params
4. Handle edge cases (empty filters, invalid values)

**Filter Config Example:**
```typescript
interface FilterConfig {
  categoryKeys?: string[];
  priceRange?: { min: number; max: number };
  brands?: string[];
  inStock?: boolean;
}
```

**Success Criteria:**
- [ ] Builder generates valid GROQ for all filter combinations
- [ ] TypeScript ensures filter config is valid
- [ ] Empty/undefined filters produce correct query
- [ ] Params object matches query placeholders

---

## Layer 3: Systems Examination

### Systems Challenge: Schema Evolution Strategy

**Scenario:** You need to migrate 500+ products to a new schema structure

**Current Schema:**
```typescript
{
  name: 'product',
  fields: [
    { name: 'price', type: 'number' },
    { name: 'specifications', type: 'array', of: [{ type: 'object' }] }
  ]
}
```

**Target Schema:**
```typescript
{
  name: 'product',
  fields: [
    { name: 'basePrice', type: 'number' },
    { name: 'salePrice', type: 'number' },
    { name: 'variants', type: 'array', of: [{ type: 'productVariant' }] }
  ]
}
```

**Constraints:**
- Zero downtime
- Backward compatibility during migration
- All products must remain accessible
- GROQ queries must continue working

**Design Decisions:**
1. Migration script approach
2. How to handle old vs new data structures
3. GROQ query compatibility strategy
4. Rollback plan

---

## Stress Test Scenarios

### Scenario 1: GROQ Performance Issue

**Symptom:** Category page GROQ query takes 4+ seconds

**Current Query:**
```groq
*[_type == "product" && category->_id in $categoryIds] {
  ...,
  category->{
    ...,
    parent->{
      ...,
      parent->{...}
    }
  }
}
```

**Problems:**
1. Deep reference traversal
2. Expanding all fields with `...`
3. Multiple parent traversals

**Optimization Required:**
- Flatten the query
- Remove unnecessary expansions
- Add proper projections
- Consider denormalization

---

### Scenario 2: Data Consistency Bug

**Given:**
- Products have `catalogueLocationKeys` array
- VFS rebuilds nightly via GitHub Actions
- Some products show in wrong categories

**Investigation:**
1. Check if products have correct keys
2. Verify VFS build script logic
3. Validate GROQ query interpretation
4. Review revalidation timing

**Fix Strategy:**
- Add validation to build script
- Implement runtime consistency checks
- Add monitoring for mismatches

---

## Quick Reference: GROQ Cheat Sheet

| Pattern | Example |
|---------|---------|
| Basic filter | `*[_type == "product"]` |
| Exists check | `*[_type == "product" && defined(image)]` |
| Reference access | `category->title` |
| Array contains | `"value" in arrayField` |
| Array overlap | `count(arrayField[@ in $values]) > 0` |
| Conditional | `defined(salePrice) ? salePrice : price` |
| Coalesce | `coalesce(salePrice, price, 0)` |
| String match | `title match "*search*"` |
| Order | `\| order(price desc)` |
| Slice | `[$start...$end]` |
| Slice first N | `[0...10]` |

---

## Completion Checklist

- [ ] Can design Sanity schemas for complex structures
- [ ] Can write efficient GROQ queries with proper projections
- [ ] Can implement array overlap queries (VFS pattern)
- [ ] Can build dynamic GROQ with type safety
- [ ] Can optimize slow queries
- [ ] Can plan schema migrations

---

*Next: Theme 04 — Virtual File System Architecture*
