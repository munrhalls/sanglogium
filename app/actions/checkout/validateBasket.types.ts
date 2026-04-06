/**
 * validateBasket server action result types
 * Implements §5 processing pipeline result contracts
 */

import type { DiscrepancyPayload } from "../../../store/preCheckout/preCheckoutTypes";

export type ValidateBasketResult =
  | { outcome: "PASS"; stripeUrl: string }
  | { outcome: "FAIL_VALIDATION"; discrepancy: DiscrepancyPayload }
  | { outcome: "FAIL_NETWORK" };

export type BasketPayload = {
  items: Array<{
    _id: string;
    quantity: number;
  }>;
  total: number;
};

// Additional discrepancy type for Stripe configuration errors
export interface StripeConfigDiscrepancy {
  type: "STRIPE_CONFIG";
  items: Array<{
    id: "stripe";
    issue: string;
  }>;
}
