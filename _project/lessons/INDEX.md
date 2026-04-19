# Lessons Index

**Purpose:** Searchable keyword → lesson mapping for pre-work retrieval.

**Last Updated:** 2026-04-18

## Keyword: contain
| Lesson | Severity | Summary |
|--------|----------|---------|
| [.windsurf/workflows/contain.md](.windsurf/workflows/contain.md) | High | Strict scope containment protocol — zero lateral movement, zero unrelated changes |

---

## Keyword: bus-stop-debugging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Trace end-to-end → verify each bus stop → isolate broken stop → fix |
| [.windsurf/workflows/trace.md](../../.windsurf/workflows/trace.md) | Critical | /trace command - systematic bus stop debugging with expected results |

---

## Keyword: trace

| Lesson | Severity | Summary |
|--------|----------|---------|
| [.windsurf/workflows/trace.md](../../.windsurf/workflows/trace.md) | Critical | /trace command - execute flow trace with expectations at each bus stop |

---

## Keyword: end-to-end-trace

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Map complete data flow before any implementation |
| [anti-patterns/implementation-first-debugging.md](anti-patterns/implementation-first-debugging.md) | Critical | Never implement before tracing complete flow |

---

## Keyword: systematic-debugging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Verify each transfer point systematically before fixing |
| [anti-patterns/implementation-first-debugging.md](anti-patterns/implementation-first-debugging.md) | Critical | Use decision tree: trace first, then implement |

---

## Keyword: flow-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Check every data transfer point works before implementation |
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | Complete event flow tracing with expectation verification |

---

## Keyword: event-flow-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | Numbered story format for complete event flow verification |

---

## Keyword: expectation-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | True/false verification at each event flow step with discrepancy logging |

---

## Keyword: discrepancy-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | Log actual vs expected only when expectations fail |

---

## Keyword: complete-trace

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Map complete data flow before any implementation |
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | UI Event -> State -> Work -> Result -> State complete tracing |
| [anti-patterns/implementation-first-debugging.md](anti-patterns/implementation-first-debugging.md) | Critical | Never implement before tracing complete flow |

---

## Keyword: event-driven-architecture

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/event-flow-logging.md](patterns/event-flow-logging.md) | High | Standardized logging for event-driven systems |

---

## Keyword: architecture-agnostic

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Universal logging system that works for any architecture type |

---

## Keyword: universal-flow-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Architecture-agnostic logging with universal flow logger |

---

## Keyword: procedural-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Sequential step logging for procedural architectures |

---

## Keyword: functional-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Function composition logging for functional architectures |

---

## Keyword: pipeline-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | ETL/data pipeline logging with extract-transform-load tracing |

---

## Keyword: service-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Service-oriented architecture logging with service call tracing |

---

## Keyword: object-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Object-oriented architecture logging with method and instantiation tracing |

---

## Keyword: pattern-agnostic

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/architecture-agnostic-logging.md](patterns/architecture-agnostic-logging.md) | High | Pattern-agnostic logging that adapts to any programming paradigm |

---

## Keyword: false-positive-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/false-positive-logging.md](anti-patterns/false-positive-logging.md) | Critical | Never hardcode verification results - perform actual comparison in logging systems |

---

## Keyword: verification-honesty

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/false-positive-logging.md](anti-patterns/false-positive-logging.md) | Critical | Logging systems must report actual verification results, not hardcoded "true" |

---

## Keyword: logging-integrity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/false-positive-logging.md](anti-patterns/false-positive-logging.md) | Critical | Maintain logging system integrity with real verification and discrepancy logging |

---

## Keyword: isolate-before-fix

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/bus-stop-debugging-methodology.md](patterns/bus-stop-debugging-methodology.md) | Critical | Find exact broken bus stop before writing any code |

---

## Keyword: implementation-first

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/implementation-first-debugging.md](anti-patterns/implementation-first-debugging.md) | Critical | Never start with code - always trace first |

---

## Keyword: code-before-understanding

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/implementation-first-debugging.md](anti-patterns/implementation-first-debugging.md) | Critical | 22min → 5min when tracing precedes implementation |

---

## Keyword: filter-flow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/end-to-end-filter-flow-testing.md](patterns/end-to-end-filter-flow-testing.md) | Medium | Test UI → URL → GROQ → Results pipeline for each filter type |

---

## Keyword: field-consistency

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/end-to-end-filter-flow-testing.md](patterns/end-to-end-filter-flow-testing.md) | Medium | Verify frontend/backend field naming consistency across codebase |
| [failures/filter-field-name-mismatch.md](failures/filter-field-name-mismatch.md) | High | Frontend priceRange vs backend price field naming caused 0 results |

---

## Keyword: integration-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/end-to-end-filter-flow-testing.md](patterns/end-to-end-filter-flow-testing.md) | Medium | Create end-to-end tests for filter flows, not just unit tests |
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | High | Systematic verification that each test step sets ground for the next |

---

## Keyword: cover-and-move

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | High | Verify each step covers for the next - never hand back until chain verified |

---

## Keyword: test-setup

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | High | Pre-flight verification of all dependencies before test execution |

---

## Keyword: pre-flight

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | High | Verify dev server, API endpoints, event names, state clearing before running tests |

---

## Keyword: chain-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | High | Step N must verify ground is set for step N+1 before proceeding |

---

## Keyword: simple

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | Critical | Keep everything simplest possible - single-line fixes, minimal abstractions, no over-engineering |

---

## Keyword: minimal

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | Critical | Minimal API endpoints, minimal code, minimal complexity |

---

## Keyword: over-engineering

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | Critical | Prevent over-engineering - if >5 min to explain, too complex |

---

