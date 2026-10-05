# Organizational pattern: single source of truth

Normative model of how this repository is organized: vertical slices. It says what the repo **should be**. Where the code disagrees with this document, the code is defective. A rule changes only by editing this file. `node tools/check-turn.mjs` enforces it (rules named in section 7).

## 1. Axioms

| # | Axiom |
|---|-------|
| A1 | **One home.** Every tracked path has exactly one home, decided by its path (section 3). |
| A2 | **Two worlds.** The runtime is the code Next bundles. Everything else is a plane: studio, tooling, laws, config, docs, automation, static. Runtime never imports a plane. Studio and tooling import from the runtime only `platform/db/env.ts`. |
| A3 | **Slices.** Each capability lives in one slice, `features/<slice>/`, built only from the parts in section 2. |
| A4 | **Doors.** Code outside a slice imports it only through `index.ts` (client door) or `server.ts` (server door). |
| A5 | **No cycles.** The slice-to-slice import graph, type imports included, has no cycle. A slice's level is 1 + the highest level it imports; levels are derived, never stored. |
| A6 | **Inward.** Inside a slice, imports follow the archetype table (section 2), type imports included; `core/` imports only `core/`. |
| A7 | **Environment.** Client-safe code (`ui/`, `state/`, `url/`, `core/`, `index.ts`, `platform/design/ui/`, any `'use client'` file) never value-imports a file containing `import "server-only"`. Every `server.ts` contains it. |
| A8 | **Platform knows no slice.** `platform/` imports only `platform/`. |
| A9 | **Routes compose.** `app/` holds Next route files only. A route imports slice doors and `platform/` and only composes them. |

## 2. The slice archetype

| Part | Holds | May import inside its slice |
|------|-------|-----------------------------|
| `index.ts` | client door: components, hooks, URL translators, client-safe types and values, Server Actions | ui, state, url, core, commands |
| `server.ts` | server door: wires adapters into ports and use cases, re-exports views and wired functions; contains `import "server-only"` | every part except schema; never a `'use server'` file |
| `ui/` | client and presentational components | ui, state, url, core, commands |
| `state/` | client stores, hooks, and the browser's calls to outside systems | state, url, core, commands, adapters |
| `url/` | URL to typed state translators, both directions | url, core |
| `view/` | server-rendered components; data arrives as props | view, ui, url, core |
| `queries/` | read use cases with logic; take their ports as the first parameter | queries, core |
| `commands/` | write use cases (take their ports) and Server Actions (`'use server'`, one per file) | commands, url, core, server.ts |
| `core/definitions/` | data: registries, constants, labels | core |
| `core/rules/` | pure logic and types | core |
| `core/ports.ts` | the function types queries, commands and server.ts need from adapters | core |
| `adapters/<system>/` | the only code that talks to an outside system (`sanity`, `stripe`, `better-auth`, `resend`, `google`, ...); implements ports | the same system, core |
| `schema/` | CMS document types (studio plane) | schema |

Across slices: any runtime file may import another slice's `index.ts`; only server-side files (`server.ts`, `view/`, `queries/`, `commands/`, `adapters/`, routes) may import a `server.ts`. Any runtime file may import `platform/`.

### Slice recipe (building or converting a slice)

