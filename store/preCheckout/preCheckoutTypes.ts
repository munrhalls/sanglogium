/**
 * Pre-checkout state machine types
 * Implements the finite state machine for basket-to-checkout handshake
 */

// States §2
export type PreCheckoutState =
  | "IDLE"
  | "PROCESSING"
  | "ERROR_NETWORK"
  | "ERROR_VALIDATION"
  | "SUCCESS";

// Events §3
export type PreCheckoutEvent =
  | { type: "START_VALIDATION" }
  | { type: "FAIL_NETWORK" }
  | { type: "FAIL_VALIDATION"; payload: DiscrepancyPayload }
  | { type: "PASS_VALIDATION"; stripeUrl: string }
  | { type: "RESET" };

// Context §10
export interface PreCheckoutContext {
  idempotencyKey: string | null;
  discrepancy: DiscrepancyPayload | null;
  stripeUrl: string | null;
  redirectWatchdogId: number | null;
}

// Discrepancy Payload §5
export type DiscrepancyPayload =
  | { type: "INVENTORY"; items: InventoryDiscrepancy[] }
  | { type: "PRICE"; items: PriceDiscrepancy[] }
  | { type: "STRIPE_CONFIG"; message: string };

export interface InventoryDiscrepancy {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

export interface PriceDiscrepancy {
  productId: string;
  productName: string;
  expected: number;
  actual: number;
}

// Transition result
export interface TransitionResult {
  state: PreCheckoutState;
  context: PreCheckoutContext;
}