## Keyword: groq-mapping

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/filter-field-name-mismatch.md](failures/filter-field-name-mismatch.md) | High | Map frontend field names to backend GROQ field handlers |

---

## Keyword: frontend-backend-sync

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/filter-field-name-mismatch.md](failures/filter-field-name-mismatch.md) | High | Ensure consistent field naming between useFilterNuqs and getProductsByVfsKeys |

---

## Keyword: tailwind

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Custom breakpoints shadow defaults - use lg-desktop:/lg-touch: instead of lg: |

---

## Keyword: breakpoints

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Check tailwind.config.ts screens section before responsive layout work |

---

## Keyword: responsive

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Default lg:/md:/sm: may not apply when custom breakpoints defined |

---

## Keyword: grid

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Grid columns not rendering? Check for breakpoint shadowing in config |

---

## Keyword: shadowing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Tailwind custom breakpoints shadow default variants |

---

## Keyword: lg-desktop

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Use lg-desktop: instead of lg: when config has custom breakpoints |

---

## Keyword: lg-touch

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/tailwind-breakpoint-shadowing.md](failures/tailwind-breakpoint-shadowing.md) | Critical | Use lg-touch: for tablet-height desktop viewports |

---

## Keyword: type-consolidation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/type-consolidation.md](patterns/type-consolidation.md) | High | Export shared types from data layer - single source of truth prevents conflicting type definitions |

---

## Keyword: server-driven-filtering

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/server-driven-filtering.md](patterns/server-driven-filtering.md) | High | All filtering server-side via GROQ - client components receive already-filtered data |
| [anti-patterns/client-side-filtering.md](anti-patterns/client-side-filtering.md) | High | Never filter server-fetched data client-side - causes double work and state mismatch |

---

## Keyword: suspense-streaming

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/suspense-streaming-components.md](patterns/suspense-streaming-components.md) | Medium | Async Server Components + Suspense boundaries enable true streaming with skeleton fallbacks |

---

## Keyword: pagination-safety

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/pagination-safety.md](sops/pagination-safety.md) | Critical | All list queries require MAX_LIMIT constant to prevent unbounded queries |

---

## Keyword: streaming

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/suspense-streaming-components.md](patterns/suspense-streaming-components.md) | Medium | Async Server Components + Suspense boundaries enable true streaming |

---

## Keyword: client-side-filtering

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/client-side-filtering.md](anti-patterns/client-side-filtering.md) | High | Never filter server-fetched data client-side - use server-driven filtering |

---

## Keyword: max-limit

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/pagination-safety.md](sops/pagination-safety.md) | Critical | All list queries require MAX_LIMIT constant |

---

## Keyword: workflow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/command-singular-focus.md](workflows/command-singular-focus.md) | High | /sprint plans, /implement executes, /test verifies, /build constructs — clear delegation chain |
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Compressed context → tight sprint doc → single execution → fast review |

---

## Keyword: command

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/command-singular-focus.md](workflows/command-singular-focus.md) | High | Each command does ONE thing — singular focus prevents responsibility ambiguity |

---

## Keyword: delegation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/command-singular-focus.md](workflows/command-singular-focus.md) | High | /sprint delegates to /implement → /implement invokes /build + /test |

---

## Keyword: singular-focus

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/command-singular-focus.md](workflows/command-singular-focus.md) | High | Commands must have single responsibility — no overlap, clear delegation |

---

## Keyword: velocity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Inverted velocity ratio (1:1.5) — workflow generates more overhead than delivery |

---

## Keyword: batched-decisions

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | 4 serial decision gates per task → batch to planning phase only |

---

## Keyword: sprint

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Compressed context → tight sprint doc → single execution → fast review |
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | Medium | Research unused after 2 hours becomes stale — consume immediately or compress |

---

## Keyword: research-staleness

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | 14 causal factors — intent clarity, ground truth, compression accuracy, review speed |

---

## Keyword: optimization

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | 14 causal factors — intent clarity, ground truth, compression accuracy, review speed |

---

## Keyword: cognitive-load

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Batch decisions to planning phase only — no re-planning during execution |

---

## Keyword: throughput

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Human (not AI) became throughput limiter — serial gates, not parallel flow |

---

## Keyword: commits

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | D-type 34% (target <20%), illusory velocity 61% (target <40%) |

---

## Keyword: diagnostics

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | /commits-diagnostics for instant velocity visibility before any sprint |

---

## Keyword: signal-density

| Lesson | Severity | Summary |
|--------|----------|---------|
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | Opus token cost 10× reduction via /compress — cheap model extracts, Opus only decides |
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | 90 min output in 12 hours — context switching destroys throughput |

---

## Keyword: re-entry-cost

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | 90 min output in 12 hours — context switching destroys throughput |

---

## Keyword: token-cost

| Lesson | Severity | Summary |
|--------|----------|---------|
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | Ground factor: Signal density ÷ time cost. Maximize load-bearing facts per token. |

---

## Keyword: opus

| Lesson | Severity | Summary |
|--------|----------|---------|
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | Opus never discovers — only synthesizes. Cheap models do all extraction. |

---

## Keyword: compression

| Lesson | Severity | Summary |
|--------|----------|---------|
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | /compress command: 8000 raw tokens → 800 dense tokens before Opus sees context |

---

## Keyword: grinde

| Lesson | Severity | Summary |
|--------|----------|---------|
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | 16 causal factors → 1 ground factor: Signal density ÷ time cost |
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Justin Sung mind mapping method for bottleneck analysis |

---

## Keyword: file-exists

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/file-exists-blocking.md](failures/file-exists-blocking.md) | Medium | Check file existence before creation to prevent progress blocking |

---

## Keyword: file-handling

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/file-handling-patterns.md](patterns/file-handling-patterns.md) | Medium | Safe file creation patterns with existence checks and handling strategies |

