# Forms & Inputs Audit — Sang Logium (source-only, 2026 standards)
_Generated 2026-09-02 by automated source audit. Code inspection only; zero doc reliance._

## Form inventory

| Form | File | Validation | Autocomplete | Mobile input types | Double-submit guard | Notable gap |
|---|---|---|---|---|---|---|
| Site search | `app/components/layout/header/SearchField.tsx` | client: min length 2, trim; no schema | none | `type="text"` (not `search`), no `enterKeyHint` | N/A (nav push) | placeholder-as-label (aria-label only), not `type="search"` |
| Newsletter signup | `app/components/features/newsletter/NewsletterSignup.client.tsx` | client: `required` + native email; server: Zod (`api/newsletter/subscribe/route.ts`) | missing `autocomplete="email"` | `type="email"` ok | yes (`disabled={status==="submitting"}`) | placeholder-as-label, success has no `aria-live` |
| Sign up | `app/(store)/sign-up/SignUpForm.tsx` | client: `required`,`minLength=8`; server: Better Auth only, no Zod | none (email/name/password all bare) | `type="email"` / `type="password"` ok | yes (`disabled={isPending}`) | no `autocomplete`, no password show/hide, error not linked/focused |
| Sign in | `app/(store)/sign-in/SignInForm.tsx` | client: `required`; server: Better Auth | none on email/password | `type="email"` / `type="password"` | yes (`signInPending`) | no `autocomplete="email"`/`current-password`, no show/hide, error not linked |
| 2FA code (sign in) | `app/(store)/sign-in/SignInForm.tsx:185` | client `required`, `maxLength=8` | `autoComplete="one-time-code"` ✓ | `inputMode="numeric"` ✓ | yes (`verifyPending`) | `type="text"` with numeric inputMode (acceptable) |
| Forgot password | `app/(store)/forgot-password/ForgotPasswordForm.tsx` | client `required`; server Better Auth | missing `autocomplete="email"` | `type="email"` ok | yes (`isPending`) | neutral success copy is good; error not `role="alert"` |
| Reset password | `app/(store)/reset-password/ResetPasswordForm.tsx` | client: match check on submit only | missing `autocomplete="new-password"` | `type="password"` | yes (`isPending \|\| !token \|\| success`) | no show/hide, mismatch error rendered at top not by confirm field |
| Change password | `app/(store)/account/AccountActions.client.tsx:143` | client: match check in action; `minLength=8` | none (`current`/`new`/`confirm` all bare) | `type="password"` | yes (`changePending`) | no `autocomplete`, no show/hide, no inline field errors |
| Update display name | `app/(store)/account/AccountActions.client.tsx:210` | server: non-empty trim (`account/actions.ts`) | missing `autocomplete="name"` | `type="text"` | yes (`namePending`) | — |
| Notification prefs | `app/(store)/account/AccountActions.client.tsx:251` | server: boolean coerce | N/A checkbox | N/A | yes (`preferencePending`) | success feedback present ✓ |
| Delete account | `app/(store)/account/AccountActions.client.tsx:320` | client: `required` + fresh-session gate | missing `autocomplete="current-password"` | `type="password"` | yes (`isDeleting`) | confirm-reveal step present; no typed-confirmation but password suffices |
| 2FA setup / verify / disable | `app/components/features/auth/TwoFactorSection.tsx` | client: `if(!x)return` + `required` | password fields bare; code has `one-time-code` ✓ | code `inputMode="numeric"` ✓ | yes (`isPending`/`disablePending`) | backup codes shown once with no copy/download button |
| Checkout address | `app/checkout/address/AddressForm.tsx` | client `required`; server: presence-only, no Zod (`actions/address/address.ts`, `actions/checkout/index.ts`) | **none on any field** | phone `type="tel"` ✓; postalCode `type="text"` no inputMode | yes (`isLoading`) | **labels not associated (no `htmlFor`/`id`)**; generic top-only errors |
| Account addresses add/edit | `app/(store)/account/addresses/AddressesClient.tsx` | client `required`; server: presence-only (`addresses/actions.ts`) | **none on any field** | phone `type="tel"` ✓ | yes (`isSaving`) | **labels not associated**; REGIONS list (PL+GB) inconsistent with checkout (PL only) |
| Checkout shipping select | `app/checkout/shipping/ShippingPageClient.tsx` | radio, `<label>` wraps input ✓ | N/A | N/A | server action redirect | ok |
| Stripe payment | `app/checkout/payment/PaymentForm.client.tsx` | Stripe `elements.submit()` + native PaymentElement errors | Stripe Elements (cc) handled | Stripe-managed | yes (`isLoading \|\| !stripe \|\| !elements`) | ExpressCheckout `onConfirm` has no local in-flight guard |
| Price range filter | `app/components/features/filters/PriceRangeSlider.tsx` | clamps to bounds | N/A | `type="range"` + `aria-label` ✓ | debounced URL write | no numeric direct-entry inputs |
| Contact | `app/(store)/contact/page.tsx` | — | — | — | — | no form at all — `mailto:` links only |

