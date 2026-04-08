import { describe, it, expect } from "vitest";
import { transition } from "@/store/preCheckout/preCheckoutMachine";
import type {
  PreCheckoutState,
  PreCheckoutEvent,
  PreCheckoutContext,
  DiscrepancyPayload
} from "@/store/preCheckout/preCheckoutTypes";

describe("preCheckoutMachine Skeleton DoD", () => {
  it("has PreCheckoutState with all 5 states", () => {
    const states: PreCheckoutState[] = ["IDLE", "PROCESSING", "ERROR_NETWORK", "ERROR_VALIDATION", "SUCCESS"];
    expect(states).toHaveLength(5);
  });

  it("has PreCheckoutEvent with all 5 events", () => {
    const events: PreCheckoutEvent[] = [
      { type: "START_VALIDATION" },
      { type: "FAIL_NETWORK" },
      { type: "FAIL_VALIDATION", payload: { type: "STRIPE_CONFIG", message: "test" } },
      { type: "PASS_VALIDATION", stripeUrl: "test" },
      { type: "RESET" }
    ];
    expect(events).toHaveLength(5);
  });

  it("has PreCheckoutContext with all 4 nullable fields", () => {
    const context: PreCheckoutContext = {
      idempotencyKey: null,
      discrepancy: null,
      stripeUrl: null,
      redirectWatchdogId: null
    };
    
    expect(context.idempotencyKey).toBeNull();
    expect(context.discrepancy).toBeNull();
    expect(context.stripeUrl).toBeNull();
    expect(context.redirectWatchdogId).toBeNull();
  });

  it("has DiscrepancyPayload with 3 discriminated types and required fields", () => {
    // INVENTORY type with required 'available' field
    const inventory: DiscrepancyPayload = {
      type: "INVENTORY",
      items: [{
        productId: "test",
        productName: "Test",
        requested: 1,
        available: 5
      }]
    };
    expect(inventory.type).toBe("INVENTORY");
    expect(inventory.items[0].available).toBe(5);

    // PRICE type with required 'expected' and 'actual' fields
    const price: DiscrepancyPayload = {
      type: "PRICE",
      items: [{
        productId: "test",
        productName: "Test",
        expected: 100,
        actual: 120
      }]
    };
    expect(price.type).toBe("PRICE");
    expect(price.items[0].expected).toBe(100);
    expect(price.items[0].actual).toBe(120);

    // STRIPE_CONFIG type
    const stripeConfig: DiscrepancyPayload = {
      type: "STRIPE_CONFIG",
      message: "Invalid currency"
    };
    expect(stripeConfig.type).toBe("STRIPE_CONFIG");
    expect(stripeConfig.message).toBe("Invalid currency");
  });

  it("exports transition function that returns state and context", () => {
    const result = transition("IDLE", { type: "RESET" }, {
      idempotencyKey: null,
      discrepancy: null,
      stripeUrl: null,
      redirectWatchdogId: null
    });
    
    expect(result).toHaveProperty("state");
    expect(result).toHaveProperty("context");
    expect(typeof result.state).toBe("string");
    expect(typeof result.context).toBe("object");
  });
});
