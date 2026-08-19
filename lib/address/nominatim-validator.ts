// SKELETON — Nominatim (OpenStreetMap) address validation.
// PREFLIGHT VERIFIED: live, free, no key/card. Real PL address → exact match
// (postcode/city/road/house_number); fake address → 0 results.
//
// Policy notes (must read before full implementation):
//  - Max 1 request/second, identify via a real User-Agent.
//  - Must add a sensible UA string (OSM blocks default UA).
//
// TODO(implementation): complete the query + strict matching per spec once
// green-lit. This file is intentionally NOT wired into address.ts yet.

export interface NominatimValidationResult {
  valid: boolean;
  degraded: boolean;
  reason?: string;
}

export interface NominatimInput {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
}

export async function validateAddressWithNominatim(
  _input: NominatimInput,
): Promise<NominatimValidationResult> {
  throw new Error("NOT_IMPLEMENTED — skeleton only, awaiting green light.");
}
