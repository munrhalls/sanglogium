# Test File Location Convention

Tests are co-located with the main implementation actor, not in `/docs` folder.

## Convention
```
<owner>/__tests__/<subject>.spec.ts(x)         unit and component specs, flat (default lane)
tests/live/<owner>/<subject>.spec.ts(x)        live-service specs (npm run test:live)
app/api/<route>/__tests__/<route>.spec.ts      specs for a route handler
tests/e2e/<journey>/<flow>.spec.ts             Playwright journey specs
tests/integration/<topic>.spec.tsx             specs that import two or more sibling features
```

Older `unit/` and `integration/` subfolders are flattened when their owner axis moves the specs.

## Examples
- `features/product-filtering/__tests__/priceBounds.spec.ts` (unit, co-located with the feature)
- `features/product-search/__tests__/SearchPagination.spec.tsx` (component spec, co-located)
- `features/product-filtering/__tests__/proofs/` (live-CMS proof scripts, run by a human)

## Rationale
- Co-location with implementation ensures tests stay in sync with code changes
- Reduces cognitive load by keeping tests close to the code they test
- Makes it easier to find and update tests when modifying implementation
- Follows standard practice of keeping tests alongside production code
