# Q & A - CRITICAL Q'S ONLY INTELLIGENCE GATHERING - System-Level Architecture

## Q & A - FOUNDATIONAL QUESTIONS AND CLARIFICATIONS

# Q & A - CLARIFICATIONS TO FOUNDATIONAL QUESTIONS

**Q2: If guest: email capture location (address page or payment page)?**
- Status: ❌ UNRESOLVED
- Evidence: Email field exists in Zod schema, confirmation emails mentioned, but NO explicit decision on WHERE to capture it
- Decision: ON PAYMENT PAGE

**Q3: Itemized order summary before final payment button?**
- Status: ❌ UNRESOLVED
- Evidence: No documentation of order summary on payment page; basket review mentioned only on basket page
- Decision: YES. THAT SHOULD BE THERE. THIS IS PART OF CHECKOUT SYSTEM HAPPY PATH ONLY GUEST CHECKOUT ONLY TRACER

**Q4: Recipient name + phone on address page?**
- Status: ❌ UNRESOLVED (identified as technical debt)
- Evidence: payment/framed-objective.md: "address page must collect a name" - currently NO name field in session.address; migration issue documented
- Decision: MUST CAPTURE NAME AND PHONE ON THE ADDRESS PAGE

**Q6: Stripe webhook + order persistence in this sprint scope?**
- Status: ❌ UNRESOLVED (deferred)
- Evidence: Webhook documented as "separate scope" in multiple files; SYSTEM-SYNTHESIS.md: "no order creation in current implementation - webhook missing"
- Decision: THIS IS PART OF CHECKOUT SYSTEM HAPPY PATH ONLY GUEST CHECKOUT ONLY TRACER 


## Layers

### WRONG LAYERS

- **Components server/client pairs layer:** Server (`...Manager.tsx`) / Client (`...Display.tsx`) component pair for basket page and for each checkout slice (address/shipping/payment/return pages)
- **Client to server circuits layer:** Server actions, passing data to client
- **Server - pre-processing correct API/CMS layer**
- **Server - API/CMS calls layer**
- **Server - post-processing API/CMS call layer**

---

### Evaluation of Your Proposed Layers

#### Red Flag 1: The Manager / Display Component Split (Over-complication)

**Your Idea:** Server (`...Manager.tsx`) / Client (`...Display.tsx`) component pairs for each checkout slice.

**The Critique:** This treats React Server Components (RSCs) like the old 2016 Container/Presentational design pattern. In Next.js 15, forcing every page to have a strict split creates file bloat.

**The Best Practice:** The `page.tsx` file itself is the server orchestrator. If a step is a simple form (like the Address page), the `page.tsx` renders a native server `<form>` directly passing a Server Action. You only spin up an explicit Client Component (`"use client"`) when you need immediate client state, browser APIs, or third-party primitives (like Stripe Elements).

#### Red Flag 2: Triplicate Server Sub-Layers (Over-complication)

**Your Idea:** Three distinct layers for API/CMS: Pre-processing → Call → Post-processing.

**The Critique:** For a happy-path tracer bullet, breaking data fetching into three explicit architectural layers creates a massive coordination cost (mapping types across three boundaries just to read a price).

**The Best Practice:** Collapse these into a single Infrastructure/Service Function per domain. A single async function like `getBasketDetails(ids)` handles input sanitation, runs the GROQ query, and formats the output. It is far easier to trace and debug.

---

### The 2026 CORRECT LAYERS Blueprint: 4 Clear Layers

To keep your tracer bullet fast, secure, and robust, your architecture should be divided into these 4 clean boundaries:

```
[ 1. Routing & Orchestration Layer ]  (Server Components - page.tsx)
                 │
                 ▼
[ 2. Presentation & Capture Layer ]   (Client Components / Server Forms)
                 │
                 ▼
[ 3. Mutation & Session Gateway ]     (Server Actions - actions/checkout.ts)
                 │
                 ▼
[ 4. Secure Service Infrastructure ]  (Core SDKs - lib/sanity.ts, lib/stripe.ts)
```

#### Layer 1: Routing & Orchestration Layer (React Server Components)

**What it contains:** Your `page.tsx` files.

**Its job:** It acts as the server-side security checkpoint. It reads the unencoded iron-session cookie directly from the request headers, determines if the user is on the right step, fetches the required data from Layer 4, and renders the layout.

**Tracer scope:** `/basket/page.tsx`, `/checkout/address/page.tsx`, `/checkout/shipping/page.tsx`, etc.

#### Layer 2: Presentation & Capture Layer (React Components)

**What it contains:** Server-rendered forms or isolated Client Components (`"use client"`).

**Its job:** Pure user interaction. It receives validated data as props from Layer 1, displays it neatly to the user, and collects input. It triggers Layer 3 on submission.

**Tracer scope:** Address inputs, shipping selection radios, Stripe Elements frame.

#### Layer 3: Mutation & Session Gateway (Next.js Server Actions)

**What it contains:** Pure async server functions decorated with `"use server"`.

**Its job:** The bridge for user inputs. It receives raw primitives from Layer 2, applies basic validation, unseals and mutates the iron-session cookie, and issues a server-side `redirect()` to push the user to the next step.

**Tracer scope:** `saveAddressAction()`, `saveShippingAction()`.

#### Layer 4: Secure Service Infrastructure (Domain Wrappers)

**What it contains:** Hard data access layer. Isolated utility files wrapping external clients.

**Its job:** To communicate with the outside world securely. No UI or session logic lives here. It accepts simple parameters and speaks directly to Sanity (GROQ), Stripe, or your shipping APIs.

**Tracer scope:** `sanityClient.fetch()`, `stripe.paymentIntents.create()`.

---

### Comparison Matrix

