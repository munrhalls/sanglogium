# Chunk 3 Contingency Plan

**Date:** 2026-05-14
**Chunk:** sang-logium-fkj (Chunk 3: Request Format Verification for Furgonetka)
**Purpose:** Systematic contingency planning to mitigate risks and avoid amateur naive attempts

---

## Contingency Framework

**Decision Rule:** If any step fails or complications arise, follow the contingency for that step before proceeding. If contingency fails, STOP and escalate to user.

---

## Current Blocker: Phone Number Format

**Risk:** Phone number validation rejecting all tested formats

**Tested Formats (all rejected):**
- `+48123456789` - rejected (invalid format)
- `123456789` - rejected (invalid format)
- `+48 123 456 789` - rejected (invalid format)

**Contingencies:**
1. Try standard Polish mobile format: `600123456` (9 digits, no prefix)
2. Try with Polish country code but no spaces: `0048123456789`
3. Try with international format: `48123456789` (no + prefix)
4. Check if phone field is optional for specific carriers (remove temporarily to test)
5. Use account holder's actual phone number from Furgonetka panel
6. Research PHP client source code for phone format examples
7. Contact Furgonetka support for phone format specification

**Stop Condition:** If 5+ phone formats tested and all rejected, STOP - requires official documentation or support contact

**Current Status:** 3 formats tested, 3 rejected. 2 more attempts before escalation.

---

## Step 3: Test with Incremental Field Additions

**Risk:** API validation errors continue after adding fields

**Contingencies:**
1. Log each validation error clearly with field path
2. Translate Polish error messages to understand requirements
3. Add only one field at a time (already doing this)
4. If validation error is unclear, try removing field and adding different field
5. Document pattern of required fields vs optional fields

**Stop Condition:** If 10+ field addition attempts and still getting validation errors, STOP - request format may be fundamentally different than expected

---

## Step 4: Validate Complete Request Format

**Risk:** Complete request format still fails (502 Bad Gateway or 400 errors)

**Contingencies:**
1. Verify all required fields are present based on validation errors
2. Check if API is down (test with simple GET to /account/services)
3. Try different service_ids (not just InPost 11597700)
4. Verify parcel dimensions are in correct units (cm vs mm)
5. Check if weight is in correct units (kg vs g)
6. Try with minimal viable package (1x1x1 cm, 0.1 kg)

**Stop Condition:** If 5+ service_ids tested and all fail with same error, STOP - account/service configuration issue

---

## Step 5: Document Request Format

**Risk:** Cannot determine exact format due to persistent validation errors

**Contingencies:**
1. Document what IS known (required fields, data types, structure)
2. Document what IS UNKNOWN (specific formats, optional fields)
3. Mark as "partial specification" with clear gaps
4. Note that production implementation may require additional refinement
5. Provide examples of working requests (if any) vs failing requests

**Stop Condition:** None - documentation can be partial if endpoint is blocked

---

## Step 6: Create User-Runnable Verification Script

**Risk:** Script fails to run or requires environment setup

**Contingencies:**
1. Use hardcoded credentials (like existing scripts)
2. Provide clear error messages if script fails
3. Include fallback to manual testing instructions
4. Test script before delivering to user
5. Document script dependencies (Node.js version, etc.)

**Stop Condition:** None - script can be partial if endpoint blocked

---

## General API Stability Contingencies

**Risk:** Sandbox API is unstable or returns 502 Bad Gateway

**Contingencies:**
1. Test /account/services first (known working endpoint) to verify API is up
2. If /account/services fails, API is down - wait and retry later
3. If 502 errors persist across multiple attempts, note as sandbox environment issue
4. Document that production API may behave differently

**Stop Condition:** If /account/services fails with 502, STOP - sandbox environment down

---

## Data Format Contingencies

**Risk:** Data type or unit mismatches (cm vs mm, kg vs g)

**Contingencies:**
1. Try multiple unit variations for dimensions (cm, mm)
2. Try multiple unit variations for weight (kg, g)
3. Check if numeric fields accept decimals or require integers
4. Check if string fields have length limits
5. Test with realistic values (not edge cases)

**Stop Condition:** If 5+ unit variations tested and all rejected, STOP - requires official documentation

---

## Escalation Triggers (STOP conditions)

**Stop immediately and escalate to user if:**
- Phone number format: 5+ formats tested and all rejected
- Field additions: 10+ attempts and still getting validation errors
- Service_ids: 5+ different carriers tested and all fail with same error
- API stability: /account/services returns 502 (sandbox down)
- Data format: 5+ unit variations tested and all rejected
- Any step requires >3 contingency attempts without progress

**Do not sink time on:** Endless format guessing, credential troubleshooting, complex multi-field experiments without clear direction

---

## Success Criteria

Chunk 3 is successful if:
- Request format is validated (at least one successful API response)
- OR Request format is documented with clear gaps if endpoint blocked
- Phone number format is resolved OR documented as unknown with workarounds
- User-runnable verification script provided (may be partial if blocked)
- All validation errors are documented and understood

**Partial success acceptable:** If phone format or other specific field format cannot be resolved, document as unknown and provide workarounds (e.g., use account holder's actual data, contact support)

---

## Current Progress Summary

**Completed:**
- Request structure identified (parcels array, service_id, pickup, sender, receiver)
- Authentication pattern working
- Most fields validating correctly

**Blocked:**
- Phone number format (3 formats tested, 3 rejected)

**Next Actions:**
1. Try 2 more phone format variations
2. If still blocked, escalate to user
3. Document partial specification if needed
4. Proceed with remaining steps using workarounds if possible
