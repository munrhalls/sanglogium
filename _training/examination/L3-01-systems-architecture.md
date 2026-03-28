# Layer 3: Systems Architecture Examination

## Prerequisites (ALL Required)
- [ ] All L1 examinations passed
- [ ] All L2 examinations passed
- [ ] Codebase navigation competency

## Section A: End-to-End System Map (30 min)

### A1: Request Lifecycle

Trace a product page request from DNS to pixels:

```
Browser → DNS → CDN → __________ → __________ → __________ → Response

For each hop, specify:
- Technology involved
- Caching layer
- Failure mode
- Performance budget
```

Your complete trace:
```





















```

### A2: Data Flow Architecture

Map content from Sanity to displayed page:

```
Sanity Studio → __________ → __________ → __________ → DOM

Transformation at each step:
- Content model → _______
- Query → _______
- Server Component → _______
- Client hydration → _______
```

## Section B: Architectural Decisions Analysis (30 min)

### B1: Server vs Client Architecture

Your codebase defaults to Server Components. Justify this decision:

**For:**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**Against (trade-offs accepted):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**When would you break the pattern?**
```






```

### B2: State Management Strategy

Your app uses Zustand + Server Components. Map state to solution:

| State Type | Solution | Example in App |
|------------|----------|----------------|
| Server-fetched | | |
| User session | | |
| Shopping basket | | |
| Form data | | |
| UI state | | |

**Why not Redux?** ___________________________________________

### B3: Caching Strategy

Map your caching layers:

```
Layer: Sanity CDN
TTL: _____
Invalidation: _____
Use case: _____

Layer: Next.js Data Cache
TTL: _____
Invalidation: _____
Use case: _____

Layer: Browser Cache
TTL: _____
Invalidation: _____
Use case: _____
```

## Section C: Failure Analysis (25 min)

### C1: Single Points of Failure

Identify components that would take down the site:

1. _________________________________ (mitigation: _____________)
2. _________________________________ (mitigation: _____________)
3. _________________________________ (mitigation: _____________)

### C2: Cascading Failure Scenarios

Trace: Sanity API outage → __________ → __________ → User impact

```










```

**Circuit breaker needed?** _________________________________

### C3: Performance Degradation

Identify bottlenecks at scale:

```
Current risk: _________________________________

At 10x traffic:
- Breaks: _________________________________
- Degrades: _________________________________
- Scales: _________________________________

Prevention:
1. ___________________________________________
2. ___________________________________________
```

## Section D: Evolution Planning (20 min)

### D1: Technical Debt Inventory

| Debt | Risk Level | Effort to Fix | When to Address |
|------|------------|---------------|-----------------|
| Brand as string (not ref) | | | |
| Any types | | | |
| Missing tests | | | |
| Other: _________ | | | |

### D2: Migration Strategy

Plan: Migrate brand from string to reference.

```
Phase 1: ________________________________
Phase 2: ________________________________
Phase 3: ________________________________
Rollback plan: ____________________________
```

### D3: Feature Scaling

How would you add real-time inventory?

```
Architecture changes:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

New technologies needed:
- ___________________________________________
- ___________________________________________
```

## Section E: Security Analysis (15 min)

### E1: Attack Vectors

| Vector | Current Protection | Gap |
|--------|-------------------|-----|
| XSS | | |
| CSRF | | |
| Injection | | |
| Data exposure | | |

### E2: Clerk Integration Security

How is auth state secured?
```
Token storage: _________________________________
Refresh strategy: _________________________________
Session expiration: _________________________________
```

## Final Systems Attestation

**I can architect and justify:**
- [ ] End-to-end data flow
- [ ] Caching strategy
- [ ] Failure handling
- [ ] Security posture
- [ ] Evolution roadmap

**Critical systems gaps:**
- [ ] ___________________________________________
- [ ] ___________________________________________

**Signed:** _________________ **Date:** _________

## Cross-Reference
**Prerequisites:** All L1, All L2
**Dependents:** Production readiness, team leadership
**Sources:** Your codebase, Next.js architecture docs
