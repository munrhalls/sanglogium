import { describe, it, expect } from "vitest";
import {
  toShippingAddress,
  fromShippingAddress,
  type Address,
} from "@/app/(store)/checkout/checkout.types";

describe("Address Mappers", () => {
  describe("toShippingAddress", () => {
    it("should convert Address to ShippingAddress format", () => {
      const address: Address = {
        regionCode: "US",
        postalCode: "12345",
        street: "Main Street",
        streetNumber: "123",
        city: "New York",
      };

      const result = toShippingAddress(address, "John Doe", "+1234567890");

      expect(result).toEqual({
        name: "John Doe",
        line1: "Main Street 123",
        city: "New York",
        state: "",
        postalCode: "12345",
        country: "US",
        phone: "+1234567890",
      });
    });

    it("should handle address without phone", () => {
      const address: Address = {
        regionCode: "PL",
        postalCode: "00-001",
        street: "Aleje Jerozolimskie",
        streetNumber: "10",
        city: "Warsaw",
      };

      const result = toShippingAddress(address, "Jan Kowalski");

      expect(result.phone).toBeUndefined();
      expect(result.line1).toBe("Aleje Jerozolimskie 10");
    });
  });

  describe("fromShippingAddress", () => {
    it("should convert ShippingAddress to Address format", () => {
      const shipping = {
        line1: "Main Street 123",
        city: "New York",
        state: "NY",
        postalCode: "12345",
        country: "US",
      };

      const result = fromShippingAddress(shipping);

      expect(result).toEqual({
        regionCode: "US",
        postalCode: "12345",
        street: "Main",
        streetNumber: "Street 123",
        city: "New York",
      });
    });

    it("should return null for empty line1", () => {
      const shipping = {
        line1: "",
        city: "New York",
        postalCode: "12345",
        country: "US",
      };

      const result = fromShippingAddress(shipping);

      expect(result).toBeNull();
    });

    it("should handle single word line1", () => {
      const shipping = {
        line1: "Broadway",
        city: "New York",
        postalCode: "10001",
        country: "US",
      };

      const result = fromShippingAddress(shipping);

      expect(result?.street).toBe("Broadway");
      expect(result?.streetNumber).toBe("");
    });
  });
});