---

## Keyword: ai-leverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 7 true bottlenecks identified: context loss, sequencing violations, data assumption, etc. |

---

## Keyword: context-loss

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 10-30 min/session friction — fixed with context templates |

---

## Keyword: sequencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | Critical | 17-day failure pattern — Pass 1→2→3 enforcement required |

---

## Keyword: infrastructure

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | Workflow hardening: data verification, pre-sprint checks, MCP retrieval |

---

## Keyword: bottleneck

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 7 true bottlenecks with evidence-based time sink quantification |

---

## Keyword: baseline

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/pre-flight-baseline-check.md](workflows/pre-flight-baseline-check.md) | High | Always verify baseline build before sprint work |

---

## Keyword: nuqs

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | Use `shallow: true` for high-frequency URL state to avoid server roundtrips |

---

## Keyword: url-state

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | nuqs + shallow routing for instant filter/sort UI feedback |

---

## Keyword: performance

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | Router navigation causes 200-500ms lag; use shallow client updates |

---

## Keyword: sanity-groq

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-groq-syntax-regression.md](failures/brand-groq-syntax-regression.md) | Critical | Use `brand->name` NOT `brand->{name}` for Sanity reference dereferencing |

---

## Keyword: reference-dereferencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-groq-syntax-regression.md](failures/brand-groq-syntax-regression.md) | Critical | Sanity reference syntax: `brand->name` for single field, `brand->{_id, name, slug}` for objects |

---

## Keyword: brand-filter

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-groq-syntax-regression.md](failures/brand-groq-syntax-regression.md) | Critical | Brand filter regression fixed with correct GROQ dereferencing syntax |

---

## Keyword: groq-syntax

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-groq-syntax-regression.md](failures/brand-groq-syntax-regression.md) | Critical | Reference dereferencing: `brand->name` not `brand->{name}` |

---

## Keyword: query-debugging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-groq-syntax-regression.md](failures/brand-groq-syntax-regression.md) | Critical | Console debugging + manual URL testing faster than Playwright for data flow issues |

---

## Keyword: debugging-workflow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/live-console-debugging-vs-playwright.md](workflows/live-console-debugging-vs-playwright.md) | High | Console debugging 15min vs Playwright 45min for data flow issues |

---

## Keyword: console-logging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/live-console-debugging-vs-playwright.md](workflows/live-console-debugging-vs-playwright.md) | High | Live console logs for API calls, query building, data transformation |

---

## Keyword: live-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/live-console-debugging-vs-playwright.md](workflows/live-console-debugging-vs-playwright.md) | High | Manual URL testing for parameter parsing and routing issues |

---

## Keyword: playwright-alternative

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/live-console-debugging-vs-playwright.md](workflows/live-console-debugging-vs-playwright.md) | High | Use console debugging for data flow, Playwright for UI workflows |

---

## Keyword: data-flow-debugging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/live-console-debugging-vs-playwright.md](workflows/live-console-debugging-vs-playwright.md) | High | Console logs at URL parsing → filter construction → GROQ generation → results |

---

## Keyword: groq

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-schema-assumption.md](failures/groq-schema-assumption.md) | Critical | Never assume field types — always read schema first |
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Reference syntax (->) on non-reference string fields returns empty results silently |
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Diagnostic traced data flow but failed to verify GROQ against schema |

---

## Keyword: type-mismatch

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/reference-vs-string-schema-mismatch.md](failures/reference-vs-string-schema-mismatch.md) | Critical | Schema defined brand as reference but data had strings - GROQ dereference failed silently |

---

## Keyword: sanity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Schema drift: brand field changed from reference to string, query didn't |
| [failures/reference-vs-string-schema-mismatch.md](failures/reference-vs-string-schema-mismatch.md) | Critical | ALWAYS verify actual data before querying - schema ≠ data reality |
| [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md) | High | Virtual File System pre-computed at build time for O(1) lookups |
| [patterns/type-safety-generated-types.md](patterns/type-safety-generated-types.md) | High | Use `Pick<SanityProduct, ...>` pattern instead of manual interfaces |

---

## Keyword: typegen

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/type-safety-generated-types.md](patterns/type-safety-generated-types.md) | High | ALWAYS regenerate types before type-related changes |
| [failures/groq-reference-syntax-assumption.md](failures/groq-reference-syntax-assumption.md) | Critical | Stale types caused reference syntax on string field |

---

## Keyword: generated-types

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/type-safety-generated-types.md](patterns/type-safety-generated-types.md) | High | `Pick<SanityProduct, ...>` pattern prevents type drift |

---

## Keyword: schema-drift

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-reference-syntax-assumption.md](failures/groq-reference-syntax-assumption.md) | Critical | Types out of sync with schema caused silent query failures |
| [patterns/type-safety-generated-types.md](patterns/type-safety-generated-types.md) | High | Prevention: regenerate types before any type work |

---

## Keyword: typescript

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/type-safety-generated-types.md](patterns/type-safety-generated-types.md) | High | Single source of truth via generated types |
| [patterns/type-consolidation.md](patterns/type-consolidation.md) | High | Export shared types from data layer |

---

## Keyword: type-check

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-reference-syntax-assumption.md](failures/groq-reference-syntax-assumption.md) | Critical | Verify field type with `grep -A 5 "field\?:" sanity.types.ts` |

---

## Keyword: schemabuild

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) | High | `require()` in ES module scope fails — use `import` |
| [failures/pre-existing-infrastructure-errors.md](failures/pre-existing-infrastructure-errors.md) | Medium | Distinguish sprint regressions from pre-existing build issues |
| [failures/svg-import-assumption.md](failures/svg-import-assumption.md) | Medium | Don't assume SVGR — verify build tooling first |

