// CommonJS version to avoid ESM issues
const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: 'sk9MazGurfGA1SpQR3AHdVjvLrcLdXsABSRC6EV40GFWOCBBnTVNLCAXD9Fsb5ZpWKw4k3AkwmiAwTZKFA045XfwL8l3cFApA4DcP6ZfADpLxge5NJe3Cfhcub3gh7h9gXrEYNcai1GILSgAkUjHLFWYuc9NEyNUMQmQFofNqjkbICwNuzi3'
});

async function verifyTestProducts() {
  try {
    console.log('Checking for test products in Sanity CMS...');

    const testProducts = await client.fetch(`
      *[_type == "product" && (name match "test" || name match "Test")] {
        _id,
        name,
        stock,
        stripePriceId,
        slug,
        displayPrice
      } | order(name asc)
    `);

    if (testProducts.length === 0) {
      console.log('\nALERT: No test products found in Sanity CMS!');
      console.log('Please create test products with the following names:');
      console.log('- Test Product Alpha (stock: 5)');
      console.log('- Test Product Beta (stock: 2)');
      console.log('- Test Product Gamma (stock: 0)');
      console.log('\nEach test product needs:');
      console.log('- stripePriceId (required for checkout)');
      console.log('- displayPrice (required for basket)');
      console.log('- stock field (for reservation testing)');
      process.exit(1);
    }

    console.log(`\nFound ${testProducts.length} test product(s):`);
    testProducts.forEach(product => {
      console.log(`- ${product.name} (${product._id})`);
      console.log(`  Stock: ${product.stock}`);
      console.log(`  Stripe Price ID: ${product.stripePriceId || 'MISSING'}`);
      console.log(`  Display Price: ${product.displayPrice || 'MISSING'}`);
      console.log('');
    });

    // Check if products have required fields
    const missingFields = [];
    testProducts.forEach(product => {
      if (!product.stripePriceId) missingFields.push(`${product.name}: stripePriceId`);
      if (!product.displayPrice) missingFields.push(`${product.name}: displayPrice`);
    });

    if (missingFields.length > 0) {
      console.log('ALERT: Some test products are missing required fields:');
      missingFields.forEach(field => console.log(`  - ${field}`));
      process.exit(1);
    }

    console.log('All test products have required fields.');

    // Output JSON for use in tests
    console.log('\nTest products JSON for tests:');
    console.log(JSON.stringify(testProducts, null, 2));

  } catch (error) {
    console.error('Error verifying test products:', error.message);
    process.exit(1);
  }
}

verifyTestProducts();
