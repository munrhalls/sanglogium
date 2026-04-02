# Payments → Orders Management → User Account - Professional Technical Architecture Audit

**Use with:** `/research` and `/audit` workflows
**Target:** Opus model
**Date:** 2026-04-02

---

## Prompt for Opus

Role: You are professional software architect and senior full-stack developer with deep expertise in e-commerce order management systems, payment processing, user account security, and CMS integration.

**Task:** Execute comprehensive technical architecture audit of payments → orders management → user account flow using the evaluation framework below.

**Scope:** End-to-end flow from payment completion through order lifecycle management to user account integration. Checkout flow is OUT OF SCOPE (already covered).

---

## Evaluation Metrics Framework

### Data Layer Metrics
rate order data structure integrity 1-10
rate user-account data consistency 1-10
rate data validation robustness 1-10
rate state synchronization 1-10
rate data persistence strategy 1-10

### Architecture Layer Metrics
rate order-state separation of concerns 1-10
rate user-account dependency patterns 1-10
rate modularity of order workflows 1-10
rate CMS integration layering 1-10
rate code organization structure 1-10

### Performance Layer Metrics
rate order query optimization 1-10
rate user account lookup efficiency 1-10
rate data fetching patterns 1-10
rate caching strategy for orders 1-10
rate memory usage optimization 1-10

### Security Layer Metrics
rate order access control 1-10
rate user authentication integration 1-10
rate payment data boundaries 1-10
rate order information disclosure 1-10
rate security headers implementation 1-10

### Robustness Layer Metrics
rate order-state error handling 1-10
rate payment failure coverage 1-10
rate resilience to system failures 1-10
rate order-user consistency guarantees 1-10
rate order recovery mechanisms 1-10

### Integration Layer Metrics
rate payment-to-order API coherence 1-10
rate user-account contract 1-10
rate CMS integration safety 1-10
rate order-state communication 1-10
rate system-wide consistency 1-10

### Overall Assessment
rate relative to professional order management standards 1-10
rate relative to system scalability requirements 1-10
rate relative to maintainability and technical debt 1-10
rate overall architectural coherence 1-10

---

## Critical Focus Areas

### 1. Order State Machine (FSM)
- Files: `sanity/schemaTypes/orderType.ts` (status field)
- Issue: FSM defined but not enforced in code
- Risk: Invalid state transitions, data corruption

### 2. User-Order Linking
- Files: Order schema (clerkUserId), user profile system
- Issue: No bidirectional sync between orders and user accounts
- Risk: Orphaned orders, access control violations

### 3. Payment-Order Reconciliation
- Files: `app/api/webhook/route.ts` (commented out)
- Issue: No automated reconciliation system
- Risk: Unpaid orders, financial discrepancies

### 4. Order Lifecycle Management
- Files: Throughout order system
- Issue: No automated state transitions
- Risk: Manual intervention required, poor UX

### 5. CMS Integration Patterns
- Files: Sanity order schema, GROQ queries
- Issue: Inconsistent data access patterns
- Risk: Performance issues, data stale-ness

---

## Order Management Specific Considerations

1. **State Machine Enforcement**: Code-level FSM validation
2. **Order-User Bidirectional Sync**: User sees orders, orders have users
3. **Payment Reconciliation**: Automated matching of payments to orders
4. **Order Lifecycle Automation**: Processing → Shipped → Delivered
5. **Access Control**: Users only see their orders
6. **Order Modifications**: Cancellations, returns, refunds
7. **Audit Trail**: Complete order history tracking
8. **Performance**: Fast order lookups, user order history

---

## Expected Output Structure

### 1. All Ratings with Evidence
- Each 1-10 rating with specific code references
- Benchmark against order management standards
- Impact analysis of low ratings

### 2. Critical Gaps Analysis
Categorized by layer:
- **Critical**: Payment reconciliation, access control
- **High**: State machine enforcement, user-order sync
- **Medium**: Lifecycle automation, audit trails
- **Low**: Code organization, documentation

### 3. Implementation Roadmap
For each gap:
- Current state (file references)
- Target state definition
- Step-by-step implementation
- Priority level
- Dependencies

### 4. End-to-End Specifications
For each user flow:
- Bus stop mapping with expectations
- Code specifications per stop
- Testing specifications
- Error handling per stop

---

## User Flows to Map

### Primary Flows:
1. **Payment Completion → Order Creation**
   - Webhook receives payment success
   - Order created with correct status
   - User notified
   - Inventory updated

2. **Order Status Updates**
   - Admin updates order status
   - User receives notifications
   - Order history reflects changes
   - Audit trail maintained

3. **User Order History**
   - User logs in
   - Views order history
   - Tracks current orders
   - Reorders functionality

4. **Order Cancellation/Returns**
   - User requests cancellation
   - System validates eligibility
   - Payment refunded if applicable
   - Order state updated

---

## Research Context

This is an e-commerce audiophile equipment store with:
- High-value orders requiring careful tracking
- International shipping with complex status tracking
- Guest and registered user orders
- Manual fulfillment process
- Need for comprehensive audit trails
- Multiple payment states (pending, paid, refunded)

---

## Success Criteria

1. **Reliable payment-to-order** mapping
2. **Proper order state** enforcement
3. **Secure user-order** access control
4. **Complete audit trails** for all changes
5. **Automated lifecycle** management
6. **Scalable order** queries
7. **Maintainable integration** points

---

## Required Deliverables

1. **Audit Report**: Complete findings with ratings
2. **Gap Analysis**: Detailed list of architectural gaps
3. **Implementation Roadmap**: Step-by-step fix plan
4. **End-to-End Specifications**: User flow specifications with:
   - Bus stop expectations
   - Code requirements
   - Test specifications
   - Error handling
5. **Schema Updates**: Required Sanity schema changes
6. **API Specifications**: Order management API definitions