## Summary

19 form surfaces inspected. Severity: 1 P0, 7 P1, 8 P2; the rest are clean or acceptable.
Verdict: the auth forms are competently built (correct `htmlFor`/`id`, pending guards, success states, neutral forgot-password copy) but share three systemic gaps — zero `autocomplete` on email/password fields, no password show/hide anywhere, and submit errors rendered as unlinked/unfocused `<div>`s with no `role="alert"`.
The checkout + account **address forms are the weak point**: labels are not programmatically associated with their inputs, no field carries `autocomplete`, and server validation is presence-only (no Zod) while the newsletter route does use Zod — an inconsistency.
No double-charge risk found: every payment/auth/address submit path disables on an in-flight/pending flag and Stripe is driven by a single PaymentIntent client secret.

## P0 — a professional evaluator would visibly wince

### P0-1 Address form labels are not associated with their inputs
- **Where:** `app/checkout/address/AddressForm.tsx:136-241` and `app/(store)/account/addresses/AddressesClient.tsx:102-212`
- **What:** Every field renders `<label className="type-caption ...">First Name</label>` followed by `<input name="firstName" ...>` — the `<label>` has no `htmlFor`, the `<input>` has no `id`, and the label does not wrap the input. There is no `aria-label`/`aria-labelledby` fallback either.
- **User-visible impact:** Screen-reader users on the checkout shipping-address step (and the account address book) hear "edit text, blank" with no field name; clicking a label does not focus its input. This is a WCAG 1.3.1 / 4.1.2 failure on a purchase-critical path.
- **2026 standard:** Every input has a programmatically associated `<label htmlFor>` + matching `id` (the auth forms in this same repo already do this).
- **Fix direction:** Add `id` to each input and `htmlFor` to each label (or wrap the input in the label).

## P1 — they would note it

### P1-1 No `autocomplete` on the checkout address fields
- **Where:** `app/checkout/address/AddressForm.tsx:137-241` (also `AddressesClient.tsx`)
- **What:** No field sets `autocomplete` — `firstName`/`lastName`/`phone`/`street`/`streetNumber`/`city`/`postalCode`/`regionCode` are all bare.
- **User-visible impact:** Browser/OS address autofill does not populate the checkout form; mobile users hand-type a full shipping address, the highest-abandonment step.
- **2026 standard:** `given-name`, `family-name`, `tel`, `address-line1`, `address-level2`, `postal-code`, `country` (+ optional `shipping` token).
- **Fix direction:** Add the correct `autocomplete` token to each address input.

### P1-2 No `autocomplete` on any auth email/password field
- **Where:** `sign-up/SignUpForm.tsx:79-113`, `sign-in/SignInForm.tsx:222-241`, `forgot-password/ForgotPasswordForm.tsx:48`, `reset-password/ResetPasswordForm.tsx:89-110`, `account/AccountActions.client.tsx:148-181,338`, `auth/TwoFactorSection.tsx:130,206`
- **What:** Email fields lack `autocomplete="email"`; password fields lack `current-password` / `new-password`; name field lacks `name`.
- **User-visible impact:** Password managers can't reliably identify fields; "suggest strong password" doesn't fire on sign-up/reset; users retype email on every auth screen on mobile.
- **2026 standard:** `email`, `current-password`, `new-password`, `name`, `username` where relevant.
- **Fix direction:** Annotate each field; use `new-password` on sign-up/reset/change, `current-password` on sign-in/delete/2FA.

