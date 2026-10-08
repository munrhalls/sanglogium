# Organizational pattern: single source of truth

Normative model of how this repository is organized: vertical slices. It says what the repo **should be**. Where the code disagrees with this document, the code is defective. A rule changes only by editing this file. `node tools/check-turn.mjs` enforces it (rules named in section 6).

## 1. Axioms

| # | Axiom |
|---|-------|
| A1 | **One home.** Every tracked path has exactly one home, decided by its path (section 3). |
| A2 | **Two worlds.** The runtime is the code Next bundles. Everything else is a plane: studio, tooling, laws, config, docs, automation, static. Runtime never imports a plane; the one exception is `app/(studio)/`, which mounts the studio plane. Studio and tooling import from the runtime only `platform/sanity/env.ts` and the import-free facet vocabulary `features/product-filtering/core/definitions/facetMap.ts`. |
| A3 | **Slices.** Each capability lives in one slice, `features/<slice>/`, built only from the parts in section 2. |
| A4 | **Doors.** Code outside a slice imports it only through `index.ts` (client door) or `server.ts` (server door). |
| A5 | **No cycles.** The slice-to-slice import graph, type imports included, has no cycle. A slice's level is 1 + the highest level it imports; levels are derived, never stored. |
| A6 | **Inward.** Inside a slice, imports follow the archetype table (section 2), type imports included. `core/` imports only its own `core/`, another slice's `index.ts` and `platform/utils/`; never a vendor package (section 3), `sanity.types.ts` or `data/`. |
| A7 | **Environment.** Client-safe code (`ui/`, `state/`, `url/`, `core/`, `index.ts`, `platform/design/ui/`, any `'use client'` file) never value-imports a file containing `import "server-only"`. Every `server.ts` contains it. |
| A8 | **Platform knows no slice.** `platform/` imports only `platform/`. |
| A9 | **Routes compose.** `app/` holds Next route files only. A route imports slice doors, `platform/`, `next`, `next/*` and `react`, and only composes them. |
| A10 | **Vendors behind adapters.** A vendor package (section 3) is imported only by `adapters/<system>/`, `platform/`, framework entry files and the studio plane (`app/(studio)/` included). `ui/` and `state/` may import a browser kit (section 3). |
| A11 | **Views take props.** A `view/` component gets its data as props; from another slice's `server.ts` it imports only `*View` components. |
| A12 | **One owner per document.** Every CMS document type has one owning slice; it holds the type's `schema/` and every write path (section 4). |

## 2. The slice archetype

