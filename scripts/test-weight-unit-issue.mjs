/**
 * Test: Weight Unit Issue
 * 
 * Hypothesis: AlleKurier API expects weight in kg, but we're sending grams
 * from Sanity parcel data (500g = 0.5kg, but we send "500" which = 500kg)
 * 
 * This causes "no_parcel_services_because_restrictions" error
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const ENDPOINT = 'https://allekurier.pl/api_v1/service_list';

function bold(text) {
  return `\x1b[1m${text}\x1b[0m`;
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function red(text) {
  return `\x1b[31m${text}\x1b[0m`;
}

async function testWeight(weight, label) {
  const email = process.env.ALLEKURIER_EMAIL;
  const password = process.env.ALLEKURIER_PASSWORD;

  const params = new URLSearchParams();
  params.set('User[email]', email);
  params.set('User[password]', password);
  params.set('Order[package]', 'parcel');
  params.set('Order[cod]', '0');
  params.set('Order[insurance]', '0');
  params.set('Sender[country]', 'PL');
  params.set('Sender[postal_code]', '00-001');
  params.set('Recipient[country]', 'PL');
  params.set('Recipient[postal_code]', '30-001');
  params.set('Packages[0][weight]', String(weight));
  params.set('Packages[0][width]', '10');
  params.set('Packages[0][height]', '5');
  params.set('Packages[0][length]', '10');
  params.set('Packages[0][custom]', '0');

  console.log(bold(`Testing: ${label}`));
  console.log(`  Weight: ${weight} (sent as "${weight}")`);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const rawBody = await res.text();
    const data = JSON.parse(rawBody);

    if (data.Error && Array.isArray(data.Error) && data.Error.length > 0) {
      console.log(red(`  ✗ ERROR: ${data.Error.join(', ')}`));
    } else if (data.Response && Array.isArray(data.Response)) {
      console.log(green(`  ✓ SUCCESS: ${data.Response.length} services`));
    } else {
      console.log(red(`  ✗ UNEXPECTED RESPONSE`));
    }
  } catch (err) {
    console.log(red(`  ✗ NETWORK ERROR: ${err.message}`));
  }
  console.log();
}

async function main() {
  console.log(bold('=== Weight Unit Issue Test ===\n'));

  // Test 1: Current production code (500 grams sent as "500")
  await testWeight(500, 'Production (500g sent as "500" = 500kg)');

  // Test 2: Correct conversion (0.5 kg)
  await testWeight(0.5, 'Correct (500g converted to 0.5kg)');

  // Test 3: Working preflight value (2.5 kg)
  await testWeight(2.5, 'Preflight (2.5kg - known working)');

  console.log(bold('=== Conclusion ==='));
  console.log('If Test 1 fails but Test 2 succeeds, the issue is weight unit conversion.');
}

main();
