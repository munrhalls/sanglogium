/**
 * Test: Parcel Calculation with Quantity 30
 * 
 * Verifies that the shared parcel calculator correctly handles quantity 30
 * by aggregating weight/volume and splitting into multiple packages if needed.
 */

import { calculatePackages } from '../lib/shipping/parcel-calculator.ts';

function bold(text) {
  return `\x1b[1m${text}\x1b[0m`;
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function red(text) {
  return `\x1b[31m${text}\x1b[0m`;
}

async function main() {
  console.log(bold('=== Parcel Calculation Test: Quantity 30 ===\n'));

  // Mock data: 1 product, quantity 30
  const basketItems = [
    { productId: 'prod-1', quantity: 30 }
  ];

  // Mock product: 500g, 10x5x10cm
  const sanityProducts = [
    {
      _id: 'prod-1',
      parcel: {
        weight: 500, // grams
        length: 10, // cm
        width: 10, // cm
        height: 5, // cm
      }
    }
  ];

  console.log('Input:');
  console.log(`  Basket: 1 item x 30 quantity`);
  console.log(`  Product: 500g, 10x10x5cm\n`);

  // Expected calculations:
  // Total weight: 500g * 30 = 15,000g = 15kg
  // Total volume: 10*10*5 * 30 = 15,000 cm³
  // Max per package: 25kg, 99,000 cm³
  // Expected: 1 package (fits within limits)

  console.log('Expected:');
  console.log(`  Total weight: 15,000g (15kg)`);
  console.log(`  Total volume: 15,000 cm³`);
  console.log(`  Max limits: 25kg, 99,000 cm³`);
  console.log(`  Expected packages: 1\n`);

  try {
    const packages = calculatePackages(basketItems, sanityProducts);

    console.log(bold('Result:'));
    console.log(`  Number of packages: ${packages.length}`);
    packages.forEach((pkg, i) => {
      console.log(`  Package ${i + 1}:`);
      console.log(`    Weight: ${pkg.weight} kg`);
      console.log(`    Dimensions: ${pkg.length}x${pkg.width}x${pkg.height} cm`);
    });

    // Verify
    if (packages.length === 1 && packages[0].weight === 15) {
      console.log(green('\n✓ PASS: Correct calculation'));
    } else {
      console.log(red('\n✗ FAIL: Unexpected result'));
    }
  } catch (err) {
    console.log(red(`\n✗ ERROR: ${err.message}`));
  }
}

main();
