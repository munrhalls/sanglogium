
// Auto-generated browser script for scenario: test-happyPath-1775540822382
// Generated at: 2026-04-07T05:47:05.075Z

window.scenarioProducts = [
  {
    "_createdAt": "2026-04-07T05:47:03Z",
    "_id": "test-happyPath-1775540822382-vKtps",
    "_rev": "xy5bTvgp07gZolKtE0q0l7",
    "_type": "product",
    "_updatedAt": "2026-04-07T05:47:03Z",
    "catalogueLocationKeys": [
      "yq3p9s798zszjkzm5btnebjh"
    ],
    "displayPrice": 100,
    "images": [],
    "name": "Test Product A - Happy Path",
    "scenarioId": "test-happyPath-1775540822382",
    "slug": {
      "_type": "slug",
      "current": "test-product-a-happy"
    },
    "status": "active",
    "stock": 10
  },
  {
    "_createdAt": "2026-04-07T05:47:05Z",
    "_id": "test-happyPath-1775540822382-dsRqb",
    "_rev": "zI6Y7r4MbyZUfGLNfJh3vC",
    "_type": "product",
    "_updatedAt": "2026-04-07T05:47:05Z",
    "catalogueLocationKeys": [
      "yq3p9s798zszjkzm5btnebjh"
    ],
    "displayPrice": 50,
    "images": [],
    "name": "Test Product B - Happy Path",
    "scenarioId": "test-happyPath-1775540822382",
    "slug": {
      "_type": "slug",
      "current": "test-product-b-happy"
    },
    "status": "active",
    "stock": 5
  }
];

window.scenarioHelpers = {
  // Directly add products to basket state
  addProductsToBasket: () => {
    console.log('Adding products to basket...');

    // Check if we're on the basket page
    if (!window.location.pathname.includes('/basket')) {
      console.log('Please navigate to /basket first');
      return;
    }

    // Create mock basket data that the UI can use
    const mockBasketItems = [
      {
        ...window.scenarioProducts[0],
        quantity: 2
      },
      {
        ...window.scenarioProducts[1],
        quantity: 1
      }
    ];

    // Store in window for debugging
    window.mockBasketItems = mockBasketItems;

    console.log('Mock basket items created:', mockBasketItems);
    console.log('Total: $' + (mockBasketItems[0].displayPrice * 2 + mockBasketItems[1].displayPrice));
    console.log('Ready to test checkout!');

    // Try to update the UI if possible
    // This depends on your basket implementation
    if (window.updateBasketUI) {
      window.updateBasketUI(mockBasketItems);
    }
  },

  // Setup mock for happy path
  setupMock: () => {
    console.log('Setting up happy path mock...');

    // Mock the validateBasket function
    window.mockValidateBasket = async (payload, idempotencyKey) => {
      console.log('MOCK validateBasket called:', {
        items: payload.items.length,
        total: payload.total,
        idempotencyKey
      });

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        outcome: "PASS",
        stripeUrl: "https://checkout.stripe.com/pay/test-success"
      };
    };

    console.log('Mock configured!');
  },

  // Show scenario info
  showInfo: () => {
    console.log('=== Happy Path Scenario ===');
    console.log('Scenario ID: test-happyPath-1775540822382');
    console.log('Products:', window.scenarioProducts.map(p => p.name));
    console.log('Expected flow: IDLE -> PROCESSING -> SUCCESS');
    console.log('Expected total: $250');
  }
};

console.log('Scenario helpers loaded. Commands:');
console.log('  scenarioHelpers.showInfo() - Show scenario info');
console.log('  scenarioHelpers.addProductsToBasket() - Add products to basket');
console.log('  scenarioHelpers.setupMock() - Setup happy path mock');

// Auto-setup
scenarioHelpers.showInfo();
scenarioHelpers.setupMock();
