// # Execution Specs: createOrderFromPaymentIntent — Atomic Settlement
//
// The order and every stock decrement commit as ONE Sanity transaction, keyed by a
// deterministic order _id. The webhook and the return handler both call this on every
// successful payment, so they can race freely: one payment -> exactly one order, with
// stock decremented exactly once (ADR-002, Pattern 1).

import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

const mocks = vi.hoisted(() => ({
  tx: { create: vi.fn(), patch: vi.fn(), commit: vi.fn() },
  transaction: vi.fn(),
  fetch: vi.fn(),
  getDocument: vi.fn(),
  directCreate: vi.fn(),
  directPatch: vi.fn(),
}));

vi.mock("@/sanity-cms/lib/backendClient", () => ({
  backendClient: {
    transaction: mocks.transaction,
    fetch: mocks.fetch,
    getDocument: mocks.getDocument,
    create: mocks.directCreate,
    patch: mocks.directPatch,
  },
}));
vi.mock("@/lib/dev/event-logger", () => ({ logCheckoutEvent: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: vi.fn() }));

import {
  createOrderFromPaymentIntent,
  type OrderSessionData,
} from "../createOrderFromPaymentIntent";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";

const ORDER_ID = "order_pi_3Test123456";

const pi = {
  id: "pi_3Test123456",
  amount: 24600,
  currency: "pln",
  receipt_email: null,
  latest_charge: null,
  metadata: { vat: "4600" },
} as unknown as Stripe.PaymentIntent;

const sessionData = (basket: OrderSessionData["basket"]): OrderSessionData => ({
  basket,
  address: {
    firstName: "Jan",
    lastName: "Kowalski",
    regionCode: "PL",
    postalCode: "50-001",
    street: "Rynek",
    streetNumber: "1",
    city: "Wroclaw",
  },
  shippingMethodName: "Standard",
  shippingCarrier: "DPD",
  shippingCost: 1500,
  email: "jan@example.com",
  checkoutSessionId: "cs_test",
});

const product = (id: string, stock: number) => ({
  _id: id,
  _rev: `rev-${id}`,
  name: `Product ${id}`,
  stock,
  price_data: { unit_amount: 10000 },
});

// First fetch is the idempotency lookup, second is the product lookup.
const mockSanity = (existingOrder: unknown, products: unknown[] = []) => {
  mocks.fetch.mockResolvedValueOnce(existingOrder).mockResolvedValueOnce(products);
};

describe("createOrderFromPaymentIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetch.mockReset();
    mocks.getDocument.mockReset();
    mocks.transaction.mockReset().mockReturnValue(mocks.tx);
    mocks.tx.create.mockReset().mockReturnValue(mocks.tx);
    mocks.tx.patch.mockReset().mockReturnValue(mocks.tx);
    mocks.tx.commit.mockReset().mockResolvedValue({});
  });

  describe("when the payment has no order yet", () => {
    it("commits the order and every stock decrement in one transaction", async () => {
      mockSanity(null, [product("p1", 5), product("p2", 3)]);

      await createOrderFromPaymentIntent(
        pi,
        sessionData([
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
        ])
      );

      expect(mocks.transaction).toHaveBeenCalledTimes(1);
      expect(mocks.tx.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: ORDER_ID,
          _type: "order",
          orderId: ORDER_ID,
          paymentIntentId: pi.id,
        })
      );
      expect(mocks.tx.patch).toHaveBeenCalledTimes(2);
      expect(mocks.tx.patch).toHaveBeenCalledWith("p1", { ifRevisionID: "rev-p1", dec: { stock: 2 } });
      expect(mocks.tx.patch).toHaveBeenCalledWith("p2", { ifRevisionID: "rev-p2", dec: { stock: 1 } });
      expect(mocks.tx.commit).toHaveBeenCalledTimes(1);
      expect(mocks.directCreate).not.toHaveBeenCalled();
      expect(mocks.directPatch).not.toHaveBeenCalled();
      expect(sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    it("merges repeated basket lines into one revision-guarded decrement", async () => {
      mockSanity(null, [product("p1", 5)]);

      await createOrderFromPaymentIntent(
        pi,
        sessionData([
          { productId: "p1", quantity: 1 },
          { productId: "p1", quantity: 2 },
        ])
      );

      expect(mocks.tx.patch).toHaveBeenCalledTimes(1);
      expect(mocks.tx.patch).toHaveBeenCalledWith("p1", { ifRevisionID: "rev-p1", dec: { stock: 3 } });
    });

    it("still records the order but skips the decrement when stock is insufficient", async () => {
      mockSanity(null, [product("p1", 1)]);

      await createOrderFromPaymentIntent(pi, sessionData([{ productId: "p1", quantity: 2 }]));

      expect(mocks.tx.create).toHaveBeenCalledTimes(1);
      expect(mocks.tx.patch).not.toHaveBeenCalled();
      expect(mocks.tx.commit).toHaveBeenCalledTimes(1);
      expect(logCheckoutEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: "order_stock_insufficient" })
      );
    });

    it("still records the order when a basket line references an unknown product", async () => {
      mockSanity(null, []);

      await createOrderFromPaymentIntent(pi, sessionData([{ productId: "gone", quantity: 1 }]));

      expect(mocks.tx.create).toHaveBeenCalledTimes(1);
      expect(mocks.tx.patch).not.toHaveBeenCalled();
      expect(mocks.tx.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe("when an order already exists for the payment intent", () => {
    it("returns without opening a transaction", async () => {
      mocks.fetch.mockResolvedValueOnce({ _id: "legacy-order" });

      await createOrderFromPaymentIntent(pi, sessionData([{ productId: "p1", quantity: 1 }]));

      expect(mocks.fetch).toHaveBeenCalledTimes(1);
      expect(mocks.transaction).not.toHaveBeenCalled();
      expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe("when the transaction is rejected", () => {
    it("treats it as a lost race if the order now exists", async () => {
      mockSanity(null, [product("p1", 5)]);
      mocks.tx.commit.mockRejectedValueOnce(new Error("Document by ID already exists"));
      mocks.getDocument.mockResolvedValueOnce({ _id: ORDER_ID });

      await expect(
        createOrderFromPaymentIntent(pi, sessionData([{ productId: "p1", quantity: 1 }]))
      ).resolves.toBeUndefined();

      expect(mocks.getDocument).toHaveBeenCalledWith(ORDER_ID);
      expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });

    it("rethrows so Stripe retries if no order exists", async () => {
      mockSanity(null, [product("p1", 5)]);
      mocks.tx.commit.mockRejectedValueOnce(new Error("stock changed"));
      mocks.getDocument.mockResolvedValueOnce(undefined);

      await expect(
        createOrderFromPaymentIntent(pi, sessionData([{ productId: "p1", quantity: 1 }]))
      ).rejects.toThrow("stock changed");

      expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
