import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutPanel from "@/app/components/features/basket/checkout/CheckoutPanel";
import { PreCheckoutContext } from "@/store/preCheckout/preCheckoutTypes";

const mockContext = {
  idempotencyKey: null,
  discrepancy: null,
  stripeUrl: null,
  redirectWatchdogId: null,
} as PreCheckoutContext;

const defaultProps = {
  state: "IDLE" as const,
  context: mockContext,
  checkout: vi.fn(),
  retry: vi.fn(),
  acceptAndContinue: vi.fn(),
  reset: vi.fn(),
};

describe("CheckoutPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("IDLE state", () => {
    it("should show checkout button enabled", () => {
      render(<CheckoutPanel {...defaultProps} state="IDLE" />);
      
      const checkoutButton = screen.getByRole("button", { name: "Checkout" });
      expect(checkoutButton).toBeInTheDocument();
      expect(checkoutButton).not.toBeDisabled();
    });

    it("should call checkout when clicked", async () => {
      const user = userEvent.setup();
      render(<CheckoutPanel {...defaultProps} state="IDLE" />);
      
      const checkoutButton = screen.getByRole("button", { name: "Checkout" });
      await user.click(checkoutButton);
      
      expect(defaultProps.checkout).toHaveBeenCalledTimes(1);
    });
  });

  describe("PROCESSING state", () => {
    it("should show disabled processing button", () => {
      render(<CheckoutPanel {...defaultProps} state="PROCESSING" />);
      
      const processingButton = screen.getByRole("button", { name: "Processing..." });
      expect(processingButton).toBeInTheDocument();
      expect(processingButton).toBeDisabled();
    });

    it("should not call checkout when processing button clicked", async () => {
      const user = userEvent.setup();
      render(<CheckoutPanel {...defaultProps} state="PROCESSING" />);
      
      const processingButton = screen.getByRole("button", { name: "Processing..." });
      await user.click(processingButton);
      
      expect(defaultProps.checkout).not.toHaveBeenCalled();
    });
  });

  describe("ERROR_NETWORK state", () => {
    it("should show retry button", () => {
      render(<CheckoutPanel {...defaultProps} state="ERROR_NETWORK" />);
      
      const retryButton = screen.getByRole("button", { name: "Retry" });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
    });

    it("should call retry when retry button clicked", async () => {
      const user = userEvent.setup();
      render(<CheckoutPanel {...defaultProps} state="ERROR_NETWORK" />);
      
      const retryButton = screen.getByRole("button", { name: "Retry" });
      await user.click(retryButton);
      
      expect(defaultProps.retry).toHaveBeenCalledTimes(1);
    });
  });

  describe("ERROR_VALIDATION PRICE type", () => {
    it("should show old price and new price per item", () => {
      const priceDiscrepancyContext = {
        ...mockContext,
        discrepancy: {
          type: "PRICE",
          items: [
            {
              id: "item1",
              productName: "Test Product",
              expected: 100,
              actual: 120,
            },
          ],
        },
      } as PreCheckoutContext;

      render(<CheckoutPanel {...defaultProps} state="ERROR_VALIDATION" context={priceDiscrepancyContext} />);
      
      expect(screen.getByText("Price Changes Detected")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Old price: $100")).toBeInTheDocument();
      expect(screen.getByText("New price: $120")).toBeInTheDocument();
    });
  });

  describe("ERROR_VALIDATION INVENTORY type", () => {
    it("should show available quantity per item", () => {
      const inventoryDiscrepancyContext = {
        ...mockContext,
        discrepancy: {
          type: "INVENTORY",
          items: [
            {
              id: "item1",
              productName: "Test Product",
              requested: 3,
              available: 1,
            },
          ],
        },
      } as PreCheckoutContext;

      render(<CheckoutPanel {...defaultProps} state="ERROR_VALIDATION" context={inventoryDiscrepancyContext} />);
      
      expect(screen.getByText("Stock Availability Changed")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Requested: 3")).toBeInTheDocument();
      expect(screen.getByText("Available: 1")).toBeInTheDocument();
    });
  });

  describe("ERROR_VALIDATION STRIPE_CONFIG type", () => {
    it("should not show Accept & Continue button", () => {
      const stripeConfigContext = {
        ...mockContext,
        discrepancy: {
          type: "STRIPE_CONFIG",
          message: "Stripe configuration error",
        },
      } as PreCheckoutContext;

      render(<CheckoutPanel {...defaultProps} state="ERROR_VALIDATION" context={stripeConfigContext} />);
      
      expect(screen.queryByRole("button", { name: "Accept & Continue" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Contact support" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Update basket" })).toBeInTheDocument();
    });
  });

  describe("SUCCESS state", () => {
    it("should show redirecting text with no buttons", () => {
      render(<CheckoutPanel {...defaultProps} state="SUCCESS" />);
      
      expect(screen.getByText("Redirecting to payment...")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