---

## Keyword: svg

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/svg-import-assumption.md](failures/svg-import-assumption.md) | Medium | Direct SVG import requires SVGR config — use Next.js Image instead |

---

## Keyword: module

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) | High | ES module scope: `import` only, no `require` |

---

## Keyword: implement

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md) | Medium | Rigid phase gates vs continuous execution mode |

---

## Keyword: debug

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/debug-data-assumption.md](failures/debug-data-assumption.md) | High | Verify actual data before code changes — build passing ≠ bug fixed |

---

## Keyword: diagnostic

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Trace complete code path including query construction |

---

## Keyword: testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/debug-data-assumption.md](failures/debug-data-assumption.md) | High | Mocked tests may hide real data issues |

---

## Keyword: test-scope

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/test-scope-creep.md](anti-patterns/test-scope-creep.md) | High | "A to B" means ONLY A to B - parse flow name, stop at endpoint, write explicit OUT OF SCOPE |

---

## Keyword: prd-todo

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/prd-todo-verification-specificity.md](patterns/prd-todo-verification-specificity.md) | Critical | All PRD .todo verification items must be EXACT: show exact code, exact output, copy-pasteable commands |

---

## Keyword: verification-specificity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/prd-todo-verification-specificity.md](patterns/prd-todo-verification-specificity.md) | Critical | Removes interpretation gap, enables verification by anyone, makes DoD objective |

---

## Keyword: exact-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/prd-todo-verification-specificity.md](patterns/prd-todo-verification-specificity.md) | Critical | Show exact console.log code to add, exact expected output format |

---

## Keyword: copy-pasteable-tests

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/prd-todo-verification-specificity.md](patterns/prd-todo-verification-specificity.md) | Critical | Test commands must be copy-pasteable, no manual steps required |

---

## Keyword: objective-success-criteria

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/prd-todo-verification-specificity.md](patterns/prd-todo-verification-specificity.md) | Critical | Makes DoD objective, not subjective - prevents "it works on my machine" debates |
| [patterns/test-dod-exactness.md](patterns/test-dod-exactness.md) | Critical | Exact expected outcome - no interpretation needed |

---

## Keyword: test-dod

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-dod-exactness.md](patterns/test-dod-exactness.md) | Critical | All test DoD items: Trace, Setup, Start conditions, Assertion, Justification, Real feedback |

---

## Keyword: test-exactness

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-dod-exactness.md](patterns/test-dod-exactness.md) | Critical | Exact expected outcome, explicit preconditions, objective success criteria |

---

## Keyword: test-preconditions

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-dod-exactness.md](patterns/test-dod-exactness.md) | Critical | Setup (what must exist), Start conditions (what state must be in) |

---

## Keyword: business-value-connection

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-dod-exactness.md](patterns/test-dod-exactness.md) | Critical | Justification (why this matters), Real feedback (what bugs this catches) |

---

## Keyword: incremental-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-application.md](patterns/cover-and-move-application.md) | Critical | Break into smallest steps, verify each step before moving forward |

---

## Keyword: smallest-steps

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-application.md](patterns/cover-and-move-application.md) | Critical | One change per step, verify independently, have rollback plan |

---

## Keyword: verified-ground

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-application.md](patterns/cover-and-move-application.md) | Critical | Build only on verified ground, no assumptions, ground set before moving forward |

---

## Keyword: failure-isolation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-application.md](patterns/cover-and-move-application.md) | Critical | Failure isolated to one step, rollback simple (revert one file) |

---

## Keyword: simplicity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/cover-and-move-testing-protocol.md](patterns/cover-and-move-testing-protocol.md) | Critical | Keep everything simplest possible - single-line fixes, minimal abstractions |
| [patterns/simplicity-principles.md](patterns/simplicity-principles.md) | Critical | Separate over modify, duplicate over complex, remove complexity, simple over clever |

---

## Keyword: separate-over-modify

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/simplicity-principles.md](patterns/simplicity-principles.md) | Critical | Create separate parallel implementation, don't modify existing working code |

---

## Keyword: duplicate-over-complex

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/simplicity-principles.md](patterns/simplicity-principles.md) | Critical | Copy code if it keeps it simple, don't create abstractions for DRY |

---

## Keyword: remove-complexity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/simplicity-principles.md](patterns/simplicity-principles.md) | Critical | Less complexity is better than fewer lines, don't optimize prematurely |

---

## Keyword: simple-over-clever

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/simplicity-principles.md](patterns/simplicity-principles.md) | Critical | Maintainability over cleverness, use obvious code over clever patterns |

---

## Keyword: phantom-coverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/test-implementation-drift-systemic-analysis.md](failures/test-implementation-drift-systemic-analysis.md) | Critical | Tests creating their own implementations instead of importing from source |

---

## Keyword: test-local

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/test-local-implementations.md](anti-patterns/test-local-implementations.md) | Critical | Never define functions/classes in tests that exist in implementation |

---

## Keyword: scoped-audit

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/scoped-lesson-detection.md](patterns/scoped-lesson-detection.md) | High | Scan current scope files for lesson violations, not entire codebase |

---

## Keyword: test-boundaries

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/test-scope-creep.md](anti-patterns/test-scope-creep.md) | High | Enforce strict test boundaries - never include what happens next in the flow |

---

## Keyword: flow-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/test-scope-creep.md](anti-patterns/test-scope-creep.md) | High | Flow-based testing requires explicit endpoint enforcement |

---

## Keyword: scope-creep

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/test-scope-creep.md](anti-patterns/test-scope-creep.md) | High | Natural tendency to over-scope tests - prevent with explicit OUT OF SCOPE sections |

