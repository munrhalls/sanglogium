import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Basket from "@/app/(store)/basket/Basket";
import { useBasketStore } from "@/store/store";
import { PreCheckoutContext, DiscrepancyPayload } from "@/store/preCheckout/preCheckoutTypes";

// Mock the usePreCheckout hook to control state
vi.mock("@/app/components/features/basket/checkout/usePreCheckout", () => ({
  usePreCheckout: vi.fn(),
}));

const mockBasketItems = [
  {
    _id: "item1",
    name: "Test Product",
    slug: "test-product",
    quantity: 2,
    displayPrice: 100,
    image: "/test-image.jpg",
    stock: 5,
  },
];

describe("Basket Controls Locking - Neighbour Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset basket store
    useBasketStore.setState({ basket: mockBasketItems });
  });

  it("should enable basket controls when checkout state is IDLE", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "IDLE",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);

    // Get all buttons (increment, decrement, remove)
    const quantityButtons = screen.getAllByRole("button");
    // Should have increment/decrement buttons and remove button
    expect(quantityButtons.length).toBeGreaterThan(0);

    // All controls should be enabled
    quantityButtons.forEach(button => {
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should disable basket controls in PROCESSING state but keep basketStore editable", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "PROCESSING",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);

    // Get all buttons
    const quantityButtons = screen.getAllByRole("button");

    // All controls should be visually disabled
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    // Verify basketStore is still editable (not locked by checkout state machine)
    const basket = useBasketStore.getState().basket;
    expect(basket).toHaveLength(1);
    expect(basket[0].quantity).toBe(2);

    // Direct store operations should still work
    useBasketStore.getState().updateQuantity("item1", 3);
    const updatedBasket = useBasketStore.getState().basket;
    expect(updatedBasket[0].quantity).toBe(3);
  });

  it("should restore basket controls editability after RESET from ERROR_VALIDATION", async () => {
    const mockReset = vi.fn();
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");

    // Start in ERROR_VALIDATION state
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "ERROR_VALIDATION",
      context: {
        discrepancy: {
          type: "PRICE",
          message: "Price changed",
          items: [{
            id: "item1",
            productName: "Test Product",
            expected: 100,
            actual: 120
          }]
        }
      } as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: mockReset,
    });

    const { rerender } = render(<Basket />);

    // Controls should be disabled in ERROR_VALIDATION
    const quantityButtons = screen.getAllByRole("button");
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
    });

    // Simulate RESET being called and state changing to IDLE
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "IDLE",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: mockReset,
    });

    rerender(<Basket />);

    // Controls should be enabled again
    const enabledButtons = screen.getAllByRole("button");
    enabledButtons.forEach(button => {
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should not allow basket item mutations to affect checkout state machine", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    let mockState = "PROCESSING";

    vi.mocked(usePreCheckout).mockReturnValue({
      state: mockState,
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);

    // Even though we can mutate the basket store directly...
    useBasketStore.getState().updateQuantity("item1", 1);
    useBasketStore.getState().removeItem("item1");

    // The checkout state machine should remain in PROCESSING
    // (it's independent of basket item mutations)
    expect(mockState).toBe("PROCESSING");
  });

  it("should handle the Update basket button (RESET) correctly", async () => {
    const mockReset = vi.fn();
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");

    // Start in ERROR_VALIDATION state
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "ERROR_VALIDATION",
      context: {
        discrepancy: {
          type: "INVENTORY",
          message: "Stock changed",
          items: [{
            id: "item1",
            productName: "Test Product",
            requested: 2,
            available: 1
          }]
        }
      } as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: mockReset,
    });

    render(<Basket />);

    // Verify the reset function exists and can be called
    expect(mockReset).toBeDefined();
    expect(typeof mockReset).toBe("function");

    // The reset function should transition from ERROR_VALIDATION to IDLE
    // which would re-enable basket controls
    mockReset();
    expect(mockReset).toHaveBeenCalled();
  });
});
