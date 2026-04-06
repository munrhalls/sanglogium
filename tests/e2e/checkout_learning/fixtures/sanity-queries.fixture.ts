import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-01-01",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
/**
 * Sanity Query Fixture
 * Provides direct data verification for test assertions
 */
export const sanityQueries = {
  /**
   * Traces actual Sanity stock values (stock + reservedStock)
   */
  async getProductStock(productId: string) {
    return await sanityClient.fetch(
      `*[_type == "product" && _id == $productId][0] { stock, reservedStock }`,
      { productId }
    );
  },

  /**
   * Retrieves an order by its Stripe Session ID
   */
  async getOrderBySession(sessionId: string) {
    return await sanityClient.fetch(
      `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
      { sessionId }
    );
  },

  /**
   * Counts total orders for idempotency and baseline checks
   */
  async getOrderCount() {
    return await sanityClient.fetch(`count(*[_type == "order"])`);
  }
};