| Attribute | Your Proposed Model | 2026 First Principles Model |
|-----------|---------------------|-----------------------------|
| Component Layout | Strict binary pairing (Manager + Display) | Unified routing orchestrator (page.tsx) calling inline leaf components |
| Data Flow | Server Actions pushing down initialization data | Server Components pushing props down; Server Actions pushing mutations up |
| API Abstraction | 3 separate processing layers | Unified service functions wrapping the core SDK clients directly |
| Traceability | Complex. Code splits across 5 files per step | Linear. Traceable in a single straight line down the 4 layers |





---

## Scopes and Sequencing

**Question:** What should scopes and sequencing be? Should I think of sequencing as sequence of layers first? Should I first build one layer fully? Or should I first build one component across all layers, then next component?

### The Falsification: Horizontal Slicing (What NOT to do)

**False Assumption:** Build all the UI pages first, then wire up all the Server Actions, then write all the Sanity/Stripe API calls. (Horizontal Slicing).

**Correction:** In a Next.js 15 App Router architecture, Horizontal Slicing is an anti-pattern. Because Server Components fetch their own data directly, and forms submit to collocated Server Actions, the UI and the server logic are structurally fused.

If you build all the UI first, you are building dead code that cannot be tested. If you build all the API calls first, you are writing blind logic without knowing the exact shape the UI will submit.

---

### The 2026 Standard: Vertical Slicing (The Tracer Bullet)

The architectural standard—and the literal definition of a "tracer bullet"—is Strict Vertical Slicing.

You must build one complete, functioning slice of the funnel across all four layers (UI → Action → Session → API) before moving to the next page.

#### Why this is the First Principle

**Immediate Validation:** A tracer bullet is meant to prove the architecture works end-to-end. By building vertically, you prove that the iron-session cookie actually saves the data and survives the redirect to the next page.

**The Domino Effect:** In a funnel, Step 3 (Shipping) is completely dependent on the data captured in Step 2 (Address). You cannot safely build the Shipping page logic until the Address page is actively writing verified data to the session.

---

### The Exact Sequencing & Scopes

To implement this professionally, your sequence is divided into micro-scopes. You execute them in this exact order:

#### Scope 0: The Foundational Layer (The only exception)

Before you build features, you must lay the track.

- **Action:** Build the `session.ts` utility (Layer 4) and configure iron-session.
- **Validation:** You can instantiate a dummy session in a test route.

#### Scope 1: The Transition (Basket → Address)

**Vertical Slice:**

- Wire the client-side Basket Checkout button (Layer 2).
- Write the `initCheckoutSession` Server Action (Layer 3).
- Assert the session writes the `[{ id, quantity }]` payload and redirects.
- Create a blank `/checkout/address/page.tsx` (Layer 1) that successfully reads the session IDs and prints them to the server console.

**Stop and Test.**

#### Scope 2: The Address Stage (Address → Shipping)

**Vertical Slice:**

- Build the Address HTML form (Layer 2).
- Write the `saveAddress` Server Action (Layer 3).
- Integrate the Google Address Validation API call (Layer 4).
- Create a blank `/checkout/shipping/page.tsx` (Layer 1) that successfully reads the updated session (which now includes the address) and prints it to the console.

**Stop and Test.**

#### Scope 3: The Shipping Stage (Shipping → Payment)

**Vertical Slice:**

- Build the Shipping Page Server Component that fetches Sanity parcel data and calls Packlink using the session address (Layer 1 & Layer 4).
- Build the radio button form (Layer 2).
- Write the `saveShipping` Server Action (Layer 3).
- Create a blank `/checkout/payment/page.tsx` (Layer 1) that reads the final session.

**Stop and Test.**

#### Scope 4: The Payment Stage (Payment → Success)

**Vertical Slice:**

- Payment Page fetches final Sanity prices and calculates the total (Layer 1).
- Server calls Stripe to create Payment Intent (Layer 4).
- Mount React Stripe Elements (Layer 2).
- Process payment and catch webhook.

**Safety Check Status:** This vertical sequencing guarantees you never write code based on assumptions. Every step acts as the Lead Domino for the next step, ensuring the session state is perfectly intact before the next UI component ever mounts.







## Tracer Chunks & Checkpoints - what should they be?

A "tracer chunk" in 2026 Next.js is a vertical slice built with raw HTML inputs and hardcoded external API responses. It proves the data pipeline works before you invest in UI components or third-party API configurations.

### Chunk 1: The Initiation Pipe

**The Chunk:**
Wire a basic button that reads a hardcoded Zustand state `[{ id: "test_1", qty: 1 }]`. Pass it to a Server Action that encrypts it into iron-session and executes `redirect("/checkout/address")`.

**The Checkpoint:**
You load `/checkout/address`. In your VS Code terminal (not the browser console), you see a `console.log(session.basket)` printing the exact array.

**Why (First Principles):**
Proves the client-to-server boundary is crossed safely, the encryption secret is valid, and Next.js correctly sets the HTTP-Only cookie during a redirect.

---

### Chunk 2: The Address Pipe

**The Chunk:**
On the Address page, write a native `<form>` with standard unstyled `<input>` fields. The Server Action bypasses real Google Validation for now (simulates a 200 OK), appends the address to the session, and executes `redirect("/checkout/shipping")`.

**The Checkpoint:**
You load `/checkout/shipping`. In your VS Code terminal, you see the cookie now holds: `{ basket: [...], address: { city: 'Wrocław', ... } }`.

**Why (First Principles):**
Proves the session can be safely mutated (appended to, rather than overwritten) and that Server Actions successfully capture raw FormData without client-side React state.

---

### Chunk 3: The Shipping Matrix Pipe

**The Chunk:**
The Shipping page server component reads the session address and runs the local static matrix logic (e.g., returns flat-rate 18.99 PLN for Poland). Render a basic radio button for this option. The `<form>` action saves the choice.

