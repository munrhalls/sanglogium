AXIS config-split · TURN 1 (of 2) · AREA: Tailwind config and tsconfig · PHASE 1.1 — Extract design tokens and component plugin out of tailwind.config.ts

WAVE 2 — PREREQUISITE: axis shared-ui is merged into main (it edits tailwind.config.ts content globs and creates shared/). Verify: shared/ui/carousel/CarouselRoot.tsx exists on origin/main and tailwind.config.ts content contains "./shared/**/*.{js,ts,jsx,tsx,mdx}". If not, STOP and report. Runs in parallel with: lib-structure, naming (file-disjoint).
OWNS (touch only these): tailwind.config.ts, shared/styles/tokens.ts (new), shared/styles/componentsPlugin.ts (new). Phase 1.2 owns tsconfig.json. Turn 2 owns sanity-cms/schemaTypes/productFilterAttributes*.
NEVER TOUCH: shared/ui/**, eslint.config.mjs, any other file.

GOAL
tailwind.config.ts is 701 lines: design tokens, two plugins (one of 457 lines of component classes) and the config object. Split so the config file only configures. Output CSS must stay identical.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c config-split from up-to-date main.

TASKS
1. Read tailwind.config.ts. Current layout: imports (lines 1-4); token objects brand, secondary, accent, success, error, warning, surface, textTokens, border (lines 6-86); typographyDefaultsPlugin (88-97); uiComponentsPlugin (99-555); export default {...} (557-end).
2. Create shared/styles/tokens.ts: move the nine token constants verbatim (values, key order, "as const" on surface unchanged) and add export to each.
3. Create shared/styles/componentsPlugin.ts: add import plugin from "tailwindcss/plugin"; move typographyDefaultsPlugin and uiComponentsPlugin verbatim and export both. They read colors through theme("...") strings; if any line references a token constant directly, add an import of that constant from "./tokens".
4. tailwind.config.ts: delete the moved blocks and add relative imports (relative on purpose: Tailwind loads this file outside the @/ alias):
   import { brand, secondary, accent, success, error, warning, surface, textTokens, border } from "./shared/styles/tokens";   (import only the names the remaining config really uses; grep each)
   import { typographyDefaultsPlugin, uiComponentsPlugin } from "./shared/styles/componentsPlugin";
   Remove the now-unused import plugin from "tailwindcss/plugin" if nothing left uses it. Keep the content array, theme, plugins array and everything else exactly as is.
5. Compare with git diff: the only changes in tailwind.config.ts are removed blocks and import lines.

DONE
- [ ] tailwind.config.ts is under 200 lines and contains no plugin( call
- [ ] shared/styles/tokens.ts exports the nine constants; shared/styles/componentsPlugin.ts exports both plugins
- [ ] the export default object and the content array are unchanged (git diff shows only removed blocks and import lines)

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
