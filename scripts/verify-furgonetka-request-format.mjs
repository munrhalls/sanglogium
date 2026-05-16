#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - User-Runnable Verification Script
 * Run this script to verify the Furgonetka API request format works correctly.
 *
 * Usage:
 *   node scripts/verify-furgonetka-request-format.mjs
 *
 * This script tests the POST /packages endpoint with a valid request format
 * and displays the pricing response. It demonstrates that:
 * - Request format is correct
 * - Pricing data is returned
 * - delivery_time field is null (API limitation)
 */

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const credentials = {
  client_id: 'sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7',
  client_secret: 'bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7',
  username: 'antarcticdepths71@gmail.com',
  password: 'Furgonetkaguars77@',
};

async function getAccessToken() {
  const basicAuth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'password',
    scope: 'api',
    username: credentials.username,
    password: credentials.password,
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

async function verifyRequestFormat() {
  console.log('Furgonetka Sandbox API - Request Format Verification');
  console.log('====================================================\n');

  try {
    console.log('Step 1: Authenticating...');
    const token = await getAccessToken();
    console.log('✓ Authentication successful\n');

    console.log('Step 2: Testing POST /packages endpoint...\n');

    const requestBody = {
      type: 'package',
      service_id: 11597700, // InPost
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
      pickup: {
        type: 'sender',
        name: 'Test Sender',
        company: 'Test Company',
        email: 'test@example.com',
        street: 'Marszałkowska 1',
        postcode: '00-533',
        city: 'Warszawa',
        phone: '600123456',
      },
      sender: {
        postcode: '00-533',
        city: 'Warszawa',
        country: 'PL',
        name: 'Test Sender',
        company: 'Test Company',
        phone: '600123456',
        email: 'test@example.com',
        street: 'Marszałkowska 1',
      },
      receiver: {
        postcode: '00-001',
        city: 'Warszawa',
        country: 'PL',
        name: 'Test Receiver',
        company: 'Test Company',
        phone: '600123456',
        email: 'test@example.com',
        street: 'Nowy Świat 1',
      },
    };

    console.log('Request body:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('\nSending request...\n');

    const res = await fetch(`${BASE_URL}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.furgonetka.v1+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Status: ${res.status} ${res.statusText}\n`);

    if (res.ok) {
      const data = await res.json();
      console.log('✓ Request accepted successfully\n');
      console.log('Key Response Data:');
      console.log('  Service:', data.service);
      console.log('  Price Gross:', data.pricing.price_gross, 'PLN');
      console.log('  Price Net:', data.pricing.price_net, 'PLN');
      console.log('  Tax Rate:', data.pricing.tax, '%');
      console.log('  Delivery Time:', data.delivery_time || 'null (not provided by API)');
      console.log('  State:', data.state);
      console.log('  Package ID:', data.package_id);
      console.log('\n⚠ IMPORTANT: delivery_time field is null for all requests.');
      console.log('  The API does not provide delivery time estimates.');
      console.log('  This is a known limitation of the Furgonetka API.');
    } else {
      const text = await res.text();
      console.log('✗ Request rejected');
      console.log('Response:', text);
      process.exit(1);
    }

  } catch (err) {
    console.error('\n✗ Error:', err.message);
    process.exit(1);
  }
}

verifyRequestFormat();
