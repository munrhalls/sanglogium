# Logging Patterns Research 2026

> **Retrieval Date:** 2026-05-27
> **Researcher:** AI/Human collaboration
> **Decay Risk:** Medium — Next.js logging config evolves; Stripe/Redis APIs are stable
> **Next Review:** 2026-08-27

## Executive Summary

- **Problem:** Next.js 15 Server/Client Component boundary fragments logs across terminal and browser console with no unified view.
- **Current State:** Backend Redis-based checkout logging works (`lib/dev/event-logger.ts`); frontend uses scattered `console.log` with no trace correlation.
- **Recommended Pattern:** Minimal frontend wrapper with traceId prefix → unified retrieval API. Avoid heavy log libraries (Pino/Winston) in browser.
- **Immediate Actions:** (1) Add `lib/frontend-logger.ts` with traceId from cookie/session, (2) Add `app/api/logs/[traceId]/route.ts` for unified retrieval.

---

## Research Scope Contract
- **Topic:** Simplest, most robust logging patterns for Next.js 15/React 18 with Server/Client Component boundary awareness
- **First Principles:**
  1. Logs must be attributable to a single user request/trace across frontend and backend
  2. Browser environment lacks Node.js APIs — logger must be environment-agnostic or split
  3. Zero-friction debugging means minimal setup, not zero setup
- **Fundamentals:** Server Component log routing, Client Component log capture, trace correlation, Redis buffering, sendBeacon reliability
- **Scope Boundary:** OUT: production log aggregation services (Datadog, Splunk), APM tools (Sentry), OpenTelemetry full stack. IN: simple in-house patterns using existing Redis infrastructure.
- **Target Audience:** Developers debugging checkout flow and frontend-backend interactions
- **Decay Risk:** Medium — Next.js logging config changes; framework versions evolve

---

## Scope
Simplest, most robust logging patterns for Next.js 15/React 18 applications with focus on:
- Server vs Client Components
- Logging across render tree
- 0 friction debugging and live checks
- Trace correlation across frontend and backend

## First Principles Analysis

### Core Problem Being Solved
Next.js 15's Server/Client Component boundary splits a single page's execution across two runtimes (server terminal + browser console), making debugging a single user flow require looking in two places with no guaranteed correlation.

### Underlying Constraints
1. **HTTP is stateless** — each request is independent; correlation must be explicitly injected
2. **Browser ≠ Node.js** — `AsyncLocalStorage`, `fs`, `process.stdout` unavailable in browser; logger must be runtime-aware or split
3. **Edge runtime is limited** — middleware and edge functions cannot use Node.js-specific loggers

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Next.js built-in forwarding (`browserToTerminal`) | Zero setup, works in dev | Dev-only, no production visibility, no structured data | Quick local debugging |
| Full OpenTelemetry + custom Logger | Automatic trace correlation, structured data, production-ready | Complex setup, OpenTelemetry dependency, overkill for small projects | Large teams, production observability |
| Simple console wrapper + traceId prefix | Minimal friction, works everywhere, trace correlation | No structured data, manual traceId management | Small projects, existing Redis infrastructure |

### Failure Modes
1. **Misapplication:** Using Pino/Winston in browser → bundler errors or missing APIs
2. **Over-application:** Setting up full OpenTelemetry for a 3-page checkout flow → maintenance burden exceeds value
3. **Under-application:** Relying only on `console.log` in production → no historical logs, no correlation across requests

---

## Next.js 15 Built-in Logging Configuration

### Development Logging Options
```javascript
// next.config.ts
export default {
  logging: {
    // Forward browser console logs to terminal
    browserToTerminal: true, // or 'warn', 'error', false

    // Server function logging (default: true)
    serverFunctions: false, // disable if noisy

    // Incoming request logging
    incomingRequests: {
      ignore: [/\/api\/v1\/health/], // filter specific routes
    },
    // incomingRequests: false, // disable entirely

    // Fetch logging
    fetches: {
      fullUrl: true, // log full URLs
      hmrRefreshes: true, // log HMR cache refreshes
    },
  },
}
```

