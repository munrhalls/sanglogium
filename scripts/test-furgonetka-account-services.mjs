#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - Test /account/services endpoint
 * Pre-flight check 3: Test known working endpoint
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

  // Use password grant (login/password)
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
  console.log(`Auth method: password grant (login: ${credentials.username}, expires in ${data.expires_in}s)`);
  return data.access_token;
}

async function main() {
  console.log('Furgonetka Sandbox API - Test /account/services');
  console.log('===============================================\n');

  try {
    const token = await getAccessToken();
    console.log('[OK] Access token acquired\n');

    // Test endpoint variations including configuration endpoints
    const endpointVariations = [
      { path: '/account/services', method: 'GET', accept: 'application/vnd.furgonetka.v1+json' },
      { path: '/account/services', method: 'GET', accept: 'application/json' },
      { path: '/account/services', method: 'GET', accept: null },
      { path: '/configuration/allowed-countries', method: 'GET', accept: 'application/vnd.furgonetka.v1+json' },
      { path: '/configuration/allowed-countries', method: 'GET', accept: 'application/json' },
      { path: '/configuration/allowed-countries', method: 'GET', accept: null },
    ];

    for (const { path, method, accept } of endpointVariations) {
      console.log(`Testing: ${method} ${path} (Accept: ${accept || 'none'})`);
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        if (accept) {
          headers['Accept'] = accept;
        }

        const res = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
        });

        console.log(`  Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`  [SUCCESS] Endpoint working: ${path}`);
          console.log('\nResponse structure:');
          console.log(JSON.stringify(data, null, 2));
          process.exit(0);
        } else {
          const text = await res.text();
          console.log(`  Response: ${text.substring(0, 100)}\n`);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}\n`);
      }
    }

    console.log('[FAIL] All endpoint variations failed');
    console.log('This may indicate account/permission issue or endpoint structure changed.');
    process.exit(1);

  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
