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

## System-Level Awareness Tracking (MANDATORY)

When working with beads issues, you MUST automatically check/update system awareness at these lifecycle points. No manual triggering required - this is automatic agent behavior.

### Theme Identification
- Format: `theme:<feature-name>` (e.g., `theme:basket`, `theme:checkout`, `theme:shipping`)
- Derive from issue title/description automatically
- Single primary theme per issue

### On Issue Creation (AFTER `bd create`)
1. Identify theme from issue title/description
2. Query existing awareness: `bd label list-all | grep theme:<theme>`
3. Query awareness state: `bd query "labels:awareness:<theme>=known"`
4. If no awareness exists, note in issue: `bd update <id> --notes="System awareness: theme:<theme> not yet tracked"`

### On Issue Claim (AFTER `bd update --claim`)
1. Identify theme from issue
2. Query current awareness: `bd state <id> awareness`
3. If awareness is unknown, set in-progress: `bd set-state <id> awareness:<theme>=in_progress`

### On Issue Close (BEFORE `bd close`)
1. Evaluate: Did this issue change system-level awareness about the theme?
2. Update awareness ONLY if structural change occurred:
   - New feature added to theme
   - Architecture pattern changed for theme
   - New integration added for theme
   - Data model changed for theme
   - Token/permission changed for theme
3. DO NOT update awareness for:
   - Bug fixes
   - Documentation updates
   - Refactors (no structural change)
   - Tests
   - Minor tweaks
4. If awareness changed: `bd set-state <id> awareness:<theme>=known --reason="implemented X"`
5. If awareness unchanged: Skip update (0 noise)

### Query Patterns
- Global themes: `bd label list-all | grep theme:`
- Per-issue awareness: `bd state <issue-id> awareness`
- All issues with theme: `bd query "labels:theme:basket"`
