"use server";

import type { Address, ServerResponse } from "@/features/checkout/core/rules/checkoutTypes";
import { verifyPolishAddress, validateWithGoogle } from "@/features/checkout/server";

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
// googleAddressValidator.ts).
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
  opts?: { skipValidation?: boolean }
