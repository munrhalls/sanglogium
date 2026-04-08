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

describe("BasketPage - Global Flow Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.replaceState.mockClear();
    mockReset.mockClear();
    mockUsePreCheckout.mockReturnValue({
      state: "IDLE",
      reset: mockReset
    });
  });

  describe("Handler ignores additional Stripe params", () => {
    it("handles Stripe cancel_url with session_id param", async () => {
      // Set up URL with additional Stripe params
      mockLocation.search = "?checkout=cancelled&session_id=cs_test_123456";
      mockLocation.pathname = "/basket";
      
      // Update URLSearchParams mock to handle additional params
      vi.doMock("url", () => ({
        URLSearchParams: class MockURLSearchParams {
          constructor(private search: string) {}
          
          get(key: string): string | null {
            if (key === "checkout" && this.search.includes("checkout=cancelled")) {
              return "cancelled";
            }
            return null;
          }
        }
      }));
      
      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;
      
      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler still works and only checks checkout=cancelled
      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
    });

    it("handles Stripe cancel_url with multiple additional params", async () => {
      // Set up URL with multiple Stripe params
      mockLocation.search = "?checkout=cancelled&session_id=cs_test_123&payment_intent=pi_test_456&customer=cus_test_789";
      mockLocation.pathname = "/basket";
      
      // Update URLSearchParams mock to handle multiple params
      vi.doMock("url", () => ({
        URLSearchParams: class MockURLSearchParams {
          constructor(private search: string) {}
          
          get(key: string): string | null {
            if (key === "checkout" && this.search.includes("checkout=cancelled")) {
              return "cancelled";
            }
            return null;
          }
        }
      }));
      
      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;
      
      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler still works and ignores other params
      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
    });

    it("does NOT trigger when checkout param is missing even with other Stripe params", async () => {
      // Set up URL with Stripe params but NO checkout=cancelled
      mockLocation.search = "?session_id=cs_test_123&payment_intent=pi_test_456";
      mockLocation.pathname = "/basket";
      
      // Update URLSearchParams mock to return null for checkout
      vi.doMock("url", () => ({
        URLSearchParams: class MockURLSearchParams {
          constructor(private search: string) {}
          
          get(key: string): string | null {
            // Always return null, even for checkout param
            return null;
          }
        }
      }));
      
      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;
      
      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler does NOT trigger
      expect(mockHistory.replaceState).not.toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });

    it("does NOT break with malformed additional params", async () => {
      // Set up URL with malformed params
      mockLocation.search = "?checkout=cancelled&session_id=&payment_intent=&invalid_param";
      mockLocation.pathname = "/basket";
      
      // Update URLSearchParams mock to handle malformed params
      vi.doMock("url", () => ({
        URLSearchParams: class MockURLSearchParams {
          constructor(private search: string) {}
          
          get(key: string): string | null {
            if (key === "checkout" && this.search.includes("checkout=cancelled")) {
              return "cancelled";
            }
            // Return empty string for malformed params
            if (this.search.includes(`${key}=`)) {
              return "";
            }
            return null;
          }
        }
      }));
      
      // Import after mocks are set up
      const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;
      
      // Render the component
      renderHook(() => BasketPage());

      // Verify the handler still works despite malformed params
      expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
    });
  });
});
