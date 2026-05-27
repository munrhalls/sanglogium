# Research: Code Logging Best Practices for Next.js 15 / React 18 / Sanity v3 in the AI Era

**Date:** 2026-05-26
**Researcher:** Cascade (AI Agent)
**Scope:** Backend & frontend logging patterns optimized for AI-assisted debugging in Windsurf IDE / Cascade
**Status:** ✅ Verified & Synthesized

---

## Research Scope Contract

- **Topic:** Structured, trace-oriented logging that maximizes debuggability when fed into AI coding agents (Cascade, Claude, etc.) in a Next.js 15 + React 18 + Sanity v3 stack.
- **First Principles:**
  1. **Ground truth over interpretation** — Logs must capture raw inputs/outputs, not summaries.
  2. **Correlation is king** — A single trace ID must stitch server components, server actions, API routes, and client events into one chronological narrative.
  3. **Token efficiency** — AI context windows are finite; log noise directly degrades debugging quality.
- **Fundamentals:**
  - Next.js 15 `instrumentation.js` + `onRequestError` hook
  - React 18 Strict Mode logging behavior (no suppression)
  - Server Action error propagation and digest limitations
  - Structured JSON vs unstructured console output
  - File-based immutable traces vs Redis vs stdout
- **Scope Boundary:**
  - OUT: Third-party observability platforms (Datadog, Sentry) — focused on local/self-hosted patterns.
  - OUT: Full OpenTelemetry deployment — analyzed for reference but not recommended for this project's local-debug-first constraint.
  - OUT: Log aggregation at scale (ELK, Grafana) — out of scope for Windsurf-pro-user debugging flow.
- **Target Audience:** Developers using Windsurf IDE Pro with Cascade, debugging checkout flows and Sanity integrations.
- **Decay Risk:** Medium — Next.js 15.x is stable; React 19 is on the horizon. Review in 6 months.

---

## Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification |
|--------|-----|------|-------------|------|-----------|-------------|
| Next.js Docs — OpenTelemetry Guide | https://nextjs.org/docs/app/guides/open-telemetry | Official | Canonical | 2026-05 | `@vercel/otel` + custom spans + default spans for App Router | ✅ Verified |
| Next.js 15 Blog — instrumentation.js stable | https://nextjs.org/blog/next-15 | Official | Canonical | 2024-10 | `instrumentation.js` stable; `onRequestError` captures server component / action / route handler / middleware errors with context | ✅ Verified |
| Next.js 15 Blog — Async Request APIs | https://nextjs.org/blog/next-15 | Official | Canonical | 2024-10 | `unstable_after` for post-response work; caching changes | ✅ Verified |
| React Docs — Strict Mode | https://react.dev/reference/react/StrictMode | Official | Canonical | 2025 | React 18+ does **not** suppress double logs in Strict Mode | ✅ Verified |
| GitHub Discussion — App Router Logging | https://github.com/vercel/next.js/discussions/62261 | Community | High | 2024-02 | `error.tsx` only receives `digest` on client; original server error is opaque to client logs | ✅ Verified |
| Vercel Template — Pino Logging | https://vercel.com/templates/next.js/pino-logging | Official Example | High | 2024 | Pino isomorphic logger works client + server; JSON structured output | ✅ Verified |
| Langfuse — LLM Observability | https://langfuse.com/docs/observability/overview | Auth Voice | High | 2025 | Traces > logs for LLM systems; need hierarchical spans, timestamps, correlation | ✅ Verified |
| Google DevTools Blog — Token Efficiency | https://developer.chrome.com/blog/designing-devtools-efficient-token-usage | Official | High | 2025 | Optimized data structures reduce token waste; structured summarization > raw dumps | ✅ Verified |
| Existing Codebase — `lib/dev/event-logger.ts` | `c:\webdev\sang-logium\lib\dev\event-logger.ts` | Source of Truth | Ground Truth | 2026-05 | Redis-backed checkout events with trace IDs, slices, and chronological ordering | ✅ Verified |
| Existing Codebase — `latest-checkout-trace.json` | `c:\webdev\sang-logium\latest-checkout-trace.json` | Source of Truth | Ground Truth | 2026-05 | File-based immutable trace of full checkout journey; 610-line JSON array | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
When a bug occurs in a Next.js 15 App Router application, the developer (or AI agent) must reconstruct the exact sequence of events across server components, server actions, API routes, and client interactions. Without structured traces, this is guesswork.

