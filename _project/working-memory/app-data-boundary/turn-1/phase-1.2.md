AXIS app-data-boundary · TURN 1 (of 1) · AREA: keep Sanity access and pass-through wrappers out of app/ · PHASE 1.2 — Fold the homepage fetch wrapper into the data layer; inline configuration.ts into the layout

PREREQUISITE: phase 1.1 done on branch app-data-boundary. Stay on that branch.
OWNS (touch only these): app/(store)/lib/fetchHomepageData.ts (deleted), app/(store)/page.tsx, app/(store)/layout.tsx, app/(store)/configuration.ts (deleted), sanity-cms/lib/homepage/getHomepageData.ts.
NEVER TOUCH: features/**, app/(store)/basket/page.tsx, anything else. Do NOT create features/homepage/server.ts: features must not import sanity-cms (see eslint NO_SANITY), so the fetch belongs in sanity-cms/lib.

GOAL
Remove a 46-line pass-through wrapper that carries a stale "MIGRATION NOTE (S9-TTFB-OPTIMIZATION)" and an unused backward-compat type re-export, and a 28-line configuration.ts that is really layout metadata plus a font. Behaviour stays identical, including the empty-data fallback.

TASKS
1. Open app/(store)/lib/fetchHomepageData.ts (46 lines) and sanity-cms/lib/homepage/getHomepageData.ts. The wrapper's fetchHomepageData(): Promise<HomepageData> calls fetchHomepageDataBatched() in try/catch; on error it logs console.error('Error fetching homepage data:', error) and returns an empty HomepageData literal (hero null, featured [], spotlight1/2/3 null, iemsGallery [], newestRelease null, dacs [], accessories with seven empty arrays).
2. In getHomepageData.ts add an exported async function fetchHomepageData(): Promise<HomepageData> with the same try/catch, same log line and the empty literal copied verbatim. Use the HomepageData type import the file already has; if it has none add: import type { HomepageData } from "@/features/homepage";. Do not copy the MIGRATION NOTE/TTFB comments and do not copy the "export type { HomepageData }" re-export (nothing imports it from the wrapper).
3. app/(store)/page.tsx: replace import { fetchHomepageData } from "./lib/fetchHomepageData"; with import { fetchHomepageData } from "@/sanity-cms/lib/homepage/getHomepageData"; (the call site const data = await fetchHomepageData(); stays).
4. git rm "app/(store)/lib/fetchHomepageData.ts" (quote the path; the app/(store)/lib folder disappears).
5. Open app/(store)/configuration.ts (28 lines: next/font Montserrat import, Metadata type import, exported metadata object, exported montserrat font). Move its content verbatim into app/(store)/layout.tsx: the Metadata type import and Montserrat import at the top, const montserrat = Montserrat({...}) at module scope, and export const metadata: Metadata = {...}. In layout.tsx delete the two lines import { metadata } from "./configuration"; / import { montserrat } from "./configuration"; and the line export { metadata };.
6. git rm "app/(store)/configuration.ts".

DONE
- [ ] app/(store)/lib/ and app/(store)/configuration.ts no longer exist
- [ ] grep -rn "configuration" "app/(store)" returns nothing; grep -rn "fetchHomepageData" app returns only page.tsx (import + call)
- [ ] getHomepageData.ts exports fetchHomepageData with the identical empty fallback literal and console.error line
- [ ] layout.tsx still has the font at module scope and export const metadata, with unchanged values (compare to the deleted file in git diff)

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits to check your work. Never put $(...) or backticks in a shell command; run one command at a time. Use git rm so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
