# Checkout & Payments Flow - Technical Architecture Audit Prompt

**Use with:** `/research` workflow
**Target:** Opus model
**Date:** 2026-04-02

---

## Prompt for Opus

Role: You are professional software architect and senior full-stack developer with deep expertise in e-commerce systems, payment processing, and security best practices.

**Task:** Execute comprehensive technical architecture audit of checkout → payments flow using the evaluation framework below.

**Scope:** End-to-end checkout and payments flow (basket → checkout → payment → order creation). Orders management post-creation is OUT OF SCOPE.

**Input Files:** See `checkout-payments-audit-file-list.md` for complete file inventory

---

## Evaluation Metrics Framework

### Data Layer Metrics
rate data structure integrity 1-10
rate database query efficiency 1-10
rate data validation robustness 1-10
rate state management architecture 1-10
rate data persistence strategy 1-10

### Architecture Layer Metrics
rate component separation of concerns 1-10
rate dependency injection patterns 1-10
rate modularity and reusability 1-10
rate architectural layering 1-10
rate code organization structure 1-10

### Performance Layer Metrics
rate render optimization 1-10
rate bundle size efficiency 1-10
rate data fetching patterns 1-10
rate caching strategy 1-10
rate memory usage optimization 1-10

### Security Layer Metrics
rate input sanitization 1-10
rate authentication integration 1-10
rate data exposure boundaries 1-10
rate error information disclosure 1-10
rate security headers implementation 1-10

### Robustness Layer Metrics
rate error handling completeness 1-10
rate edge case coverage 1-10
rate resilience to failures 1-10
rate data consistency guarantees 1-10
rate recovery mechanisms 1-10

### Integration Layer Metrics
rate API design coherence 1-10
rate frontend-backend contract 1-10
rate third-party integration safety 1-10
rate cross-component communication 1-10
rate system-wide consistency 1-10

### Overall Assessment
rate relative to professional e-commerce architecture standards 1-10
rate relative to system scalability requirements 1-10
rate relative to maintainability and technical debt 1-10
rate overall architectural coherence 1-10

---

## Critical Focus Areas

### 1. Stock Reservation System
- Files: `app/api/checkout/route.ts` (lines 44-52, 67-74)
- Issue: Not implemented (TODO comments)
- Risk: Race conditions, overselling

### 2. Payment Webhook Handler
- File: `app/api/webhook/route.ts`
- Issue: Entirely commented out
- Risk: No order creation on payment completion

### 3. Two-Phase Commit Pattern
- File: `app/api/checkout/route.ts` (lines 24-30)
- Issue: Not implemented
- Risk: Payment/stock inconsistency

### 4. Error Handling & UX
- Throughout checkout flow
- Issue: Inconsistent error states
- Risk: Lost sales, poor conversion

### 5. Security Boundaries
- Stripe integration
- Webhook verification
- User data handling
- Input validation

---

## E-commerce Specific Considerations

1. **Race Condition Handling**: Stock reservation, concurrent purchases
2. **Payment Idempotency**: Duplicate payment prevention
3. **Webhook Reliability**: Retry mechanisms, failure handling
4. **Data Consistency**: Basket → Order data integrity
5. **Guest Checkout**: Security vs conversion balance
6. **Session Management**: Cart persistence across auth states
7. **Error Recovery**: Stock rollback on payment failure
8. **Performance**: Checkout conversion optimization

---

## Expected Output Structure

### 1. All Ratings with Evidence
- Each 1-10 rating with specific code references
- Benchmark against e-commerce standards
- Impact analysis of low ratings

### 2. Critical Gaps Analysis
Categorized by layer:
- **Critical**: Payment security, data consistency
- **High**: Stock reservation, webhook handling
- **Medium**: Error handling, UX flows
- **Low**: Code organization, documentation

### 3. Implementation Roadmap
For each gap:
- Current state (file references)
- Target state definition
- Step-by-step implementation
- Priority level
- Dependencies

### 4. Verification Checklist
- Tests to add
- Monitoring points
- Security audits
- Performance benchmarks

---

## Research Context

This is an e-commerce audiophile equipment store with:
- High-value transactions ($100-$5000+)
- Low stock quantities (hand-picked inventory)
- International shipping requirements
- Guest checkout support
- Stripe as payment processor
- Sanity CMS for product/order data
- Clerk for authentication

---

## Success Criteria

1. **No race conditions** in stock handling
2. **Reliable payment → order** flow
3. **Secure handling** of payment data
4. **Graceful error recovery** for all failure modes
5. **Optimized conversion** through checkout flow
6. **Scalable architecture** for growth
7. **Maintainable codebase** for future development