---

## Keyword: component

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/functional-grouping.md](patterns/functional-grouping.md) | High | Complete functional groups (e.g., filter system) not isolated components |

---

## Keyword: workflow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md) | Medium | Need pre-flight branch checks and execution mode flags |

---

## Keyword: windows

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Windows Playwright hanging prevention - process cleanup, Redis version, timeouts |

---

## Keyword: playwright

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Pre-flight process checks, --maxWorkers=1, timeout configuration |

---

## Keyword: process-hanging

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Zombie Node processes hang PowerShell - kill with Stop-Process -Force |

---

## Keyword: zombie-processes

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Previous test runs leave Node processes - pre-flight cleanup required |

---

## Keyword: test-environment

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Isolate test processes, monitor resources, dedicated configs |

---

## Keyword: prevention

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/windows-playwright-process-management.md](sops/windows-playwright-process-management.md) | Critical | Systematic prevention protocol for Windows Playwright issues |
| [workflows/pre-flight-baseline-check.md](workflows/pre-flight-baseline-check.md) | High | Always verify baseline build before sprint work to prevent false correlation |

---

## Keyword: pre-flight

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | 7 systematic friction reductions: context templates, data verification, pre-sprint checks |

---

## Keyword: ai-leverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Infrastructure sprint: 40-60 min saved per session via context scripts, verification gates |

---

## Keyword: friction-reduction

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Cognitive reconstruction overhead eliminated with scripts and workflow enforcement |

---

## Keyword: context-management

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Context templates eliminate 10-30 min/session rebuild overhead |

---

## Keyword: verification-gates

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/test-development-sop.md](sops/test-development-sop.md) | High | Quality gates for test development - file size, scope, organization validation |

---

## Keyword: test-drift

| Lesson | Severity | Summary |
|----------|---------|---------|
| [failures/test-implementation-drift.md](failures/test-implementation-drift.md) | Critical | Tests copied functions instead of importing, creating phantom coverage and false confidence |

---

## Keyword: import-only

| Lesson | Severity | Summary |
|----------|---------|---------|
| [failures/test-implementation-drift.md](failures/test-implementation-drift.md) | Critical | Unit tests MUST import functions directly from source files - no copying, no recreating |

---

## Keyword: phantom-tests

| Lesson | Severity | Summary |
|----------|---------|---------|
| [failures/test-implementation-drift.md](failures/test-implementation-drift.md) | Critical | 3 test files tested functions that don't exist in implementation |

---

## Keyword: test-verification

| Lesson | Severity | Summary |
|----------|---------|---------|
| [failures/test-implementation-drift.md](failures/test-implementation-drift.md) | Critical | Create /audit-tests command to detect phantom implementations |

---

## Keyword: unit-testing

| Lesson | Severity | Summary |
|----------|---------|---------|
| [failures/test-implementation-drift.md](failures/test-implementation-drift.md) | Critical | Import discipline prevents phantom tests and implementation drift |

---

## Keyword: test-organization

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-organization-patterns.md](patterns/test-organization-patterns.md) | High | Thematic test organization - avoid monolithic files, maintain execution flow |
| [anti-patterns/monolithic-testing.md](anti-patterns/monolithic-testing.md) | Critical | Anti-pattern: Single large test files with mixed concerns |
| [sops/test-development-sop.md](sops/test-development-sop.md) | High | SOP for test development with organization guidelines |

---

## Keyword: monolithic-tests

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/monolithic-testing.md](anti-patterns/monolithic-testing.md) | Critical | Files > 15 tests or > 200 lines must be split thematically |

---

## Keyword: thematic-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-organization-patterns.md](patterns/test-organization-patterns.md) | High | Group tests by domain concern with clear thematic boundaries |

---

## Keyword: integration-flows

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-organization-patterns.md](patterns/test-organization-patterns.md) | High | Integration tests must follow real user flows: 1 action -> 2 steps maximum |

---

## Keyword: test-naming

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/test-development-sop.md](sops/test-development-sop.md) | High | Descriptive file names: {theme}.test.ts, avoid generic names |

---

## Keyword: test-sop

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/test-development-sop.md](sops/test-development-sop.md) | High | Standard Operating Procedure for all test development |

---

## Keyword: file-structure

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/test-development-sop.md](sops/test-development-sop.md) | High | Directory structure: unit/{theme}.test.ts, integration/{flow}/{theme}.test.ts |

---

## Keyword: test-maintainability

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/monolithic-testing.md](anti-patterns/monolithic-testing.md) | Critical | Large files create cognitive overhead and navigation difficulty |

---

## Keyword: cognitive-overload

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/monolithic-testing.md](anti-patterns/monolithic-testing.md) | Critical | Monolithic test files create cognitive overhead for developers |

---

## Keyword: human-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/human-verification-patterns.md](patterns/human-verification-patterns.md) | High | Co-locate verification guides with tests, mirror thematic organization |
| [sops/human-verification-sop.md](sops/human-verification-sop.md) | High | SOP for creating human verification guides aligned with test structure |

---

## Keyword: verification-guides

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/human-verification-patterns.md](patterns/human-verification-patterns.md) | High | Manual verification guides must match test organization and scope |
| [sops/human-verification-sop.md](sops/human-verification-sop.md) | High | Create verification guides in human-verification folder alongside tests |

---

## Keyword: test-alignment

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/human-verification-patterns.md](patterns/human-verification-patterns.md) | High | Verification files must mirror test file names and thematic boundaries |

---

## Keyword: bus-stops

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/human-verification-patterns.md](patterns/human-verification-patterns.md) | High | Bus stop organization must align with test scope boundaries |

---

