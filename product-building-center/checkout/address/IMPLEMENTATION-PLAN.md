# Address Slice — Gap-Closing Implementation Plan

Source of truth: `happy-path.mermaid`, `edge-cases.mermaid`, `component-tree.mermaid`, `srp-map.mermaid` in this folder.
Execute **one phase at a time**. Inside a phase, do the tasks in order, then **STOP** and report.

---

## HARD RULES — read before touching any file

You are coding the blueprint. **Nothing else.**

**BANNED actions (do none of these, ever, during this program):**
- `npm run dev`, `next dev`, `next build`, `next start`, `curl` to the dev server
- `tsc`, `eslint`, `prettier`, any lint/format/type command
- `vitest`, `jest`, `playwright`, any test command
- Chrome / CDP / any browser automation
- `npm install` / `npm ci`
- `git` commands (no commit, no push)
- Any command that "verifies", "checks", "builds", or "runs" the app

**BANNED behaviors:**
- Do NOT read files that are not named in the task you are on.
- Do NOT edit files that are not named in the task you are on.
- Do NOT add tests, explanatory comments, console.logs, or "improvements".
- Do NOT refactor, rename, or reformat anything outside the exact instruction.
- Do NOT touch shared/global components or data helpers (see "Do not touch" list).

**You have exactly one job per task:** write the file exactly as specified. When done, stop and report the file(s) you wrote.

---

## Files this program creates / edits (overview)

| # | File | Action |
|---|------|--------|
| 1 | `app/checkout/address/AddressForm.tsx` | REWRITE |
| 2 | `lib/address/teryt-validator.ts` | REWRITE |
| 3 | `app/actions/address/google-address-validator.frozen.ts` | CREATE |
| 4 | `app/actions/address/address.ts` | REWRITE |

## Do NOT touch (under any circumstance)

- `app/checkout/address/page.tsx`
- `app/checkout/address/AddressForm.test.tsx`
- `app/actions/address/address.test.ts`
- `app/actions/checkout/index.ts`
- `app/api/trace/route.ts`
- `app/api/shipping/route.ts`
- `app/checkout/checkout.types.ts`
- `app/checkout/_components/CheckoutStepper.tsx`
- Anything under `app/checkout/shipping/`, `app/checkout/payment/`, `app/checkout/return/`

## Explicitly OUT OF SCOPE for this program (do not attempt)

- Verifying house number / postal code against the TERYT registry at street-number granularity. Requires new research into TERYT WSDL fields not yet confirmed in this codebase — not a mechanical blueprint translation.
- Adding an apartment/flat-number field. Requires a product decision + changes rippling into `Address` type, session shape, and possibly shipping/payment slices — out of scope for this address-only program.

If either of these come up, stop and report — do not improvise a solution.

---

## PHASE 1 — Remove the telemetry side-channel from the form (SRP fix)

`AddressForm.tsx` currently fires a fire-and-forget `fetch("/api/trace", ...)` call on every submit, sending PII (name, phone, full address) to a shared logging endpoint. Per `srp-map.mermaid`, the Presentation & Capture layer's job is form UI + submit orchestration only — no telemetry side-channel. `saveAddress` (the Server Action it calls) already logs the submission correctly via `logCheckoutEvent`, so this call is also a duplicate.

### Task 1.1 — REWRITE `app/checkout/address/AddressForm.tsx`

Replace the **entire contents** of this file with:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveAddress } from "@/app/actions/checkout";
import CheckoutStepper from "../_components/CheckoutStepper";
import type { Address } from "../checkout.types";

const REGIONS = [{ code: "PL", label: "Poland" }] as const;

interface AddressFormProps {
  traceId: string;
  initialAddress?: Address;
}

