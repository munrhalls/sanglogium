# Phase 7 — Guest-to-account order merge

**Depends on:** nothing technically, but it's a natural companion to the order-detail work in phase 5 — do that first so there's somewhere meaningful for merged orders to show up.
**Closes:** G11.

---

## The problem, precisely

Orders get `userId` set **only at creation time** (`createOrderFromPaymentIntent.ts`, confirmed reading current source: `userId: sessionData.userId` at line ~78/153, sourced from `pi.metadata?.userId`, sourced from the auth session at the time of checkout). If someone checks out as a guest with `jane@example.com`, then later creates an account with that same email, their prior guest orders (`isGuest: true`, `userId` unset) are never retroactively linked. This is expected/correct behavior for the orders that exist today — the gap is that nothing ever offers to link them.

## Design decision: link by verified email only, on sign-up, once

Do not build an ongoing background job. Do not let a user claim someone else's orders by typing an arbitrary email — only link orders whose `customerEmail` matches the **verified** email of the account doing the linking, and only trigger it right after email verification succeeds (at that point we know the person controls that inbox).

## What to build

1. **New function** in a new file `lib/checkout/mergeGuestOrders.ts`:
   ```ts
   export async function mergeGuestOrdersByEmail(userId: string, verifiedEmail: string) {
     const guestOrders = await backendClient.fetch(
       `*[_type == "order" && isGuest == true && customerEmail == $email && !defined(userId)]{_id}`,
       { email: verifiedEmail }
     );
     if (guestOrders.length === 0) return { linked: 0 };
     const tx = backendClient.transaction();
     for (const order of guestOrders) {
       tx.patch(order._id, (p) => p.set({ userId, isGuest: false }));
     }
     await tx.commit();
     return { linked: guestOrders.length };
   }
   ```

2. **Call it exactly once, right after email verification succeeds** — not on every sign-in (that would re-run needlessly and could race with a second concurrent session). The natural hook point is `lib/auth.ts`'s `emailVerification` handling — better-auth doesn't currently expose an "after verify" hook in this codebase's config, so the pragmatic integration point is: extend the `databaseHooks.user.update.after` hook (added in phase 3, or add fresh here if phase 3 hasn't shipped) to check `if (user.emailVerified) { await mergeGuestOrdersByEmail(user.id, user.email); }`. Guard against re-running on every subsequent unrelated update by checking there isn't already a linked order for that user first, or by tracking a boolean — keep this simple, re-running the merge query is idempotent (the `!defined(userId)` filter means already-linked orders won't be touched twice), so a lightweight re-check on every user-update is acceptable and doesn't need extra state.

3. Surface the result to the user: on `/account`, if `mergeGuestOrdersByEmail` linked orders during this session, show a one-time banner ("We found N previous order(s) placed with this email and added them to your account.") — simplest implementation is to have the merge function's result surfaced via a query param or session flag read once on `/account`, not a persistent notification system (that's phase 8's territory).

## Explicitly out of scope

- Merging guest **basket/cart** state — that's checkout-session behavior, unrelated to orders, not mentioned in the original audit.
- Any UI for a user to manually claim orders under a different email — rejected by design (security: would allow claiming someone else's orders by typing their email).

## Acceptance criteria

- A guest order placed with `jane@example.com`, followed by a new account sign-up + verification using `jane@example.com`, results in that order having `userId` set and `isGuest: false`.
- A guest order under a **different** email is never linked to an unrelated account.
- Running the merge twice for the same user does not duplicate or corrupt data (idempotent).
- `/account/orders` now shows the previously-guest order for the newly-linked account.
