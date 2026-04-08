
// Mock for happy path
window.mockValidateBasket = async (payload, key) => {
  console.log('MOCK: validateBasket called with key:', key);
  return { outcome: "PASS", stripeUrl: "https://checkout.stripe.com/pay/test-success" };
};
