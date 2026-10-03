AXIS config-split · TURN 2 (of 2) · AREA: Sanity filter-attributes schema · PHASE 2.1 — Split productFilterAttributes.ts into per-category segments

PREREQUISITE: turn 1 is committed and pushed on branch config-split. Task area is disjoint from turn 1.
OWNS (touch only these): sanity-cms/schemaTypes/productFilterAttributes.ts (becomes the folder sanity-cms/schemaTypes/productFilterAttributes/ with index.ts, shared.ts, headphones.ts, audioElectronics.ts, accessories.ts).
NEVER TOUCH: sanity-cms/schemaTypes/productType.ts (it imports "./productFilterAttributes", which keeps resolving to the folder's index.ts), sanity.types.ts, schema.json, any other file.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; treehouse get --lease, then cd into the printed path.
3. git switch config-split; if origin/main moved, git merge origin/main (no rebase, no force-push).

GOAL
One 871-line file holds every filter attribute of every category. Split it into four contiguous segments in the ORIGINAL order, so the Studio field order and every field definition stay identical.

TASKS
1. Record the baseline: grep -c "categories:" sanity-cms/schemaTypes/productFilterAttributes.ts (expect 74; remember the number you get).
2. Read the file. Structure: export const filterAttributesField = defineField({ ... fields: ([ ...entries... ] as any[]).map(({ categories, domain, domainField, ...field }) => defineField({ ... })) }). Each entry carries a categories: [...] property.
3. Cut the entries array into four contiguous segments, keeping order, never editing an entry:
   - shared: every entry before the first entry whose categories includes "headphones" (price, brand, inStock, the all-products entry, and the entry categories ["headphones","accessories","audio-electronics"]);
   - headphones: from that first headphones entry up to (excluding) the first entry whose categories is exactly ["audio-electronics"] (multi-category entries inside this range stay here);
   - audioElectronics: from that first ["audio-electronics"] entry up to (excluding) the first entry whose categories is exactly ["accessories"] (multi-category entries inside this range stay here);
   - accessories: from that first ["accessories"] entry to the end of the array.
4. Create in the new folder sanity-cms/schemaTypes/productFilterAttributes/: shared.ts exporting const sharedFields: any[] = [...]; headphones.ts exporting headphonesFields; audioElectronics.ts exporting audioElectronicsFields; accessories.ts exporting accessoriesFields. Add import { defineField, defineArrayMember } from "sanity" to a segment file only for the names that segment really uses (grep).
5. git mv sanity-cms/schemaTypes/productFilterAttributes.ts sanity-cms/schemaTypes/productFilterAttributes/index.ts, then in index.ts replace the array literal with ([...sharedFields, ...headphonesFields, ...audioElectronicsFields, ...accessoriesFields] as any[]) followed by the unchanged .map(...) call, and import the four arrays. Keep filterAttributesField, its name/title/type/description and the whole .map callback (hidden logic included) untouched.
6. Sum grep -c "categories:" over the four segment files: it must equal the baseline from task 1.

DONE
- [ ] the folder holds index.ts, shared.ts, headphones.ts, audioElectronics.ts, accessories.ts; the old single file is gone
- [ ] total "categories:" count across the four segment files equals the baseline (74)
- [ ] index.ts keeps filterAttributesField and the unchanged .map callback; productType.ts is untouched
- [ ] every segment file imports only what it uses

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
