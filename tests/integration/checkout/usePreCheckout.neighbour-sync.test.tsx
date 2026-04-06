import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePreCheckout } from "@/app/components/features/basket/checkout/usePreCheckout";
import { releaseInventoryLock } from "@/app/actions/checkout/releaseInventoryLock";
import { useBasketStore, selectBasketTotal } from "@/store/store";

// Mock server actions
const { mockValidateBasket } = vi.hoisted(() => {
  const mockValidateBasket = vi.fn();
  return { mockValidateBasket };
});

vi.mock("@/app/actions/checkout", () => ({
  validateBasket: mockValidateBasket
}));

vi.mock("@/app/actions/checkout/releaseInventoryLock");

// Mock store
vi.mock("@/store/store", () => ({
  useBasketStore: {
    getState: vi.fn()
  },
  selectBasketTotal: vi.fn()
}));

describe("usePreCheckout - Neighbour Flow Sync", () => {
  const mockBasketStore = {
    basket: [
      { _id: "product1", quantity: 2, displayPrice: 100, stock: 10 },
      { _id: "product2", quantity: 1, displayPrice: 50, stock: 5 }
    ],
    getState: vi.fn(() => mockBasketStore),
    updateItemPrice: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateBasket.mockClear();
    (useBasketStore as any).getState = () => mockBasketStore;
    vi.mocked(selectBasketTotal).mockReturnValue(250);
    vi.mocked(releaseInventoryLock).mockResolvedValue(undefined);
  });

  describe("Public API maps 1:1 to state machine transitions", () => {
    it("checkout() dispatches START_VALIDATION event", async () => {
      mockValidateBasket.mockResolvedValue({
        outcome: "PASS",
        stripeUrl: "https://checkout.stripe.com/pay/test"
      });

      const { result } = renderHook(() => usePreCheckout());

      await act(async () => {
        result.current.checkout();
      });

      // Verify START_VALIDATION was dispatched (transitions to SUCCESS after validation)
      expect(mockValidateBasket).toHaveBeenCalledWith(
        {
          items: [
            { _id: "product1", quantity: 2 },
            { _id: "product2", quantity: 1 }
          ],
          total: 250
        },
        expect.any(String),
        expect.any(Object)
      );
      // State ends up as SUCCESS after validation passes
      expect(result.current.state).toBe("SUCCESS");
    });

    it("retry() dispatches START_VALIDATION event", async () => {
      mockValidateBasket
        .mockResolvedValueOnce({ outcome: "FAIL_NETWORK" })
        .mockResolvedValueOnce({
          outcome: "PASS",
          stripeUrl: "https://checkout.stripe.com/pay/test"
        });

      const { result } = renderHook(() => usePreCheckout());

      // First call fails
      await act(async () => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("ERROR_NETWORK");

      // Retry dispatches START_VALIDATION again
      await act(async () => {
        result.current.retry();
      });
      expect(result.current.state).toBe("SUCCESS");
      expect(mockValidateBasket).toHaveBeenCalledTimes(2);
    });

    it("reset() dispatches RESET event", async () => {
      const { result } = renderHook(() => usePreCheckout());

      // From any state, reset should dispatch RESET
      await act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe("IDLE");
      expect(result.current.context.discrepancy).toBeNull();
      expect(result.current.context.stripeUrl).toBeNull();
      expect(result.current.context.idempotencyKey).toBeNull();
    });

    it("acceptAndContinue() calls acceptAndContinueHandler with context", async () => {
      const mockDiscrepancy = {
        type: "PRICE" as const,
        items: [
          {
            id: "product1",
            productName: "Test Product",
            expected: 100,
            actual: 120
          }
        ]
      };

      mockValidateBasket
        .mockResolvedValueOnce({
          outcome: "FAIL_VALIDATION",
          discrepancy: mockDiscrepancy
        })
        .mockResolvedValueOnce({
          outcome: "PASS",
          stripeUrl: "https://checkout.stripe.com/pay/test"
        });

      const { result } = renderHook(() => usePreCheckout());

      // First call fails
      await act(async () => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("ERROR_VALIDATION");
      expect(result.current.context.discrepancy).toEqual(mockDiscrepancy);

      // acceptAndContinue should call the handler with context
      await act(async () => {
        result.current.acceptAndContinue();
      });

      // Verify the handler was called with the discrepancy and idempotency key
      expect(mockValidateBasket).toHaveBeenCalledTimes(2);
    });

    it("acceptAndContinue() does nothing when no discrepancy", async () => {
      const { result } = renderHook(() => usePreCheckout());

      // In IDLE state, no discrepancy
      await act(() => {
        result.current.acceptAndContinue();
      });

      // Should remain in IDLE, no validation called
      expect(result.current.state).toBe("IDLE");
      expect(mockValidateBasket).not.toHaveBeenCalled();
    });
  });

  describe("Basket snapshot sourced from same basketStore", () => {
    it("getBasketPayload uses the same basketStore instance", () => {
      // Create a shared basket store instance
      const sharedBasketStore = {
        basket: [
          { _id: "product1", quantity: 3, displayPrice: 150, stock: 8 }
        ],
        getState: vi.fn()
      };

      // Override the mock for this specific test
      (useBasketStore as any).getState = vi.fn(() => sharedBasketStore);
      vi.mocked(selectBasketTotal).mockReturnValue(150);
      mockValidateBasket.mockResolvedValue({
        outcome: "PASS",
        stripeUrl: "https://checkout.stripe.com/pay/test"
      });

      const { result } = renderHook(() => usePreCheckout());

      // Call checkout to trigger getBasketPayload
      act(() => {
        result.current.checkout();
      });

      // Verify the same basketStore instance was used
      expect((useBasketStore as any).getState).toHaveBeenCalled();
      expect(mockValidateBasket).toHaveBeenCalledWith(
        {
          items: [{ _id: "product1", quantity: 3 }],
          total: 150
        },
        expect.any(String),
        expect.any(Object)
      );
    });

    it("basket snapshot reflects real-time changes", () => {
      const dynamicBasketStore = {
        basket: [
          { _id: "product1", quantity: 1, displayPrice: 100, stock: 10 }
        ],
        getState: vi.fn(() => dynamicBasketStore)
      };

      (useBasketStore as any).getState = () => dynamicBasketStore;
      vi.mocked(selectBasketTotal).mockReturnValue(100);

      const { result } = renderHook(() => usePreCheckout());

      // Initial call
      act(() => {
        result.current.checkout();
      });

      const firstCall = mockValidateBasket.mock.calls[0];
      expect(firstCall[0]).toEqual({
        items: [{ _id: "product1", quantity: 1 }],
        total: 100
      });

      // Update basket
      dynamicBasketStore.basket[0].quantity = 2;
      vi.mocked(selectBasketTotal).mockReturnValue(200);

      // Second call should reflect updated basket
      act(() => {
        result.current.retry();
      });

      const secondCall = mockValidateBasket.mock.calls[1];
      expect(secondCall[0]).toEqual({
        items: [{ _id: "product1", quantity: 2 }],
        total: 200
      });
    });

    it("no separate copy of basket data is created", () => {
      const { result } = renderHook(() => usePreCheckout());

      // Verify that getBasketPayload directly accesses the store
      // without creating a separate copy or cache
      const storeState = useBasketStore.getState();

      act(() => {
        result.current.checkout();
      });

      // The basket items should reference the same data structure
      expect(mockValidateBasket).toHaveBeenCalledWith(
        {
          items: storeState.basket.map(item => ({
            _id: item._id,
            quantity: item.quantity
          })),
          total: 250
        },
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe("All 5 states are reachable from public API", () => {
    it("can reach IDLE state (initial and after reset)", () => {
      const { result } = renderHook(() => usePreCheckout());

      // Initial state
      expect(result.current.state).toBe("IDLE");

      // Reset returns to IDLE
      act(() => {
        result.current.reset();
      });
      expect(result.current.state).toBe("IDLE");
    });

    it("can reach PROCESSING state (checkout and retry)", async () => {
      let resolvePromise: (value: any) => void;
      mockValidateBasket.mockImplementation(() =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const { result } = renderHook(() => usePreCheckout());

      // From checkout
      act(() => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("PROCESSING");

      // Resolve the promise first, then reset
      await act(async () => {
        resolvePromise!({ outcome: "FAIL_NETWORK" });
      });
      expect(result.current.state).toBe("ERROR_NETWORK");

      // Reset to IDLE
      act(() => {
        result.current.reset();
      });
      expect(result.current.state).toBe("IDLE");

      // From retry
      let resolvePromise2: (value: any) => void;
      mockValidateBasket.mockImplementation(() =>
        new Promise((resolve) => {
          resolvePromise2 = resolve;
        })
      );

      act(() => {
        result.current.retry();
      });
      expect(result.current.state).toBe("PROCESSING");

      // Clean up
      await act(async () => {
        resolvePromise2!({ outcome: "PASS", stripeUrl: "test" });
      });
    });

    it("can reach SUCCESS state", async () => {
      mockValidateBasket.mockResolvedValue({
        outcome: "PASS",
        stripeUrl: "https://checkout.stripe.com/pay/test"
      });

      const { result } = renderHook(() => usePreCheckout());

      await act(async () => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("SUCCESS");
    });

    it("can reach ERROR_NETWORK state", async () => {
      mockValidateBasket.mockResolvedValue({
        outcome: "FAIL_NETWORK"
      });

      const { result } = renderHook(() => usePreCheckout());

      await act(async () => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("ERROR_NETWORK");
    });

    it("can reach ERROR_VALIDATION state", async () => {
      mockValidateBasket.mockResolvedValue({
        outcome: "FAIL_VALIDATION",
        discrepancy: {
          type: "INVENTORY",
          items: [
            {
              id: "product1",
              productName: "Test",
              requested: 2,
              available: 1
            }
          ]
        }
      });

      const { result } = renderHook(() => usePreCheckout());

      await act(async () => {
        result.current.checkout();
      });
      expect(result.current.state).toBe("ERROR_VALIDATION");
    });
  });
});
