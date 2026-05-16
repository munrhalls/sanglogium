#!/usr/bin/env node
/**
 * Furgonetka Sandbox OAuth Password Grant Test
 * Minimal script to test username/password authentication.
 *
 * Prerequisites:
 *   FURGONETKA_SANDBOX_CLIENT_ID and FURGONETKA_SANDBOX_CLIENT_SECRET in .env
 *
 * Run:
 *   node scripts/test-furgonetka-password-auth.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const clientId = process.env.FURGONETKA_SANDBOX_CLIENT_ID;
const clientSecret = process.env.FURGONETKA_SANDBOX_CLIENT_SECRET;

// User credentials
const username = 'antarcticdepths71@gmail.com';
const password = 'Furgonetkaguars77@';

if (!clientId || !clientSecret) {
  console.error('Missing required environment variables:');
  console.error('  FURGONETKA_SANDBOX_CLIENT_ID');
  console.error('  FURGONETKA_SANDBOX_CLIENT_SECRET');
  process.exit(1);
}

console.log('Furgonetka Sandbox OAuth Password Grant Test');
console.log('=============================================\n');
console.log(`Client ID: ${clientId}`);
console.log(`Username: ${username}`);
console.log(`OAuth URL: ${OAUTH_URL}\n`);

try {
  // Furgonetka OAuth uses Basic Auth with clientId:clientSecret
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'password',
    scope: 'api',
    username,
    password,
  });

  console.log('Requesting access token (password grant)...');
  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  console.log(`Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const text = await res.text();
    console.error(`\n[ERROR] OAuth request failed`);
    console.error(`Response body: ${text}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log('\n[SUCCESS] Access token acquired');
  console.log(`Token type: ${data.token_type}`);
  console.log(`Expires in: ${data.expires_in} seconds`);
  console.log(`Access token (first 50 chars): ${data.access_token.substring(0, 50)}...`);
  if (data.refresh_token) {
    console.log(`Refresh token (first 50 chars): ${data.refresh_token.substring(0, 50)}...`);
  }

  process.exit(0);
} catch (err) {
  console.error('\n[CRITICAL ERROR]', err.message);
  process.exit(1);
}
