import { backendClient } from "../../../../sanity/lib/backendClient";

/**
 * Sanity Query Fixture
 * Provides direct data verification for test assertions
 */
export const sanityQueries = {
  /**
   * Traces actual Sanity stock values (stock + reservedStock)
   */
  async getProductStock(productId: string) {
    return await backendClient.fetch(
      `*[_type == "product" && _id == $productId][0] { stock, reservedStock }`,
      { productId }
    );
  },

  /**
   * Retrieves an order by its Stripe Session ID
   */
  async getOrderBySession(sessionId: string) {
    return await backendClient.fetch(
      `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
      { sessionId }
    );
  },

  /**
   * Counts total orders for idempotency and baseline checks
   */
  async getOrderCount() {
    return await backendClient.fetch(`count(*[_type == "order"])`);
  }
};