### P1-3 Submit errors are not announced or focused
- **Where:** `sign-up/SignUpForm.tsx:68`, `sign-in/SignInForm.tsx:139-168`, `reset-password/ResetPasswordForm.tsx:72`, `account/AccountActions.client.tsx:131-135,198-202,239-243`, `checkout/address/AddressForm.tsx:123`
- **What:** Error containers are plain `<div>`s with no `role="alert"` / `aria-live`, and focus is never moved to the error or the first invalid field after a failed submit. (Newsletter error at line 65 is the only one with `role="alert"`.)
- **User-visible impact:** A screen-reader or keyboard user submits, nothing is spoken, focus stays on the disabled button — they don't know the submit failed.
- **2026 standard:** Error summary with `role="alert"` (or `aria-live="assertive"`) and focus moved to it or to the first errored control.
- **Fix direction:** Wrap each error region in `role="alert"` and `.focus()` it (or the first bad field) on failure.

### P1-4 No password show/hide toggle on any password field
- **Where:** all password inputs — `SignUpForm.tsx:106`, `SignInForm.tsx:235`, `ResetPasswordForm.tsx:89,103`, `AccountActions.client.tsx:148,161,175,338`, `TwoFactorSection.tsx:130,206`
- **What:** Every `type="password"` is fixed; there is no reveal control.
- **User-visible impact:** Users creating an 8+ char password (sign-up, reset, change) can't verify what they typed, raising typo-driven failures and lockouts.
- **2026 standard:** A show/hide button toggling `type` between `password`/`text`, with `aria-pressed`.
- **Fix direction:** Add a shared reveal toggle component to the password field.

### P1-5 Address validation is presence-only and schema-inconsistent
- **Where:** `app/actions/address/address.ts`, `app/(store)/account/addresses/actions.ts:15-48` (`parseAddress` — only `!x` checks), vs `app/api/newsletter/subscribe/route.ts:5-7` (Zod)
- **What:** Server accepts any non-empty string for phone/postal code/etc.; no format validation, no Zod, no shared schema — unlike the newsletter route.
- **User-visible impact:** Malformed phone/postal values are stored; the only real check is the downstream TERYT lookup, which returns one generic top-level message with no indication of which field is wrong.
- **2026 standard:** One Zod schema validated on client and server, field-level error mapping.
- **Fix direction:** Introduce an `addressSchema` (Zod) used by both the client form and the server actions.

### P1-6 Password-mismatch checked only on submit, shown away from the field
- **Where:** `reset-password/ResetPasswordForm.tsx:23-25`, `account/AccountActions.client.tsx:56-58`
- **What:** "Passwords do not match" is computed only inside the submit action and rendered in the top error banner, not adjacent to the Confirm field; no live comparison.
- **User-visible impact:** User submits, waits, scrolls up to read a generic banner, scrolls back down to fix the confirm field.
- **2026 standard:** Inline error tied to the confirm input via `aria-describedby`, updated on blur/change.
- **Fix direction:** Move the mismatch message under the confirm field and validate on blur.

### P1-7 2FA backup codes shown once with no copy/download affordance
- **Where:** `app/components/features/auth/TwoFactorSection.tsx:257-267`
- **What:** Backup codes render in a `<ul>` with copy "You will only see them once" but no copy-to-clipboard or download button.
- **User-visible impact:** Users must manually transcribe recovery codes; a misheard/mistyped code means permanent lockout risk if they lose the authenticator.
- **2026 standard:** Copy-all and download-as-file actions, plus a "I've saved these" confirmation before proceeding.
- **Fix direction:** Add copy + download buttons and gate the "Enable 2FA" button on acknowledgement.

## P2 — polish

### P2-1 Placeholder used as the visible label
- **Where:** `NewsletterSignup.client.tsx:45` (`placeholder="Your email address"`, `aria-label` only), `SearchField.tsx:238,323` (`placeholder="Search products..."`)
- **What:** No visible `<label>`; the placeholder carries the field name and vanishes on input.
- **2026 standard:** Persistent visible label (visually-hidden is acceptable for search with an icon, but a floating/static label is better for newsletter).
- **Fix direction:** Add a visible or visually-hidden `<label>` and keep placeholder as example text only.

### P2-2 Site search is `type="text"`, not `type="search"`, with no `enterKeyHint`
- **Where:** `app/components/layout/header/SearchField.tsx:237,322`
- **What:** `type="text"` and no `enterKeyHint="search"` / `inputMode`.
- **2026 standard:** `type="search"` + `enterKeyHint="search"` for the correct mobile keyboard and clear affordance.
- **Fix direction:** Switch type and add `enterKeyHint`.