1. Pure types and logic go to `core/rules/`; constants and registries to `core/definitions/`.
2. URL parsers and serializers go to `url/`; client stores and hooks to `state/`.
3. Server components go to `view/`; client and presentational components to `ui/`.
4. Every call to an outside system goes to `adapters/<system>/`, usually one function per file. A file that uses a secret or a server-only API contains `import "server-only"`. GROQ and Sanity patches exist only in `adapters/sanity/`.
5. `core/ports.ts` declares a function type for each adapter function the slice uses, grouped into named port objects.
6. A use case with logic goes to `queries/<name>.ts` or `commands/<name>.ts` and takes its ports as the first parameter. Without logic, `server.ts` exports the wired adapter function directly.
7. A Server Action is `commands/<name>.ts` starting with `'use server'`: auth guard (through the auth slice's server door), input validation, one call to a wired function from `server.ts`, revalidation.
8. `server.ts` contains `import "server-only"`, builds the port objects from adapters, binds use cases, and re-exports views and wired functions under stable names.
9. `index.ts` re-exports what other slices' and routes' client code may use.
10. A route reads its params, calls server-door functions and renders a server-door view. No GROQ, no adapter, no logic.

## 3. Homes

| Kind | Home |
|------|------|
| Page, layout, loading, error, not-found, route handler, sitemap, robots, global styles | `app/` (Next special file names and `app/globals.css` only) |
| Framework entry file | repo root: `middleware.ts`, `instrumentation*.ts`, `sentry.*.config.ts` |
| Slice part | `features/<slice>/...` (section 2) |
| Design primitive | `platform/design/ui/` |
| Design tokens and Tailwind plugin (config plane) | `platform/design/styles/` |
| Store clients (`client` for public CDN reads, `backendClient` for token reads and writes), Sanity env, image URL helpers | `platform/db/` |
| Email sending primitive | `platform/email/` |
| Analytics components and helpers | `platform/analytics/` |
| Utility with no product knowledge | `platform/utils/` |
| CMS document type | `features/<slice>/schema/` |
| Studio collector and desk structure | `studio/`, with `sanity.config.ts` at the root |
| Generated data read by the runtime | `data/` |
| Generated types and schema | repo root (`sanity.types.ts`, `schema.json`) |
| Build or one-off script | `scripts/` |
| Local tooling, checks, live proofs | `tools/` |
| Behaviour laws (laws plane: may import the runtime, nothing imports them) | `<module>.laws.ts` next to the module they check |
| Static asset | `public/` |
| Docs, process, entry docs | `docs/`, `_project/`, root `README.md`, `CLAUDE.md`, `AGENTS.md` |
| Agent and automation configuration | `.github/`, `.claude/`, `.codex/`, `.devin/`, `vercel.json`, `.no-mistakes.yaml`, `skills-lock.json` |
| Root tool config | the root allowlist in `CLAUDE.md` (Repository Layout Standard) |
| Ephemeral: logs, caches, env files, phase files | nowhere in git |

## 4. Data rule

- A slice reads and writes the documents it needs through its own `adapters/sanity/`, typed by `sanity.types.ts`. Each write path lives in exactly one slice.
- A write that must touch several documents atomically stays in one adapter of the slice that owns the operation (order placement in checkout, see `docs/checkout/ADR-002-checkout-inventory-concurrency.md`).

## 5. Conventions (review-enforced)

- Specifiers: `./x` for the same directory and `@/...` otherwise; no `..` under `features/`. Studio-plane files use relative paths only, because the Sanity CLI does not resolve `@/`.
- Naming: components PascalCase, module files camelCase, docs and scripts kebab-case, slice names are domain nouns.
- One Server Action per file.
- Promotion: a component moves to `platform/design/ui/` when a second slice needs it.
- Behaviour laws: a port gets laws when it gets a second adapter or when its behaviour is not obvious; URL translators get round-trip laws. Laws use `node:test` and need no dependency. Agents never run them; the human does.
- Hygiene: secrets, env files, logs, caches and working notes are never committed.

## 6. Transition (temporary, removed by the close-out axis)

While slices migrate, these legacy homes are accepted and not checked: `sanity-cms/lib/`, `sanity-cms/env.ts`, `sanity-cms/schemaTypes/`, `sanity-cms/structure.ts`, `lib/`, `shared/`, `features/<slice>/model/`, `domain/`, `config/` and `proofs/`, `features/<slice>/actions.ts`, files placed directly in `features/<slice>/adapters/`, and files in `app/` that are not Next special files. Imports into legacy files are not checked either. Legacy homes are only emptied, never added to.

## 7. Enforcement

| Axiom | Rule in `tools/check-org-pattern.mjs` |
|-------|----------------------------------------|
| A1, A3 | PLACE |
| A2 | PLANE |
| A4 | DOOR |
| A5 | CYCLE (whole tree, every run) |
| A6 | INWARD |
| A7 | ENV, SERVERDOOR |
| A8 | PLATFORM |
| A9 | ROUTE (imports only; "no logic" is review-enforced) |
| all | `tools/check-imports.mjs`: SPEC (every import resolves), DELETED (no importer of a removed file) |

`import type` is erased at build time, so it is exempt from ENV only.

## Appendix: the whole repository

```
app/                      routes only: read params, call slice doors, compose
features/<slice>/         index.ts  server.ts  ui/  state/  url/  view/  queries/  commands/
                          core/{definitions,rules,ports.ts}  adapters/<system>/  schema/
platform/                 design/{ui,styles}  db/  email/  analytics/  utils/   (knows no slice)
studio/                   schema collector and desk structure (sanity.config.ts at root)
data/                     generated data read by the runtime
scripts/  tools/          build scripts; local checks, live proofs
docs/  _project/  public/

slice -> slice only through index.ts / server.ts, never in a cycle
inside a slice every import points inward, toward core/
only adapters/ talk to Sanity, Stripe, better-auth, Resend, Google
```
