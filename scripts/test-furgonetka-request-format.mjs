#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - Request Format Verification
 * Systematically test POST /packages request format by incrementally adding fields
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
  console.log(`Auth: password grant (expires in ${data.expires_in}s)\n`);
  return data.access_token;
}

async function testRequestFormat(token, requestBody, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${description}`);
  console.log('='.repeat(60));
  console.log('\nRequest body:');
  console.log(JSON.stringify(requestBody, null, 2));

  const res = await fetch(`${BASE_URL}/packages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.furgonetka.v1+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`\nStatus: ${res.status} ${res.statusText}`);

  if (res.ok) {
    const data = await res.json();
    console.log('\n[SUCCESS] Request accepted!');
    console.log('\nResponse:');
    console.log(JSON.stringify(data, null, 2));
    return { success: true, data };
  } else {
    const text = await res.text();
    console.log('\n[ERROR] Request rejected');
    console.log('\nResponse body:');
    console.log(text);
    return { success: false, error: text };
  }
}

async function main() {
  console.log('Furgonetka Sandbox API - Request Format Verification');
  console.log('====================================================\n');

  try {
    const token = await getAccessToken();

    // Test 1: Minimal package parameters with parcels array
    console.log('\n--- TEST 1: Minimal package parameters ---');
    await testRequestFormat(token, {
      type: 'package',
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
    }, 'Minimal package parameters (parcels array, no service_id, no addresses)');

    // Test 2: Add service_id
    console.log('\n--- TEST 2: Add service_id ---');
    await testRequestFormat(token, {
      type: 'package',
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
      service_id: 11597700, // InPost
    }, 'Add service_id (InPost)');

    // Test 3: Add pickup with Polish mobile format (9 digits, no prefix)
    console.log('\n--- TEST 3: Add pickup with Polish mobile format ---');
    await testRequestFormat(token, {
      type: 'package',
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
      service_id: 11597700,
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
    }, 'Add pickup with Polish mobile format (600123456)');

    // Test 4: Add sender with Polish mobile format
    console.log('\n--- TEST 4: Add sender with Polish mobile format ---');
    await testRequestFormat(token, {
      type: 'package',
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
      service_id: 11597700,
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
    }, 'Add sender with Polish mobile format');

    // Test 5: Add receiver with Polish mobile format
    console.log('\n--- TEST 5: Add receiver with Polish mobile format ---');
    await testRequestFormat(token, {
      type: 'package',
      parcels: [{
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
      }],
      service_id: 11597700,
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
    }, 'Add receiver with Polish mobile format');

  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
