# Project Rules

## Task Tracking with Beads

This project uses `bd` (beads) for issue tracking.

**Essential Commands:**
- Run `bd prime` for workflow context and command guidance
- Run `bd ready` to see available tasks with no blockers
- Run `bd show <id>` to view issue details
- Run `bd update <id> --claim` to claim a task before working on it
- Run `bd close <id>` to mark a task as complete
- Run `bd remember "insight"` to save project learnings

**Workflow:**
1. Check `bd ready` to see what tasks are available
2. Claim a task with `bd update <id> --claim`
3. Work on the task
4. Close with `bd close <id>`

**Do not** use markdown TODO lists for task tracking.

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
