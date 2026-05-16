#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - Get Carrier List
 * Test to understand API structure and available endpoints.
 *
 * Prerequisites:
 *   FURGONETKA_SANDBOX_CLIENT_ID and FURGONETKA_SANDBOX_CLIENT_SECRET in .env
 *
 * Run:
 *   node scripts/test-furgonetka-carriers.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const clientId = process.env.FURGONETKA_SANDBOX_CLIENT_ID;
const clientSecret = process.env.FURGONETKA_SANDBOX_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Missing required environment variables:');
  console.error('  FURGONETKA_SANDBOX_CLIENT_ID');
  console.error('  FURGONETKA_SANDBOX_CLIENT_SECRET');
  process.exit(1);
}

async function getAccessToken() {
  // Furgonetka OAuth uses Basic Auth with clientId:clientSecret
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'api',
  });

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function main() {
  console.log('Furgonetka Sandbox API - Test Carrier List');
  console.log('==========================================\n');

  try {
    const token = await getAccessToken();
    console.log('[OK] Access token acquired\n');

    // Try to get carrier list - based on PHP client patterns
    const endpoints = [
      '/account/services',  // From PHP client AccountRequest
      '/configuration/allowed-countries',  // From PHP client ConfigurationRequest
      '/configuration/services-statements',  // From PHP client ConfigurationRequest
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: GET ${endpoint}`);
      try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`  Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`  [SUCCESS] Data received`);
          console.log(`  Response structure:`, JSON.stringify(data, null, 2).substring(0, 500));
          console.log();
          process.exit(0);
        } else {
          const text = await res.text();
          console.log(`  Response: ${text.substring(0, 200)}\n`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}\n`);
      }
    }

    console.log('[INFO] GET endpoints returning JSON decode error. Trying POST with empty body...\n');

    // Try POST with empty body for configuration endpoints
    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: POST ${endpoint} (empty body)`);
      try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        console.log(`  Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`  [SUCCESS] Data received`);
          console.log(`  Response structure:`, JSON.stringify(data, null, 2).substring(0, 500));
          console.log();
          process.exit(0);
        } else {
          const text = await res.text();
          console.log(`  Response: ${text.substring(0, 200)}\n`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}\n`);
      }
    }

    console.log('[INFO] Configuration endpoints failed. Trying price calculation patterns...\n');

    // Try price calculation endpoints based on common patterns
    const priceEndpoints = [
      { method: 'POST', path: '/price/calculate', body: { sender: { postcode: '00-533', city: 'Warszawa', country: 'PL' }, receiver: { postcode: '00-001', city: 'Warszawa', country: 'PL' }, package: { weight: 1.5, length: 15, width: 15, height: 15 } } },
      { method: 'POST', path: '/pricing/calculate', body: { sender: { postcode: '00-533' }, receiver: { postcode: '00-001' }, package: { weight: 1.5 } } },
      { method: 'POST', path: '/order/pricing', body: { sender: { postcode: '00-533' }, receiver: { postcode: '00-001' }, package: { weight: 1.5 } } },
    ];

    for (const { method, path, body } of priceEndpoints) {
      console.log(`Testing endpoint: ${method} ${path}`);
      try {
        const res = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        console.log(`  Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`  [SUCCESS] Data received`);
          console.log(`  Response structure:`, JSON.stringify(data, null, 2).substring(0, 500));
          console.log();
          process.exit(0);
        } else {
          const text = await res.text();
          console.log(`  Response: ${text.substring(0, 200)}\n`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}\n`);
      }
    }

    console.log('[INFO] Could not find working endpoint. Manual documentation review needed.');

  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
