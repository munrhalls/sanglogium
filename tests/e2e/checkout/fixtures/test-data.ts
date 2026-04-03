/**
 * Test Data Constants
 * Provides shared product IDs, addresses, and test cards across all E2E suites
 */

export const TEST_PRODUCT_IDS = [
  "id_test_product_1",
  "id_test_product_2"
];

export const TEST_ADDRESSES = {
  POLAND: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+48123456789",
    street: "Rynek 1",
    city: "Wrocław",
    postalCode: "50-100",
    country: "PL"
  }
};

export const STRIPE_TEST_CARDS = {
  SUCCESS: "4242 4242 4242 4242",
  // Reserved for future use: DECLINED, EXPIRED, etc.
};
