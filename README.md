# Sang Logium

Production e-commerce platform for high-end audio gear, built and maintained
solo over 18+ months.

🔗 Live: https://www.sanglogium.com

## Features

- Custom checkout flow with Stripe Payment Intents
- Custom authentication system (Better Auth)
- Catalogue of 500+ products with admin and marketing management panels
- Automated data pipeline (Playwright, Sanity CMS, image processing)
- AI-assisted development workflow: Claude handles planning/task breakdown,
  Devin IDE executes implementation

## Tech Stack

**Framework & Language:** Next.js 15 (App Router) · React 19 · TypeScript

**CMS & Data:** Sanity v3 · Turso (libsql — auth database)

**Payments:** Stripe (Payment Intents, Embedded Elements)

**Auth & Session:** Better Auth (Kysely adapter) · iron-session (encrypted checkout cookies)

**Email:** Resend (newsletter, checkout & auth emails)

**Shipping:** AlleKurier & Packlink (aggregated rate quoting)

**State & Forms:** Zustand · React Hook Form · Zod

**Infrastructure:** Upstash Redis (inventory reservation) · BullMQ (background jobs) · Sentry (error monitoring & tracing) · Vercel Speed Insights (RUM) · Pino (structured logging)

**Address Validation:** Google Maps Address Validation API

**Styling:** Tailwind CSS

**Testing:** Playwright (E2E & component) · Vitest (unit & integration)

## Screenshots

_(placeholder — see Phase 4)_
