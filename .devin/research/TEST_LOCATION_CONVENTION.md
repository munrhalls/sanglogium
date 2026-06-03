# Test File Location Convention

Tests are co-located with feature docs in `/docs` folder.

## Convention
```
docs/<feature-name>/__tests__/<unit|integration|e2e>/
or
docs/<feature-name>/<sub-feature-name>/__tests__/<unit|integration|e2e>/
```

## Examples
- `docs/basket/non-local-basket/__tests__/unit/basketStore.spec.ts`
- `docs/basket/non-local-basket/__tests__/integration/basketButton.spec.tsx`
