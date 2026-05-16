#!/usr/bin/env node
/**
 * Furgonetka Sandbox OAuth Client Credentials Pre-flight Test
 * Tests OAuth client_credentials authentication (for OAuth app without user account)
 * and verifies token with API ping.
 *
 * Credentials (hardcoded for pre-flight testing):
 *   client_id: sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7
 *   client_secret: bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7
 *
 * Note: Password grant requires a user account (username/password).
 *       This setup uses client_credentials for OAuth app authentication only.
 *
 * Run:
 *   node scripts/test-furgonetka-auth.mjs
 */

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;
const PING_URL = `${BASE_URL}/account/services`;

const credentials = {
  client_id: 'sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7',
  client_secret: 'bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7',
  username: 'antarcticdepths71@gmail.com',
  password: 'Furgonetkaguars77@',
};

console.log('Furgonetka Sandbox OAuth Authentication Pre-flight Test');
console.log('========================================================\n');
console.log('Phase 1: OAuth Password Grant Authentication');
console.log('-------------------------------------------\n');
console.log(`OAuth URL: ${OAUTH_URL}`);
console.log(`Client ID: ${credentials.client_id}`);
console.log(`Username: ${credentials.username}\n`);

let accessToken;
let authMethod = '';

try {
  // Try password grant first (user authentication)
  const basicAuth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'password',
    scope: 'api',
    username: credentials.username,
    password: credentials.password,
  });

  console.log('Requesting access token via password grant...');
  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  console.log(`Response status: ${res.status} ${res.statusText}`);

  if (res.ok) {
    const data = await res.json();
    accessToken = data.access_token;
    authMethod = 'password grant';
    console.log(`\n[PASS] Phase 1: Access token acquired via password grant`);
    console.log(`Token type: ${data.token_type}`);
    console.log(`Expires in: ${data.expires_in} seconds`);
    console.log(`Access token (first 50 chars): ${accessToken.substring(0, 50)}...\n`);
    console.log('[NOTE] Using password grant flow (user authentication).');
    console.log('       User-scoped endpoints should be accessible.\n');
  } else {
    const text = await res.text();
    console.error(`\n[FAIL] Password grant failed`);
    console.error(`Response body: ${text}`);
    console.log('\nFalling back to client_credentials grant...\n');

    // Fallback to client_credentials
    const body2 = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'api',
    });

    console.log('Requesting access token via client_credentials...');
    const res2 = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body2,
    });

    console.log(`Response status: ${res2.status} ${res2.statusText}`);

    if (!res2.ok) {
      const text2 = await res2.text();
      console.error(`\n[FAIL] Client credentials grant also failed`);
      console.error(`Response body: ${text2}`);
      console.log('\nPhase 2: SKIPPED (no token available)');
      console.log('\n========================================');
      console.log('FINAL RESULT: FAIL');
      process.exit(1);
    }

    const data2 = await res2.json();
    accessToken = data2.access_token;
    authMethod = 'client_credentials';
    console.log(`\n[PASS] Phase 1: Access token acquired via client_credentials (fallback)`);
    console.log(`Token type: ${data2.token_type}`);
    console.log(`Expires in: ${data2.expires_in} seconds`);
    console.log(`Access token (first 50 chars): ${accessToken.substring(0, 50)}...\n`);
    console.log('[NOTE] Using client_credentials flow (OAuth app authentication).');
    console.log('       User-scoped endpoints (like /account/services) will return 401.\n');
  }
} catch (err) {
  console.error(`\n[FAIL] Phase 1: ${err.message}`);
  console.log('\nPhase 2: SKIPPED (no token available)');
  console.log('\n========================================');
  console.log('FINAL RESULT: FAIL');
  process.exit(1);
}

console.log('Phase 2: API Ping Test');
console.log('------------------------\n');

const pingEndpoints = [
  '/shipment',
  '/przesylka',
  '/przesylki',
  '/order',
  '/zamowienie',
  '/konto/przesylki',
  '/konto/zamowienia',
];

let phase2Passed = false;
let workingEndpoint = '';
let workingMethod = '';
let workingEndpoints = [];

for (const endpoint of pingEndpoints) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`Testing endpoint: ${endpoint}\n`);

  // Try POST with auth token
  console.log(`  Attempt: POST with auth token...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.furgonetka.v1+json',
      },
      body: JSON.stringify({}),
    });

    console.log(`  Status: ${res.status} ${res.statusText}`);

    if (res.ok) {
      const data = await res.json();
      phase2Passed = true;
      workingEndpoints.push(endpoint);
      if (!workingEndpoint) {
        workingEndpoint = endpoint;
        workingMethod = 'GET with auth token';
      }
      console.log(`  [PASS] Response received (${JSON.stringify(data).substring(0, 100)}...)\n`);
    } else {
      const text = await res.text();
      console.log(`  Response: ${text.substring(0, 200)}\n`);
    }
  } catch (err) {
    console.log(`  Error: ${err.message}\n`);
  }
}

if (!phase2Passed) {
  console.log('\n========================================');
  console.log('FINAL RESULT: FAIL (Phase 1 passed, Phase 2 failed)');
  console.log('\nFINDINGS:');
  console.log('  Phase 1 (Authentication):');
  console.log(`    - ${authMethod}: PASSED`);
  console.log('  Phase 2 (API Ping):');
  console.log('    - All endpoints tested: FAILED');
  console.log('\nDIAGNOSTIC:');
  console.log('  Tested endpoints:', pingEndpoints.join(', '));
  console.log('\nRECOMMENDATIONS:');
  console.log('  1. Verify user account credentials');
  console.log('  2. Check if account has proper permissions');
  console.log('  3. Contact Furgonetka support if needed');
  process.exit(1);
}

console.log('========================================');
console.log('FINAL RESULT: PASS (both phases successful)');
console.log('\nSummary:');
console.log(`  Authentication: ${authMethod}`);
console.log(`  Working endpoints: ${workingEndpoints.join(', ')}`);
console.log(`  Total working endpoints: ${workingEndpoints.length}`);
console.log('\nFurgonetka sandbox authentication is working correctly.');
process.exit(0);
