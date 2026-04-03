import { stripe } from "../../../../lib/stripe/stripe.js";
import { STRIPE_TEST_CARDS } from "./test-data";

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
            productsIntent: "id_test_product_1:1"
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
