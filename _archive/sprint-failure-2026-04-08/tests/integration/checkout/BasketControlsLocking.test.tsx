import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Basket from "@/app/(store)/basket/Basket";
import { useBasketStore } from "@/store/store";
import { PreCheckoutContext } from "@/store/preCheckout/preCheckoutTypes";

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

describe("Basket Controls Locking", () => {
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
    
    const quantityButtons = screen.getAllByRole("button");
    // Should have increment/decrement buttons and remove button
    expect(quantityButtons.length).toBeGreaterThan(0);
    
    // All buttons should be enabled
    quantityButtons.forEach(button => {
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should disable basket controls when checkout state is PROCESSING", async () => {
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
    
    const quantityButtons = screen.getAllByRole("button");
    
    // All buttons should be disabled
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should disable basket controls when checkout state is ERROR_NETWORK", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "ERROR_NETWORK",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);
    
    const quantityButtons = screen.getAllByRole("button");
    
    // All buttons should be disabled
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should disable basket controls when checkout state is ERROR_VALIDATION", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "ERROR_VALIDATION",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);
    
    const quantityButtons = screen.getAllByRole("button");
    
    // All buttons should be disabled
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should disable basket controls when checkout state is SUCCESS", async () => {
    const { usePreCheckout } = await import("@/app/components/features/basket/checkout/usePreCheckout");
    vi.mocked(usePreCheckout).mockReturnValue({
      state: "SUCCESS",
      context: {} as PreCheckoutContext,
      checkout: vi.fn(),
      retry: vi.fn(),
      acceptAndContinue: vi.fn(),
      reset: vi.fn(),
    });

    render(<Basket />);
    
    const quantityButtons = screen.getAllByRole("button");
    
    // All buttons should be disabled
    quantityButtons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });
});
