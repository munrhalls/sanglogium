#!/usr/bin/env node
/**
 * Furgonetka Sandbox Price Calculation Test
 * Test the price calculation endpoint with correct v1+json headers.
 *
 * Prerequisites:
 *   FURGONETKA_SANDBOX_CLIENT_ID and FURGONETKA_SANDBOX_CLIENT_SECRET in .env
 *
 * Run:
 *   node scripts/test-furgonetka-price-calculation.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;
const PRICE_CALC_URL = `${BASE_URL}/packages/calculate-price`;

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

async function calculatePrice(token, sender, receiver) {
  const payload = {
    package: {
      pickup: {
        postcode: sender.postcode,
        city: sender.city,
        country_code: sender.country_code,
      },
      receiver: {
        postcode: receiver.postcode,
        city: receiver.city,
        country_code: receiver.country_code,
      },
      parcels: [
        {
          weight: 1.5,
          width: 15,
          depth: 15,
          height: 15,
        },
      ],
    },
    services: {
      service: 'dpd',
    },
  };

  console.log(`\nTesting price calculation:`);
  console.log(`  Sender: ${sender.city} ${sender.postcode}`);
  console.log(`  Receiver: ${receiver.city} ${receiver.postcode}`);
  console.log(`  Package: 15x15x15 cm, 1.5 kg`);
  console.log(`  Service: dpd\n`);

  const res = await fetch(PRICE_CALC_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.furgonetka.v1+json',
      'Accept': 'application/vnd.furgonetka.v1+json',
    },
    body: JSON.stringify(payload),
  });

  console.log(`Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const text = await res.text();
    console.error(`Response body: ${text}`);
    return null;
  }

  const data = await res.json();
  console.log(`Response data:`, JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  console.log('Furgonetka Sandbox Price Calculation Test');
  console.log('=========================================\n');

  try {
    const token = await getAccessToken();
    console.log('[OK] Access token acquired\n');

    // Test with sender: Warsaw 00-533
    const sender = {
      postcode: '00-533',
      city: 'Warszawa',
      country_code: 'PL',
    };

    // Test receivers at different distances
    const receivers = [
      { postcode: '00-001', city: 'Warszawa', country_code: 'PL' },  // Close
      { postcode: '01-001', city: 'Warszawa', country_code: 'PL' },  // Medium
      { postcode: '30-001', city: 'Kraków', country_code: 'PL' },   // Far
    ];

    const results = [];

    for (const receiver of receivers) {
      const result = await calculatePrice(token, sender, receiver);
      if (result) {
        results.push({ receiver, result });
      }
      console.log('\n' + '='.repeat(50) + '\n');
    }

    console.log('\n[SUMMARY]');
    console.log(`Successful calculations: ${results.length}/${receivers.length}`);

    if (results.length > 0) {
      console.log('\nResults:');
      results.forEach(({ receiver, result }) => {
        console.log(`  ${receiver.city} ${receiver.postcode}:`, JSON.stringify(result, null, 2).substring(0, 200));
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