**The Checkpoint:**
You load `/checkout/payment`. In your VS Code terminal, the session explicitly prints: `{ basket: [...], address: [...], shippingCode: "inpost_pl", shippingCost: 1899 }`.

**Why (First Principles):**
Proves the critical security boundary: the client only submitted a string (`inpost_pl`), but the server successfully calculated and locked the unalterable financial cost (1899 cents) into the encrypted cookie.

---

### Chunk 4: The Financial Lock Pipe

**The Chunk:**
The Payment page server component reads the session. It executes a dummy Sanity fetch (returning a hardcoded product price, e.g., 10000 cents). It adds the `shippingCost` from the session. It calls the real Stripe SDK to create a Payment Intent for 11899 cents.

**The Checkpoint:**
You open your Stripe Developer Dashboard in the browser. You see a newly created PaymentIntent for exactly 118.99 PLN, with the session's address attached as metadata.

**Why (First Principles):**
Proves complete architectural parity. The server successfully merged real-time CMS pricing with trusted session shipping logic, and handed a tamper-proof total to the payment gateway.

---

## Comparison vs. 2026 Best Practices

| Aspect | Traditional Approach (Pre-2024) | 2026 Next.js 15 Standard |
|--------|--------------------------------|---------------------------|
| **Chunking Logic** | Build the UI components (AddressForm, ShippingRadios) first, then connect APIs later. | Vibe Coding / Tracer: API First - Build raw HTML `<form>`s to prove Server Actions and state persistence. Add Tailwind and UI components only after the Stripe checkpoint passes. |
| **Checkpoints** | Checking React DevTools to see if Redux/Zustand updated correctly. | Server Logs & Webhooks: Because the user cannot be trusted, checkpoints are strictly verified in the Node.js terminal and the Stripe Dashboard. |
| **External APIs** | Build the Google Address and Packlink API integrations immediately. | Mock the Edges: Hardcode external API responses in the Server Actions during the tracer phase. This isolates bugs to your Next.js session architecture, not rate-limits or bad API keys. |


---

## NUQS and User Navigation

**Question:** How does NUQS factor into this? How does user navigation back/forth factor into this? What SHOULD be possible for user in terms of back/forth navigation, what SHOULD NOT be possible for user? Why?


# User navigation - correct handling

### How nuqs Factors In (The Falsification)

**The Short Answer:** In the checkout funnel, nuqs factors in by being completely excluded.

nuqs is brilliant for your Sang-logium catalogue filters, search, and pagination because you want users to share and bookmark those URLs (e.g., `?brand=meze`). However, the URL is a public, client-controlled vector.

If you use nuqs to control checkout steps (e.g., `?step=shipping&cost=15`), a malicious user can simply type `?step=payment&cost=0` in the address bar. In 2026 headless e-commerce, the checkout is driven strictly by Next.js physical route segments (`/checkout/address`) combined with the iron-session cookie. The URL parameters must remain completely empty during checkout.

---

### User Navigation: What SHOULD Be Possible?

**The Standard: Permissive Backwards Navigation.**

A user must be able to click the browser's native "Back" button at any point to return to a previous step without losing data or crashing the app.

**Why:** E-commerce UX studies show that users frequently want to double-check their address or change a shipping option before clicking pay. Breaking the native "Back" button causes immediate cart abandonment.

**How it works:** Because your architecture uses stateless iron-session cookies and React Server Components, hitting "Back" triggers a fast server render. The server reads the cookie, sees the data is already there, and renders the form with the user's previous inputs pre-filled.

---

### User Navigation: What SHOULD NOT Be Possible?

**The Standard: Guarded Forward Navigation (The Funnel Lock).**

Users must never be able to skip a required step, even if they manipulate their browser history.

| Navigation Scenario | Allowed | Reason / Enforcement |
|---------------------|---------|----------------------|
| Direct Link to Payment | No | Missing Address/Shipping data in session. |
| Skip Forward via History | No | Server redirect blocks access without prerequisites. |
| Edit Address → Skip Shipping | No | Changing address invalidates previous shipping costs. |

#### The Critical Vulnerability (The "Ghost Forward" Attack)

The user is on the Payment page. They click "Back" twice to reach the Address page. They change their city to a remote zone (which has higher shipping rates) and submit. Instead of picking a new shipping rate, they click the browser's "Forward" button twice to skip the Shipping page and return to Payment, attempting to keep the old, cheaper rate.

---

### The Solution: Session Cascade Validation

To mathematically prevent funnel jumping while supporting native back/forward navigation, you must implement these three server-side rules:

#### Rule 1: The Payment Guard

At `/checkout/payment/page.tsx`, the server checks the session. If `session.shippingCode` is missing, it executes `redirect("/checkout/shipping")`.

#### Rule 2: The Shipping Guard

At `/checkout/shipping/page.tsx`, the server checks the session. If `session.address` is missing, it executes `redirect("/checkout/address")`.

#### Rule 3: The Action Invalidator (The Lead Domino)

When the user submits the Address form via the Server Action (`saveAddress`), the action must explicitly delete the downstream session data before saving the new address:

```typescript
// Inside saveAddress() Server Action
session.shippingCode = undefined;
session.shippingCost = undefined;
await session.save();
```

By destroying the downstream data upon any upstream change, you ensure that if the user clicks "Forward" to jump to the Payment page, Rule 1 catches them and securely kicks them back to the Shipping page to recalculate costs.


### User Navigation: What SHOULD NOT Be Possible?

**The Standard: Guarded Forward Navigation (The Funnel Lock).**

Users must never be able to skip a required step, even if they manipulate their browser history.

