# Phase 8 — Notification preferences

**Priority: low.** Do not start until phases 1–7 are shipped and verified.
**Depends on:** nothing technically.
**Closes:** G7.

---

## Scope, kept minimal

The audit doesn't specify which notifications exist beyond transactional auth/order emails (verification, reset, order confirmation). Don't invent a large preference system. Build exactly one boolean the store plausibly needs:

- `marketingEmailsOptIn` (boolean, default `false`) — whether the user wants promotional/marketing email, as distinct from transactional email (verification, password reset, order updates), which must never be gated by this flag — those are not optional.

## What to build

1. **Schema:** add `marketingEmailsOptIn` (boolean, default `false`) to `sanity-cms/schemaTypes/userType.ts`.
2. **Server action:** `updatePreferences(formData)` in `app/(store)/account/actions.ts` (same file as phase 2's `updateName`, or a new `preferences/actions.ts` if that file is getting crowded) — `requireSession()`, patch `userProfile.marketingEmailsOptIn`.
3. **UI:** a "Notifications" section on `/account` with a single checkbox, following the existing form pattern.
4. Do not wire this into an actual email-sending decision in this phase — that's a separate marketing-email-sending feature that doesn't exist yet in this codebase. This phase only stores the preference; whatever future marketing-email system gets built should read it.

## Acceptance criteria

- Toggling the checkbox persists to `userProfile.marketingEmailsOptIn`.
- Transactional emails (verification, reset, order confirmation) are unaffected — confirm none of `lib/email.ts`'s existing send functions were touched.