### Underlying Constraints
1. **Server/client boundary opacity** — Server Actions and Server Components run on Node.js; client components run in the browser. Logs are split by runtime.
2. **React 18 Strict Mode double invocation** — Functions run twice in development; console output is not suppressed anymore, creating noise.
3. **`error.tsx` digest limitation** — Client-side error boundaries only receive an opaque `digest` string, not the original server error.
4. **AI context window limits** — Cascade/Windsurf agents have limited context. Dumping 10MB of unstructured logs is useless.
5. **Next.js 15 request lifecycle complexity** — A single page load may involve: middleware → layout (RSC) → page (RSC) → nested RSC fetches → client hydration → server action → route handler → external API.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Console logging** | Zero setup, instant feedback | Unstructured, lost on deploy, unreadable by AI | Never for production debugging; acceptable for quick local checks only |
| **File-based JSON trace** (`latest-checkout-trace.json`) | Immutable, chronological, easy to read/feed to AI, zero dependencies | Local only, no aggregation, manual cleanup | **Primary for local AI debugging** — exact fit for Windsurf workflow |
| **Redis-backed event log** (`event-logger.ts`) | Persistent across reloads, retrievable via API, TTL auto-cleanup | Requires Redis infra, network latency, harder to "just grep" | Production / shared environments; good for team debugging |
| **Full OpenTelemetry** | Vendor-neutral, spans/traces/metrics, auto-instrumentation | Heavy setup, overkill for local debugging, steep learning curve | Production observability pipeline; defer until needed |
| **Pino structured logger** | Fast, JSON output, isomorphic, ecosystem standard | Adds dependency, requires configuration, still needs transport | When you need a mature logger library and don't mind a dependency |

### Failure Modes
1. **Misapplication:** Using `console.log` inside Server Actions and expecting to see it in production logs (Vercel strips these; only `error.tsx` digest reaches client).
2. **Over-application:** Deploying full OpenTelemetry + SigNoz for a local debugging workflow — adds complexity with no local benefit.
3. **Under-application:** Not capturing the `traceId` at the entry point (middleware or first server component), making cross-layer correlation impossible.

---

## Code Fundamentals

### Fundamental: Next.js 15 `instrumentation.js` + `onRequestError`

**Claim:** Next.js 15 provides a stable server lifecycle hook to capture all server errors with full context.

**Verification:**
- [x] Located in our codebase: Not yet implemented (opportunity).
- [x] Source inspected: https://nextjs.org/blog/next-15 — `onRequestError(err, request, context)` receives `router` (App/Pages), `serverContext` (Server Component / Server Action / Route Handler / Middleware).

**Actual Behavior:**
When an error is thrown in a Server Action, Next.js catches it and renders the nearest `error.tsx`. In production, the client only receives a `digest` hash. `onRequestError` is the **only** place where the original `Error` object, stack trace, and request context coexist.

**Edge Cases:**
1. `onRequestError` runs **after** the response is sent — safe for async logging but cannot modify the response.
2. Errors in `middleware.ts` are also captured here.
3. Client-side React errors are NOT captured here; use `window.onerror` or error boundary `useEffect` for those.

### Fundamental: React 18 Strict Mode & Double Logging

**Claim:** React 18 no longer suppresses `console.log` during double invocation in Strict Mode.

**Verification:**
- [x] Source inspected: https://react.dev/reference/react/StrictMode — "React 18 does not suppress any logs."

**Actual Behavior:**
Every `console.log` inside a component, hook, or server function may appear twice in development. This makes console-based debugging noisy and unreliable for chronological reconstruction.

