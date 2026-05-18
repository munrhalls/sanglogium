/**
 * AlleKurier API Preflight Experiment
 * 
 * Self-contained script to verify the AlleKurier API endpoint for retrieving
 * carrier shipping rates. Uses mock parcel/address data. Preflight only -
 * no production integration or persistence.
 * 
 * Endpoint verified from PHP client library source (GetServicesAction.php):
 *   POST https://allekurier.pl/api_v1/service_list
 * 
 * Usage: node scripts/experiment-allekurier-preflight.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const ENDPOINT = 'https://allekurier.pl/api_v1/service_list';
const TIMEOUT_MS = 15000;

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK = {
  packageType: 'parcel',
  codAmount: 0,
  insuranceAmount: 0,
  senderCountry: 'PL',
  senderPostalCode: '00-001',
  recipientCountry: 'PL',
  recipientPostalCode: '30-001',
  packages: [
    { weight: 2.5, width: 30, height: 20, length: 40, custom: false },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function bold(text) {
  return `\x1b[1m${text}\x1b[0m`;
}

function green(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function red(text) {
  return `\x1b[31m${text}\x1b[0m`;
}

function yellow(text) {
  return `\x1b[33m${text}\x1b[0m`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(bold('=== AlleKurier API Preflight Experiment ===\n'));

  // 1. Credential check
  const email = process.env.ALLEKURIER_EMAIL;
  const password = process.env.ALLEKURIER_PASSWORD;

  if (!email || !password) {
    console.log(red('BLOCKED: ALLEKURIER_EMAIL or ALLEKURIER_PASSWORD not set in .env'));
    console.log('Add to .env:');
    console.log('  ALLEKURIER_EMAIL=your-email');
    console.log('  ALLEKURIER_PASSWORD=your-password');
    process.exit(1);
  }

  console.log(`${green('✓')} Credentials found: ${email}\n`);

  // 2. Build request
  console.log(bold('── Request ──'));
  console.log(`Endpoint:  POST ${ENDPOINT}`);
  console.log(`Package:   ${MOCK.packages[0].weight}kg, ${MOCK.packages[0].width}x${MOCK.packages[0].height}x${MOCK.packages[0].length}cm`);
  console.log(`Route:     ${MOCK.senderCountry} ${MOCK.senderPostalCode} → ${MOCK.recipientCountry} ${MOCK.recipientPostalCode}\n`);

  const params = new URLSearchParams();
  params.set('User[email]', email);
  params.set('User[password]', password);
  params.set('Order[package]', MOCK.packageType);
  params.set('Order[cod]', String(MOCK.codAmount));
  params.set('Order[insurance]', String(MOCK.insuranceAmount));
  params.set('Sender[country]', MOCK.senderCountry);
  params.set('Sender[postal_code]', MOCK.senderPostalCode);
  params.set('Recipient[country]', MOCK.recipientCountry);
  params.set('Recipient[postal_code]', MOCK.recipientPostalCode);

  MOCK.packages.forEach((pkg, i) => {
    params.set(`Packages[${i}][weight]`, String(pkg.weight));
    params.set(`Packages[${i}][width]`, String(pkg.width));
    params.set(`Packages[${i}][height]`, String(pkg.height));
    params.set(`Packages[${i}][length]`, String(pkg.length));
    params.set(`Packages[${i}][custom]`, pkg.custom ? '1' : '0');
  });

  // 3. Execute
  console.log(bold('── Executing ──'));
  console.log('Sending request...\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      body: params,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    console.log(red(`NETWORK ERROR: ${err.message}`));
    if (err.name === 'AbortError') {
      console.log(yellow(`Request timed out after ${TIMEOUT_MS / 1000}s`));
    }
    process.exit(1);
  }

  clearTimeout(timer);

  // 4. Response
  console.log(bold('── Response ──'));
  console.log(`HTTP Status: ${res.status} ${res.statusText}\n`);

  const rawBody = await res.text();
  let data;

  try {
    data = JSON.parse(rawBody);
  } catch {
    console.log(red('Response is not valid JSON:'));
    console.log(rawBody.substring(0, 500));
    process.exit(1);
  }

  if (!res.ok) {
    console.log(red(`HTTP ${res.status} - API rejected the request`));
    console.log('Raw response:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  // 5. Validate response structure
  console.log(bold('── Structure Validation ──'));

  if (data.Error && Array.isArray(data.Error) && data.Error.length > 0) {
    console.log(red('API returned errors:'));
    data.Error.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }

  if (!data.Response || !Array.isArray(data.Response)) {
    console.log(yellow('WARNING: Unexpected response structure'));
    console.log('Raw response:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const services = data.Response;

  if (services.length === 0) {
    console.log(yellow('API returned 0 services. Possible causes:'));
    console.log('  - Account not marked as test (email it@allekurier.pl)');
    console.log('  - No carriers available for this route/package');
    console.log('\nRaw response:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(green(`✓ Valid response: ${services.length} carrier service(s) returned\n`));

  // 6. Display results
  console.log(bold('── Carrier Services ──'));

  services.forEach((svc, i) => {
    const carrier = svc.Carrier || {};
    const service = svc.Service || {};
    const order = svc.Order || {};

    console.log(bold(`${i + 1}. ${carrier.name || 'Unknown'} (${carrier.code || '?'})`));
    console.log(`   Service:  ${service.name || 'Unknown'} (${service.code || '?'})`);
    console.log(`   Net:      ${order.net || '?'} PLN`);
    console.log(`   Gross:    ${order.gross || '?'} PLN`);
    console.log();
  });

  // 7. Summary
  console.log(bold('── Preflight Result ──'));
  console.log(green('PASS: AlleKurier API endpoint confirmed working'));
  console.log(`  Endpoint:  ${ENDPOINT}`);
  console.log(`  Services:  ${services.length}`);
  console.log(`  First net: ${services[0]?.Order?.net || '?'} PLN\n`);

  console.log('Response structure (first item):');
  console.log(JSON.stringify(services[0], null, 2));

  process.exit(0);
}

main();
