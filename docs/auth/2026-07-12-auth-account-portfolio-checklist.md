# Auth & Account — Portfolio Live-Check Checklist

Scope: what to click through in the running app right now. Not a security audit (see `docs/auth/2026-07-11-account-auth-verification-and-gap-analysis.md` for that) — this is about what a recruiter/reviewer sees and how logging in and managing an account *feels*.

## Already solid (confirmed in code, just verify it live)

- Email+password with required verification, forgot/reset password, rate-limited
- Google sign-in, TOTP 2FA with QR setup + backup codes + "remember this device"
- Guest checkout works end-to-end; order confirmation offers "Create account" with email pre-filled
- Guest orders auto-merge into the account on sign-up/sign-in, with a visible banner
- Password change and account deletion both require a fresh session + re-entering your password
- Sign-up is 3 fields (name, email, password) — no pointless "confirm password" field
- Deep-link redirect works: bounced to `/sign-in` from `/account/orders`, you land back on `/account/orders` after login
- Google button only renders when Google sign-in is actually configured

## Fix first: the account dashboard looks unfinished

Sign-in, sign-up, and checkout all use the site's dark premium design system (`card-base`, `type-section-hed`, `btn-primary`). The `/account` landing page doesn't — it's plain text with default blue underlined links and a generic bold heading. This is the first screen a signed-in visitor sees, and it visibly breaks the brand the moment someone logs in. Restyle it to match — this is the single biggest gap between "functional" and "sellable" here.

## Live-check list

**Sign up**
- [ ] Password requirements are visible before typing, not just enforced silently on submit
- [ ] Password field has a show/hide toggle (mobile typos go undetected without one)
- [ ] Still just 3 fields, no confirm-password — keep it that way

**Sign in**
- [ ] Wrong password gives a clear, non-technical error
- [ ] Unverified email shows a working "resend verification" option
- [ ] Session survives a page refresh — no surprise logout

**Account dashboard**
- [ ] Visually matches the rest of the site (see gap above)
- [ ] Name, orders, addresses, wishlist read as clear sections, not a bare list of links
- [ ] Change password confirms other devices were signed out
- [ ] 2FA setup shows QR code, backup codes, and a clear on/off state
- [ ] Delete account requires password re-entry and warns it's irreversible

**Guest → account**
- [ ] Guest order confirmation shows "Create account" with email pre-filled
- [ ] Signing up with that email pulls in past guest orders, with a visible confirmation banner

**General trust signals**
- [ ] No console errors on sign-in/sign-up/account pages
- [ ] Full keyboard usability (tab through, submit with Enter)
- [ ] Mobile: tap targets are big enough, no horizontal scroll

## Skip for a portfolio project

- Passkeys/WebAuthn — an emerging 2026 trend, not yet a baseline expectation
- Email change, extra social providers (Apple/GitHub) — functional completeness, not a sellability blocker
- Per-device session list — "sign out all devices" already covers the trust need
