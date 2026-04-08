import Stripe from "stripe";
import dotenv from "dotenv";
import { STRIPE_TEST_CARDS } from "./test-data";

dotenv.config({ path: ".env.local" });

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
  apiVersion: "2023-10-16" as any,
});

/**
 * Stripe Test Fixture
 * Provides helpers for webhook construction and session inspection
 */
export const stripeMock = {
  /**
   * Returns the primary success test card
   */
  getSuccessCard() {
    return STRIPE_TEST_CARDS.SUCCESS;
  },

  /**
   * Generates a mock webhook payload for testing internal API endpoints
   * Supports 'checkout.session.completed', 'checkout.session.expired', etc.
   */
  async generateWebhookPayload(sessionId: string, type: string) {
    return {
      id: `evt_test_${Date.now()}`,
      type: type,
      data: {
        object: {
          id: sessionId,
          metadata: {
            productsIntent: "3O1ZNp54LWQGln4uEAU7Vs:1"
          }
        }
      }
    };
  },

  /**
   * Retrieves a real Stripe Session for state verification
   */
  async retrieveSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  }
};