| Part | Holds | May import inside its slice |
|------|-------|-----------------------------|
| `index.ts` | client door: components, hooks, URL translators, client-safe types and values (other slices' `core/` may import these), Server Actions | ui, state, url, core, commands |
| `server.ts` | server door: wires adapters into ports and use cases, re-exports views and wired functions; contains `import "server-only"` | every part except schema; never a `'use server'` file |
| `ui/` | client and presentational components; names never end in `View`, `Client`, `Server` or `Page` | ui, state, url, core, commands |
| `state/` | client stores, hooks, and the browser's calls to outside systems | state, url, core, commands, adapters |
| `url/` | URL to typed state translators, both directions | url, core |
| `view/` | server-rendered components named `*View`; data arrives as props | view, ui, url, core |
| `queries/` | read use cases with logic; take their ports as the first parameter | queries, core |
| `commands/` | write use cases (take their ports) and every Server Action: `'use server'`, one per file, named `<name>Action.ts` (an action is an RPC entry point, reads included) | commands, url, core, server.ts |
| `core/definitions/` | data: registries, constants, labels | core |
| `core/rules/` | pure logic and types | core |
| `core/ports.ts` | the function types queries, commands and server.ts need from adapters, in the slice's own types | core |
| `adapters/<system>/` | the only code that talks to an outside system (`sanity`, `stripe`, `better-auth`, `resend`, `google`, ...); implements ports and maps vendor shapes into the slice's types | the same system, core |
| `schema/` | CMS document types (studio plane) | schema |

Across slices: any runtime file may import another slice's `index.ts`; only server-side files (`server.ts`, `queries/`, `commands/`, `adapters/`, routes) may import another slice's `server.ts`, and `view/` may import from it only `*View` components. Any runtime file may import `platform/`, within the limits of A6 and A10.

A part may group its files in one level of sub-folders named after a screen region or a flow (`ui/card/`, `view/listing/`).

### Slice recipe (building or converting a slice)

1. Pure types and logic go to `core/rules/`; constants and registries to `core/definitions/`.
2. URL parsers and serializers go to `url/`; client stores and hooks to `state/`.
3. Server components go to `view/` (named `*View`); client and presentational components to `ui/`.
4. Every call to an outside system goes to `adapters/<system>/`, usually one function per file, and returns the slice's own types. A file that uses a secret or a server-only API contains `import "server-only"`. GROQ and Sanity patches exist only in `adapters/sanity/`.
5. `core/ports.ts` declares a function type for each adapter function the slice uses, grouped into named port objects.
6. A use case with logic goes to `queries/<name>.ts` or `commands/<name>.ts` and takes its ports as the first parameter. Without logic, `server.ts` exports the wired adapter function directly.
7. A Server Action is `commands/<name>Action.ts` starting with `'use server'`: auth guard (through the auth slice's server door), input validation, one call to a wired function from a server door, revalidation.
8. `server.ts` contains `import "server-only"`, builds the port objects from adapters, binds use cases, and re-exports views and wired functions under stable names.
9. `index.ts` re-exports what other slices' and routes' client code may use.
10. A route reads its params, calls server-door functions and renders a server-door view. No GROQ, no adapter, no logic.

## 3. Homes

| Kind | Home |
|------|------|
| Page, layout, loading, error, not-found, route handler, sitemap, robots, global styles | `app/` (Next special file names and `app/globals.css` only) |
| Static page copy (legal and information pages) | the route's `page.tsx`, laid out with the shell's content layout |
| Framework entry file | repo root: `middleware.ts`, `instrumentation*.ts`, `sentry.*.config.ts` |
| Slice part | `features/<slice>/...` (section 2) |
| Design primitive | `platform/design/ui/` (a component moves here when a second slice needs it) |
| Design tokens and Tailwind plugin (config plane) | `platform/design/styles/` |
| Store clients (`client` for public CDN reads, `backendClient` for token reads and writes), Sanity env, image URL helpers | `platform/sanity/` |
| Email sending primitive | `platform/email/` |
| Analytics components and helpers (Google Analytics, web vitals, Speed Insights) | `platform/analytics/` |
| Client of an outside system | the using slice's `adapters/<system>/`; `platform/` once two or more slices use it |
| Utility with no product knowledge | the slice that uses it; `platform/utils/` once two or more slices use it |
| CMS document type | `features/<owning slice>/schema/` |
| Studio collector and desk structure | `studio/`, with `sanity.config.ts` at the root |
| Generated data read by the runtime | `data/`, read only by the owning slice's adapter |
| Generated types and schema | repo root (`sanity.types.ts`, `schema.json`) |
| Build or one-off script | `scripts/` |
| Local tooling, checks, live proofs, operator scripts | `tools/` |
| Behaviour laws (laws plane: may import the runtime, nothing imports them) | `<module>.laws.ts` next to the module they check |
| Static asset | `public/` |
| Living reference doc | `docs/<topic>.md` |
| Architecture decision record | `docs/ADR-NNN-<topic>.md` |
| Process and entry docs | `_project/`, root `README.md`, `CLAUDE.md`, `AGENTS.md` |
| Agent and automation configuration | `.github/`, `.claude/`, `.codex/`, `.devin/`, `vercel.json`, `.no-mistakes.yaml`, `skills-lock.json` (one folder per agent tool; each tool reads its own, so overlap between them is intended) |
| Ephemeral: logs, caches, env files, phase files | nowhere in git |

**Root allowlist.** Files: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `sanity.config.ts`, `sanity.cli.ts`, `sentry.*.config.ts`, `instrumentation*.ts`, `middleware.ts`, `vercel.json`, `.node-version`, `.gitignore`, `.codeiumignore`, `.no-mistakes.yaml`, `.env.example`; tool-generated `schema.json`, `sanity.types.ts`, `skills-lock.json`; entry docs `README.md`, `CLAUDE.md`, `AGENTS.md`. Folders: `app/ features/ platform/ studio/ scripts/ tools/ docs/ data/ public/ _project/ .github/ .claude/ .codex/ .devin/`. Nothing else at the root.

**Vendor packages** (A10): `stripe`, `@stripe/*`, `better-auth` and its subpaths, `@better-auth/*`, `kysely`, `kysely-libsql`, `next-sanity` and its subpaths, `@sanity/*`, `sanity`, `groq`, `resend`, `iron-session`, `@vercel/*`, `@sentry/*`, `web-vitals`. **Browser kits**, allowed in `ui/` and `state/`: `@stripe/stripe-js`, `@stripe/react-stripe-js`. A new vendor is added here and in the gate in the same change.

## 4. Data rule

- Every CMS document type has one owning slice: its `schema/` and every write path live there. Another slice writes through the owner's `server.ts`. Owners: `userProfile` is owned by profile; `order` by order; `product` and `brand` by products; `catalogueItem` by catalogue; `hero` and `homepageData` by homepage.
- Reads are free: a slice reads the documents it needs through its own `adapters/sanity/`.
- A write that must touch several documents atomically stays in one adapter of the slice that owns the operation (order placement in order, see `docs/ADR-002-checkout-inventory-concurrency.md`).
- `sanity.types.ts` is imported only by `adapters/sanity/` and `platform/`; contracts in `core/` and `view/` use the slice's own types.

## 5. Conventions (review-enforced unless section 6 names a rule)

- Specifiers: `./x` for the same directory and `@/...` otherwise; no `..` under `features/`, except in studio-plane files, which use relative paths only because the Sanity CLI does not resolve `@/`.
- Naming: components PascalCase; module files camelCase; docs, scripts and static assets kebab-case (exempt: `README.md`, `CLAUDE.md`, `AGENTS.md`, `ADR-NNN-*.md` and the three `_project/` process documents); `view/` components end in `View`; `ui/` component names never end in `View`, `Client`, `Server` or `Page`; Server Actions are `commands/<name>Action.ts`; slice names are domain nouns.
- One Server Action per file.
- Promotion: a component moves to `platform/design/ui/` when a second slice needs it.
- Composition roots: a route, a slice's `server.ts`, a page-level view and a batched query are the designated places that change when a part is added; every other change is an addition.
- Client doors: `index.ts` may carry the pure values and types other slices' `core/` needs (a shared kernel). A separate pure door is added only when laws must import such a module.
- Behaviour laws: a port gets laws when it gets a second adapter or when its behaviour is not obvious; URL translators get round-trip laws. Laws use `node:test` and need no dependency. Agents never run them; the human does.
- Hygiene: secrets, env files, logs, caches and working notes are never committed.

## 6. Enforcement

| Axiom or rule | Rule in `tools/check-org-pattern.mjs` |
|---------------|----------------------------------------|
| A1, A3 | PLACE |
| A2 | PLANE |
| A4 | DOOR |
| A5 | CYCLE (whole tree, every run) |
| A6 | INWARD, CORE |
| A7 | ENV, SERVERDOOR |
| A8 | PLATFORM |
| A9 | ROUTE (imports; "no logic" is review-enforced) |
| A10 | VENDOR |
| A11 | VIEWDATA |
| A12, section 4 | GENERATED (`sanity.types.ts` imports); the single write owner is review-enforced |
| Section 5 naming | ACTION, NAMES |
| all | `tools/check-imports.mjs`: SPEC (every import resolves), DELETED (no importer of a removed file), EXPORT (every imported name is exported by its target) |

Behaviour (L): `npm run laws` runs every `*.laws.ts` file; the human runs it, agents never do.

`import type` is erased at build time, so it is exempt from ENV only.

## Appendix: the whole repository

```
app/                      routes only: read params, call slice doors, compose
features/<slice>/         index.ts  server.ts  ui/  state/  url/  view/  queries/  commands/
                          core/{definitions,rules,ports.ts}  adapters/<system>/  schema/
platform/                 design/{ui,styles}  sanity/  email/  analytics/  utils/   (knows no slice)
studio/                   schema collector and desk structure (sanity.config.ts at root)
data/                     generated data read by the runtime
scripts/  tools/          build scripts; local checks, live proofs, operator scripts
docs/  _project/  public/

slice -> slice only through index.ts / server.ts, never in a cycle
inside a slice every import points inward, toward core/
only adapters/ (and the shared clients in platform/) talk to Sanity, Stripe, better-auth, Resend, Google
every CMS document has one owning slice
```