### P2-3 Success feedback lacks `aria-live`
- **Where:** `NewsletterSignup.client.tsx:61-63` (success `<p>` no live region), `SignUpForm.tsx:44-62`, most account sections' success banners
- **What:** Error path sometimes has `role="alert"`, success path never does.
- **Fix direction:** Give success banners `role="status"` / `aria-live="polite"`.

### P2-4 No required-field indication in the UI
- **Where:** all forms — labels are e.g. `<label>First Name</label>` with a `required` attr but no asterisk or "(required)" text
- **What:** Sighted users get no advance signal of which fields are mandatory (nearly all are).
- **Fix direction:** Mark required fields (or state "All fields required") consistently.

### P2-5 Polish postal code field has no `inputMode`
- **Where:** `AddressForm.tsx:236`, `AddressesClient.tsx:205`
- **What:** `type="text"` with no `inputMode`; PL postal codes are `NN-NNN`.
- **Fix direction:** `inputMode="numeric"` (or a formatted-input mask).

### P2-6 Social sign-in buttons have no in-flight disable
- **Where:** `SignUpForm.tsx:133-139`, `SignInForm.tsx:272-278`
- **What:** `handleGoogleSignUp`/`handleGoogleSignIn` fire on click with no pending state; a double-tap can call `authClient.signIn.social` twice before redirect.
- **Fix direction:** Disable the button after first click.

### P2-7 ExpressCheckout confirm path has no local guard
- **Where:** `app/checkout/payment/PaymentForm.client.tsx:220-239`
- **What:** `onConfirm` calls `stripe.confirmPayment` without setting/checking `isLoading` (the manual `handlePay` does). Stripe's own element state mitigates this, so low risk.
- **Fix direction:** Share the `isLoading` guard across both confirm paths.

### P2-8 Price range filter offers no numeric entry
- **Where:** `app/components/features/filters/PriceRangeSlider.tsx:146-163`
- **What:** Two overlapping `type="range"` inputs only; no min/max number fields for precise values. Keyboard access works via arrows; `aria-valuetext` (currency) is not set.
- **Fix direction:** Add optional min/max number inputs and `aria-valuetext="$X"`.

## Checked and OK

- **Double-submit protection:** every mutating submit disables its button on a pending/in-flight flag — `useActionState` `isPending` (sign-in/up, forgot, reset, change password, name, prefs), explicit `isLoading`/`isSaving`/`isDeleting`/`isProcessing` state (address, addresses, delete account, payment). No unguarded submit handler found.
- **Stripe double-charge:** `PaymentForm` drives a single PaymentIntent via `clientSecret`; Pay buttons (card + mobile sticky) both bind the same `disabled={isLoading || !stripe || !elements}`; card/validation errors delegated to native `PaymentElement`.
- **Auth form label association:** sign-in, sign-up, forgot, reset, change-password, delete-account, 2FA all use correct `<label htmlFor>` + input `id`.
- **2FA / OTP fields:** `inputMode="numeric"` + `autoComplete="one-time-code"` + `maxLength` on both the sign-in 2FA step and the setup verify step.
- **Forgot-password messaging:** returns the neutral "If an account exists for this email, a reset link has been sent" — no account enumeration.
- **Reset-password button:** correctly disabled when `!token` or after success, with an explicit invalid/expired-token branch and a "request a new link" path.
- **Delete account:** requires a fresh session (`requireFreshSession`, 5-min `freshAge`) both to reveal the form and to submit, plus a password and an explicit reveal step.
- **Change password:** `revokeOtherSessions: true` and a success message stating other devices were signed out.
- **Newsletter:** server-side Zod validation, disabled-while-submitting, clears the field on success, `role="alert"` on the error message.
- **Search:** `role="search"`, `aria-label`, full combobox ARIA (`aria-expanded`, `aria-controls`, `aria-activedescendant`), debounced with `AbortController`, `maxLength={500}`.
- **Price slider:** `aria-label` on both handles, `focus-visible` outline, values clamped to bounds so a hand-edited URL can't break it.
- **Input focus visibility:** `.input-field` / `.input-base` / `.input-select` (tailwind.config.ts) all define a `:focus-visible` `2px` outline with offset.
