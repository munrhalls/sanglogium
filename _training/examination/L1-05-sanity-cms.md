# Layer 1 Examination: Sanity CMS 3.x + GROQ

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites:**
- [ ] JSON and document-based data models
- [ ] GraphQL or REST API fundamentals
- [ ] TypeScript generics and type inference

**I attest I understand document databases:** _________________

---

## Section A: First Principles Foundation (20 minutes)

### A1: Headless CMS vs Traditional CMS

**Question 1: From first principles, why does Sanity exist? What problem does a headless CMS solve?**

Your explanation (reference content vs presentation separation):
```
[Write 150+ words - why is WordPress monolithic architecture problematic?]















```

**Gap Detection:** What am I missing about real-time collaboration and Portable Text?
```









```

### A2: GROQ vs GraphQL/SQL

**Question 2: Sanity created GROQ. Why not just use GraphQL or SQL?**

Compare the three for content queries:

| Aspect | GROQ | GraphQL | SQL |
|--------|------|---------|-----|
| Schema flexibility | | | |
| JSON traversal | | | |
| Joins/references | | | |
| Projection (field selection) | | | |
| Best use case | | | |

**GROQ's unique power:** ___________________________________________

---

## Section B: Closed-Book GROQ Implementation (30 minutes)

**Write these queries WITHOUT documentation.**

### B1: Basic Projection & Filtering

Write a GROQ query that:
1. Fetches all `product` documents
2. Where `stock` > 0
3. Returns only `name`, `price`, and `slug`
4. Orders by `price` ascending
5. Limits to 10 results

```groq
// Your query:










```

### B2: Reference Expansion

Products have `catalogueLocationKeys` (array of strings). Write a query that:
1. Fetches a product by slug
2. Expands the `image` asset to get URL and dimensions
3. Returns the first 3 gallery images with hotspot data

```groq
// Your query:



























```

**What is `hotspot` and why does it matter?** ____________________________

### B3: Advanced Filtering with References

Write a query that finds products in a specific catalogue location using the VFS pattern:

```groq
// Given a path like "/headphones/open-back", 
// find products where catalogueLocationKeys contains any key matching "open-back-*"

// Your query using the VFS pattern from your codebase:



















```

### B4: Coalesce & Conditional Logic

Write a query that:
1. Returns `overviewFields` if present
2. Falls back to `specifications` if overviewFields is empty
3. Returns empty array if neither exists

```groq
// Your query using coalesce:











```

---

## Section C: Schema Design (15 minutes)

### C1: Reference Pattern

Your codebase has this TODO in `productType.ts`:

> "Brand as Reference. The Issue: brand is a string. If you type 'Sony' on one product and 'Sony Inc.' on another, your filtering breaks."

**Design the brand reference schema:**

```typescript
// Brand document type:
















n

// Updated product field:













```

**Migration strategy for existing string data:** _________________________

### C2: Validation Rules

Write validation for a `price` field that must:
1. Be required
2. Be >= 0
3. Have at most 2 decimal places

```typescript
defineField({
  name: 'price',
  type: 'number',
  validation: (Rule) => 












});
```

### C3: Preview Configuration

Your `productType.ts` has a `preview` configuration. Explain what each part does:

```typescript
preview: {
  select: {
    title: "name",     // ________________________________
    id: "_id",         // ________________________________
    media: "image",    // ________________________________
    price: "displayPrice", // ____________________________
  },
  prepare(selection) {
    // What does prepare do?
    // ________________________________
  }
}
```

---

## Section D: TypeGen & Type Safety (15 minutes)

### D1: TypeGen Workflow

Your codebase uses Sanity TypeGen. Explain the workflow:

```
Step 1: ________________________________ (command: _______________)
Step 2: ________________________________ (command: _______________)
Step 3: ________________________________ (file generated: _______)
```

### D2: Generated Types Examination

From `sanity.types.ts`, examine a generated query type:

```typescript
// Find a PRODUCTS_QUERY result type and explain:















```

**Critical integration with Next.js:** _________________________________

---

## Section E: Open-Book Verification (10 minutes)

### E1: Sanity 3.x Latest Features

```
Feature: ___________________________________________
Impact on your codebase: ____________________________
```

### E2: Corrections from closed-book

| Query Type | My GROQ | Correct GROQ | Conceptual Gap |
|------------|---------|--------------|----------------|
| B1 basic | | | |
| B2 reference | | | |
| B3 VFS | | | |
| B4 coalesce | | | |

---

## Final Attestation

**I can now:**
- [ ] Write GROQ queries without reference
- [ ] Design schemas with proper references
- [ ] Understand the VFS query pattern in your codebase
- [ ] Use TypeGen for type safety
- [ ] Debug content structure issues

**Commitment:** I will validate GROQ queries in Vision before implementing. ___

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** JSON/document models, API fundamentals, TypeScript

**Dependents:**
- Server Components data fetching (Layer 2)
- VFS integration (Layer 2)
- Real-time previews (Layer 2)

**Conflicts/Alternatives:**
- Contentful (competing headless CMS)
- Strapi (self-hosted alternative)
- Direct database (PostgreSQL with JSONB)

**Authoritative Sources:**
1. https://www.sanity.io/docs/groq
2. https://www.sanity.io/docs/schema-types
3. https://www.sanity.io/docs/sanity-typegen
4. Your `sanity.types.ts` (generated source of truth)

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
