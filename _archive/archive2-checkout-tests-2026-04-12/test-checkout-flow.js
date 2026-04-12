// Test script to add item to basket and test checkout flow
// Run this in browser console on http://localhost:3000

// Add a test item to basket
const testItem = {
  _id: 'test-product-id',
  name: 'Test Product',
  displayPrice: 100,
  stock: 10,
  quantity: 1,
  image: '/test-image.jpg',
  slug: 'test-product',
  stripePriceId: 'price_test123'
};

// Get basket store (if available)
console.log('Adding test item to basket...');
console.log('Test item:', testItem);

// Navigate to basket page
window.location.href = '/basket';