| Navigation Scenario | Allowed | Reason / Enforcement |
|---------------------|---------|----------------------|
| Direct Link to Payment | No | Missing Address/Shipping data in session. |
| Skip Forward via History | No | Server redirect blocks access without prerequisites. |
| Edit Address → Skip Shipping | No | Changing address invalidates previous shipping costs. |

#### The Critical Vulnerability (The "Ghost Forward" Attack)

The user is on the Payment page. They click "Back" twice to reach the Address page. They change their city to a remote zone (which has higher shipping rates) and submit. Instead of picking a new shipping rate, they click the browser's "Forward" button twice to skip the Shipping page and return to Payment, attempting to keep the old, cheaper rate.

---

### The Solution: Session Cascade Validation

To mathematically prevent funnel jumping while supporting native back/forward navigation, you must implement these three server-side rules:

#### Rule 1: The Payment Guard

At `/checkout/payment/page.tsx`, the server checks the session. If `session.shippingCode` is missing, it executes `redirect("/checkout/shipping")`.

#### Rule 2: The Shipping Guard

At `/checkout/shipping/page.tsx`, the server checks the session. If `session.address` is missing, it executes `redirect("/checkout/address")`.

#### Rule 3: The Action Invalidator (The Lead Domino)

When the user submits the Address form via the Server Action (`saveAddress`), the action must explicitly delete the downstream session data before saving the new address:

```typescript
// Inside saveAddress() Server Action
session.shippingCode = undefined;
session.shippingCost = undefined;
await session.save();
```

By destroying the downstream data upon any upstream change, you ensure that if the user clicks "Forward" to jump to the Payment page, Rule 1 catches them and securely kicks them back to the Shipping page to recalculate costs.



## The Corrected, Safe 2026 Flow (Tracer Bullet)

Here is your exact flow, repaired for safety, security, and Next.js 15 limits:

### Basket Page

Client reads local basket (IDs, Qtys) → Next.js fetches current prices/stock from Sanity → Displays Basket + Estimated base shipping.

### Initiate Checkout

User clicks checkout → Server Action creates encrypted session containing ONLY `[{ id, qty }]` → Redirects to Address page.

### Address Page

User submits form → Server Action validates address (Google API) → Saves address to session → Redirects to Shipping page.

### Shipping Page

Server reads session address and basket IDs → Fetches parcel data from Sanity → Calls shipping API (Allekurier/Packlink) → Displays options → User selects option → Server Action saves ONLY the shippingCode to session → Redirects to Payment page.

### Payment Page (The Security Checkpoint)

- Server component reads session (basket, address, shippingCode).
- Server re-fetches real-time prices and parcel data from Sanity.
- Server re-calculates exact final shipping cost using the shippingCode.
- Server calculates Total = (Real Products Price + Real Shipping Cost).
- Server generates Stripe Payment Intent with Total.
- Passes client_secret to React Stripe Elements.

### Client Payment

Stripe Elements handles payment securely.

### Webhook (Async)

Stripe webhook receives `payment_intent.succeeded` → Server verifies → Server writes to Sanity (Creates Order document, decrements stock).

### Return Page

User sees success confirmation.


# Critical Q&A - Checkout System
---

## Fetch Operations: Server Actions vs API Routes

**Question:** What should fetch operations be? Client has to pass item IDs/quantities. So API POST…or Server Actions (which are supposed to not be for fetch operations)?

### The Architectural Reality: It's a Mutation, Not a Fetch

Your rule is 100% correct: Server Actions should never be used as a substitute for `fetch()` to pull data and populate client-side UI. If a client component just needs to read data from a database, it should use a standard API Route Handler (GET) or an SWR/TanStack Query setup.

However, clicking "Proceed to Checkout" is not a fetch operation. It is a lifecycle mutation that alters the state of the user's application session.

You are doing three things simultaneously:

- Receiving the user's intent (`[{ productId, quantity }]`).
- Writing and encrypting a secure session cookie (iron-session).
- Redirecting the user to a new page (`/checkout/address`).

Because this operation involves a write followed by a redirect, a Next.js Server Action is the absolute industry standard.

---

### The 2026 Fetch & Mutation Lifecycle Pattern

Here is exactly how the client-to-server data handover works without breaking Next.js 15 principles or requiring a single custom API endpoint.

#### Step 1: The Transition (Server Action)

The user clicks the checkout button on the client. Your component calls a Server Action, passing the bare Zustand data.

```typescript
// src/app/basket/CheckoutButton.tsx
"use client"
import { useBasketStore } from "@/store/basket";
import { initCheckoutSession } from "@/actions/checkout";

export function CheckoutButton() {
  const items = useBasketStore((state) => state.items); // [{ id, quantity }]

  return (
    <button onClick={async () => await initCheckoutSession(items)}>
      Proceed to Checkout
    </button>
  );
}
```

The corresponding Server Action processes this as a write:

```typescript
// src/actions/checkout.ts
"use server"
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function initCheckoutSession(items: Array<{ id: string; quantity: number }>) {
  const session = await getCheckoutSession();
  
  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();
  
  // Transition to the next page
  redirect("/checkout/address"); 
}
```

#### Page Rendering & Data Fetching (React Server Components)

Once the Server Action redirects the user to `/checkout/address`, you completely stop using client-side fetching.

The Address page is a React Server Component. It fetches its own data natively on the server before the page even reaches the user's screen.

```typescript
// src/app/checkout/address/page.tsx
import { getCheckoutSession } from "@/lib/session";
import { client } from "@/lib/sanity";

export default async function AddressPage() {
  // 1. Read the secure cookie directly on the server
  const session = await getCheckoutSession();
  const productIds = session.basket.map(item => item.id);

  // 2. Pure Server-to-Server Fetch (Direct, blazing fast GROQ call)
  // Note: don't take the groq literally - it's just conceptual answer
  const productsData = await client.fetch(
    `*[_type == "product" && _id in $productIds]`, 
    { productIds }
  );

  // 3. Render the HTML completely on the server
  return (
    <div>
      {/* Address form component goes here */}
    </div>
  );
}
```

