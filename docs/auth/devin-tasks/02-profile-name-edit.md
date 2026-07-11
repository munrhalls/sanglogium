# Phase 2 — Profile editing: display name

**Depends on:** Phase 1 (clean baseline; not a hard technical dependency, just do it in order).
**Closes:** G1 (partial — name only; email is Phase 3).

---

## Why this is two writes, not one

The user's display name lives in **two places** that must stay in sync:
1. better-auth's own `user.name` (used by `session.user.name`, shown as the account-page greeting).
2. Sanity's `userProfile.name` (mirrored at creation time by the `databaseHooks.user.create.after` hook in `lib/auth.ts`).

better-auth has no built-in hook for **updates** (only `user.create.after` is wired today). So a name change must explicitly write to both, in one server action, or the Sanity copy will silently drift out of sync.

## What to build

1. **New server action** — add to `app/(store)/account/actions.ts` (new file):
   ```ts
   "use server";
   import { requireSession } from "@/lib/auth/dal";
   import { auth } from "@/lib/auth";
   import { backendClient } from "@/sanity-cms/lib/backendClient";
   import { headers } from "next/headers";

   export async function updateName(formData: FormData) {
     const session = await requireSession();
     const name = (formData.get("name") as string)?.trim();
     if (!name) return { error: "Name cannot be empty." };

     await auth.api.updateUser({
       headers: await headers(),
       body: { name },
     });

     const profile = await backendClient.fetch(
       `*[_type == "userProfile" && authId == $authId][0]{_id}`,
       { authId: session.userId }
     );
     if (profile?._id) {
       await backendClient.patch(profile._id).set({ name }).commit();
     }

     return { success: true, name };
   }
   ```
   (Match the existing error/success return shape used by `AccountActions.client.tsx`'s `changeAction` — `{ error }` or `{ success, ... }`.)

2. **UI** — add a "Profile" section to `app/(store)/account/AccountActions.client.tsx` (or split it into a new `ProfileActions.client.tsx` if the file is getting long — either is fine, keep the existing `card-base`/`type-section-hed` visual pattern). A single `name` text input, pre-filled with the current name (pass `session.user.name` down as a prop from `account/page.tsx`), `useActionState` wrapping the new `updateName` action, standard error/success banners.

3. Update `app/(store)/account/page.tsx` to pass `session.user.name` into whichever client component now owns the profile form.

## Explicitly out of scope for this phase

- Email change — separate flow, separate phase (03), because it requires verification of the new address and cannot reuse this simple pattern.
- Avatar/image upload — not requested by the audit, don't add it.

## Acceptance criteria

- Changing the name on `/account` updates the greeting ("Welcome, {name}!") after a refresh.
- The corresponding `userProfile` document in Sanity has the same `name` value (verify via a GROQ fetch by `authId` in a scratch script, or via Sanity Studio).
- Empty name submission shows an inline error, no write occurs.
- Existing Change Password / Sign Out sections on the account page are untouched and still work.
