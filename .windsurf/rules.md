# Project Rules

## Test Storage Location

Tests must be stored in:
- `/docs/<feature name>/__tests__/<...folders>`
- Sometimes: `/docs/<feature name>/<sub-feature-name>/__tests__/ <...folders>`

**Do not** store tests in `/tests/` directory. Tests belong within the feature documentation structure.

## Barrel Files (index.ts) - Anti-Pattern for Next.js 15

**Do not** use barrel files (index.ts) for component exports in Next.js 15.

**Rationale:**
- Barrel exports interfere with Next.js 15's automatic tree-shaking and code splitting
- They prevent the bundler from eliminating unused exports at the module level
- Direct imports (e.g., `import { X } from './feature/X'`) are preferred for optimal bundle size
- This is a known limitation in Next.js 15's module resolution system

**Correct Pattern:**
```typescript
// ❌ Anti-pattern
import { BasketManager } from '@/components/features/basket'

// ✅ Correct pattern
import BasketManager from '@/components/features/basket/BasketManager'
```
