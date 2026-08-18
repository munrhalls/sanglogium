"use server";
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
  normalizedRegion: string
): Address => {
  const components = new Map(
    googleAddress.addressComponents.map((c) => [
      c.componentType,
      c.componentName.text,
    ])
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

export async function submitShippingAction(
  input: Address,
  opts?: { skipValidation?: boolean }
): Promise<ServerResponse> {
  const normalizedInput =
    normalizeRegionCode(input.regionCode) ?? input.regionCode;

  // Human escape hatch: accept the address exactly as the customer entered it,
  // bypassing Google validation. Prevents a valid submission from dead-ending
  // on a strict Google verdict.
  if (opts?.skipValidation) {
    return {
      status: "ACCEPT",
      address: { ...input, regionCode: normalizedInput },
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      status: "FIX",
      errors: { message: "Internal configuration error." },
    };
  }

  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;

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

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Address validation failed: ${response.status} ${response.statusText}`,
        errorBody
      );

      const message =
        response.status === 400
          ? "Invalid address format. Please check your input."
          : response.status === 401
            ? "Address validation service authentication error."
            : "Address validation service temporarily unavailable.";

      return {
        status: "FIX",
        errors: { message },
      };
    }

    const data = (await response.json()) as GoogleValidationResponse;
    const verdict = data.result?.verdict;
    const googleAddress = data.result?.address;

    if (verdict && googleAddress && isAcceptedAddress(verdict)) {
      const googleCode = normalizeRegionCode(
        googleAddress.postalAddress?.regionCode
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
        googleCode ?? normalizedInput
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
    return {
      status: "FIX",
      errors: {
        message:
          "Address validation service temporarily unavailable. Please return later.",
      },
    };
  }
}
