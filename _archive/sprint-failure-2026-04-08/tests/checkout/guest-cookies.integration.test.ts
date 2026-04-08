import { describe, it, expect, vi } from "vitest";

// Mock Next.js cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Import after mocking
import {
  getGuestCheckoutData,
  saveGuestCheckoutData,
  clearGuestCheckoutData,
  saveGuestEmail,
  getGuestEmail,
} from "@/app/actions/checkout/guestCookies";

describe("Guest Cookies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGuestCheckoutData", () => {
    it("should return null when no cookie exists", async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const result = await getGuestCheckoutData();
      expect(result).toBeNull();
    });

    it("should parse and return cookie data", async () => {
      const mockData = {
        email: "test@example.com",
        name: "John Doe",
        address: {
          regionCode: "US",
          postalCode: "12345",
          street: "Main Street",
          streetNumber: "123",
          city: "New York",
        },
      };
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(mockData),
      });

      const result = await getGuestCheckoutData();
      expect(result).toEqual(mockData);
    });

    it("should return null for invalid JSON", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid json" });
      const result = await getGuestCheckoutData();
      expect(result).toBeNull();
    });
  });

  describe("saveGuestCheckoutData", () => {
    it("should save data to cookie", async () => {
      mockCookieStore.get.mockReturnValue(null);

      const data = { email: "test@example.com" };
      await saveGuestCheckoutData(data);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "guest_checkout",
        JSON.stringify(data),
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        })
      );
    });

    it("should merge with existing data", async () => {
      const existing = { name: "John" };
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(existing),
      });

      await saveGuestEmail("test@example.com");

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "guest_checkout",
        JSON.stringify({ name: "John", email: "test@example.com" }),
        expect.any(Object)
      );
    });
  });

  describe("clearGuestCheckoutData", () => {
    it("should delete the cookie", async () => {
      await clearGuestCheckoutData();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("guest_checkout");
    });
  });

  describe("getGuestEmail", () => {
    it("should return email from cookie", async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify({ email: "test@example.com" }),
      });

      const result = await getGuestEmail();
      expect(result).toBe("test@example.com");
    });

    it("should return null when no email exists", async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify({ name: "John" }),
      });

      const result = await getGuestEmail();
      expect(result).toBeNull();
    });
  });
});