## Keyword: manual-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/human-verification-sop.md](sops/human-verification-sop.md) | High | Manual testing procedures with clear verification steps and expected results |

---

## Keyword: integration-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/human-verification-patterns.md](patterns/human-verification-patterns.md) | High | Integration verification requires co-located guides matching test structure |

---

## Keyword: todo-files

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/todo-file-extension-pattern.md](patterns/todo-file-extension-pattern.md) | Medium | Use .todo extension for task-oriented content, .md for documentation |

---

## Keyword: file-extensions

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/todo-file-extension-pattern.md](patterns/todo-file-extension-pattern.md) | Medium | File extension should match content purpose: .todo for tasks, .md for docs |

---

## Keyword: task-oriented

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/todo-file-extension-pattern.md](patterns/todo-file-extension-pattern.md) | Medium | Task-oriented content (checklists, procedures) should use .todo extension |

---

## Keyword: documentation-organization

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/todo-file-extension-pattern.md](patterns/todo-file-extension-pattern.md) | Medium | Clear file extension rules distinguish documentation from task lists |

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:389-469](auto-lessons.md) | Critical | Data verification before hypothesis prevents 15-20 min wasted on unverified fixes |
| [auto-lessons.md:472-527](auto-lessons.md) | High | Data Verification Gate + Pre-Sprint Infrastructure Check |

---

## Keyword: sequencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | Critical | Pass 1→2→3, Layer 1→2→3→4 enforcement prevents 17-day pattern failures |

---

## Keyword: schema

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-schema-assumption.md](failures/groq-schema-assumption.md) | Critical | Read schema file before writing GROQ — never assume field types |
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Always verify field type before using reference syntax |
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Schema-to-query validation required |

---

## Search by Technology

### Next.js
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md)
- [failures/svg-import-assumption.md](failures/svg-import-assumption.md)

### React
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md)

### TypeScript
- [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md)

### Sanity
- [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md)
- [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md)
- [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md)

---

## Search by Severity

### Critical
- [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) — Silent failures, wrong field syntax

### High
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) — Build breaks
- [failures/debug-data-assumption.md](failures/debug-data-assumption.md) — Ineffective debugging
- [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) — Incomplete diagnosis
- [patterns/functional-grouping.md](patterns/functional-grouping.md) — Architecture quality

### Medium
- [failures/pre-existing-infrastructure-errors.md](failures/pre-existing-infrastructure-errors.md)
- [failures/svg-import-assumption.md](failures/svg-import-assumption.md)
- [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md)

---

## Keyword: cloneElement

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/clone-element-anti-pattern.md](failures/clone-element-anti-pattern.md) | High | cloneElement breaks component contracts - use React Context for prop injection |

---

## Keyword: context

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/clone-element-anti-pattern.md](failures/clone-element-anti-pattern.md) | High | React Context eliminates prop drilling without cloneElement hacks |

---

## Keyword: prop-drilling

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/clone-element-anti-pattern.md](failures/clone-element-anti-pattern.md) | High | Use Context instead of prop drilling for 3+ level prop sharing |

---

## Keyword: opus

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | Opus generates superior sprint specs with gap coverage, line-number precision, constraint-first architecture |

---

## Keyword: sprint-spec

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | Compress input to <1000 tokens, include Gap Coverage mapping, Scope Lock Rules, line numbers, anti-patterns |

---

## Keyword: scope-contract

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | Each SC must have Gap Coverage reference, explicit DoDs, build gate, and verification command |

---

## Keyword: gap-coverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | Every SC must explicitly map to audit gaps (G1, G2, etc.) for traceability |

---

## Keyword: layer-sequencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | Four Layers: Structure → Layout → Surface → Interaction. Pass 1/2/3 sequencing |

---

## Keyword: constraint-first

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/opus-sprint-specification-generation.md](workflows/opus-sprint-specification-generation.md) | High | List Scope Lock Rules (what NOT to touch) BEFORE implementation details |

---

## Keyword: opus-audit

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/opus-audit-to-sprint-pipeline.md](patterns/opus-audit-to-sprint-pipeline.md) | High | 8-part audit structure: Design System → Research → Component Audit → Ratings → Gap Analysis → SCs → Verification → Targets |

---

## Keyword: design-audit

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/opus-audit-to-sprint-pipeline.md](patterns/opus-audit-to-sprint-pipeline.md) | High | Use 8-part structure with numbered gaps (G1, G2...) and traceable SCs |

---

## Keyword: gap-analysis

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/opus-audit-to-sprint-pipeline.md](patterns/opus-audit-to-sprint-pipeline.md) | High | Gap table: Current State | Target State | Components | with G1, G2 numbering |

---

## Keyword: reference-standard

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/opus-audit-to-sprint-pipeline.md](patterns/opus-audit-to-sprint-pipeline.md) | High | Homepage/canonical implementation as reference for all target states |

---

## Keyword: cargo-cult-testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/cargo-cult-testing.md](anti-patterns/cargo-cult-testing.md) | Critical | Tests passed 100% but system didn't work - tests mocked core functionality instead of testing it |

---

## Keyword: human-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-verification.md](workflows/human-first-verification.md) | Critical | Always verify manually before writing tests - tests document verified behavior, don't create it |

---

## Keyword: directness

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/directness-principle.md](patterns/directness-principle.md) | Critical | Maintain direct human observation - indirect verification creates blind spots |

---

## Keyword: test-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/cargo-cult-testing.md](anti-patterns/cargo-cult-testing.md) | Critical | Every test must be anchored in human verification first |
| [workflows/human-first-verification.md](workflows/human-first-verification.md) | Critical | Manual verification required before test writing |

---

## Keyword: mock-abuse

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/cargo-cult-testing.md](anti-patterns/cargo-cult-testing.md) | Critical | Never mock the core functionality being tested |

