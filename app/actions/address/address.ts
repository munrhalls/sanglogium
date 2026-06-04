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
    regionCode: googleAddress.postalAddress?.regionCode || normalizedRegion,
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
  input: Address
): Promise<ServerResponse> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      status: "FIX",
      errors: { message: "Internal configuration error." },
    };
  }

  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;
  const regionCode = input.regionCode === "UK" ? "GB" : input.regionCode;

  const addressLine = [input.street, input.streetNumber]
    .filter(Boolean)
    .join(" ")
    .trim();
  console.log("Address Line:", addressLine);

  const payload: RequestBody = {
    address: {
      regionCode: regionCode,
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
      const cleanAddress = formatCleanAddress(googleAddress, input, regionCode);

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