### Key Behavior
- **Server Component logs** → Terminal (forwarded to browser console in dev mode - intentional feature)
- **Client Component logs** → Browser console (forwarded to terminal if `browserToTerminal: true`)
- **Source location** included automatically: `[browser] Hello World (app/page.tsx:8:17)`

## Server vs Client Component Logging

### The Fragmentation Problem
Next.js apps are a mix of Server and Client Components that render a single page but log to different places:
- Server Components → Server terminal
- Client Components → Browser console
- No unified view without additional tooling

### Solutions

#### Option 1: Next.js Built-in Forwarding (Simplest)
```javascript
// next.config.ts
logging: { browserToTerminal: true }
```
- **Pros**: Zero setup, built-in, works in dev
- **Cons**: Dev only, no production visibility, no structured data

#### Option 2: Custom Logger with Trace Correlation
```typescript
// lib/logger.ts
class Logger {
  private getTraceContext() {
    const span = trace.getActiveSpan()
    if (!span) return {}
    const { traceId, spanId } = span.spanContext()
    return { traceId, spanId }
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: { ...this.getTraceContext(), ...context },
    }
    if (typeof window === 'undefined') {
      // Server: send to log exporter
      exportLogEntry(entry)
    } else {
      // Browser: buffer and send to API
      browserLogger.info(message, context)
    }
  }
}
```
- **Pros**: Automatic trace correlation, structured data, works in production
- **Cons**: Requires OpenTelemetry setup, more complex

#### Option 3: Simple Console Wrapper (Current Approach + TraceId)
```typescript
// lib/simple-logger.ts
export function log(message: string, context?: Record<string, unknown>) {
  const traceId = getTraceIdFromSession() // from iron-session or cookie
  const prefix = traceId ? `[${traceId}] ` : ''
  console.log(`${prefix}${message}`, context)
}
```
- **Pros**: Minimal friction, works everywhere, trace correlation
- **Cons**: No structured data, manual traceId management

## Browser Logging Challenges

### Problem
Most loggers (Pino, Winston) assume Node.js APIs:
- `AsyncLocalStorage` - not available in browser
- `fs` - not available in browser
- Edge runtimes - don't support Node.js loggers

### Solution: Separate Browser Logger
```typescript
// lib/browser-logger.ts
'use client'

class BrowserLogger {
  private logs: LogEntry[] = []
  private flushInterval = 10000 // 10 seconds

  constructor() {
    setInterval(() => this.flush(), this.flushInterval)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flush()
    })
  }

  private flush() {
    if (this.logs.length === 0) return

    const logsToSend = this.logs
    this.logs = []

    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(logsToSend)], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/logs', blob)
    } else {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logsToSend),
        keepalive: true,
      })
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: this.enrich(context),
    })
  }

  private enrich(context?: Record<string, unknown>) {
    const span = trace.getActiveSpan()
    const ctx = span?.spanContext()
    return {
      traceId: ctx?.traceId ?? 'no-trace',
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    }
  }
}
```

## React-Specific Patterns

### Render Frequency Monitoring
```typescript
function useLogRenders(componentName: string) {
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current += 1
    Logger.debug(`${componentName} rendered`, {
      count: renderCount.current,
    })
  })
}

// Usage
function ExpensiveComponent(props) {
  useLogRenders('ExpensiveComponent')
  // ...
}
```

### Error Boundaries with Logging
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: ErrorInfo) {
    Logger.error('React error boundary caught error', {
      error,
      componentStack: info.componentStack,
    })
  }
}
```

### Contextual Logging
```typescript
// Bad
Logger.error('Payment failed')