export default function AddressForm({
  traceId,
  initialAddress,
}: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    regionCode: "",
    postalCode: "",
    street: "",
    streetNumber: "",
    city: "",
  });

  const isDirty = useRef(false);
  // Set by the "Continue with entered address" escape-hatch button before it
  // submits, so the next handleSubmit call bypasses Google validation.
  const skipValidationRef = useRef(false);

  // Hydrate form from session address when user returns via Back button.
  // regionCode is sanitized against REGIONS so a stale/legacy session address
  // can never leave the country select in an unmatched (broken) state, and the
  // dirty-guard prevents re-hydration from clobbering edits in the current visit.
  useEffect(() => {
    if (!initialAddress || isDirty.current) return;
    setForm({
      firstName: initialAddress.firstName || "",
      lastName: initialAddress.lastName || "",
      phone: initialAddress.phone || "",
      regionCode: REGIONS.some((r) => r.code === initialAddress.regionCode)
        ? initialAddress.regionCode
        : "",
      postalCode: initialAddress.postalCode || "",
      street: initialAddress.street || "",
      streetNumber: initialAddress.streetNumber || "",
      city: initialAddress.city || "",
    });
  }, [initialAddress]);

  const handleChange = (field: keyof typeof form, value: string) => {
    isDirty.current = true;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (formData: FormData, skip = false) => {
    setIsLoading(true);
    setError(null);

    // The escape-hatch button resubmits with skip=true so a valid address can
    // never dead-end on a strict Google validation verdict.
    const skipValidation =
      skip ||
      skipValidationRef.current ||
      formData.get("submitMode") === "skipValidation";
    skipValidationRef.current = false;

    const addressData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      regionCode: formData.get("regionCode") as string,
      postalCode: formData.get("postalCode") as string,
      street: formData.get("street") as string,
      streetNumber: formData.get("streetNumber") as string,
      city: formData.get("city") as string,
    };

    // CLICK TRACE — log exactly what happens when the user clicks the submit button
    console.log("[ADDRESS FORM] Continue to Shipping clicked", {
      traceId,
      skipValidation,
      addressData,
      initialAddressInSession: initialAddress,
    });

    try {
      const result = await saveAddress(addressData, { skipValidation });
      console.log("[ADDRESS FORM] saveAddress resolved", result);
      if (result && result.status === "FIX") {
        console.log(
          "[ADDRESS FORM] Address REJECTED by validation",
          result.errors,
        );
        setError(
          result.errors?.message ??
            "Address could not be verified. Please check your details and try again.",
        );
      }
    } catch (err) {
      // NEVER intercept Next.js redirect errors — let the framework handle navigation
      console.log("[ADDRESS FORM] saveAddress threw", err);
      unstable_rethrow(err);
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <CheckoutStepper currentStep={1} />
      <h1 className="type-section-hed mb-10 text-center">Shipping Address</h1>

      {error && (
        <div className="rounded mb-4 border border-error-500/30 bg-error-500/10 p-3">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <p className="type-overline section-header-anchor mb-6">
          Contact Information
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="type-caption mb-1.5 block">First Name</label>
            <input
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="type-caption mb-1.5 block">Last Name</label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="type-caption mb-1.5 block">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
            className="input-field"
          />
        </div>

        <p className="type-overline section-header-anchor mb-6 mt-12">
          Shipping Address
        </p>

        <div>
          <label className="type-caption mb-1.5 block">Country</label>
          <select
            name="regionCode"
            value={form.regionCode}
            onChange={(e) => handleChange("regionCode", e.target.value)}
            required
            className="input-select w-full"
          >
            <option value="" disabled>
              Select country
            </option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="type-caption mb-1.5 block">City</label>
          <input
            name="city"
            type="text"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <div>
            <label className="type-caption mb-1.5 block">Street</label>
            <input
              name="street"
              type="text"
              value={form.street}
              onChange={(e) => handleChange("street", e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="type-caption mb-1.5 block">Number</label>
            <input
              name="streetNumber"
              type="text"
              value={form.streetNumber}
              onChange={(e) => handleChange("streetNumber", e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="type-caption mb-1.5 block">Postal Code</label>
          <input
            name="postalCode"
            type="text"
            value={form.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-cart-large mt-8 w-full"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="rounded-full inline-block h-4 w-4 animate-spin border-2 border-brand-700/40 border-t-brand-700" />
              Verifying...
            </span>
          ) : (
            "Continue to Shipping"
          )}
        </button>

        {error && !isLoading && (
          <button
            type="submit"
            onClick={() => {
              skipValidationRef.current = true;
            }}
            className="btn-secondary mt-3 w-full py-3"
          >
            Continue with entered address
          </button>
        )}
      </form>
    </div>
  );
}
```

STOP.

---

## PHASE 2 — Fix Plac/Aleja/Rondo false-rejection risk (edge-case fix)

Per `edge-cases.mermaid`, a genuinely real PL address must never be wrongly rejected. `teryt-validator.ts` currently compares the raw typed street word (e.g. `"plac"`) against TERYT's abbreviated canonical name (e.g. `"pl. Grunwaldzki"`) — the type-prefix word itself can never match, causing a false rejection. Fix: strip known Polish street-type prefixes from both sides before comparing.

### Task 2.1 — REWRITE `lib/address/teryt-validator.ts`

Replace the **entire contents** of this file with:

```ts
// GUS TERYT ws1 client — free, authoritative Polish address verification.
//
// SOAP 1.1 + WS-Security UsernameToken via fetch (no SDK, no key, 0 cost).
//
// Endpoints (verified against the live service, 2026-08):
//   test: https://uslugaterytws1test.stat.gov.pl/Terytws1.svc  (public creds)
//   prod: https://uslugaterytws1.stat.gov.pl/Terytws1.svc      (free GUS account)
// Env overrides: TERYT_ENDPOINT, TERYT_USER, TERYT_PASS.
//
// Flow (field names verified against the WSDL):
//   WyszukajMiejscowosc(nazwaMiejscowosci)          -> Symbol (SIMC)
//   WyszukajUlice(nazwaulicy, cecha, nazwamiejscowosci) -> IdentyfikatorUlicy
//   WeryfikujAdresDlaUlic(symbolMsc, SymUl)          -> ZweryfikowanyAdres
//
// NOTE: never call verify with an empty street identifier — the service then
// returns an arbitrary street for the locality (false positive). Guarded below.
// Always fails soft (`degraded: true`) so checkout never dead-ends on GUS.

export interface TerytVerifyInput {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
}

export interface TerytVerifyResult {
  valid: boolean;
  degraded: boolean;
  reason?: string;
  streetName?: string;
}

const DEFAULT_ENDPOINT = "https://uslugaterytws1test.stat.gov.pl/Terytws1.svc";
const DEFAULT_USER = "TestPubliczny";
const DEFAULT_PASS = "1234abcd";

const NS_SOAP = "http://schemas.xmlsoap.org/soap/envelope/";
const NS_TEMPURI = "http://tempuri.org/";
const NS_WSA = "http://www.w3.org/2005/08/addressing";
const NS_WSSE =
  "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
const NS_WSU =
  "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";

const xmlEscape = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function envelope(action: string, body: string, user: string, pass: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="${NS_SOAP}" xmlns:ns1="${NS_TEMPURI}">
  <soapenv:Header xmlns:wsa="${NS_WSA}">
    <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="${NS_WSSE}" xmlns:wsu="${NS_WSU}">
      <wsse:UsernameToken wsu:Id="T1">
        <wsse:Username>${xmlEscape(user)}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${xmlEscape(pass)}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
    <wsa:Action>${action}</wsa:Action>
  </soapenv:Header>
  <soapenv:Body>${body}</soapenv:Body>
</soapenv:Envelope>`;
}

async function call(action: string, body: string): Promise<string> {
  const endpoint = process.env.TERYT_ENDPOINT || DEFAULT_ENDPOINT;
  const user = process.env.TERYT_USER || DEFAULT_USER;
  const pass = process.env.TERYT_PASS || DEFAULT_PASS;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body: envelope(action, body, user, pass),
  });

  if (!res.ok) {
    throw new Error(`TERYT HTTP ${res.status}`);
  }
  return res.text();
}

/** Extract the text of an exact element (namespace-agnostic, whole-name match). */
const field = (xml: string, name: string): string | undefined =>
  new RegExp(`<[^>]*\\b${name}>([^<]*)</[^>]*\\b${name}>`).exec(xml)?.[1];

/** Diacritics-insensitive, case-insensitive token for matching PL names. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Known Polish street-type prefixes (spelled out and abbreviated). Stripped
// from both the user's input and TERYT's canonical name before the name
// cross-check, so a spelled-out prefix on input (e.g. "Plac") never
// mismatches TERYT's abbreviated form on output (e.g. "pl.") and causes a
// false rejection of a genuinely real address.
const STREET_PREFIXES = [
  "ulica", "ul",
  "aleja", "al",
  "plac", "pl",
  "osiedle", "os",
  "rondo",
  "bulwar", "bulw",
  "wybrzeze", "wyb",
  "skwer",
];

const stripStreetPrefix = (s: string): string => {
  const tokens = normalize(s).split(" ").filter(Boolean);
  if (tokens.length > 1 && STREET_PREFIXES.includes(tokens[0])) {
    return tokens.slice(1).join(" ");
  }
  return tokens.join(" ");
};

export async function verifyPolishAddress(
  input: TerytVerifyInput,
): Promise<TerytVerifyResult> {
  const city = input.city.trim();
  const street = input.street.trim();
  const postal = input.postalCode.trim();

  if (!city || !street) {
    return { valid: false, degraded: false, reason: "city/street missing" };
  }
  if (postal && !/^\d{2}-\d{3}$/.test(postal)) {
    return { valid: false, degraded: false, reason: "postal code format" };
  }

  try {
    // 1) Resolve the locality to its TERYT symbol (SIMC).
    const cityResp = await call(
      "http://tempuri.org/ITerytWs1/WyszukajMiejscowosc",
      `<ns1:WyszukajMiejscowosc><ns1:nazwaMiejscowosci>${xmlEscape(city)}</ns1:nazwaMiejscowosci></ns1:WyszukajMiejscowosc>`,
    );
    const simc = field(cityResp, "Symbol");
    if (!simc) {
      return { valid: false, degraded: false, reason: "locality not found in TERYT" };
    }

    // 2) Resolve the street in that locality to its ULIC identifier.
    const streetResp = await call(
      "http://tempuri.org/ITerytWs1/WyszukajUlice",
      `<ns1:WyszukajUlice><ns1:nazwaulicy>${xmlEscape(street)}</ns1:nazwaulicy><ns1:cecha>ul.</ns1:cecha><ns1:nazwamiejscowosci>${xmlEscape(city)}</ns1:nazwamiejscowosci></ns1:WyszukajUlice>`,
    );
    let idul = field(streetResp, "IdentyfikatorUlicy");

    // Retry without the street cecha for al./pl./rondo/... streets.
    if (!idul) {
      const retry = await call(
        "http://tempuri.org/ITerytWs1/WyszukajUlice",
        `<ns1:WyszukajUlice><ns1:nazwaulicy>${xmlEscape(street)}</ns1:nazwaulicy><ns1:nazwamiejscowosci>${xmlEscape(city)}</ns1:nazwamiejscowosci></ns1:WyszukajUlice>`,
      );
      idul = field(retry, "IdentyfikatorUlicy");
    }
    if (!idul) {
      return { valid: false, degraded: false, reason: "street not found in locality" };
    }

    // 3) Street-level verification against the official registry. An empty
    //    street identifier would return an arbitrary street (false positive),
    //    so a resolved idul is mandatory (guarded above).
    const verifyResp = await call(
      "http://tempuri.org/ITerytWs1/WeryfikujAdresDlaUlic",
      `<ns1:WeryfikujAdresDlaUlic><ns1:symbolMsc>${xmlEscape(simc)}</ns1:symbolMsc><ns1:SymUl>${xmlEscape(idul)}</ns1:SymUl></ns1:WeryfikujAdresDlaUlic>`,
    );
    const streetName = field(verifyResp, "NazwaUlicyWPelnymBrzmieniu");
    if (!streetName) {
      return { valid: false, degraded: false, reason: "street/address not verified" };
    }

    // Cross-check the returned official name against the entered street to
    // block any symbol-mismatch false positive. Street-type prefixes (ul.,
    // al., pl., ...) are stripped from both sides first so a spelled-out
    // prefix on input (e.g. "Plac") never mismatches TERYT's abbreviated
    // form (e.g. "pl.") on output.
    const inputCore = stripStreetPrefix(street);
    const officialCore = stripStreetPrefix(streetName);
    const tokens = inputCore.split(" ").filter(Boolean);
    if (tokens.length > 0 && !tokens.every((t) => officialCore.includes(t))) {
      return { valid: false, degraded: false, reason: `street name mismatch: ${streetName}` };
    }

    return { valid: true, degraded: false, streetName };
  } catch (err) {
    console.warn("[TERYT] Service unavailable — failing soft.", err);
    return {
      valid: false,
      degraded: true,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}
```

STOP.

---

## PHASE 3 — Extract the frozen Google path out of the active validator (SRP + component-tree fix)

Per `srp-map.mermaid` and `component-tree.mermaid`, the validator-dispatch file must contain ONLY the active dispatch logic — no dead code inline. `address.ts` currently cohabits ~150 lines of a frozen, unused Google Address Validation path with the live TERYT dispatch. Move the frozen path into its own file.

### Task 3.1 — CREATE `app/actions/address/google-address-validator.frozen.ts`

Write this file **verbatim**:

```ts
// ==========================================================================
// FROZEN — Google Address Validation API (legacy path).
//
// NOT in active use. Kept solely so it can be re-enabled for a future
// multi-country launch by setting ADDRESS_VERIFY_MODE=google. Do not treat
// this code as live; it is dead unless that env flag is set. It costs money
// per call and was replaced by the free TERYT verifier (see
// lib/address/teryt-validator.ts). A missing API key degrades to
// accept-as-entered (region-gated) rather than blocking checkout.
//
// This file is a plain server-side helper module (NOT "use server") — it is
// only ever called from address.ts, never invoked directly as a Server
// Action, so it may accept a function argument (acceptAsEntered).
// ==========================================================================
import { Address, ServerResponse } from "@/app/checkout/checkout.types";

interface RequestBody {
  address: {
    regionCode: string;
    postalCode: string;
    locality: string;
    addressLines: string[];
  };
  enableUspsCass: boolean;
}

interface GoogleAddressComponent {
  componentType: string;
  componentName: {
    text: string;
  };
}

interface GoogleAddress {
  addressComponents: GoogleAddressComponent[];
  postalAddress?: {
    regionCode: string;
  };
}

interface GoogleValidationVerdict {
  inputGranularity: string;
  validationGranularity: string;
  geocodeGranularity: string;
  addressComplete: boolean;
  hasReplacedComponents: boolean;
  hasSpellCorrectedComponents: boolean;
  hasInferredComponents: boolean;
}

export interface GoogleValidationResponse {
  result?: {
    verdict?: GoogleValidationVerdict;
    address?: GoogleAddress;
    geocode?: {
      location: {
        latitude: number;
        longitude: number;
      };
      placeId?: string;
    };
  };
}

const ALLOWED_GRANULARITY = new Set(["PREMISE", "SUB_PREMISE"]);

// Countries the checkout address form actually offers (see REGIONS in
// app/checkout/address/AddressForm.tsx) plus the GB code the region gate
// accepts when it matches the normalized input (UK alias -> GB). A
// Google-normalized regionCode outside this set must never be persisted.
const SUPPORTED_REGION_CODES = new Set(["PL", "GB"]);

// Normalize region-code aliases on both sides of the validation round-trip.
// The customer-facing code may be "UK" but Google's ISO 3166-1 alpha-2 code
// is "GB" — input and output must agree on "GB" before comparison/persistence.
const normalizeRegionCode = (code?: string | null): string | undefined => {
  if (!code) return undefined;
  return code === "UK" ? "GB" : code;
};

const formatCleanAddress = (
  googleAddress: GoogleAddress,
  input: Address,
  normalizedRegion: string,
): Address => {
  const components = new Map(
    googleAddress.addressComponents.map((c) => [
      c.componentType,
      c.componentName.text,
    ]),
  );

  const get = (type: string) => components.get(type);

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    street: get("route") || input.street,
    streetNumber:
      [get("street_number"), get("subpremise")].filter(Boolean).join("/") ||
      input.streetNumber,
    city: get("locality") || get("postal_town") || input.city,
    postalCode: get("postal_code") || input.postalCode,
    regionCode:
      normalizeRegionCode(googleAddress.postalAddress?.regionCode) ??
      normalizedRegion,
  };
};

function isAcceptedAddress(verdict: GoogleValidationVerdict): boolean {
  if (!verdict.addressComplete) return false;

  if (verdict.hasInferredComponents) {
    return false;
  }

  return (
    ALLOWED_GRANULARITY.has(verdict.inputGranularity) &&
    ALLOWED_GRANULARITY.has(verdict.validationGranularity)
  );
}

export async function validateWithGoogle(
  input: Address,
  normalizedInput: string,
  acceptAsEntered: () => ServerResponse,
): Promise<ServerResponse> {
  const apiKey = process.env.GOOGLE_ADDRESS_VALIDATION_API_KEY;

  // No key configured → treat as "validation unavailable" and degrade
  // gracefully instead of blocking checkout.
  if (!apiKey) {
    console.warn(
      "[GOOGLE VALIDATION] No GOOGLE_ADDRESS_VALIDATION_API_KEY configured — accepting address as entered (region-gated)."
    );
    return acceptAsEntered();
  }

  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;
  console.log(url, "GOOGLE API");

  const addressLine = [input.street, input.streetNumber]
    .filter(Boolean)
    .join(" ")
    .trim();
  console.log("Address Line:", addressLine);

  const payload: RequestBody = {
    address: {
      regionCode: normalizedInput,
      postalCode: input.postalCode,
      locality: input.city,
      addressLines: [addressLine],
    },
    enableUspsCass: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(
      "////////////////////////  Google Address Validation Response Status:",
      response.status,
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Address validation failed: ${response.status} ${response.statusText}`,
        errorBody,
      );

      // 400: Google parsed the payload and rejected the address format — keep strict.
      if (response.status === 400) {
        return {
          status: "FIX",
          errors: { message: "Invalid address format. Please check your input." },
        };
      }

      // 401/403/429/5xx: Google-side unavailability (closed billing account, bad
      // key, outage). Degrade gracefully — never block checkout on Google.
      console.warn(
        `[GOOGLE VALIDATION] Google unavailable (${response.status}) — accepting address as entered (region-gated).`
      );
      return acceptAsEntered();
    }

    const data = (await response.json()) as GoogleValidationResponse;
    const verdict = data.result?.verdict;
    const googleAddress = data.result?.address;

    if (verdict && googleAddress && isAcceptedAddress(verdict)) {
      const googleCode = normalizeRegionCode(
        googleAddress.postalAddress?.regionCode,
      );

      // Region gate: if Google resolved a country that contradicts the one the
      // customer selected, this is a genuinely different country — reject it
      // rather than silently switching the destination.
      if (googleCode && googleCode !== normalizedInput) {
        return {
          status: "FIX",
          errors: {
            message:
              "This address is in a country we do not currently ship to (Poland). Please verify your country and address.",
          },
        };
      }

      const cleanAddress = formatCleanAddress(
        googleAddress,
        input,
        googleCode ?? normalizedInput,
      );

      // Never persist a normalized country the checkout form cannot represent.
      if (!SUPPORTED_REGION_CODES.has(cleanAddress.regionCode)) {
        return {
          status: "FIX",
          errors: {
            message:
              "This address is in a country we do not currently ship to (Poland). Please verify your country and address.",
          },
        };
      }

      return {
        status: "ACCEPT",
        address: cleanAddress,
        geocode: data.result?.geocode,
        placeId: data.result?.geocode?.placeId,
      };
    }

    return {
      status: "FIX",
      errors: { message: "Address could not be strictly validated." },
    };
  } catch (err) {
    console.error("Address Validation Error:", err);
    console.warn(
      "[GOOGLE VALIDATION] Network error — accepting address as entered (region-gated)."
    );
    return acceptAsEntered();
  }
}
```

STOP.

### Task 3.2 — REWRITE `app/actions/address/address.ts`

Replace the **entire contents** of this file with:

```ts
"use server";
import { Address, ServerResponse } from "@/app/checkout/checkout.types";
import { verifyPolishAddress } from "@/lib/address/teryt-validator";
import { validateWithGoogle } from "./google-address-validator.frozen";

// Normalize region-code aliases on both sides of the validation round-trip.
// The customer-facing code may be "UK" but the frozen Google path's ISO
// 3166-1 alpha-2 code is "GB" — kept here since it is needed on the active
// dispatch path regardless of which verifier ultimately runs.
const normalizeRegionCode = (code?: string | null): string | undefined => {
  if (!code) return undefined;
  return code === "UK" ? "GB" : code;
};

// ACTIVE verifier — GUS TERYT (official registry, free, no key). The Google
// path is FROZEN and only reachable via ADDRESS_VERIFY_MODE=google (see
// google-address-validator.frozen.ts).
async function validateWithTeryt(
  input: Address,
  normalizedRegion: string,
): Promise<ServerResponse> {
  const t = await verifyPolishAddress({
    street: input.street,
    streetNumber: input.streetNumber,
    postalCode: input.postalCode,
    city: input.city,
  });

  // GUS down → never block checkout; accept as entered (region-gated).
  if (t.degraded) {
    console.warn(`[TERYT] Degraded (${t.reason}) — accepting address as entered.`);
    return { status: "ACCEPT", address: { ...input, regionCode: normalizedRegion } };
  }

  if (!t.valid) {
    console.warn(`[TERYT] Rejected — ${t.reason}`);
    return {
      status: "FIX",
      errors: {
        message:
          "We could not match this address to the official Polish address registry (TERYT). Please verify your street, city and postal code.",
      },
    };
  }

  console.log(`[TERYT] ACCEPT — ${t.streetName ?? input.street}, ${input.city}`);
  return { status: "ACCEPT", address: { ...input, regionCode: normalizedRegion } };
}

export async function submitShippingAction(
  input: Address,
  opts?: { skipValidation?: boolean },
): Promise<ServerResponse> {
  const normalizedInput =
    normalizeRegionCode(input.regionCode) ?? input.regionCode;

  // Accept the address exactly as entered (region normalized). Used by the
  // human escape hatch and by graceful degradation when Google is unavailable
  // (e.g. closed billing account) so checkout can never dead-end on Google.
  const acceptAsEntered = (): ServerResponse => {
    return {
      status: "ACCEPT",
      address: { ...input, regionCode: normalizedInput },
    };
  };

  // Human escape hatch: accept the address exactly as the customer entered it,
  // bypassing Google validation. Prevents a valid submission from dead-ending
  // on a strict Google verdict.
  if (opts?.skipValidation) {
    return acceptAsEntered();
  }

  // ACTIVE verifier: TERYT (official GUS registry, free). Runs for all PL
  // submissions; the store ships within Poland only, so other regions are
  // simply accepted as entered (region-gated).
  const verifyMode = process.env.ADDRESS_VERIFY_MODE ?? "teryt";
  if (verifyMode !== "google") {
    if (normalizedInput === "PL") {
      return validateWithTeryt(input, normalizedInput);
    }
    return acceptAsEntered();
  }

  // FROZEN path — see google-address-validator.frozen.ts.
  return validateWithGoogle(input, normalizedInput, acceptAsEntered);
}
```

STOP.

---

## DONE

Program complete when all 4 files are done (1 created, 3 rewritten). Report the list of files you wrote. Do not run anything.
