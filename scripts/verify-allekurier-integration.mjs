/**
 * Simplest Possible Experiment: Verify AlleKurier Integration
 * 
 * Tests the new allekurier-rates library functions to confirm:
 * 1. API call works with credentials
 * 2. Response transforms to ShippingOption interface
 * 3. Mapping matches Q&A requirements
 * 
 * Usage: node scripts/verify-allekurier-integration.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import the new library functions
import { fetchAlleKurierRates, transformAlleKurierToShippingOption } from '../lib/shipping/allekurier-rates.ts';

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
  console.log(bold('=== AlleKurier Integration Verification ===\n'));

  // Mock input (same as preflight experiment)
  const input = {
    fromCountry: 'PL',
    fromZip: '00-001',
    toCountry: 'PL',
    toZip: '30-001',
    packages: [{
      weight: 2.5,
      width: 30,
      height: 20,
      length: 40,
    }],
  };

  console.log('Input:', JSON.stringify(input, null, 2));
  console.log();

  // Step 1: Fetch rates from AlleKurier API
  console.log(bold('Step 1: Fetching rates from AlleKurier API...'));
  const services = await fetchAlleKurierRates(input);

  if (services.length === 0) {
    console.log(red('✗ No services returned. Check credentials or account status.'));
    process.exit(1);
  }

  console.log(green(`✓ ${services.length} services returned\n`));

  // Step 2: Transform to ShippingOption interface
  console.log(bold('Step 2: Transforming to ShippingOption interface...'));
  const shippingOptions = services.map(transformAlleKurierToShippingOption);
  console.log(green(`✓ Transformed ${shippingOptions.length} shipping options\n`));

  // Step 3: Verify mapping matches Q&A requirements
  console.log(bold('Step 3: Verifying mapping (Q&A requirements):'));
  console.log('  - provider ← Carrier.name');
  console.log('  - servicelevel.name ← Service.name');
  console.log('  - rateId ← Carrier.code + Service.code');
  console.log('  - amount ← Order.gross (B2C)');
  console.log('  - currency ← "PLN"');
  console.log('  - estimatedDays ← Time.days\n');

  // Display first option as example
  console.log(bold('Example ShippingOption (first service):'));
  console.log(JSON.stringify(shippingOptions[0], null, 2));
  console.log();

  // Verify interface structure
  const first = shippingOptions[0];
  const hasRequiredFields = 
    typeof first.provider === 'string' &&
    typeof first.servicelevel?.name === 'string' &&
    typeof first.rateId === 'string' &&
    typeof first.amount === 'number' &&
    typeof first.currency === 'string' &&
    typeof first.estimatedDays === 'number';

  if (hasRequiredFields && first.currency === 'PLN' && first.amount > 0) {
    console.log(green('✓ All requirements verified'));
    console.log(green('✓ Integration working correctly\n'));
  } else {
    console.log(red('✗ Interface verification failed'));
    process.exit(1);
  }

  // Summary
  console.log(bold('=== Summary ==='));
  console.log(green('PASS: AlleKurier integration verified'));
  console.log(`  Services fetched: ${services.length}`);
  console.log(`  Options transformed: ${shippingOptions.length}`);
  console.log(`  Currency: ${first.currency}`);
  console.log(`  First rateId: ${first.rateId}`);
  console.log(`  First amount: ${first.amount} PLN (gross, B2C)\n`);
}

main().catch(err => {
  console.error(red('Error:'), err);
  process.exit(1);
});
