// Poczta Polska PNA client — free Polish postal-address validation.
//
// Endpoint (public docs):  https://pna.poczta-polska.pl/{token}/{search}
// Token (free, email-only, no card): register at https://poczta-polska.pl/pna/
// Response is expected to be JSON with `codes` and `addresses` arrays.
//
// This client parses DEFENSIVELY and ALWAYS fails soft: an unavailable or
// malformed service reports `degraded: true` so the checkout flow can fall
// back (to Google, then to accept-as-entered) and never dead-end on PNA.

export interface PnaValidationResult {
  valid: boolean;
  degraded: boolean;
  reason?: string;
}

export interface PnaInput {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
}

/** Diacritics-insensitive, case-insensitive token for matching PL addresses. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function validatePolishAddressWithPna(
  input: PnaInput,
): Promise<PnaValidationResult> {
  const token = process.env.PNA_POCZTA_TOKEN;

  if (!token) {
    return {
      valid: false,
      degraded: true,
      reason: "PNA_POCZTA_TOKEN not configured",
    };
  }

  // Search by postal code — the authoritative way to confirm the entered code
  // belongs to a Polish locality (and which city/street names carry that code).
  const url = `https://pna.poczta-polska.pl/${token}/${encodeURIComponent(
    input.postalCode,
  )}`;

  try {
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      console.warn(
        `[PNA] Poczta Polska unavailable (${res.status}) — failing soft.`,
      );
      return {
        valid: false,
        degraded: true,
        reason: `PNA HTTP ${res.status}`,
      };
    }

    const json = (await res.json()) as {
      codes?: string[];
      addresses?: string[];
    };
    const codes = Array.isArray(json?.codes) ? json.codes : [];
    const addresses = Array.isArray(json?.addresses) ? json.addresses : [];

    // Unexpected schema → unverifiable, never block.
    if (codes.length === 0 && addresses.length === 0) {
      console.warn(
        "[PNA] Unexpected response shape:",
        JSON.stringify(json).slice(0, 300),
      );
      return {
        valid: false,
        degraded: true,
        reason: "unexpected response shape",
      };
    }

    const wantCode = normalize(input.postalCode);
    const wantCity = normalize(input.city);
    const codeMatch = codes.some((c) => normalize(c) === wantCode);
    const cityMatch = addresses.some((a) => normalize(a).includes(wantCity));

    if (codeMatch && cityMatch) {
      console.log(`[PNA] Address verified: ${input.postalCode} ${input.city}`);
      return { valid: true, degraded: false };
    }

    console.warn(
      `[PNA] Mismatch — code=${codeMatch} city=${cityMatch} (${input.postalCode} / ${input.city})`,
    );
    return { valid: false, degraded: false, reason: "code/city mismatch" };
  } catch (err) {
    console.warn("[PNA] Network error — failing soft.", err);
    return { valid: false, degraded: true, reason: "network error" };
  }
}
