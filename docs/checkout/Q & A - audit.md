# Addressing Gaps / Red Flags in Q & A

## 1. Shipping page re-calculates cost from shippingCode alone — but the API is non-deterministic

**Severity:** Critical / Security

The Q&A says: save only shippingCode to the session on the Shipping page; on the Payment page, "recalculate the true cost server-side" from that code. This is presented as the secure alternative to saving the price client-side.

**The gap:** Packlink/Allekurier rates are dynamic. A rate quoted at 20.00 PLN on the Shipping page can return 22.50 PLN 5 minutes later on the Payment page (carrier surcharges, weight rounding, zone re-evaluation). The "recalculate" step will produce a different number than what the user saw and agreed to. You will charge more than consented — a GDPR and payment regulation issue in Poland/EU.

**Fix:** The Q&A itself partially contradicts this elsewhere (the API Fetch Tally table shows shippingCode & shippingCost stored on Shipping page). The correct design is: call the API once on the Shipping page, save both shippingCode AND shippingCost (in cents, server-computed) to the iron-session. On the Payment page, trust that encrypted cost — do not re-call the API. The document oscillates between both approaches and never resolves this cleanly.

---

## 2. No CSRF protection mentioned for Server Actions triggered via plain onClick

**Severity:** Critical / Security

The CheckoutButton.tsx code example calls a Server Action directly via onClick={async () => await initCheckoutSession(items)}. Next.js 15 Server Actions invoked through <form action={...}> receive automatic CSRF origin checks. Actions invoked from client event handlers do get the Origin header check in Next.js 15, but the Q&A never mentions verifying this, nor does it address the gap between same-site: lax (the cookie setting used) and cross-origin POST protection.

**Fix:** Prefer native <form action={serverAction}> wherever possible. For the basket initiation which must be an onClick, explicitly note that Next.js 15's built-in origin header validation covers this — but only if the app is deployed on HTTPS with the correct secure: true cookie flag, which the Q&A only sets conditionally (process.env.NODE_ENV === 'production'). Document this dependency explicitly.

---

## 3. Stripe Webhook verification step is skipped / under-specified

**Severity:** Critical / Security

The Q&A mentions "Stripe webhook receives payment_intent.succeeded → Server verifies → Server writes to Sanity." The word "verifies" does all the heavy lifting but is never elaborated. There is no mention of stripe.webhooks.constructEvent(), the STRIPE_WEBHOOK_SECRET env var, or the requirement to consume the raw body (not the parsed JSON body) — a mistake that breaks webhook signature validation entirely.

**Why this is critical:** Without proper webhook signature verification, any attacker can POST a fake payment_intent.succeeded event to your endpoint, triggering order creation and stock decrements for items never actually paid for. This is the most common e-commerce fraud vector.

**Fix:** The Scope 4 spec and session.ts utility file are detailed to the line, but the webhook handler — which does the real money-to-inventory write — gets one sentence. It needs its own scope with explicit verification steps.

---

## 4. Session invalidation on payment success is not defined

**Severity:** Critical / Data integrity

The Q&A says "Session Destroyed" in the API Fetch Tally table at the Webhook step, but never explains how or when. The session cookie lives on the client. After a successful payment, if the user hits Back or reloads the Payment page, the session still contains the basket — the Stripe Elements component may attempt to re-submit or re-initialize with the already-consumed client_secret.

**Fix:** The webhook handler should call session.destroy() (iron-session method). The Payment page's Server Component should also check if a completed order exists for this session before rendering Stripe Elements, and redirect to the success page instead.

---

## 5. Address validation gate is architecturally loose — Google API failure path unhandled

**Severity:** Critical / Reliability

Scope 2 ("integrate Google Address Validation API") treats the API call as a pass/fail gate with no fallback. Google Address Validation API has usage limits and can return inconclusive verdicts (UNCONFIRMED_BUT_PLAUSIBLE). The Q&A never specifies: what happens when Google is down? What verdict levels trigger a block vs. a warning? Does a rate-limit error from Google prevent the user from checking out entirely?