---

### Why This Architecture is Safe and Simple

**Zero Custom API Endpoints:** You do not need to write or maintain `/api/checkout/init` route handlers. Next.js handles the RPC (Remote Procedure Call) infrastructure for you via the Server Action.

**No Hydration Mismatch:** The data required to show the checkout page is present during the initial server-side render of that route. The user never sees a loading spinner or a layout jump.

**Security Closure:** The client only initiates the session with primitive IDs. From that exact second onward, the server takes complete control of the checkout state via the encrypted cookie.


## Where is user's data stored during checkout flow in Next.js/React?

**The 2026 Standard: Stateless Server Sessions (Encrypted Cookies)**

Because you do not have a Postgres database, and writing to Sanity is out of the question, the 2026 standard for Next.js 15 is an Encrypted HTTP-Only Session Cookie.

**Where it is stored:** A single, encrypted cookie (e.g., `checkout_session`) managed entirely by Next.js, residing on the user's browser but completely unreadable and unmodifiable by client-side JavaScript.

**How it works:** Next.js Server Actions mutate this cookie at each step of the checkout.

**Why:** It allows Next.js React Server Components (RSCs) to instantly read the user's progress on every page load, delivering a zero-loading-spinner experience. It requires zero database writes, zero premature Stripe API calls, and is inherently immune to client-side price/shipping tampering.

---

## Critical Q's: Cookie Overflow and Staleness Flaw (CRITICAL)

### The "Cookie Overflow" and Staleness Flaw

**Your Flow:** "server action: create user checkout session + save products price, available stock, parcel datas to session"

**The Mistake:** HTTP-Only cookies have a strict 4KB size limit. If you save the entire product object (prices, stock, parcel dimensions) for a cart with 5-10 items, plus the encryption overhead of iron-session, you will exceed 4KB. The cookie will silently fail to save, breaking checkout.

**The Fix:** The checkout session must be incredibly lean. It should only hold: `[{ id, quantity }]`, address, and shippingCode.

**The Re-Fetch Rule:** You must fetch the prices, stock, and parcel data from Sanity again at the exact moment you create the Stripe Payment Intent. This guarantees you are using real-time prices (in case a price changed while they were typing their address) and keeps the session under 1KB.

---

### The External Shipping API "Double-Call" (Over-complication)

**Your Perception:** "...payment page must re-fetch parcel data again because it needs to call shipping API again because it's required to calculate the total payment amount..."

**The Red Flag:** Calling a third-party API (like Packlink) twice for the same checkout is a critical over-complication. It doubles your latency on the most sensitive page (Payment), risks rate-limiting, and opens the door to discrepancies if the shipping API returns a different rate 30 seconds later.

### The Fix (How to safely pass the cost without a DB)

Because you are using iron-session, the cookie is 100% encrypted and tamper-proof server-side.

1. On the Shipping Page, the Server Component calls the Packlink API once and displays the options.
2. When the user selects "DPD (20 PLN)" and clicks "Continue", a Next.js Server Action receives their choice.
3. **The Magic:** The Server Action binds the exact API-provided price and saves it inside the encrypted cookie: `{ shippingCode: "dpd_courier", shippingCost: 2000 }` (stored in cents).
4. Because the client cannot read or modify the encrypted iron-session cookie, this cost is completely trusted.
5. On the Payment Page, you do not call the Shipping API. You simply read `session.shippingCost`, fetch the live product prices from Sanity, and add them together.

Because iron-session acts as a secure, server-controlled "black box" on the client, data written to it by a Server Action is fully trusted.

---

### Contradiction?

Here is the exact, clean truth of how the data flows without any contradiction:

**On the Shipping Page:** The server reads the address from the session, fetches the parcel data from Sanity, and passes both to the Shipping API. The user picks their method. Your Server Action writes both the shippingCode and the exact calculated cost (e.g., `shippingCost: 2499` in cents) into the cookie.

**On the Payment Page:** The server reads the encrypted cookie. It completely trusts the `shippingCost` because the client could not have altered it. Therefore, the server only queries Sanity to get fresh, real-time product prices and stock to ensure the user isn't buying a modified price or an item that sold out while they were typing their address.

**The Final Calculation:** The server takes the freshly validated Sanity product subtotal, pulls the trusted `shippingCost` straight out of the cookie, adds them together on the server, and hands that single final number to Stripe.

---

## The Final, Professional API Fetch Tally (The 2026 Standard)

Here is the exact, minimized, secure matrix of every external call in your entire funnel:

| Phase | Sanity CMS Calls | External API Calls | Data Mutated in iron-session Cookie |
|-------|------------------|-------------------|-----------------------------------|
| 1. Basket Page | 1 Read (Fetch price, stock, parcel data) | 0 (Use flat-rate utility for PL, text estimate for DE/GB) | Create `{ basket: [{id, qty}] }` |
| 2. Address Page | 0 | 1 API Call (Google Address Validation) | Append address |
| 3. Shipping Page | 1 Read (Fetch ONLY parcel data for calculation) | 1 API Call (Packlink/Allekurier for options) | Append shippingCode & shippingCost |
| 4. Payment Page | 1 Read (Fetch ONLY product prices for final total) | 1 API Call (Stripe Payment Intent Init) | None |
| 5. Webhook (Async) | 1 Write (Create Order, Decrement Stock) | 0 | Session Destroyed |

Summary
Total CMS Reads: 3 (Highly efficient, localized payloads).

Total CMS Writes: 1 (Only on guaranteed payment success).

