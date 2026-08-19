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

// --- TERYT SOAP fixtures (field names verified against the live test WSDL) ---
const soap = (body: string) => ({
  ok: true,
  text: async () => `<s:Envelope><s:Body>${body}</s:Body></s:Envelope>`,
});

const cityFoundXml =
  "<b:Miejscowosc><b:Symbol>0986283</b:Symbol><b:Nazwa>Wrocław</b:Nazwa></b:Miejscowosc>";
const streetFoundXml =
  "<b:Ulica><b:Cecha>ul.</b:Cecha><b:IdentyfikatorUlicy>00642</b:IdentyfikatorUlicy><b:Nazwa>Balonowa</b:Nazwa></b:Ulica>";
const verifiedXml =
  "<b:ZweryfikowanyAdres><b:NazwaUlicyWPelnymBrzmieniu>ul. Balonowa</b:NazwaUlicyWPelnymBrzmieniu></b:ZweryfikowanyAdres>";

const mockTeryt = (overrides?: { city?: string; street?: string; verify?: string }) => {
  mockFetch.mockImplementation(async (_url: unknown, init?: RequestInit) => {
    const body = String(init?.body ?? "");
    if (body.includes("WyszukajMiejscowosc")) return soap(overrides?.city ?? cityFoundXml);
    if (body.includes("WyszukajUlice")) return soap(overrides?.street ?? streetFoundXml);
    if (body.includes("WeryfikujAdresDlaUlic")) return soap(overrides?.verify ?? verifiedXml);
    throw new Error(`Unexpected TERYT call: ${body.slice(0, 120)}`);
  });
};

describe("submitShippingAction — TERYT (active verifier, default mode)", () => {
  beforeEach(() => {
    vi.stubEnv("ADDRESS_VERIFY_MODE", "teryt");
    mockFetch.mockReset();
  });

  it("accepts a real PL address verified against TERYT", async () => {
    mockTeryt();
    const result = await submitShippingAction(baseInput);
    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("PL");
  });

  it("rejects a street that does not exist in the locality", async () => {
    mockTeryt({ street: "" });
    const result = await submitShippingAction(baseInput);
    expect(result.status).toBe("FIX");
  });

  it("rejects a locality not present in TERYT", async () => {
    mockTeryt({ city: "" });
    const result = await submitShippingAction(baseInput);
    expect(result.status).toBe("FIX");
  });

  it("rejects a verified street name that does not match the input", async () => {
    mockTeryt({
      verify:
        "<b:ZweryfikowanyAdres><b:NazwaUlicyWPelnymBrzmieniu>ul. Alpejska</b:NazwaUlicyWPelnymBrzmieniu></b:ZweryfikowanyAdres>",
    });
    const result = await submitShippingAction(baseInput);
    expect(result.status).toBe("FIX");
  });

  it("degrades to ACCEPT when TERYT is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNRESET"));
    const result = await submitShippingAction(baseInput);
    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("PL");
  });
});

describe("submitShippingAction — FROZEN Google path (ADDRESS_VERIFY_MODE=google)", () => {
  beforeEach(() => {
    vi.stubEnv("ADDRESS_VERIFY_MODE", "google");
    vi.stubEnv("GOOGLE_ADDRESS_VALIDATION_API_KEY", "test-key");
    mockFetch.mockReset();
  });

  it("accepts a valid address and persists the normalized input region code", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => googleResponse("PL") });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("PL");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("accepts the UK->GB alias on input and Google output", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => googleResponse("GB") });

    const result = await submitShippingAction({ ...baseInput, regionCode: "UK" });

    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("GB");

    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toContain("addressvalidation.googleapis.com");
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.address.regionCode).toBe("GB");
  });

  it("rejects an address Google resolves to a genuinely different country", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => googleResponse("DE") });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("FIX");
    expect(result.errors?.message).toContain("Poland");
  });

  it("returns the raw input without calling fetch when skipValidation is true", async () => {
    const result = await submitShippingAction(baseInput, { skipValidation: true });

    expect(result.status).toBe("ACCEPT");
    expect(result.address).toEqual({ ...baseInput, regionCode: "PL" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("degrades gracefully to ACCEPT when Google is unavailable (403)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: async () => "{}",
    });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("ACCEPT");
    expect(result.address?.regionCode).toBe("PL");
  });

  it("degrades gracefully to ACCEPT on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNRESET"));

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("ACCEPT");
    expect(result.address).toEqual({ ...baseInput, regionCode: "PL" });
  });

  it("stays strict (FIX) when Google rejects the address format (400)", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => "{}",
    });

    const result = await submitShippingAction(baseInput);

    expect(result.status).toBe("FIX");
    expect(result.errors?.message).toContain("Invalid address format");
  });

});
