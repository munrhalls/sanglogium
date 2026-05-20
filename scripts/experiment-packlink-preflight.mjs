/**
 * Packlink Pro API Preflight Experiment
 * 
 * Self-contained script to verify the Packlink Pro API endpoint for retrieving
 * carrier shipping rates for Germany. Uses mock parcel/address data. Preflight only -
 * no production integration or persistence.
 * 
 * Endpoint: GET https://api.packlink.com/v1/services
 * 
 * Usage: node scripts/experiment-packlink-preflight.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const ENDPOINT = 'https://api.packlink.com/v1/services';
const TIMEOUT_MS = 15000;

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK = {
  fromCountry: 'DE',
  fromZip: '80333',
  toCountry: 'DE',
  toZip: '10115',
  packages: [
    { width: 15, height: 15, length: 15, weight: 1.5 },
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
  console.log(bold('=== Packlink Pro API Preflight Experiment ===\n'));

  // 1. Credential check
  const apiKey = process.env.PACKLINK_PRO_API;

  if (!apiKey) {
    console.log(red('BLOCKED: PACKLINK_PRO_API not set in .env'));
    console.log('Add to .env:');
    console.log('  PACKLINK_PRO_API=your-api-key');
    process.exit(1);
  }

  console.log(`${green('✓')} API key found: ${apiKey.substring(0, 20)}...\n`);

  // 2. Build request
  console.log(bold('── Request ──'));
  console.log(`Endpoint:  GET ${ENDPOINT}`);
  console.log(`Package:   ${MOCK.packages[0].weight}kg, ${MOCK.packages[0].width}x${MOCK.packages[0].height}x${MOCK.packages[0].length}cm`);
  console.log(`Route:     ${MOCK.fromCountry} ${MOCK.fromZip} → ${MOCK.toCountry} ${MOCK.toZip}\n`);

  const params = new URLSearchParams();
  params.set('from[country]', MOCK.fromCountry);
  params.set('from[zip]', MOCK.fromZip);
  params.set('to[country]', MOCK.toCountry);
  params.set('to[zip]', MOCK.toZip);

  MOCK.packages.forEach((pkg, i) => {
    params.set(`packages[${i}][width]`, String(pkg.width));
    params.set(`packages[${i}][height]`, String(pkg.height));
    params.set(`packages[${i}][length]`, String(pkg.length));
    params.set(`packages[${i}][weight]`, String(pkg.weight));
  });

  const url = `${ENDPOINT}?${params.toString()}`;

  // 3. Execute
  console.log(bold('── Executing ──'));
  console.log('Sending request...\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
      },
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

  if (!Array.isArray(data)) {
    console.log(yellow('WARNING: Unexpected response structure - expected array'));
    console.log('Raw response:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const services = data;

  if (services.length === 0) {
    console.log(yellow('API returned 0 services. Possible causes:'));
    console.log('  - No carriers available for this route/package');
    console.log('  - Invalid API key or permissions');
    console.log('\nRaw response:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(green(`✓ Valid response: ${services.length} carrier service(s) returned\n`));

  // 6. Display results
  console.log(bold('── Carrier Services ──'));

  services.forEach((svc, i) => {
    console.log(bold(`${i + 1}. ${svc.carrier_name || 'Unknown'}`));
    console.log(`   Service:  ${svc.name || 'Unknown'}`);
    console.log(`   Price:    ${svc.price?.total_price || '?'} ${svc.price?.currency || '?'}`);
    console.log(`   Transit:  ${svc.transit_hours || '?'} hours`);
    console.log(`   Delivery: ${svc.first_estimated_delivery_date || '?'}`);
    console.log();
  });

  // 7. Summary
  console.log(bold('── Preflight Result ──'));
  console.log(green('PASS: Packlink Pro API endpoint confirmed working'));
  console.log(`  Endpoint:  ${ENDPOINT}`);
  console.log(`  Services:  ${services.length}`);
  console.log(`  First price: ${services[0]?.price?.total_price || '?'} ${services[0]?.price?.currency || '?'}\n`);

  console.log('Response structure (first item):');
  console.log(JSON.stringify(services[0], null, 2));

  process.exit(0);
}

main();
