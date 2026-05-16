#!/usr/bin/env node
/**
 * Furgonetka Sandbox API - Test Realistic Scenarios
 * Test close vs far recipient scenarios to verify rate calculation realism
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

async function testScenario(token, sender, receiver, serviceId, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SCENARIO: ${description}`);
  console.log('='.repeat(60));
  console.log(`\nSender: ${receiver.city} (${receiver.postcode})`);
  console.log(`Receiver: ${receiver.city} (${receiver.postcode})`);

  const requestBody = {
    type: 'package',
    parcels: [{
      width: 15,
      height: 15,
      depth: 15,
      weight: 1.5,
    }],
    service_id: serviceId,
    pickup: {
      type: 'sender',
      name: sender.name,
      company: sender.company,
      email: sender.email,
      street: sender.street,
      postcode: sender.postcode,
      city: sender.city,
      phone: sender.phone,
    },
    sender: {
      postcode: sender.postcode,
      city: sender.city,
      country: 'PL',
      name: sender.name,
      company: sender.company,
      phone: sender.phone,
      email: sender.email,
      street: sender.street,
    },
    receiver: {
      postcode: receiver.postcode,
      city: receiver.city,
      country: 'PL',
      name: receiver.name,
      company: receiver.company,
      phone: receiver.phone,
      email: receiver.email,
      street: receiver.street,
    },
  };

  const res = await fetch(`${BASE_URL}/packages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.furgonetka.v1+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`Status: ${res.status} ${res.statusText}`);

  if (res.ok) {
    const data = await res.json();
    console.log('\n[SUCCESS] Request accepted!');
    console.log('\nKey Data:');
    console.log(`  Service: ${data.service}`);
    console.log(`  Price Gross: ${data.pricing.price_gross} PLN`);
    console.log(`  Price Net: ${data.pricing.price_net} PLN`);
    console.log(`  Delivery Time: ${data.delivery_time || 'null (not provided)'}`);
    console.log(`  State: ${data.state}`);
    return { success: true, data };
  } else {
    const text = await res.text();
    console.log('\n[ERROR] Request rejected');
    console.log(`Response: ${text.substring(0, 200)}`);
    return { success: false, error: text };
  }
}

async function main() {
  console.log('Furgonetka Sandbox API - Realistic Scenario Testing');
  console.log('====================================================\n');

  try {
    const token = await getAccessToken();

    // Sender: Warsaw (central Poland)
    const sender = {
      name: 'Test Sender',
      company: 'Test Company',
      email: 'test@example.com',
      street: 'Marszałkowska 1',
      postcode: '00-533',
      city: 'Warszawa',
      phone: '600123456',
    };

    // Test 1: Close recipient (Warszawa - same city)
    console.log('\n--- TEST 1: Close recipient (same city) ---');
    const closeReceiver = {
      name: 'Test Receiver',
      company: 'Test Company',
      email: 'test@example.com',
      street: 'Nowy Świat 1',
      postcode: '00-001',
      city: 'Warszawa',
      phone: '600123456',
    };
    await testScenario(token, sender, closeReceiver, 11597700, 'Close recipient (Warszawa to Warszawa) - InPost');

    // Test 2: Far recipient (Kraków - ~300km south)
    console.log('\n--- TEST 2: Far recipient (different city) ---');
    const farReceiver = {
      name: 'Test Receiver',
      company: 'Test Company',
      email: 'test@example.com',
      street: 'Florianska 1',
      postcode: '30-001',
      city: 'Kraków',
      phone: '600123456',
    };
    await testScenario(token, sender, farReceiver, 11597700, 'Far recipient (Warszawa to Kraków) - InPost');

    // Test 3: Very far recipient (Gdańsk - ~300km north)
    console.log('\n--- TEST 3: Very far recipient (different region) ---');
    const veryFarReceiver = {
      name: 'Test Receiver',
      company: 'Test Company',
      email: 'test@example.com',
      street: 'Długa 1',
      postcode: '80-001',
      city: 'Gdańsk',
      phone: '600123456',
    };
    await testScenario(token, sender, veryFarReceiver, 11597700, 'Very far recipient (Warszawa to Gdańsk) - InPost');

    // Test 4: Test with different carrier (DPD)
    console.log('\n--- TEST 4: Different carrier (DPD) ---');
    await testScenario(token, sender, farReceiver, 11597695, 'Far recipient with DPD (Warszawa to Kraków)');

  } catch (err) {
    console.error('\n[CRITICAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
