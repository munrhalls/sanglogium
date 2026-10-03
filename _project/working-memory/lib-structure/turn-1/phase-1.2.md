AXIS lib-structure · TURN 1 (of 1) · AREA: lib/ roles, one file-name casing rule, dead ambient types · PHASE 1.2 — Sanity image helpers, event logger casing, redundant qrcode typings

PREREQUISITE: phase 1.1 done on branch lib-structure. Stay on that branch.
OWNS (touch only these): lib/sanity/** (new), lib/utils/sanityImageUrl.ts and sanityImageLoader.ts (moved), lib/dev/**, lib/qrcode.d.ts, next.config.ts (one line), and the importer files named below.
NEVER TOUCH: sanity-cms/** (the helpers stay in lib/ because features may not import sanity-cms; lint rule NO_SANITY), any other file.

GOAL
Sanity-specific helpers leave the generic lib/utils/ folder; one casing rule for module files (camelCase, as in the rest of the repo); drop an ambient typing that @types/qrcode already provides.

TASKS
1. mkdir lib/sanity, then git mv lib/utils/sanityImageUrl.ts lib/sanity/imageUrl.ts and git mv lib/utils/sanityImageLoader.ts lib/sanity/imageLoader.ts. If one imports the other relatively (./sanityImageUrl), change it to ./imageUrl.
2. Rewrite importers: "@/lib/utils/sanityImageUrl" becomes "@/lib/sanity/imageUrl" in features/basket/ui/BasketItem.tsx, features/products/ui/RelatedProducts.tsx, features/products/ui/ProductInfo.tsx, features/products/ui/ImageGallery.tsx (re-grep "sanityImage" to catch any other).
3. next.config.ts (around line 53): loaderFile: "./lib/utils/sanityImageLoader.ts" becomes loaderFile: "./lib/sanity/imageLoader.ts". This line decides where every next/image gets its URL: double-check the new path exists.
4. git mv lib/dev/event-logger.ts lib/dev/eventLogger.ts, then rewrite "@/lib/dev/event-logger" to "@/lib/dev/eventLogger" in all ten importers: app/api/checkout/payment-intent-session/route.ts, app/api/checkout/return/route.ts, app/api/trace/route.ts, app/api/webhooks/stripe/route.ts, app/checkout/payment/page.tsx, app/checkout/shipping/page.tsx, app/checkout/success/page.tsx, features/checkout/actions.ts, features/checkout/adapters/allekurierRates.ts, sanity-cms/lib/orders/createOrderFromPaymentIntent.ts. (Re-grep "event-logger" to confirm the exact specifier form in each file, relative or alias, and keep that form.)
5. lib/qrcode.d.ts declares only declare module "qrcode" { toDataURL(text, options?: { width?; margin? }): Promise<string> } and @types/qrcode is already a devDependency. Check features/auth/ui/TwoFactorSection.tsx: if it uses only toDataURL with width and/or margin options, git rm lib/qrcode.d.ts. If it uses anything else, STOP and report line numbers.

DONE
- [ ] lib/utils holds only formatting.ts, price.ts, tailwind.ts; lib/sanity holds imageUrl.ts and imageLoader.ts; lib/dev holds eventLogger.ts; lib/qrcode.d.ts is gone
- [ ] grep -rnE "sanityImage|event-logger|qrcode.d" app features lib sanity-cms next.config.ts returns nothing
- [ ] next.config.ts loaderFile points at an existing file
- [ ] only the files listed above changed (git status)

RULES: Never run build, lint, tsc, tests, dev server, npm install or no-mistakes; never spawn subagents or open a browser; use only git, ls, grep, mkdir, mv, rm and file edits. Never put $(...) or backticks in a shell command; run one command at a time. Use git mv / git rm so history follows. Touch only the files listed under OWNS. If any path, line number or string above does not match the repo, STOP and report the exact mismatch (file:line); do not guess and do not re-plan. Report paths as file:// URIs.
