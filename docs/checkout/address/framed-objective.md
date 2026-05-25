# PRIMARY SOURCE OF TRUTH (HAPPY PATH ONLY)
This is the latest, primary source of truth for the Address Page scope.
**Scope:** Happy path tracer only. Error handling and edge cases are out of scope.
Any documentation or code unaligned with this objective is legacy and should be dismissed.
(Do not delete legacy files yet - cleanup is for later phase.)

---

- Integrate existing Address Page with iron-session (Stop 2 of checkout funnel)
- Verify address page reads session correctly (add guard if missing)
- Integrate existing Google Address Validation with iron-session
- **Add firstName, lastName, phone fields to address form** (foundational requirement)
- Modify form submission to save validated address to session
- Server reads existing checkout session cookie
- Google API validates address data (already implemented)
- Append validated address (including firstName, lastName, phone) to session
- Overwrite checkout_session cookie with new data
- Redirect to /checkout/shipping
- Final session state: { basket, address: { firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city } }