Total Shipping API Calls: 1 (Perfectly optimized).
------

## Reserved Stock - ARCHITECTURE

### The Falsification (What NOT to do)

**False Assumption:** If you need a soft reservation, you should create a `reservedStock` field in Sanity and mutate it when the user clicks "Checkout."

**Correction:** Doing this in Sanity is a catastrophic anti-pattern.

**No Auto-Expiry:** If a user closes their browser at the Stripe page, Sanity has no native way to "un-reserve" that item 15 minutes later without you building and paying for external, complex cron jobs. Your $3000 headphone will be stuck as "Sold Out" forever.

**No Atomic Locks:** If two users click checkout on the last item at the exact same millisecond, Sanity's API will allow both writes to succeed.

**Using redis-queue (checkout-queue implemented earlier) to handle above concerns** - that's a gigantic overhead, cost-benefit is extremely negative.

---

### What to do instead:

#### The 2026 Standard: The Two-Tiered Inventory Strategy

In headless React/Next.js e-commerce, the standard is to divide your catalog into two risk profiles because implementing soft reservations adds architectural complexity.

**Tier 1: General Products (Cables, Standard Gear < $500)**

**The Pattern:** Optimistic Checkout.

**How it works:** You do not reserve anything. You check stock on the basket page, and you check it again instantly before generating the Stripe Payment Intent. If it sells out in those 30 seconds (extremely rare for standard stock), the server throws an error and sends them back to the basket.

**Why:** It keeps the architecture incredibly fast, cheap, and simple.

**Tier 2: High-Ticket & 1-of-1 Products (> $3000 Gear)**

**The Pattern:** Pessimistic Locking (Soft Reservation).

**Why:** Your intuition is 100% correct. If two audiophiles simultaneously buy the last $4,000 Focal or Meze headphone, refunding one of them creates a massive customer service nightmare and severe brand damage. You must protect the checkout funnel for these items.

---

### How to Actually Build a Soft Reservation (The Safe Way)

If you decide to protect your high-ticket items, the 2026 standard requires adding exactly one micro-service to your stack: Serverless Redis (specifically Upstash).

Redis is an in-memory key-value store that solves the exact problems Sanity cannot. Here is the flow:

**The Checkout Click:** User clicks checkout for a $3000 headphone.

**The Redis Lock:** Your Next.js Server Action checks Sanity. If stock is 1, it tells Redis: "Create a lock for Product 123. Make it expire and delete itself automatically in exactly 15 minutes (TTL)."

**The Block:** If User B tries to checkout 10 seconds later, your Server Action checks Redis, sees the lock, and tells User B: "This item is currently in someone else's basket. Check back in 15 minutes."

**The Resolution:**

- **If User A pays:** The Stripe Webhook permanently decrements Sanity stock to 0 and deletes the Redis lock.
- **If User A abandons:** After 15 minutes, Redis automatically deletes the lock. User B can now buy it. Sanity was never touched.




## What should the architecture be, given my tech stack, to make the above happen?

**The 2026 Standard Architecture: iron-session**

The standard utility for stateless Next.js 15 / React 19 apps without a dedicated Postgres database is `iron-session` (specifically its Next.js App Router implementation).

**What it is:** A highly minimal, official Vercel-recommended library that encrypts your JSON payload (basket IDs, address, shipping ID) using AES-GCM encryption and stores it securely in an HTTP-Only cookie.

**Why this is the standard for your Sanity/Stripe stack:**

- **Zero Database Architecture:** It allows you to safely persist the checkout state across multiple funnel pages without ever writing intermediate data to Sanity.
- **Edge & Server Action Native:** It is fully compatible with Next.js 15 Server Actions and Edge Middleware, utilizing standard Web Crypto APIs.
- **Black-Box Security:** Unlike JWTs, the cookie value is completely opaque to the user. They cannot read or modify any step of their checkout progress.
- **Minimalist:** It is incredibly lightweight. No complex Redux/Zustand hydration logic is required for secure data.

---

### Implementation Steps

Here is the exact architecture and setup to implement this as your Lead Domino.

#### A. The Dependency

Using your preferred CLI tool (Node.js environment):

```bash
npm install iron-session
```

#### B. The Configuration (Environment)

You need a 32+ character password to encrypt the cookie. This stays entirely on the server.

In your `.env.local`:

```env
SESSION_SECRET="super-secure-32-character-password-here-sang-logium"
```

#### C. The Utility File (`/src/lib/session.ts` or `.js`)

This single file acts as the controller for your entire checkout funnel. It defines the exact shape of your checkout session and exposes the getter/setter for your Server Actions.

```typescript
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

// 1. Define the exact shape of your checkout state
export interface CheckoutSessionData {
  basket: Array<{ productId: string; quantity: number }>;
  address?: {
    city: string;
    postalCode: string;
    street: string;
    country: string;
  };
  shippingId?: string;
}

// 2. Configure the encryption
const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "sang_logium_checkout",
  cookieOptions: {
    // secure: true should be used in production (HTTPS)
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

// 3. Export the utility for your Server Actions
export async function getCheckoutSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<CheckoutSessionData>(cookieStore, sessionOptions);
  
  // Initialize default structure if it doesn't exist
  if (!session.basket) {
    session.basket = [];
  }
  
  return session;
}
```

#### D. Usage in a Server Action (The Next Domino)

Once this utility exists, your checkout flow becomes trivial. Here is an example of how you will update the shipping choice securely moving forward:

```typescript
"use server"
import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveShippingAndProceed(shippingId: string) {
  // 1. Retrieve and decrypt the session
  const session = await getCheckoutSession();
  
  // 2. Append the new data
  session.shippingId = shippingId;
  
  // 3. Encrypt and save back to the HTTP-Only cookie
  await session.save();
  
  // 4. Move forward in the funnel
  redirect("/checkout/payment");
}
```