**Fix:** Define explicit handling: (a) treat Google API failure as a soft pass — log it but allow the user to proceed; (b) treat UNCONFIRMED_BUT_PLAUSIBLE as a user-visible warning, not a hard block; (c) never expose the raw Google error to the client.

---

## 6. Redis soft reservation: TTL race condition and lock ownership not addressed

**Severity:** High / Logic

The Redis reservation section says "if User A pays, delete the Redis lock." But it never specifies that the lock must be owned by User A's session. If multiple users check out simultaneously and User A's lock key is just product:{id}, any webhook could delete any lock — including one set by User B who is still in their payment flow.

**Fix:** Store a session-unique token as the Redis value, not just a boolean. Only delete the lock if redis.get(key) === sessionToken — use a Lua script or Redis SET ... NX ... GET for atomicity.

---

## 7. Basket page architecture conflates Server Component fetching with client Zustand — hydration timing gap

**Severity:** High / Architecture

The Q&A describes basket page: "Client reads local basket (IDs, Qtys) → Next.js fetches current prices/stock from Sanity." But the basket is Zustand (client-only, persisted to localStorage). A Server Component cannot access Zustand store on the server. This means the Sanity fetch must happen client-side (via useEffect or SWR), or the page must use a hybrid approach. The Q&A glosses over this boundary, saying the basket page "server component fetches parcel data" — which is only possible if the component is actually a Client Component doing its own fetch.

**Fix:** Be explicit that the basket page is a Client Component (or has a client sub-component) that reads Zustand, extracts IDs, then calls a Server Action or API route to fetch Sanity data. This is not the "pure RSC" pattern described elsewhere and the distinction matters.

---

# Summary

Here's my full assessment. The Q&A is genuinely strong overall — about 74% validated — but has a cluster of serious issues that need resolution before you execute the sprint.

The single most important clarification to make before touching code is the shipping cost storage contradiction. Three sections of the Q&A give three different answers on whether to store just shippingCode or both shippingCode + shippingCost. The API Fetch Tally table and the Cookie Overflow section are both correct — store both in the session (cost in integer cents). The shipping_id section contradicts this and should be treated as superseded. Lock this in your architecture contract before SWE 1.6 touches a single file, because it's the load-bearing decision that determines how the Payment page is built.

## Red Flags by Severity

1. **Shipping cost re-calculation on Payment page** — dynamic carrier APIs are not deterministic; you'll charge a different amount than what the user consented to. Store the cost from the Shipping page, trust it on Payment page.
2. **No webhook signature verification spec** — the Stripe webhook handler is described in one sentence but is the highest-risk code in the entire system. Fake payment_intent.succeeded events are the most common e-commerce fraud vector.
3. **CSRF on onClick Server Actions** — technically protected by Next.js 15's Origin header check, but only if secure: true is enforced in production. The conditional flag in the session.ts example is fine, but this dependency is never documented.
4. **Session not destroyed after payment** — the iron-session cookie persists on the client after the webhook fires. No mechanism defined to prevent duplicate rendering of the Payment page with a spent client_secret.
5. **Google Address Validation failure path** — hard-blocks checkout on API error or UNCONFIRMED status, with no graceful degradation defined.
6. **Redis lock ownership** — the TTL reservation correctly solves the auto-expiry problem, but the lock deletion in the webhook has a race condition: it doesn't verify the lock belongs to the paying session.
7. **Basket page RSC/Zustand boundary** — Zustand is client-only; a pure Server Component cannot read it. This is quietly papered over throughout the document.

## Additional Sprint Risk

Three field naming aliases for the same datum (shippingId, shippingCode, shipping_id) across different sections is also a concrete sprint risk — SWE 1.6 will produce inconsistent variable names if you don't declare a canonical name in the architecture contract.

The architecture contract section of your .todo file should explicitly resolve all of these before Scope 0 begins.