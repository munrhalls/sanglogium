import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitShippingAction } from "./address";
import type { Address } from "@/app/checkout/checkout.types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const baseInput: Address = {
  firstName: "Jan",
  lastName: "Kowalski",
  phone: "+48 123 456 789",
  regionCode: "PL",
  postalCode: "54-129",
  street: "Balonowa",
  streetNumber: "9",
  city: "Wrocław",
};

const acceptedVerdict = {
  inputGranularity: "PREMISE",
  validationGranularity: "PREMISE",
  geocodeGranularity: "PREMISE",
  addressComplete: true,
  hasReplacedComponents: false,
  hasSpellCorrectedComponents: false,
  hasInferredComponents: false,
};

const googleResponse = (regionCode: string) => ({
  result: {
    verdict: acceptedVerdict,
    address: {
      addressComponents: [
        { componentType: "route", componentName: { text: "Balonowa" } },
        { componentType: "street_number", componentName: { text: "9" } },
        { componentType: "locality", componentName: { text: "Wrocław" } },
        { componentType: "postal_code", componentName: { text: "54-129" } },
      ],
      postalAddress: { regionCode },
    },
    geocode: {
      location: { latitude: 51.1079, longitude: 17.0385 },
      placeId: "ChIJ-test-place",
    },
  },
});

describe("submitShippingAction", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
    mockFetch.mockReset();
  });

  it("accepts a valid address and persists the normalized input region code", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => googleResponse("PL"),
    });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("PL");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("accepts the UK->GB alias on input and Google output", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => googleResponse("GB"),
    });

    const result = await submitShippingAction({
      ...baseInput,
      regionCode: "UK",
    });

    expect(result.status).toBe("ACCEPT");
    // Persist the normalized code, never the alias.
    expect(result.address?.regionCode).toBe("GB");

    // The Google payload must already carry the normalized GB code.
    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toContain("addressvalidation.googleapis.com");
    const body = JSON.parse(
      (mockFetch.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.address.regionCode).toBe("GB");
  });

  it("rejects an address Google resolves to a genuinely different country", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => googleResponse("DE"),
    });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("FIX");
    expect(result.errors?.message).toContain("Poland");
  });

  it("returns the raw input without calling fetch when skipValidation is true", async () => {
    const result = await submitShippingAction(baseInput, {
      skipValidation: true,
    });

    expect(result.status).toBe("ACCEPT");
    expect(result.address).toEqual({ ...baseInput, regionCode: "PL" });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