---

## Keyword: manual-first

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-verification.md](workflows/human-first-verification.md) | Critical | Make it work manually, then write tests to document that working code |

---

## Keyword: test-documentation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-verification.md](workflows/human-first-verification.md) | Critical | Tests should document verified behavior, not speculate about it |

---

## Keyword: human-observation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/directness-principle.md](patterns/directness-principle.md) | Critical | Every verification must be directly observable by humans |

---

## Keyword: no-mocking-core

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/directness-principle.md](patterns/directness-principle.md) | Critical | Only mock external dependencies, never core flow |

---

## Keyword: human-first-sprint

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | 7-step methodology: UX flows -> End-state overview -> Architecture contract -> Tiny scopes -> Continuous verification -> Human-confidence tests -> Simplicity guardrails |

---

## Keyword: ux-flows

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | Start every sprint with "user does X -> system shows Y -> user can do Z" before any code |

---

## Keyword: architecture-contracts

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | Explicit event->state->side-effect->result event contracts prevent fatal vagueness |

---

## Keyword: continuous-verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | Verify immediately after each scope contract, no big phases, no blind spots |

---

## Keyword: tiny-scopes

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | Each scope contract: UX slice + arch slice + human verification + minimal tests, self-contained |

---

## Keyword: simplicity-guardrails

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/human-first-sprint-methodology.md](workflows/human-first-sprint-methodology.md) | Critical | "Is this the simplest possible way?" test before any code, tests, or concepts |

---

## Keyword: quick-workflow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/quick-workflow-pattern.md](workflows/quick-workflow-pattern.md) | Critical | 5-step pattern (75min total) to prevent over-complication: UX flows -> Manual verification -> Architecture -> Guardrails -> Sprint template |

---

## Keyword: simplicity-contract

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/as-simple-as-possible-contract.md](patterns/as-simple-as-possible-contract.md) | Critical | 5-minute explanation rule, one-page documentation rule, test-length rule to prevent over-complication |

---

## Keyword: over-complication

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/quick-workflow-pattern.md](workflows/quick-workflow-pattern.md) | Critical | Use /quick-workflow for any feature at risk of over-complication |
| [patterns/as-simple-as-possible-contract.md](patterns/as-simple-as-possible-contract.md) | Critical | AS-SIMPLE-AS-POSSIBLE contract prevents over-complication |

---

## Keyword: guardrails

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/as-simple-as-possible-contract.md](patterns/as-simple-as-possible-contract.md) | Critical | Guardrails: 5-minute rule, one-page rule, test-length rule |

---

## Keyword: search-consistency

| Lesson | Severity | Summary |
|--------|----------|---------|
| Search Consistency Pattern | High | Maintain identical field coverage across all search endpoints (autocomplete, full search, API) |

---

## Keyword: autocomplete

| Lesson | Severity | Summary |
|--------|----------|---------|
| Search Consistency Pattern | High | Autocomplete must match full search field coverage for consistent user experience |

---

## Keyword: field-coverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| Search Consistency Pattern | High | All search endpoints must search same fields: name, brand, sku, specifications, overview |

---

## Keyword: api-parity

| Lesson | Severity | Summary |
|--------|----------|---------|
| Search Consistency Pattern | High | Feature parity required between autocomplete and full search APIs |

---

## Keyword: compound-development

| Lesson | Severity | Summary |
|--------|----------|---------|
| [Compound Development Lessons](../_contexts/general/compound-development-lessons.md) | Critical | End-to-end trace with bus stop expectations is only worthwhile development method |

---

## Keyword: time-worth

| Lesson | Severity | Summary |
|--------|----------|---------|
| [Compound Development Lessons](../_contexts/general/compound-development-lessons.md) | Critical | Only bus stop tracing is worth time in web development, everything else is waste |

---

## Keyword: playwright-waste

| Lesson | Severity | Summary |
|--------|----------|---------|
| [Compound Development Lessons](../_contexts/general/compound-development-lessons.md) | Critical | Playwright tests are colossal waste without clear targets and end results |

---

## Keyword: test-pyramid

| Lesson | Severity | Summary |
|--------|----------|---------|
| [Compound Development Lessons](../_contexts/general/compound-development-lessons.md) | Critical | Simple pre-flight test first, then pyramid layer up - abandon if basic test fails |

---

## Keyword: sequenced-changes

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/opus-audit-to-sprint-pipeline.md](patterns/opus-audit-to-sprint-pipeline.md) | High | SC1, SC2... with Gap Coverage mapping, before/after code, exact file paths |

---

## Keyword: playwright

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-single-browser-testing.md](sops/playwright-single-browser-testing.md) | High | Always use --project=chromium to prevent multi-browser explosion |

---

## Keyword: e2e

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-single-browser-testing.md](sops/playwright-single-browser-testing.md) | High | Single browser testing prevents 5-10x slowdown |

---

## Keyword: testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-single-browser-testing.md](sops/playwright-single-browser-testing.md) | High | Playwright config fixed to chromium only |

---

## Keyword: pre-flight

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-test-pre-flight.md](sops/playwright-test-pre-flight.md) | High | Verify URL, elements, action, result BEFORE writing tests |

---

## Keyword: verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-test-pre-flight.md](sops/playwright-test-pre-flight.md) | High | Manual verification prevents wasted test debugging |

---

## Keyword: state-definition

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-test-pre-flight.md](sops/playwright-test-pre-flight.md) | High | Before-state, target element, user action, after-state must be specifically defined |

---

## Keyword: specificity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [sops/playwright-test-pre-flight.md](sops/playwright-test-pre-flight.md) | High | No vague definitions - exact counts, selectors, and expectations required |

