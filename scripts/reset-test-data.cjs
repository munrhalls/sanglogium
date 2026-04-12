// Reset test data to initial state
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: 'sk9MazGurfGA1SpQR3AHdVjvLrcLdXsABSRC6EV40GFWOCBBnTVNLCAXD9Fsb5ZpWKw4k3AkwmiAwTZKFA045XfwL8l3cFApA4DcP6ZfADpLxge5NJe3Cfhcub3gh7h9gXrEYNcai1GILSgAkUjHLFWYuc9NEyNUMQmQFofNqjkbICwNuzi3'
});

const TEST_PRODUCTS_INITIAL_STOCK = {
  "YcMKSEyusPBTcaoe1xiP1b": 5, // Test Product Alpha
  "MHd9dKrYZDArdj3morESVD": 2, // Test Product Beta
  "MHd9dKrYZDArdj3morESpg": 0, // Test Product Gamma
  "test-item-1": 10,
  "test-item-2": 10,
  "xy5bTvgp07gZolKtE1FaJ3": 10,
  "xy5bTvgp07gZolKtE1FaVM": 5
};

async function resetTestData() {
  try {
    console.log('Resetting test product stock to initial values...');
    
    for (const [productId, stock] of Object.entries(TEST_PRODUCTS_INITIAL_STOCK)) {
      await client.patch(productId).set({ stock }).commit();
      console.log(`Reset ${productId} stock to ${stock}`);
    }
    
    console.log('Test data reset complete.');
  } catch (error) {
    console.error('Error resetting test data:', error.message);
    process.exit(1);
  }
}

resetTestData();