**Implication for AI Debugging:**
File-based append-only traces (like `latest-checkout-trace.json`) are immune to this noise because they are explicit writes, not console captures.

### Fundamental: Sanity v3 Client Has No Built-in Query Logging

**Claim:** Sanity's client does not automatically log GROQ queries, parameters, or response times.

**Verification:**
- [x] Located in our codebase: `sanity-cms/lib/client.ts`, `sanity-cms/lib/checkoutClient.ts`, `sanity-cms/lib/backendClient.ts` — no logging hooks.
- [x] Docs inspected: https://www.sanity.io/docs/content-lake/groq-introduction — no mention of automatic query telemetry.

**Actual Behavior:**
If a GROQ query is slow or returns unexpected data, you must wrap the client call yourself to capture: query string, parameters, execution time, and result shape.

---

## Best Practices (Verified)

### Practice 1: One Immutable File Per User Journey
**Consensus:** High — matches existing `latest-checkout-trace.json` pattern.

**Supporting Evidence:**
- Existing codebase: `latest-checkout-trace.json` captures 20+ steps of checkout flow in strict chronological order.
- Google DevTools blog (2025): Token-optimized data formats enable longer conversation history and more accurate AI answers.

**Counter-Evidence:**
- File I/O is blocking in Node.js; for high-traffic production, use async streams or Redis.

**Verdict:** ✅ Recommended for local debugging and low-frequency journeys (checkout, onboarding).

**Implementation:**
- Use `fs.appendFileSync` or `fs.promises.appendFile` to write NDJSON or JSON array entries.
- Include `traceId`, `timestamp`, `step`, `layer` (server-component | server-action | api-route | client), and raw `data`.
- Reset the file at journey start (`fs.writeFileSync(path, '[]')`).

### Practice 2: Correlation ID (Trace ID) Propagation
**Consensus:** High — appears in OpenTelemetry, LLM observability, and our existing `event-logger.ts`.

**Supporting Evidence:**
- `lib/dev/event-logger.ts:167` — `generateCheckoutSessionId()` returns `chk_<timestamp>_<random>`.
- Langfuse docs: "Trace IDs must capture rich context and link cross-system traces."
- Next.js 15 default spans include `next.route` for correlation.

**Counter-Evidence:**
- Manual propagation is error-prone; forgetting to pass `traceId` into a nested Server Action breaks the chain.

**Verdict:** ✅ Recommended — automate via AsyncLocalStorage (Node.js native) or a thin wrapper.

**Implementation:**
```typescript
// lib/logging/trace-context.ts
import { AsyncLocalStorage } from 'async_hooks';
export const traceStorage = new AsyncLocalStorage<string>();

// In Server Action or API route:
traceStorage.run(traceId, async () => {
  await someNestedFunction(); // can retrieve traceId without passing it
});
```

### Practice 3: Capture Raw Inputs/Outputs, Never Summaries
**Consensus:** High — matches the framed objective's "intercept inputs and outputs exactly as they are."

**Supporting Evidence:**
- Existing trace file shows raw AlleKurier payloads, Stripe PaymentIntent metadata, and Sanity product counts.
- LLM observability research: "Debugging an LLM requires knowing the prompt version, the specific chunks retrieved, intermediate outputs."

**Counter-Evidence:**
- Raw payloads may contain PII (emails, addresses). Sanitize before logging in production.

**Verdict:** ✅ Recommended — with a `sanitize` pass for PII.

**Implementation:**
- Log arguments before mutation.
- Log return values before returning.
- Log errors with `error.message`, `error.stack`, and `error.cause`.
- Never log "it worked" — log the actual data that proves it worked.

### Practice 4: Structured JSON Over Pretty-Printed Text
**Consensus:** High — every authoritative source agrees.

**Supporting Evidence:**
- Next.js GitHub Discussion #62261: JSON logs are the only way to pass structured data to Datadog/Splunk.
- Pino / Vercel template: JSON is the default output.
- Chrome DevTools blog: "Optimized format enables a performance agent that can maintain a longer conversation history."

