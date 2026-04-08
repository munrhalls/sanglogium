// Add test products to UI basket
// This adds products that can be seen in the actual basket UI

// Quick setup functions
window.uiTestHelpers = {
  // Navigate to a product category page
  goToHeadphones: () => {
    window.location.href = '/products/headphones/closed-back';
  },

  goToElectronics: () => {
    window.location.href = '/products/audio-electronics/desktop-amps';
  },

  goToAccessories: () => {
    window.location.href = '/products/accessories/headphone-cables';
  },

  // Setup happy path - guide user through the process
  setupHappyPath: () => {
    console.log('Happy Path Setup Guide:');
    console.log('1. Navigate to a product category:');
    console.log('   - uiTestHelpers.goToHeadphones()');
    console.log('   - uiTestHelpers.goToElectronics()');
    console.log('   - uiTestHelpers.goToAccessories()');
    console.log('2. Add 2-3 products to basket using the UI');
    console.log('3. Go to /basket');
    console.log('4. Click checkout button');
    console.log('5. Mock will handle the validation response');

    // Auto-navigate to headphones
    window.uiTestHelpers.goToHeadphones();
  },

  // Quick navigation
  quickSetup: () => {
    console.log('Quick Setup - Navigating to headphones...');
    window.uiTestHelpers.goToHeadphones();
  }
};

console.log('UI Test Helpers loaded. Available commands:');
console.log('  uiTestHelpers.goToHeadphones() - Go to headphones category');
console.log('  uiTestHelpers.goToElectronics() - Go to electronics category');
console.log('  uiTestHelpers.goToAccessories() - Go to accessories category');
console.log('  uiTestHelpers.setupHappyPath() - Full setup guide');
console.log('  uiTestHelpers.quickSetup() - Quick navigation to products');
