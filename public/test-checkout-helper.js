
// Test Data Injector for Manual Verification
// Paste this script in the browser console during manual testing

window.testCheckout = {
  // Get current checkout state (if exposed)
  getState: function() {
    return window.checkoutState || 'State not exposed';
  },

  // Simulate network failure
  simulateNetworkFailure: function() {
    // Override fetch to simulate network error
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[0].includes('validateBasket')) {
        return Promise.reject(new Error('Network error simulated'));
      }
      return originalFetch.apply(this, args);
    };
    console.log('Network failure simulation enabled');
  },

  // Restore normal fetch
  restoreNetwork: function() {
    // This would need to be implemented based on how you override it
    console.log('Network restored (refresh page to reset)');
  },

  // Add console logging for state transitions
  enableStateLogging: function() {
    // This would need to be implemented in the actual component
    console.log('State logging enabled (requires component implementation)');
  },

  // Get current basket contents
  getBasketContents: function() {
    // This would need to be implemented based on your basket store
    console.log('Basket contents (requires basket store access)');
  },

  // Test scenarios
  scenarios: {
    happyPath: 'All items valid, should succeed',
    priceMismatch: 'Price changed in Sanity, should show PRICE error',
    inventoryShortage: 'Not enough stock, should show INVENTORY error',
    outOfStock: 'Zero stock, should remove item',
    networkError: 'Network failure, should show NETWORK error'
  }
};

console.log('Test checkout helper loaded. Use window.testCheckout');
  