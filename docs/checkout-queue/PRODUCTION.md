# Production Readiness Checklist

## Overview

This checklist outlines the critical gaps and recommendations for deploying the checkout-queue to production. Items are organized by priority level.

## High Priority

- [ ] **Add authorization to checkout-queue endpoint** - Currently public, requires authentication to prevent abuse
- [ ] **Add IP whitelist for cleanup endpoint** - Restrict `/api/cleanup/expired-reservations` to trusted sources
- [ ] **Add rate limiting** - Prevent queue abuse and protect against denial of service attacks
- [ ] **Add health endpoint for external monitoring** - Expose `/api/checkout-queue/health` for monitoring services

## Medium Priority

- [ ] **Add alerting for health check failures** - Configure notifications when Redis connection fails
- [ ] **Add metrics collection for queue performance** - Track queue depth, processing time, and error rates
- [ ] **Add request logging for debugging production issues** - Log reservation requests and responses
- [ ] **Add circuit breaker for Redis failures** - Graceful degradation when Redis is unavailable

## Low Priority

- [ ] **Add admin dashboard for queue monitoring** - Visual interface for monitoring queue status
- [ ] **Add cleanup job status tracking** - Track cleanup job execution and results

## Required Environment Variables

### Critical
- `UPSTASH_REDIS_REST_URL` - Redis REST API endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token
- `SANITY_STUDIO_READ_WRITE` - Sanity write token with create permissions for atomic operations (verified)

### Optional
- `RESERVATION_TTL_SEC` - Reservation time-to-live (defaults to 900 seconds)
- `NODE_ENV` - Environment mode (recommended for dataset selection)

## Vercel Configuration

### Required
- Build command: `npm run build` (Vercel auto-detects Next.js)
- Install command: `npm install --legacy-peer-deps` (for peer dependencies)
- Cron job: Cleanup job every 5 minutes at `/api/cleanup/expired-reservations`

### Runtime
- Runtime: `nodejs` (required for Redis operations)

## Related Documentation

- [README](./README.md) - Checkout queue overview and architecture
- [MAJOR ADR](./MAJOR ADR.md) - Architecture Decision Records
- [Technical Diagrams](./TECHNICAL DIAGRAM.md) - Mermaid diagrams showing flows
