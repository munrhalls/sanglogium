# Framed Objective

**Tech Stack:** Next.js 15, Server Actions, API routes, native Node.js `fs` module.

**Purpose:** Build a zero-dependency, read-only logging mechanism that intercepts and logs function inputs/outputs for end-to-end debugging without touching business logic.

**Scope:** Backend Server Actions, API route handlers, and Stripe webhook logging to a single `latest-checkout-trace.json` file with optional client-side console output.

- Intercept inputs (arguments) and outputs (returns/errors) of functions and log them exactly as they are, without mutation or inspection.
- Write the intercepted payloads chronologically to a single `latest-checkout-trace.json` file using native Node `fs`.
- Expose a generic `reset` mechanism to wipe the trace file to a blank slate `[]`.
- Enforce strict Single Responsibility: the logger must possess absolute zero knowledge of the business logic, payload structures, shipping providers, or payment gateways it is logging.
- The logger must work for backend logging.
- The logger must work for client logging (or output to dev tools console).