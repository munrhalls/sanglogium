# Layer 2: Forms + Validation (React Hook Form + Zod)

## Prerequisites
- [ ] L1 React 18
- [ ] L1 TypeScript
- [ ] L2 React + TypeScript

## Section A: First Principles (15 min)

**Q1: Why controlled vs uncontrolled components? When is each appropriate?**

| Aspect | Controlled | Uncontrolled |
|--------|------------|--------------|
| State location | | |
| Validation timing | | |
| Performance | | |
| Use case | | |

**Q2: What problem does React Hook Form solve vs useState?**
```
RHF approach: _________________________________
Re-renders: __________________________________
Validation trigger: __________________________
```

## Section B: Implementation (30 min)

### B1: Complete Form with Zod

Create a product creation form:

```tsx
const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  // Add: optional description, required category
});

type ProductFormData = z.infer<typeof productSchema>;

function ProductForm() {
  // Implement with:
  // - useForm hook
  // - zodResolver
  // - handleSubmit
  // - Error display
  // - Loading state
}
```

### B2: Array Fields

Add dynamic specifications (key-value pairs):

```tsx
// Use useFieldArray for:
// - Add/remove spec rows
// - Each row: key input, value input, remove button
// - Validate no duplicate keys
```

### B3: Cross-Field Validation

Validate that `salePrice` < `regularPrice`:

```tsx
// Implement .refine() on schema
// Show error on specific field
```

## Section C: Your Codebase Patterns (20 min)

### C1: Checkout Form Analysis

Examine `app/(store)/checkout/`:

- Schema location: ___________________________
- Resolver pattern: ____________________________
- Error display component: ______________________
- Submission handler: __________________________

### C2: Address Validation

Google Maps validation integration:
- When does validation trigger? ________________
- How is API result handled? ____________________
- Error states: _________________________________

## Section D: Edge Cases (15 min)

| Scenario | Solution |
|----------|----------|
| File upload with validation | |
| Async validation (username check) | |
| Form reset after submit | |
| Preserving form on navigation | |

## Open-Book (10 min)

**Zod features you should know:**
- `.transform()`
- `.pipe()`
- `.brand()`
- Custom error messages

## Attestation
**I can:**
- [ ] Build complex forms with RHF+Zod
- [ ] Handle array fields
- [ ] Implement cross-field validation
- [ ] Navigate codebase form patterns

**Signed:** _________________ **Date:** _________

## Cross-Reference
**Prerequisites:** L1 React, L1 TypeScript
**Dependents:** Checkout flow, admin forms
**Sources:** react-hook-form.com, zod.dev
