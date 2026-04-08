import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { submitShippingAction } from "@/app/actions/address/address";
import { MOCK_GOOGLE_SUCCESS } from "./fixtures";

describe("GOOGLE ADDRESS VALIDATE API - ACCEPT case", () => {
  const originalEnv = process.env;
  beforeAll(() => {
    process.env.GOOGLE_MAPS_API_KEY = "TEST_KEY";
  });
  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  it("returns ACCEPT status when Google verdict is valid", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_GOOGLE_SUCCESS,
      statusText: "OK",
    } as Response);

    const input = {
      street: "Woodstock Road",
      streetNumber: "28",
      city: "London",
      postalCode: "W4 5RA",
      regionCode: "GB",
    };

    const result = await submitShippingAction(input);

    expect(result.status).toBe("ACCEPT");
    expect(result.address).toEqual({
      street: "Woodstock Road",
      streetNumber: "28",
      city: "London",
      postalCode: "W4 5RA",
      regionCode: "GB",
    });
    expect(result.geocode).toBeDefined();
    expect(result.geocode?.latitude).toBeTypeOf("number");
    expect(result.geocode?.longitude).toBeTypeOf("number");
    expect(result.placeId).toBeTypeOf("string");
    expect(result.errors).toBeUndefined();
  });
  // TODO Zero Negative Coverage: Your code has critical logic in isAcceptedAddress (checking addressComplete, hasReplacedComponents, and Granularity). None of this is tested. You don't know if your code actually rejects a "Route" level address or an address with typos.
});
