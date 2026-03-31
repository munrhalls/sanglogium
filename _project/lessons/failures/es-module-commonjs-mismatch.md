# failures: ES Module CommonJS Mismatch

**Date:** 2026-03-31  
**Source:** Debug - Products Page  
**Severity:** High  
**Frequency:** Systemic (will recur without vigilance)  
**Status:** Active

---

## The Problem

Build failed with `ReferenceError: require is not defined in ES module scope` when running `npm run dev`. Error referenced compiled output path (`.next/server/pages/_document.js`) not source file, making root cause difficult to locate.

## Root Cause

`package.json` specifies `"type": "module"` (ES modules), but `getProductsByVfsKeys.ts` used CommonJS syntax:

```typescript
// Broken:
const { cache } = require('react');  // CommonJS in ES module
```

**Error message indirection:** The runtime error pointed to compiled output, requiring grep search to locate actual `require()` usage in source.

## The Fix

```typescript
// Before (broken - CommonJS):
const { cache } = require('react');

// After (working - ES module):
import { cache } from 'react';
```

## Prevention

**Rule for this codebase:** This project uses ES modules exclusively. CommonJS (`require`/`module.exports`) will fail.

**IDE/Editor safeguards:**
- Check for red squiggles on `require` statements
- TypeScript will flag this if properly configured

**Code review checklist:**
- [ ] No `require()` statements in new/modified files
- [ ] No `module.exports` usage
- [ ] All imports use ES module syntax: `import { x } from 'module'`

**Verification command:**
```bash
# Check a file for CommonJS syntax
grep -n "require(" src/path/to/file.ts
grep -n "module.exports" src/path/to/file.ts
```

## Applicability

**When to apply this lesson:**
- Writing new TypeScript/JavaScript files
- Copying code from StackOverflow or older examples
- Working with Node.js APIs that default to CommonJS examples
- `package.json` has `"type": "module"`

**Keywords for retrieval:**
- "module"
- "esm"
- "commonjs"
- "require"
- "import"
- "build"
- "error"

**Related lessons:**
- [pre-existing-infrastructure-errors.md](pre-existing-infrastructure-errors.md) — Distinguishing sprint regressions

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `.windsurfrules` — Consider adding "ES modules only" constraint

**Date integrated:** 2026-03-31