---

**Safety Check Status:** The architecture strictly avoids unnecessary database writes, securely encrypts the payload, is perfectly compatible with Next.js 15 Server Actions, and relies entirely on standard Node ecosystem tools.


How does that relate to important things that happen for end-user before checkout and during checkout? 
- basket page - 
- basket page - initial shipping cost API fetch based on basket and parcel data  




---

## AI Cooperation Workflow

**Question:** AI cooperation? What should my workflow be?

Here is the professional orchestration strategy for your 2026 AI toolkit.

To execute this specific, high-risk refactor (Basket Page through Payment) while preserving your UI and deleting the bad server state, you need a strict separation of duties.

### The Hierarchy

- **You:** The Director. You hold the context, trigger the workflows, and run the local verifications.
- **Gemini / Kimi 2.6:** The Lead Architects & Auditors. Used for intelligence gathering (`/task`) and generating the sprint blueprint (`/sprint`).
- **SWE 1.6 / Claude Code (Windsurf):** The Deterministic Execution Engines. Used strictly for surgical code manipulation (`/implement`).

---

### Step 1: Intelligence & Blueprinting (`/task` & `/sprint` with Gemini)

Before you touch the IDE's execution agent, you define the physics of the work here.

**The `/task` Execution:** We have already essentially run Steps 1-5 of your `/task` workflow in our previous prompts. We gathered intelligence, verified the 2026 standards, and falsified the bad approaches (cookie overflow, Sanity writes).

**The `/sprint` Generation:** You prompt me (Gemini) with your `/sprint` command, supplying the conclusions we just reached. I will output the exact `.todo` file.

**The Secret Weapon:** In the "Architecture Contract" phase of the `.todo`, we will explicitly define the iron-session schema and explicitly state that all client state tools (Zustand/Redux) are banned from the checkout funnel.

**Issue Tracking:** You map the generated scope contracts from the `.todo` into your Beads issue tracker inside Windsurf.

---

### Step 2: The Surgical Extraction (`/implement` with SWE 1.6 / Claude Code)

This is the most critical phase. You must use the `/implement` protocol to strictly bind the local agent, preventing it from hallucinating or touching your good UI code.

When you pass the `/implement` command to SWE 1.6 or Claude Code in Windsurf, you must define the paths exactly like this:

**Explicit Refined Scope:**

> "Extract legacy checkout state management and implement Next.js 15 stateless iron-session tracer bullets."

**Read-Only Context Paths (The Shields):**

- `src/components/ui/**/*.tsx` (Protects your Tailwind/Layout)
- `src/app/checkout/**/*Form.tsx` (Protects your React Hook Form client components)
- `src/store/basket.ts` (Protects your 100% OK client basket)

**Allowed Write Scope Paths (The Scalpel):**

- `src/lib/session.ts` (To create the new utility)
- `src/actions/checkout.ts` (To create the Server Actions)
- `src/app/checkout/**/page.tsx` (To rewire the Server Components)
- `[Path to your old bad state files]` (Explicitly command the agent to delete/strip these using native Node.js file operations, no terminal scripts needed).

**Execution Guardrail:** By locking the Write Scope, SWE 1.6 cannot accidentally rewrite your UI just because it thought a different Tailwind class looked better. It forces the agent to focus purely on the server-to-server data handover.

---

### Step 3: Atomic Verification (`/test` and Build Gates)

Because you are building a tracer bullet (Vertical Slicing), your verification loop must be incredibly tight.

**Run Scope 1 (Basket → Address):** Windsurf implements `initCheckoutSession` and deletes the old transition logic.

**The Build Gate:** Run your Next.js build. (Note: Stick strictly to `npm run build` or native Node scripts. Do not let the agent use or suggest PowerShell commands for verification).

**The Visual Gate:** Check your Node terminal for the `console.log(session)`. If the array is there, the tracer bullet worked.

**The Re-Group:** If SWE 1.6 fails the `/test` or hallucinates, stop. Do not let SWE 1.6 guess the architecture. Bring the exact error or edge case back to me (Gemini) using Step 8 of your `/task` workflow ("if anything at any point starts to complicate... immediately stop and ask"). I will fix the architectural flaw, and you pass the corrected logic back to SWE 1.6.

---

### Summary of the AI Stack Routine

- **Gemini** = Map the territory (`/task`) & draw the boundaries (`/sprint`).
- **Beads** = Track the milestones.
- **SWE 1.6 / Opus 4.7** = Execute inside the fenced Write Scope Paths (`/implement`) to rip out the bad and wire the new Server Actions, protecting the UI.








## AI Cooperation Workflow - UPDATED

Here is the professional evaluation of your AI cooperation workflow for the Next.js 15 tracer bullet, addressing your exact sequencing, deletion, and issue-tracking questions based on 2026 headless e-commerce first principles.

---

### 1. The Deletion Strategy: Should You Delete First?

**Do not delete the old implementation upfront.** In modern LLM-assisted development, performing a massive "rip and replace" before establishing the new architecture is a critical anti-pattern.

**The Risk:** If you delete all the bad state management files beforehand, you destroy the local context within Windsurf. SWE 1.6 relies on the existing codebase to understand your prop drilling, your React Hook Form schemas, and the exact DOM structure you want to preserve.

**The 2026 Standard (Shadow Replacement):** The deletion must be surgical and happen during the vertical slicing. When you execute Scope 2 (Address Stage) via the `/implement` command, you instruct the agent to wire the new iron-session Server Action and simultaneously strip out the legacy Zustand/client-state logic for that specific page. This guarantees your UI and Furgonetka integrations remain intact while the underlying plumbing is swapped out.

---

### 2. The Beads Protocol: Issue Tracking