**Counter-Evidence:**
- JSON is harder for humans to read in raw terminal output.

**Verdict:** ✅ Recommended — use NDJSON or compact JSON arrays. Pretty-print only when rendering for humans.

### Practice 5: Layer Annotation in Every Log Entry
**Consensus:** Medium — specific to Next.js 15's multi-layer architecture.

**Supporting Evidence:**
- Next.js 15 default spans distinguish: `BaseServer.handleRequest`, `AppRender.getBodyResult`, `AppRouteRouteHandlers.runHandler`.
- Our existing checkout trace mixes server and client steps without explicit layer tags.

**Verdict:** ✅ Recommended.

**Implementation:**
Add `layer` field to every trace entry:
- `middleware`
- `server-component`
- `server-action`
- `api-route`
- `client-component`
- `client-event`
- `webhook`

### Practice 6: Server Action Error Logging via `onRequestError`
**Consensus:** High — canonical Next.js 15 pattern.

**Supporting Evidence:**
- Next.js 15 blog: `onRequestError(err, request, context)` captures full server error + context.
- GitHub Discussion #62261: "I am unable to capture error logs from exceptions that occur in server components... I wish to inspect the details."

**Verdict:** ✅ Recommended — create `instrumentation.ts` today.

**Implementation:**
```typescript
// instrumentation.ts
export async function onRequestError(err, request, context) {
  const traceId = request.headers.get('x-trace-id') || 'unknown';
  await appendToTraceFile({
    traceId,
    layer: context.serverContext, // 'Server Action' | 'Server Component' | etc.
    step: 'error',
    timestamp: new Date().toISOString(),
    data: {
      message: err.message,
      stack: err.stack,
      digest: err.digest,
      route: request.url,
    },
  });
}
```

---

## Common Solutions Landscape

### Solution: `console.log` Everywhere
**Prevalence:** Ubiquitous
**Type:** Anti-pattern in AI era

**Pros:**
- Zero setup