// Good
Logger.error('Payment processing failed', {
  userId: '123',
  amount: 99.99,
  currency: 'USD',
  errorCode: 'INSUFFICIENT_FUNDS',
  timestamp: new Date().toISOString(),
})
```

## Code Fundamentals

### Fundamental: Server Component Log Routing
**Claim:** Server Component logs go to terminal; browser console only sees Client Component logs unless `browserToTerminal: true`.

**Verification:**
- [x] Located in our codebase: `next.config.ts` (logging config), `app/(store)/checkout/payment/page.tsx` (Server Component)
- [ ] Test created: No automated test for log routing
- [x] Source inspected: Next.js 15 docs — `logging.browserToTerminal` forwards browser logs to terminal in dev

**Actual Behavior:**
- Server Component `console.log` → terminal only (browser console does NOT see it)
- Client Component `console.log` → browser console (forwarded to terminal if `browserToTerminal: true`)
- Source location included automatically: `[browser] Hello World (app/page.tsx:8:17)`

**Edge Cases:**
1. Production: `browserToTerminal` does NOT work — browser logs stay in browser
2. HMR refreshes: can produce duplicate logs if `hmrRefreshes: true`

### Fundamental: Trace Correlation via iron-session
**Claim:** A traceId stored in the encrypted iron-session cookie can be shared across Server Components, Client Components, and API routes.

**Verification:**
- [x] Located in our codebase: `lib/session.ts` (iron-session config), `lib/dev/event-logger.ts` (uses correlationId from session)
- [x] Test created: Manual — checkout traces show consistent `traceId` across payment page, return handler, and success page
- [ ] Source inspected: Not verified against iron-session source code

**Actual Behavior:**
- `lib/dev/event-logger.ts` reads `req.session?.traceId` or generates `chk_${timestamp}_${random}`
- TraceId persists across the full checkout flow because iron-session cookie is HTTP-only and encrypted

**Edge Cases:**
1. Session expiry mid-flow → new traceId generated, correlation broken
2. Concurrent checkouts in same browser → same session, same traceId (acceptable for single-user flow)

### Fundamental: Browser Log Buffering with sendBeacon
**Claim:** `navigator.sendBeacon` reliably sends logs on page unload without blocking navigation.

**Verification:**
- [ ] Located in our codebase: Not yet implemented
- [ ] Test created: No
- [x] Source inspected: MDN — `sendBeacon` is designed for analytics/log delivery on unload; returns boolean indicating queue success

**Actual Behavior:**
- `sendBeacon` POSTs data asynchronously; browser guarantees delivery attempt even after page unload
- Fallback to `fetch(..., { keepalive: true })` for browsers without sendBeacon

**Edge Cases:**
1. Very large payload (>64KB) — sendBeacon may fail silently
2. No network connection — data lost; needs local buffering for retry

---

## Simplest Robust Pattern (Recommended)

### For This Project (0 Friction Focus)

#### Backend (Already Works)
- Keep `lib/dev/event-logger.ts` (Redis-based with correlationId)
- Keep `scripts/get-trace.mjs` for retrieval
- Keep `scripts/clear-redis-logs.mjs` for cleanup

#### Frontend (Add Minimal Wrapper)
```typescript
// lib/frontend-logger.ts
'use client'

export function log(message: string, context?: Record<string, unknown>) {
  // Try to get traceId from session (if available)
  const traceId = getTraceIdFromCookie() || 'no-trace'
  const prefix = `[${traceId}] `

  console.log(`${prefix}${message}`, context)

  // Optional: send to backend for unified storage
  if (process.env.NODE_ENV === 'development') {
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        traceId,
        message,
        context,
      }),
    })
  }
}

