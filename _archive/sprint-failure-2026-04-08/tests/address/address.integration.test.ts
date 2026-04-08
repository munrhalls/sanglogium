import { describe, it, expect } from "vitest";
import { submitShippingAction } from "@/app/actions/address/address";
import { Address, ServerResponse } from "@/app/(store)/checkout/checkout.types";

describe("submitShippingAction Live Integration", () => {
  it("hits the real Google API and returns ACCEPT", async () => {
    const validAddress: Address = {
      regionCode: "GB",
      postalCode: "W4 5RA",
      street: "Woodstock Road",
      streetNumber: "28",
      city: "London",
    };

    const result: ServerResponse = await submitShippingAction(validAddress);

    expect(result.status).toBe("ACCEPT");
    expect(result.address).toBeDefined();
    expect(result.address?.postalCode).toBe("W4 5RA");
    expect(result.geocode).toBeDefined();
    expect(result.geocode?.latitude).toEqual(expect.any(Number));
    expect(result.geocode?.longitude).toEqual(expect.any(Number));
    expect(result.placeId).toEqual(expect.any(String));
  });

  // TODO Zero Negative Coverage: Your code has critical logic in isAcceptedAddress (checking addressComplete, hasReplacedComponents, and Granularity). None of this is tested. You don't know if your code actually rejects a "Route" level address or an address with typos.
});
