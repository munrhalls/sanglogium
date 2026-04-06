import { describe, it, expect } from "vitest";
import { transition } from "@/store/preCheckout/preCheckoutMachine";
import type {
  PreCheckoutState,
  PreCheckoutEvent,
  PreCheckoutContext,
  DiscrepancyPayload
} from "@/store/preCheckout/preCheckoutTypes";

describe("preCheckoutMachine", () => {
  const initialContext: PreCheckoutContext = {
    idempotencyKey: null,
    discrepancy: null,
    stripeUrl: null,
    redirectWatchdogId: null
  };

  describe("valid transitions", () => {
    it("should transition IDLE -> PROCESSING on START_VALIDATION", () => {
      const event: PreCheckoutEvent = { type: "START_VALIDATION" };
      const result = transition("IDLE", event, initialContext);

      expect(result.state).toBe("PROCESSING");
      expect(result.context.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/); // UUID v4
      expect(result.context.discrepancy).toBeNull();
    });

    it("should transition PROCESSING -> ERROR_NETWORK on FAIL_NETWORK", () => {
      const contextWithKey: PreCheckoutContext = {
        ...initialContext,
        idempotencyKey: "test-key"
      };
      const event: PreCheckoutEvent = { type: "FAIL_NETWORK" };
      const result = transition("PROCESSING", event, contextWithKey);

      expect(result.state).toBe("ERROR_NETWORK");
      expect(result.context.idempotencyKey).toBeNull();
    });

    it("should transition PROCESSING -> ERROR_VALIDATION on FAIL_VALIDATION", () => {
      const contextWithKey: PreCheckoutContext = {
        ...initialContext,
        idempotencyKey: "test-key"
      };
      const discrepancy: DiscrepancyPayload = {
        type: "INVENTORY",
        items: [{
          productId: "p1",
          productName: "Test Product",
          requested: 2,
          available: 1
        }]
      };
      const event: PreCheckoutEvent = { type: "FAIL_VALIDATION", payload: discrepancy };
      const result = transition("PROCESSING", event, contextWithKey);

      expect(result.state).toBe("ERROR_VALIDATION");
      expect(result.context.discrepancy).toEqual(discrepancy);
      expect(result.context.idempotencyKey).toBeNull();
    });

    it("should transition PROCESSING -> SUCCESS on PASS_VALIDATION", () => {
      const contextWithKey: PreCheckoutContext = {
        ...initialContext,
        idempotencyKey: "test-key"
      };
      const event: PreCheckoutEvent = {
        type: "PASS_VALIDATION",
        stripeUrl: "https://checkout.stripe.com/pay/test"
      };
      const result = transition("PROCESSING", event, contextWithKey);

      expect(result.state).toBe("SUCCESS");
      expect(result.context.stripeUrl).toBe("https://checkout.stripe.com/pay/test");
      expect(result.context.idempotencyKey).toBe("test-key"); // Should be retained
    });

    it("should transition ERROR_NETWORK -> PROCESSING on START_VALIDATION", () => {
      const event: PreCheckoutEvent = { type: "START_VALIDATION" };
      const result = transition("ERROR_NETWORK", event, initialContext);

      expect(result.state).toBe("PROCESSING");
      expect(result.context.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("should transition ERROR_VALIDATION -> PROCESSING on START_VALIDATION when discrepancy is null", () => {
      const event: PreCheckoutEvent = { type: "START_VALIDATION" };
      const result = transition("ERROR_VALIDATION", event, initialContext);

      expect(result.state).toBe("PROCESSING");
      expect(result.context.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("should stay in ERROR_VALIDATION on START_VALIDATION when discrepancy exists", () => {
      const contextWithDiscrepancy: PreCheckoutContext = {
        ...initialContext,
        discrepancy: {
          type: "PRICE",
          items: [{
            productId: "p1",
            productName: "Test Product",
            expected: 100,
            actual: 120
          }]
        }
      };
      const event: PreCheckoutEvent = { type: "START_VALIDATION" };
      const result = transition("ERROR_VALIDATION", event, contextWithDiscrepancy);

      expect(result.state).toBe("ERROR_VALIDATION");
      expect(result.context.discrepancy).toEqual(contextWithDiscrepancy.discrepancy);
      expect(result.context.idempotencyKey).toBeNull();
    });

    it("should transition SUCCESS -> ERROR_NETWORK on FAIL_NETWORK", () => {
      const contextWithKeyAndUrl: PreCheckoutContext = {
        ...initialContext,
        idempotencyKey: "test-key",
        stripeUrl: "https://checkout.stripe.com/pay/test"
      };
      const event: PreCheckoutEvent = { type: "FAIL_NETWORK" };
      const result = transition("SUCCESS", event, contextWithKeyAndUrl);

      expect(result.state).toBe("ERROR_NETWORK");
      expect(result.context.idempotencyKey).toBeNull();
      expect(result.context.stripeUrl).toBe("https://checkout.stripe.com/pay/test"); // Should be retained
    });

    it("should reset from ERROR_VALIDATION, ERROR_NETWORK, and SUCCESS to IDLE", () => {
      const errorStates: PreCheckoutState[] = ["ERROR_NETWORK", "ERROR_VALIDATION", "SUCCESS"];
      const event: PreCheckoutEvent = { type: "RESET" };

      errorStates.forEach(state => {
        const result = transition(state, event, initialContext);
        expect(result.state).toBe("IDLE");
        expect(result.context).toEqual(initialContext);
      });
    });
  });

  describe("invalid transitions", () => {
    it("should remain in IDLE for unsupported events", () => {
      const unsupportedEvents: PreCheckoutEvent[] = [
        { type: "FAIL_NETWORK" },
        { type: "FAIL_VALIDATION", payload: { type: "STRIPE_CONFIG", message: "test" } },
        { type: "PASS_VALIDATION", stripeUrl: "test" },
        { type: "RESET" }
      ];

      unsupportedEvents.forEach(event => {
        const result = transition("IDLE", event, initialContext);
        expect(result.state).toBe("IDLE");
        expect(result.context).toEqual(initialContext);
      });
    });

    it("should remain in PROCESSING for unsupported events", () => {
      const unsupportedEvents: PreCheckoutEvent[] = [
        { type: "START_VALIDATION" },
        { type: "RESET" }
      ];

      unsupportedEvents.forEach(event => {
        const result = transition("PROCESSING", event, initialContext);
        expect(result.state).toBe("PROCESSING");
        expect(result.context).toEqual(initialContext);
      });
    });

    it("should remain in ERROR_VALIDATION for unsupported events", () => {
      const unsupportedEvents: PreCheckoutEvent[] = [
        { type: "FAIL_NETWORK" },
        { type: "FAIL_VALIDATION", payload: { type: "STRIPE_CONFIG", message: "test" } },
        { type: "PASS_VALIDATION", stripeUrl: "test" }
      ];

      unsupportedEvents.forEach(event => {
        const result = transition("ERROR_VALIDATION", event, initialContext);
        expect(result.state).toBe("ERROR_VALIDATION");
        expect(result.context).toEqual(initialContext);
      });
    });

    it("should remain in SUCCESS for unsupported events", () => {
      const unsupportedEvents: PreCheckoutEvent[] = [
        { type: "START_VALIDATION" },
        { type: "FAIL_VALIDATION", payload: { type: "STRIPE_CONFIG", message: "test" } },
        { type: "PASS_VALIDATION", stripeUrl: "test" }
      ];

      unsupportedEvents.forEach(event => {
        const result = transition("SUCCESS", event, initialContext);
        expect(result.state).toBe("SUCCESS");
        expect(result.context).toEqual(initialContext);
      });
    });
  });

  describe("context mutations", () => {
    it("should generate unique idempotency keys", () => {
      const event: PreCheckoutEvent = { type: "START_VALIDATION" };
      const result1 = transition("IDLE", event, initialContext);
      const result2 = transition("IDLE", event, initialContext);

      expect(result1.context.idempotencyKey).not.toBe(result2.context.idempotencyKey);
    });

    it("should handle all discrepancy payload types", () => {
      const discrepancies: DiscrepancyPayload[] = [
        {
          type: "INVENTORY",
          items: [{
            productId: "p1",
            productName: "Product 1",
            requested: 5,
            available: 2
          }]
        },
        {
          type: "PRICE",
          items: [{
            productId: "p2",
            productName: "Product 2",
            expected: 100,
            actual: 150
          }]
        },
        {
          type: "STRIPE_CONFIG",
          message: "Invalid currency"
        }
      ];

      discrepancies.forEach(discrepancy => {
        const contextWithKey: PreCheckoutContext = {
          ...initialContext,
          idempotencyKey: "test-key"
        };
        const event: PreCheckoutEvent = { type: "FAIL_VALIDATION", payload: discrepancy };
        const result = transition("PROCESSING", event, contextWithKey);

        expect(result.state).toBe("ERROR_VALIDATION");
        expect(result.context.discrepancy).toEqual(discrepancy);
        expect(result.context.idempotencyKey).toBeNull();
      });
    });
  });
});
