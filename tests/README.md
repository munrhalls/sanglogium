# tests/

The unit, integration and e2e suites were retired 2026-10-02 (owner decision: untrustworthy). What remains are proof scripts the owner runs live — they are not a suite to extend.

- `product-filtering/` — live-CMS proof scripts (`*.test.ts`); output goes to git-ignored `out/`.
- `catalogue/`, `products/` — integrity and proof `.mjs` scripts.
- Behaviour laws: `tests/<feature>/*.laws.ts` (`node:test`, no dependency) — the human runs one file at a time:
  `node --experimental-strip-types --import ./tools/alias-loader.mjs --test <file>`

New test files, test configs or test dependencies need owner approval first — `node tools/check-turn.mjs` warns on them.