Your intuition is correct. Generating Beads issues before the sprint blueprint causes architectural drift.

**The Sequencing Rule:** Gemini `/sprint` → `.todo` file → Beads.

Here is exactly how to structure your issue tracker:

- **Do not heavily modify the `/sprint` workflow:** Keep your `/sprint` command focused on UX flows, state transitions, and the 5 Scope Contracts (Scope 0 to Scope 4).
- **Hierarchical Mapping:** Once the `.todo` is generated, translate it into Beads hierarchically. This perfectly maps to the 2026 Vertical Slicing standard.

**Epic:** Tracer Checkout Engine

- **Task 1:** Scope 0 - Foundational Layer (session.ts)
- **Task 2:** Scope 1 - Basket to Address Transition
- **Task 3:** Scope 2 - Address Capture & Validation
- **Task 4:** Scope 3 - Shipping Matrix & Lock
- **Task 5:** Scope 4 - Financial Lock & Stripe Intent

This 1:1 mapping ensures that when you unleash SWE 1.6 on a Beads issue, the boundaries are already mathematically defined.

---

### 3. The 2026 AI Cooperation Workflow

To execute this safely within Windsurf, utilizing your specific toolset and Node.js environment preferences, follow this exact orchestration loop:

#### Phase 1: The Blueprint (Gemini)

**Input:** You run the `/sprint` command here with me (Gemini). We use the intelligence from our 1000-line Q&A file to lock in the iron-session architecture.

**Output:** A pristine `.todo` file outlining the 5 Vertical Slices, complete with strict constraints (e.g., No client-side state for checkout data, no PowerShell commands, strictly Node.js/JSON file manipulation).

#### Phase 2: The Tracker (You & Beads)

**Action:** You manually (or via an IDE script) copy the 5 Scope Contracts from the `.todo` file into 5 distinct, hierarchical Beads issues.

**Validation:** The tracker now acts as the single source of truth for the local agent.

#### Phase 3: Surgical Execution (Windsurf / SWE 1.6)

For each individual Beads task, you trigger your `/implement` workflow.

- **The Prompt:** Open the first Beads issue (Scope 0). Run the `/implement` protocol.
- **The Shields:** Explicitly define the Read-Only Context Paths. Lock the agent out of your `src/components/ui/` and your existing client basket (`src/store/basket.ts`).
- **The Scalpel:** Define the Allowed Write Scope Paths (e.g., `src/lib/session.ts`).
- **The Execution:** SWE 1.6 writes the isolated tracer code.

#### Phase 4: Atomic Verification (You)

- **The Build Gate:** Before moving to the next Beads issue, you run your native Node verification (`npm run build`).
- **The Server Log Check:** You check your IDE terminal. Did the server action correctly `console.log` the encrypted session data?

**If Pass:** Close the Beads issue. Move to the next vertical slice.

**If Fail:** Stop. Do not let SWE 1.6 hallucinate a fix. Bring the error trace back to Gemini to recalibrate the architecture.

---

**By strictly siloing the "Thinking" (Gemini) from the "Doing" (SWE 1.6 inside Windsurf), you prevent the local agent from over-complicating the Next.js 15 mechanics or destroying your existing front-end work.**

---

## Sprint Sequencing Strategy

**Question:** Split sprints, in order of execution, to relatively small, easy to manage parts (max 6-7 scopes at a time). Compare vs best practices/first principle. What would be the overall map of sprints sequence? Each vertical slice would likely get 2-3 sprints. Would you be able to map or diagram that map?

### The Evaluation: Splitting Sprints

**The Good:** Restricting a sprint to a maximum of 5–7 micro-scopes is the absolute gold standard for AI-assisted development. Local execution agents like SWE 1.6 degrade in performance and begin hallucinating when context windows get overloaded with too many tasks. Small, tight scopes keep the agent deterministic.

**The Red Flag (Falsification):** "...each vertical slice would likely get 2-3 sprints"

This violates the First Principle of the Tracer Bullet. If you split a single vertical slice across 3 sprints (e.g., Sprint 1: UI, Sprint 2: Server Actions, Sprint 3: Iron-Session), you are reverting to Horizontal Slicing.

**Why it fails:** If Sprint 1 only builds UI, you have no way to test if the data actually persists to the server. You are writing blind code.

### The 2026 Standard: 1 Sprint = 1 Complete Vertical Funnel Step

A sprint must cut completely through the stack (UI → Action → Session → API) for one specific page so that by the end of the sprint, that page is 100% functional and verified.

### The Architectural Sequence Map

Instead of slicing a page across multiple sprints, you slice the funnel into sequential sprints. Each sprint acts as the Lead Domino for the next, guaranteeing the iron-session cookie carries the correct data forward.

Here is the precise 2026 e-commerce roadmap:

#### Sprint 1: Foundation & The Transition (Proves the client-to-server boundary)

**Scopes:** Setup session.ts → Wire client checkout button → Create initCheckoutSession Action → Redirect to Address.

#### Sprint 2: The Address Capture (Proves session mutation)

**Scopes:** Native Server Form → saveAddress Action → Validate via Google API → Append to Session → Redirect to Shipping.

#### Sprint 3: The Shipping Lock (Proves unalterable financial calculation)

**Scopes:** Server reads Address → Fetch Sanity Parcel data → Show flat-rate/API options → saveShipping Action locks cost → Redirect to Payment.

#### Sprint 4: The Financial Payload (Proves Stripe integration)

**Scopes:** Server fetches fresh Sanity prices → Adds trusted Session shipping cost → Generates Stripe Payment Intent → Mounts React Elements.

#### Sprint 5: The Async Resolution (Proves background mutations)

**Scopes:** Listen for Stripe Webhook → Create Sanity Order → Decrement Stock → Display Return Page.

---
