# Test File Location Convention

Tests are co-located with the main implementation actor, not in `/docs` folder.

## Convention
```
<implementation-folder>/__tests__/<unit|integration|e2e>/
```

## Examples
- `store/__tests__/unit/basketStore.spec.ts` (co-located with basketStore.ts)
- `components/checkout/__tests__/integration/AddressForm.spec.tsx` (co-located with AddressForm.tsx)
- `app/(store)/__tests__/e2e/checkout-flow.spec.ts` (co-located with store route)

## Rationale
- Co-location with implementation ensures tests stay in sync with code changes
- Reduces cognitive load by keeping tests close to the code they test
- Makes it easier to find and update tests when modifying implementation
- Follows standard practice of keeping tests alongside production code
