#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - Test Pricing Endpoint
 * Verify packageCheckPrice endpoint and extract schema.
 *
 * Prerequisites:
 *   FURGONETKA_SANDBOX_CLIENT_ID and FURGONETKA_SANDBOX_CLIENT_SECRET in .env
 *
 * Run:
 *   node scripts/test-furgonetka-pricing-endpoint.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

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
  console.log(`Auth method: password grant (expires in ${data.expires_in}s)`);
  return data.access_token;
}

async function main() {
  console.log('Furgonetka Sandbox API - Test Pricing Endpoint');
  console.log('===============================================\n');

  try {
    const token = await getAccessToken();
    console.log('[OK] Access token acquired\n');

    // Try to access Swagger/OpenAPI documentation
    const docUrls = [
      '/swagger.json',
      '/swagger.yaml',
      '/openapi.json',
      '/openapi.yaml',
      '/api-docs',
      '/api-docs.json',
      '/docs.json',
      '/swagger-ui.html',
      '/api/swagger.json',
      '/api/openapi.json',
    ];

    console.log('Trying to find Swagger/OpenAPI documentation...\n');

    for (const path of docUrls) {
      console.log(`Checking: ${path}`);
      try {
        const res = await fetch(`${BASE_URL}${path}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log(`  Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const text = await res.text();
          console.log(`  [FOUND] Documentation available!`);
          console.log(`  Content preview: ${text.substring(0, 500)}\n`);
          
          // Save to file
          const fs = await import('fs');
          fs.writeFileSync(`furgonetka-api-doc${path.replace(/\//g, '-')}.json`, text);
          console.log(`  Saved to: furgonetka-api-doc${path.replace(/\//g, '-')}.json`);
          process.exit(0);
        }
      } catch (err) {
        console.log(`  Error: ${err.message}`);
      }
    }

    console.log('\n[INFO] No Swagger/OpenAPI documentation found at standard paths.');
    
    // Test /packages endpoint with different approaches
    console.log('\nTesting /packages endpoint...\n');
    const endpoints = [
      { method: 'POST', path: '/packages', body: {
        type: 'package',
        width: 15,
        height: 15,
        depth: 15,
        weight: 1.5,
        service_id: 11597695, // DPD from /account/services
        pickup: { type: 'sender', name: 'Test Sender', company: 'Test Company' },
        sender: {
          postcode: '00-533',
          city: 'Warszawa',
          country: 'PL',
          name: 'Test Sender',
          company: 'Test Company',
          phone: '123456789',
          email: 'test@example.com'
        },
        receiver: {
          postcode: '00-001',
          city: 'Warszawa',
          country: 'PL',
          name: 'Test Receiver',
          company: 'Test Company',
          phone: '123456789',
          email: 'test@example.com'
        }
      }, accept: 'application/vnd.furgonetka.v1+json' },
    ];

    for (const { method, path, body, accept } of endpoints) {
      console.log(`Testing endpoint: ${method} ${path} (Accept: ${accept})`);

      let url = `${BASE_URL}${path}`;
      let headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': accept,
      };

      let options = {
        method,
        headers,
      };

      if (method === 'POST' && body) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);

      console.log(`Response status: ${res.status} ${res.statusText}`);

      if (res.ok) {
        const data = await res.json();
        console.log('\n[SUCCESS] Pricing endpoint works!');
        console.log('\nResponse schema:');
        console.log(JSON.stringify(data, null, 2));
        process.exit(0);
      } else {
        const text = await res.text();
        console.log(`Response body: ${text.substring(0, 200)}\n`);
      }
    }

    console.log('[INFO] Manual documentation review required. The API documentation at https://sandbox.furgonetka.pl/api/rest appears to be a landing page, not interactive documentation.');
  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
