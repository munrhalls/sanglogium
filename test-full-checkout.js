// Test script for full checkout flow verification
// Run this in browser console on http://localhost:3000

// Step 1: Add test items to basket
console.log('=== Testing Checkout Flow ===');

// Get the basket store from window (if exposed)
if (window.useBasketStore) {
  const testItem = {
    _id: 'test-product-123',
    name: 'Test Headphones',
    displayPrice: 1299,
    stock: 10,
    quantity: 1,
    image: '/test-headphones.jpg',
    slug: 'test-headphones',
    stripePriceId: 'price_1O9K7z2eZvKYlo2C8s9qX2Y9'
  };
  
  console.log('Adding test item to basket...');
  window.useBasketStore.getState().addItem(testItem);
  console.log('Item added. Navigate to /basket to test checkout.');
} else {
  console.log('Basket store not exposed. Please add items manually through UI.');
}

// Step 2: Navigate to basket
console.log('Navigate to http://localhost:3000/basket to test checkout flow');
console.log('Expected flow:');
console.log('1. Basket page loads with items');
console.log('2. Click Checkout button');
console.log('3. Navigate to /checkout/address?sessionId=X&idempotencyKey=X');
console.log('4. Address form loads (no redirect back to basket)');
console.log('5. Fill address form and submit');
console.log('6. Check console for "reserveStock response: { success: true, ... }"');
console.log('7. Navigate to /checkout/payment?sessionId=X');
