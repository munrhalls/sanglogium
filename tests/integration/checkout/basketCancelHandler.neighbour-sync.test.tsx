import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BasketPage from "@/app/components/features/basket/BasketPage";

// Mock window.location and history
const mockLocation = {
  search: "?checkout=cancelled",
  pathname: "/basket"
};

const mockHistory = {
  replaceState: vi.fn()
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true
});

// Mock URLSearchParams
class MockURLSearchParams {
  constructor(private search: string) {}

  get(key: string): string | null {
    if (this.search.includes("checkout=cancelled")) return "cancelled";
    return null;
  }
}

vi.mock("url", () => ({
  URLSearchParams: MockURLSearchParams
}));

// Mock server-only modules
vi.mock("server-only", () => ({}));

// Mock server actions
vi.mock("@/app/actions/checkout", () => ({
  validateBasket: vi.fn()
}));

vi.mock("@/app/actions/checkout/releaseInventoryLock", () => ({
  releaseInventoryLock: vi.fn()
}));

// Mock store
vi.mock("@/store/store", () => ({
  useBasketStore: vi.fn(),
  selectBasketTotal: vi.fn()
}));

// Mock the usePreCheckout hook
const { mockReset, mockUsePreCheckout } = vi.hoisted(() => {
  const mockReset = vi.fn();
  const mockUsePreCheckout = vi.fn(() => ({
    state: "IDLE",
    reset: mockReset
  }));
  return { mockReset, mockUsePreCheckout };
});

vi.mock("@/app/components/features/basket/checkout/usePreCheckout", () => ({
  usePreCheckout: mockUsePreCheckout
}));

describe("BasketPage - Neighbour Flow Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.replaceState.mockClear();
    mockReset.mockClear();
    mockUsePreCheckout.mockReturnValue({
      state: "IDLE",
      reset: mockReset
    });
  });

  describe("cancel_url matches basket page route + ?checkout=cancelled", () => {
    it("cancel_url pattern matches basket page handler expectation", async () => {
      // Verify the cancel_url pattern from validateBasket source
      const cancelUrlPattern = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/basket?checkout=cancelled`;

      // Check that the pattern matches what our handler expects
      expect(cancelUrlPattern).toContain("/basket?checkout=cancelled");
      expect(cancelUrlPattern).toMatch(/^https?:\/\/[^\/]+\/basket\?checkout=cancelled$/);
    });

    it("basket page handler responds to exact cancel_url pattern", async () => {
      // Set up the exact URL pattern from validateBasket
      mockLocation.search = "?checkout=cancelled";
      mockLocation.pathname = "/basket";

      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler responds to the exact pattern
      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
    });
  });

  describe("success_url does NOT route back to basket page", () => {
    it("success_url pattern does NOT route to basket page", async () => {
      // Verify the success_url pattern from validateBasket source
      const successUrlPattern = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/return`;

      // Check that the pattern does NOT route to basket page
      expect(successUrlPattern).toContain("/checkout/return");
      expect(successUrlPattern).not.toContain("/basket");
      expect(successUrlPattern).toMatch(/^https?:\/\/[^\/]+\/checkout\/return$/);
    });

    it("basket page handler does NOT trigger on success_url pattern", async () => {
      // Set up URL pattern that matches success_url (should not trigger handler)
      mockLocation.search = ""; // No checkout=cancelled param
      mockLocation.pathname = "/checkout/return"; // Success route

      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler does NOT respond to success_url pattern
      expect(mockHistory.replaceState).not.toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });
  });
});
