AXIS app-data-boundary · TURN 1 (of 1) · AREA: keep Sanity access and pass-through wrappers out of app/ · PHASE 1.1 — Move the sitemap GROQ into sanity-cms/lib

WAVE 1 — no prerequisites. Runs in parallel with: shared-ui, tests-prune, docs-process-prune, tooling-untrack, data-md-removal (all file-disjoint from this axis).
OWNS (touch only these): app/sitemap.ts, sanity-cms/lib/products/getSitemapSlugs.ts (new), sanity-cms/lib/products/index.ts (only if task 3 applies). Phase 1.2 additionally owns app/(store)/page.tsx, app/(store)/layout.tsx, app/(store)/lib/fetchHomepageData.ts, app/(store)/configuration.ts, sanity-cms/lib/homepage/getHomepageData.ts.
NEVER TOUCH: features/**, any other file.

GOAL
The repo rule "GROQ and Sanity clients live only in sanity-cms/lib, never in app/" holds for the sitemap. Today app/sitemap.ts imports the Sanity client and runs two GROQ queries itself.

SETUP (do first)
1. Read CLAUDE.md and AGENTS.md.
2. git fetch origin; make sure you start from the latest origin/main (fast-forward or pull if behind).
3. treehouse get --lease, then cd into the printed path.
4. git switch -c app-data-boundary from up-to-date main.

TASKS
1. Open app/sitemap.ts. It imports client from "@/sanity-cms/lib/client", defines a local SanityDocument interface and runs two client.fetch(...) GROQ queries (products, categories) inside Promise.all.
2. Create sanity-cms/lib/products/getSitemapSlugs.ts. Copy the client import style from a sibling such as sanity-cms/lib/products/getProductBySlug.ts. Content: export interface SitemapSlug { slug: string; _updatedAt?: string }; export async function getSitemapSlugs(): Promise<{ products: SitemapSlug[]; categories: SitemapSlug[] }> that runs the two queries (the exact GROQ strings from sitemap.ts, unchanged) in Promise.all and returns { products, categories }.
3. Open sanity-cms/lib/products/index.ts. If it re-exports sibling getX fetchers, add getSitemapSlugs in the same style; otherwise leave the file untouched.
4. In app/sitemap.ts delete the client import and the local SanityDocument interface, import getSitemapSlugs from "@/sanity-cms/lib/products/getSitemapSlugs", and inside the existing try block replace the Promise.all/client.fetch call with: const { products, categories } = await getSitemapSlugs();
   Everything else (SITE_URL, URL building, the (products || []).map code, staticRoutes, catch/fallback, exports) stays byte-for-byte.

DONE
- [ ] grep -rn "sanity-cms/lib/client" app returns nothing
- [ ] grep -rn "client.fetch" app returns nothing
- [ ] getSitemapSlugs.ts holds the two original GROQ strings unchanged
- [ ] app/sitemap.ts diff touches only the import block, the removed interface and the one call site

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep and file edits to check your work. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv / git rm so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