// Helper to get traceId from cookie
function getTraceIdFromCookie(): string | null {
  // Read from iron-session cookie or custom traceId cookie
  // Implementation depends on session setup
  return null
}
```

#### Unified Retrieval API
```typescript
// app/api/logs/[traceId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { traceId: string } }
) {
  const { traceId } = params

  // Get backend logs from Redis
  const backendLogs = await getCheckoutEvents(traceId)

  // Get frontend logs (if stored)
  const frontendLogs = await getFrontendLogs(traceId)

  return Response.json({
    traceId,
    backendLogs,
    frontendLogs,
  })
}
```

## Best Practices (Verified)

### Practice: TraceId Correlation for All Logs
**Consensus:** High — appears in every authoritative source (Next.js docs, OpenTelemetry docs, observability blogs)

**Supporting Evidence:**
- Next.js 15 logging docs: source locations automatically included with `[browser]` prefix
- OpenTelemetry: trace/span context is the foundational correlation mechanism
- Sentry blog: "Logging in Next.js is hard" — root cause is split runtimes, solution is explicit correlation IDs

**Counter-Evidence (Falsification Attempts):**
- Single-page apps without server components don't need trace correlation (correlation is trivial in SPA)
- Counter: Our app IS a Next.js app with Server Components, so this applies

**Verdict:** ✅ Recommended

**When to Use:** Any Next.js app with both Server and Client Components on the same page
**When to Skip:** Pure SPA or static site with no server-side rendering

---

### Practice: Avoid Node.js Loggers in Browser
**Consensus:** High — Pino and Winston docs both state browser support is limited or requires separate browser bundles

**Supporting Evidence:**
- Pino docs: "Pino is a Node.js logger"; browser support via `pino-browser` is a separate package with reduced features
- Winston docs: no native browser support; requires polyfills for `fs`, `path`

**Counter-Evidence (Falsification Attempts):**
- `pino-browser` exists and works — could bundle a lightweight version
- Counter: Adds ~10KB+ to bundle, still lacks `AsyncLocalStorage` for trace context, not worth it for simple use case

**Verdict:** ✅ Recommended — avoid; use minimal wrapper instead

**When to Use:** Never for browser logging in this project
**When to Skip:** N/A

---

### Practice: Buffer Browser Logs + sendBeacon on Unload
**Consensus:** Medium — MDN recommends it; some community sources prefer WebSocket for real-time streaming

**Supporting Evidence:**
- MDN: `navigator.sendBeacon` "is used to asynchronously transfer a small amount of data over HTTP to a web server"
- Google Analytics, Plausible, and other analytics tools use beacon or similar patterns

**Counter-Evidence (Falsification Attempts):**
- WebSocket provides real-time streaming and bidirectional communication
- Counter: WebSocket is overkill for one-way log shipping; adds connection management complexity; sendBeacon is simpler and sufficient

**Verdict:** ✅ Recommended

**When to Use:** Shipping logs from browser to backend API
**When to Skip:** Real-time log streaming needed (use WebSocket instead)

## Common Solutions Landscape

### Solution: Next.js Built-in `browserToTerminal` Forwarding
**Prevalence:** Common among Next.js developers in local development
**Type:** Idiomatic (for dev debugging)

**Pros:**
- Zero setup, single config line
- Automatically includes source location

**Cons:**
- Dev-only; no production visibility
- No structured data or filtering
- Can be noisy with HMR refreshes

**Real-World Pain Points:**
- Developers assume it works in production, then lose all browser logs
- Cannot correlate a specific user session across server and browser logs

**Recommendation:** Use for local debugging only. Do not rely on it for production or checkout flow tracing.

---

### Solution: Full OpenTelemetry + Custom Logger Class
**Prevalence:** Niche in small projects; common in enterprise
**Type:** Idiomatic (for large-scale observability)

**Pros:**
- Automatic trace/span correlation across all runtimes
- Structured data, production-ready
- Works with Jaeger, Zipkin, SigNoz backends

**Cons:**
- Complex setup: collector, instrumentation, exporter configuration
- Adds dependencies and bundle size
- Overkill for a single checkout flow

**Real-World Pain Points:**
- Setup can take days; ongoing maintenance non-trivial
- Next.js instrumentation API is still evolving; breaking changes between versions

**Recommendation:** Avoid for this project. Scope is too small to justify the infrastructure.

---

### Solution: Simple Console Wrapper with traceId Prefix (Current Approach + Enhancement)
**Prevalence:** Common in small-to-medium projects with custom needs
**Type:** Workaround (not a framework-provided solution, but effective)

**Pros:**
- Minimal friction, works everywhere
- No new dependencies
- Leverages existing Redis infrastructure
- Trace correlation with single string prefix

**Cons:**
- No structured data (just string + object dump)
- Manual traceId management
- No log levels or filtering without extra code

**Real-World Pain Points:**
- `console.log` in production can be noisy; needs level filtering
- No automatic log rotation or retention

**Recommendation:** ✅ **Use this** — best fit for current project size and existing Redis backend.

---

## Current System Assessment

### What Works
- Backend checkout logging with Redis (event-logger.ts)
- TraceId generation and correlation
- Log retrieval scripts (get-trace.mjs)
- Log cleanup scripts (clear-redis-logs.mjs)

### What's Missing
- Frontend structured logging (currently scattered console.log)
- Frontend-backend log correlation (no shared traceId)
- Unified log retrieval API
- Zero-friction frontend log capture

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use minimal frontend wrapper with traceId prefix | First principle: browser ≠ Node.js; existing Redis infrastructure; zero new dependencies | Create `lib/frontend-logger.ts` — `'use client'`, reads traceId from cookie/session, prefixes console.log |
| Add unified retrieval API | Trace correlation requires single endpoint for both frontend and backend logs | Create `app/api/logs/[traceId]/route.ts` — reads Redis backend logs + any stored frontend logs |
| Avoid OpenTelemetry for now | Overkill for single checkout flow; adds complexity without proportional value | Re-evaluate if project grows beyond checkout flow or needs production observability |
| Keep existing Redis backend logging | Already works, verified, scripts exist | No change to `lib/dev/event-logger.ts`, `scripts/get-trace.mjs`, `scripts/clear-redis-logs.mjs` |

### Immediate Actions
1. **Create `lib/frontend-logger.ts`** — `'use client'` wrapper with traceId prefix from iron-session cookie
2. **Create `app/api/logs/[traceId]/route.ts`** — unified GET endpoint for frontend+backend log retrieval
3. **Wire traceId into checkout flow** — ensure `PaymentForm.client.tsx` and return handler share same traceId

### Open Questions (Research Gaps)
1. What is the exact cookie format for reading traceId from iron-session on the client? (requires inspecting session.ts or testing)
2. Should frontend logs be buffered in Redis or just sent to API endpoint and discarded?
3. What log level filtering should apply in production vs development?

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Server Component logs go to terminal, not browser | Next.js 15 docs + observed behavior | Documentation + runtime observation |
| `browserToTerminal` is dev-only | Next.js 15 docs explicitly state | Documentation |
| `sendBeacon` works for unload delivery | MDN docs + Google Analytics usage pattern | Documentation + industry precedent |
| Backend Redis logging works end-to-end | `scripts/get-trace.mjs` successfully retrieves checkout traces | Manual test |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| OpenTelemetry is the best solution | Setup complexity too high for single checkout flow; Next.js instrumentation API unstable | Abandoned for this project |
| Pino browser bundle is viable | Adds bundle size, still lacks `AsyncLocalStorage`, separate package required | Abandoned |
| WebSocket is better than sendBeacon | WebSocket adds connection management; sendBeacon is simpler and sufficient for one-way logs | Survived — sendBeacon preferred |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Next.js 15 Built-in Logging | High | 2026-08-27 — Next.js versions change logging behavior frequently |
| sendBeacon API | Low | 2027-05-27 — Stable web standard |
| OpenTelemetry recommendations | Medium | 2026-11-27 — Ecosystem evolving rapidly |
| Redis logging backend | Low | 2027-05-27 — Redis and ioredis are stable |

---

## Confidence Assessment

| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | High | Based on HTTP statelessness, browser/Node.js runtime differences, edge constraints — fundamentals don't change |
| Code Fundamentals | Medium-High | Verified against Next.js 15 docs, MDN, manual runtime observation; some items not tested with automated tests |
| Best Practices | High | Strong consensus across Next.js docs, OpenTelemetry docs, Sentry blog, community sources; falsification attempts completed |
| Common Solutions | High | All three options evaluated with tradeoffs, pain points, and explicit recommendations |
| Current System Assessment | High | Direct observation of working `event-logger.ts`, `get-trace.mjs`, checkout traces in Redis |

---

## References
- Next.js 15 Logging Config: https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
- Structured Logging with OpenTelemetry: https://signoz.io/blog/opentelemetry-nextjs-logging/
- Sentry Next.js Logging: https://blog.sentry.io/logging-in-next-js-is-hard-but-it-doesnt-have-to-be/
- React Logging Best Practices: https://last9.io/blog/react-logging/
