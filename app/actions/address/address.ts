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
