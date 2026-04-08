// Mock Basket Store for Manual Testing
// This provides test products that work with the manual test scenarios

// Test products data
const mockProducts = [
  {
    _id: 'test-product-a',
    name: 'Test Product A',
    displayPrice: 100,
    stock: 10,
    slug: 'test-product-a',
    image: '/images/test-product-a.jpg'
  },
  {
    _id: 'test-product-b',
    name: 'Test Product B',
    displayPrice: 50,
    stock: 5,
    slug: 'test-product-b',
    image: '/images/test-product-b.jpg'
  },
  {
    _id: 'test-product-c',
    name: 'Test Product C',
    displayPrice: 75,
    stock: 0,
    slug: 'test-product-c',
    image: '/images/test-product-c.jpg'
  }
];

// Mock basket store
window.mockBasketStore = {
  items: [],
  
  addItem(productId, quantity = 1) {
    const product = mockProducts.find(p => p._id === productId);
    if (!product) return;
    
    const existingItem = this.items.find(item => item._id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity
      });
    }
    
    console.log(`Added ${quantity}x ${product.name} to basket`);
    this.logState();
  },
  
  removeItem(productId) {
    const index = this.items.findIndex(item => item._id === productId);
    if (index > -1) {
      const item = this.items[index];
      this.items.splice(index, 1);
      console.log(`Removed ${item.name} from basket`);
      this.logState();
    }
  },
  
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item._id === productId);
    if (item) {
      item.quantity = quantity;
      console.log(`Updated ${item.name} quantity to ${quantity}`);
      this.logState();
    }
  },
  
  getTotal() {
    return this.items.reduce((total, item) => total + (item.displayPrice * item.quantity), 0);
  },
  
  logState() {
    console.log('Basket State:', {
      items: this.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.displayPrice
      })),
      total: this.getTotal()
    });
  },
  
  clear() {
    this.items = [];
    console.log('Basket cleared');
  }
};

// Helper functions for manual testing
window.testHelpers = {
  addProductA: (qty = 1) => window.mockBasketStore.addItem('test-product-a', qty),
  addProductB: (qty = 1) => window.mockBasketStore.addItem('test-product-b', qty),
  addProductC: (qty = 1) => window.mockBasketStore.addItem('test-product-c', qty),
  clearBasket: () => window.mockBasketStore.clear(),
  showBasket: () => window.mockBasketStore.logState(),
  
  // Quick scenario setup
  setupHappyPath: () => {
    window.mockBasketStore.clear();
    window.mockBasketStore.addItem('test-product-a', 2);
    window.mockBasketStore.addItem('test-product-b', 1);
    console.log('Happy Path setup: 2x Product A, 1x Product B (Total: $250)');
  },
  
  setupPriceMismatch: () => {
    window.mockBasketStore.clear();
    window.mockBasketStore.addItem('test-product-a', 1);
    console.log('Price Mismatch setup: 1x Product A at $100 (server has $120)');
  },
  
  setupInventoryShortage: () => {
    window.mockBasketStore.clear();
    window.mockBasketStore.addItem('test-product-b', 3);
    console.log('Inventory Shortage setup: 3x Product B (server has 2)');
  },
  
  setupOutOfStock: () => {
    window.mockBasketStore.clear();
    window.mockBasketStore.addItem('test-product-c', 1);
    console.log('Out of Stock setup: 1x Product C (server has 0)');
  }
};

console.log('Mock basket store loaded. Available commands:');
console.log('  testHelpers.addProductA(qty)');
console.log('  testHelpers.addProductB(qty)');
console.log('  testHelpers.addProductC(qty)');
console.log('  testHelpers.clearBasket()');
console.log('  testHelpers.showBasket()');
console.log('  testHelpers.setupHappyPath()');
console.log('  testHelpers.setupPriceMismatch()');
console.log('  testHelpers.setupInventoryShortage()');
console.log('  testHelpers.setupOutOfStock()');