**Cons:**
- React 18 Strict Mode doubles output
- Lost in production (Vercel doesn't persist stdout from Server Components)
- Unstructured — AI cannot correlate or query
- No trace ID propagation

**Recommendation:** ❌ Eliminate from Server Actions and Server Components. Use structured trace writes instead.

### Solution: Pino + `pino-pretty`
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Fast, structured, isomorphic
- Rich ecosystem (transports, serializers)

**Cons:**
- Adds dependency
- Requires config for Next.js App Router (Edge runtime issues)
- Still needs a transport to be useful for AI debugging

**Recommendation:** ⚠️ Use if you need a mature logger library. Skip if zero-dependency is a constraint.

### Solution: Redis List (Current `event-logger.ts`)
**Prevalence:** Niche (project-specific)
**Type:** Workaround that became infrastructure

**Pros:**
- Persistent across dev server restarts
- Retrievable via `/api/checkout-logs/[traceId]`
- TTL prevents unbounded growth

**Cons:**
- Requires Redis connection (fails without env vars)
- Not local-file-grepable
- `lpush` + `lrange` + `reverse()` is awkward for chronological reads

**Recommendation:** ✅ Keep for production/shared environments. Complement with local file trace for offline debugging.

### Solution: File-Based Trace (Current `latest-checkout-trace.json`)
**Prevalence:** Project-specific
**Type:** Idiomatic for this project's constraints

**Pros:**
- Zero dependencies
- Immutable chronological record
- Perfect for AI context ingestion (single file, JSON array)
- Works offline

**Cons:**
- Not suitable for concurrent multi-user production loads
- File size grows unbounded without rotation

**Recommendation:** ✅ **Primary recommendation for Windsurf/Cascade debugging.**

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Next.js 15 `instrumentation.js` is stable | Next.js 15 blog | Official docs |
| React 18 does not suppress double logs | react.dev StrictMode | Official docs |
| Sanity v3 client has no built-in query logging | `sanity-cms/lib/client.ts` | Source inspection |
| `error.tsx` only receives digest in production | GitHub Discussion #62261 | Community consensus |
| Structured JSON is optimal for AI context | Chrome DevTools blog, Langfuse docs | Authoritative voice |
| Existing trace file works and is useful | `latest-checkout-trace.json` | Ground truth (610 lines) |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "You need OpenTelemetry for proper tracing" | Our existing file-based trace reconstructs full journeys without OTel | Survived — OTel is overkill for local AI debugging |
| "Redis is better than files for everything" | Files are grep-able, offline, zero-latency, and require no infra | Survived — Redis is a complement, not a replacement |
| "Pino is mandatory for structured logging" | Native `fs` + JSON achieves the same with zero deps | Survived — Pino is optional |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Next.js 15 `instrumentation.js` | Low | 2027-05 |
| React 18 Strict Mode | Low | 2027-05 |
| AI token efficiency recommendations | High | 2026-11 |
| Sanity v3 client behavior | Low | 2027-05 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Create `instrumentation.ts`** | `onRequestError` is the only canonical way to capture original server errors with context | Add at project root; log to `latest-checkout-trace.json` |
| **Add `layer` field to all traces** | Next.js 15 has 4+ execution layers; AI needs to know which layer failed | Update `lib/dev/event-logger.ts` and file trace logic |
| **Use AsyncLocalStorage for traceId** | Eliminates manual propagation bugs across Server Actions | `lib/logging/trace-context.ts` |
| **Keep `latest-checkout-trace.json` as primary dev artifact** | Zero deps, fits in context window, proven to work | Enhance with `layer`, `durationMs`, `error.stack` |
| **Wrap Sanity client calls** | Sanity has no native query logging; slow/buggy queries are invisible | Add timing + query logging in `sanity-cms/lib/` clients |
| **Sanitize PII before trace write** | Raw traces currently capture emails, addresses, names | Add `sanitize(data)` that redacts known PII fields |
| **Eliminate `console.log` from checkout Server Actions** | Replaced by structured trace writes | Audit `app/actions/checkout/` |

### Immediate Actions

1. **Create `instrumentation.ts`** with `onRequestError` hook that writes to `latest-checkout-trace.json`.
2. **Add `layer` field** to existing trace schema (backward-compatible — add key, don't remove).
3. **Create `lib/logging/trace-context.ts`** using `AsyncLocalStorage` for automatic `traceId` propagation.
4. **Wrap Sanity clients** with a timer + trace logger that records GROQ query + params + duration + row count.
5. **Add `sanitize.ts`** utility to strip `email`, `street`, `postalCode`, `phone`, etc. from trace payloads.

### Open Questions

1. Should we migrate `latest-checkout-trace.json` to NDJSON (newline-delimited JSON) for easier append semantics and corruption resilience?
2. What is the maximum safe file size before context window overflow? (Current: ~610 lines = ~25KB — well within limits.)
3. Should client-side events also write to the same trace file via the `/api/trace` route, or keep a separate client-side buffer?

---

## Appendix: AI-Optimized Log Schema

Recommended JSON shape for every trace entry:

```json
{
  "timestamp": "2026-05-26T13:24:55.398Z",
  "traceId": "chk_1779801895033_rr2ymmb",
  "layer": "server-action",
  "step": "address_validation_result",
  "durationMs": 42,
  "data": { "status": "ACCEPT" },
  "error": null,
  "meta": {
    "route": "/checkout/shipping",
    "sanityQuery": null,
    "externalApi": null
  }
}
```

Rules:
- **Always include `traceId`** — no exceptions.
- **Always include `layer`** — AI cannot guess runtime context.
- **`data` must be raw, not summarized** — AI needs original payloads to spot bugs.
- **`error` must include `.stack` in dev** — digest alone is useless for debugging.
- **Use `durationMs`** — performance bugs are bugs.
- **Keep keys stable** — AI agents learn schemas; changing keys breaks prompt stability.