---

## Keyword: brand-migration

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-reference-migration-failure.md](failures/brand-reference-migration-failure.md) | Critical | Sanity field migration from string to reference requires updating ALL interfaces, queries, and components atomically |

---

## Keyword: reference-fields

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-reference-migration-failure.md](failures/brand-reference-migration-failure.md) | Critical | Reference field changes need comprehensive codebase search and atomic updates |

---

## Keyword: react-rendering

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-reference-migration-failure.md](failures/brand-reference-migration-failure.md) | Critical | Objects with {_ref, _type} cannot be rendered as React children - must dereference to .name |

---

## Keyword: type-safety

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/brand-reference-migration-failure.md](failures/brand-reference-migration-failure.md) | Critical | Schema changes without complete type updates cause runtime React errors |

---

## Keyword: build-time

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/build-time-destruction-rule.md](anti-patterns/build-time-destruction-rule.md) | Critical | Build runs banned during development - use dev server for verification |

---

## Keyword: verification

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/build-time-destruction-rule.md](anti-patterns/build-time-destruction-rule.md) | Critical | Reserve builds for sprint completion, explicit override, or pre-deployment only |

---

## Keyword: playwright

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/playwright-performance-optimization.md](patterns/playwright-performance-optimization.md) | High | Use parallel workers, headless mode, no fixed waits for fast tests |

---

## Keyword: validation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-validation-consistency.md](patterns/test-validation-consistency.md) | Medium | Type checking alone doesn't catch empty strings - check content too |

---

## Keyword: type-guards

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-validation-consistency.md](patterns/test-validation-consistency.md) | Medium | Validation must check type AND content (typeof + non-empty) |

---

## Keyword: empty-string

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-validation-consistency.md](patterns/test-validation-consistency.md) | Medium | Empty strings pass typeof === "string" but are invalid data |

---

## Keyword: data-quality

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-validation-consistency.md](patterns/test-validation-consistency.md) | Medium | Test negative cases: empty strings, zero-length arrays, whitespace |

---

## Keyword: test-alignment

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-validation-consistency.md](patterns/test-validation-consistency.md) | Medium | Keep test validation logic in sync with implementation |

---

## Keyword: stock-reservation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/stock-reservation-checkout.md](patterns/stock-reservation-checkout.md) | High | Reserve stock during checkout, decrement only on payment success |

---

## Keyword: inventory-management

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/stock-reservation-checkout.md](patterns/stock-reservation-checkout.md) | High | Use reservedStock field to prevent race conditions in checkout |

---

## Keyword: two-phase-commit

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/stock-reservation-checkout.md](patterns/stock-reservation-checkout.md) | High | Reserve inventory in checkout, finalize in webhook, rollback on failure |

---

## Keyword: sanity-transaction

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/stock-reservation-checkout.md](patterns/stock-reservation-checkout.md) | High | Use ifRevisionId and atomic patches for inventory operations |

---

## Keyword: rhythm

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | Balance acceleration and pacing - signal density ÷ cycle time optimization |

---

## Keyword: pace

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | When to slow down: schema changes, architecture, integrations, security, performance |

---

## Keyword: acceleration

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | When to accelerate: clear flows, verified data, single-sentence scope, no dependencies |
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | When to accelerate: UI, copy, styles, simple features, well-defined requirements |

---

## Keyword: tempo

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | Development tempo optimization - avoid planning paralysis and verification deferral |

---

## Keyword: signal-density

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | Core ground factor: signal density ÷ time cost - maximize load-bearing facts per token |
| [prompting/signal-density-optimization.md](prompting/signal-density-optimization.md) | Critical | Opus token cost 10× reduction via /compress |

---

## Keyword: cycle-time

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | Optimize cycle time while maintaining signal density - avoid 90min/12hr thrash |

---

## Keyword: throughput

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/optimal-development-rhythm.md](core/optimal-development-rhythm.md) | Critical | Maximize throughput via vertical slices, 15-min specs, continuous verification |
| [workflows/velocity-aware-sprint-planning.md](workflows/velocity-aware-sprint-planning.md) | High | Human (not AI) became throughput limiter - serial gates, not parallel flow |

---

## Keyword: env-prefix

| Lesson | Severity | Summary |
|--------|----------|---------|
| [core/env-prefix-discipline.md](core/env-prefix-discipline.md) | Critical | Use feature-specific prefixes for all environment variables to prevent 500 errors |

---

## Keyword: sanity-client

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/sanity-read-write-client-separation.md](patterns/sanity-read-write-client-separation.md) | Critical | Separate read (CDN) and write (token) clients for Sanity operations |

---

## Keyword: groq-syntax

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/groq-reference-syntax-errors.md](anti-patterns/groq-reference-syntax-errors.md) | Critical | Use `brand->name` not `brand->{name}` for Sanity reference dereferencing |

---

## Keyword: test-integrity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/test-data-integrity.md](patterns/test-data-integrity.md) | High | Atomic test isolation with state restoration for real data testing |

---

## Keyword: debug-truncation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [anti-patterns/debug-output-truncation.md](anti-patterns/debug-output-truncation.md) | High | Console.log truncates at 500 chars - use direct object logging |

---

## Keyword: redis-isolation

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/redis-test-isolation.md](patterns/redis-test-isolation.md) | High | Use dedicated DB (15) for tests to prevent pollution |

---

## Keyword: async-queue

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/async-queue-testing.md](patterns/async-queue-testing.md) | High | Test both immediate 202 response and eventual async processing state |

---

## New Lesson Template

```markdown
| Lesson | Severity | Summary |
|--------|----------|---------|
| [path/name.md](path/name.md) | [Critical/High/Medium/Low] | [One-line summary] |
```
