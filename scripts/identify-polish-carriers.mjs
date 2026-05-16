#!/usr/bin/env node
/**
 * Identify Polish Carriers for Furgonetka API
 * Get complete carrier list and test each for rate calculation capability.
 *
 * Usage:
 *   node scripts/identify-polish-carriers.mjs
 */

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const credentials = {
  client_id: 'sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7',
  client_secret: 'bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7',
  username: 'antarcticdepths71@gmail.com',
  password: 'Furgonetkaguars77@',
};

// Test addresses (B2C - no company field)
const sender = {
  name: 'Test Sender',
  email: 'test@example.com',
  phone: '600123456',
  street: 'Marszałkowska 1',
  postcode: '00-533',
  city: 'Warszawa',
  country: 'PL',
};

// Multiple recipient postcodes to test carrier availability
const recipients = [
  {
    name: 'Warsaw Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Nowy Świat 1',
    postcode: '00-001',
    city: 'Warszawa',
    country: 'PL',
  },
  {
    name: 'Kraków Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Floriańska 1',
    postcode: '30-001',
    city: 'Kraków',
    country: 'PL',
  },
  {
    name: 'Gdańsk Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Długa 1',
    postcode: '80-001',
    city: 'Gdańsk',
    country: 'PL',
  },
  {
    name: 'Wrocław Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Rynek 1',
    postcode: '50-001',
    city: 'Wrocław',
    country: 'PL',
  },
  {
    name: 'Poznań Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Półwiejska 1',
    postcode: '61-001',
    city: 'Poznań',
    country: 'PL',
  },
];

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

async function getCarrierList(token) {
  console.log('Fetching carrier list from /account/services...\n');
  const res = await fetch(`${BASE_URL}/account/services`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.furgonetka.v1+json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Carrier list request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500));

  // Handle different response structures
  if (Array.isArray(data)) {
    return data;
  } else if (data.services && Array.isArray(data.services)) {
    return data.services;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data.items && Array.isArray(data.items)) {
    return data.items;
  } else {
    throw new Error(`Unexpected carrier list structure: ${JSON.stringify(data).substring(0, 200)}`);
  }
}

async function testCarrierWithPostcode(token, carrier, recipient) {
  const requestBody = {
    type: 'package',
    service_id: carrier.id,
    parcels: [{ width: 15, height: 15, depth: 15, weight: 1.5 }],
    pickup: {
      type: 'sender',
      name: sender.name,
      email: sender.email,
      street: sender.street,
      postcode: sender.postcode,
      city: sender.city,
      phone: sender.phone,
    },
    sender: {
      postcode: sender.postcode,
      city: sender.city,
      country: sender.country,
      name: sender.name,
      phone: sender.phone,
      email: sender.email,
      street: sender.street,
    },
    receiver: {
      postcode: recipient.postcode,
      city: recipient.city,
      country: recipient.country,
      name: recipient.name,
      phone: recipient.phone,
      email: recipient.email,
      street: recipient.street,
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

  if (res.ok) {
    const data = await res.json();
    return {
      success: true,
      postcode: recipient.postcode,
      city: recipient.city,
      price_gross: data.pricing.price_gross,
      price_net: data.pricing.price_net,
    };
  } else {
    const text = await res.text();
    try {
      const errorData = JSON.parse(text);
      return {
        success: false,
        postcode: recipient.postcode,
        city: recipient.city,
        errorMessage: errorData.errors?.[0]?.message || 'unknown',
      };
    } catch {
      return {
        success: false,
        postcode: recipient.postcode,
        city: recipient.city,
        error: text,
      };
    }
  }
}

async function testCarrier(token, carrier) {
  const results = [];
  for (const recipient of recipients) {
    const result = await testCarrierWithPostcode(token, carrier, recipient);
    results.push(result);
    if (result.success) {
      break; // Stop at first successful postcode
    }
  }
  return results;
}

async function main() {
  console.log('Identify Polish Carriers for Furgonetka API');
  console.log('============================================\n');

  try {
    const token = await getAccessToken();
    console.log('Authentication successful\n');

    const carriers = await getCarrierList(token);
    console.log(`Found ${carriers.length} carriers\n`);

    const results = [];

    for (const carrier of carriers) {
      console.log(`Testing: ${carrier.name} (ID: ${carrier.id})`);
      const testResults = await testCarrier(token, carrier);

      const successfulResult = testResults.find(r => r.success);
      if (successfulResult) {
        results.push({
          name: carrier.name,
          service_id: carrier.id,
          success: true,
          postcode: successfulResult.postcode,
          city: successfulResult.city,
          price_gross: successfulResult.price_gross,
          price_net: successfulResult.price_net,
        });
        console.log(`  ✓ SUCCESS - ${successfulResult.city} (${successfulResult.postcode}) - Price: ${successfulResult.price_gross} PLN\n`);
      } else {
        results.push({
          name: carrier.name,
          service_id: carrier.id,
          success: false,
          errors: testResults.map(r => r.errorMessage || r.error),
        });
        console.log(`  ✗ FAILED - Tested ${testResults.length} postcodes - ${testResults[0].errorMessage}\n`);
      }
    }

    console.log('============================================');
    console.log('SUMMARY');
    console.log('============================================\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Successful carriers: ${successful.length}`);
    console.log(`Failed carriers: ${failed.length}\n`);

    console.log('--- SUCCESSFUL CARRIERS ---');
    successful.forEach(r => {
      console.log(`${r.name} (ID: ${r.service_id}) - ${r.city} (${r.postcode}) - ${r.price_gross} PLN`);
    });

    console.log('\n--- FAILED CARRIERS ---');
    failed.forEach(r => {
      console.log(`${r.name} (ID: ${r.service_id}) - ${r.errors[0]}`);
    });

    console.log('\n============================================');
    console.log('FINAL CARRIER LIST');
    console.log('============================================\n');

    // Exclude Poczta Polska
    const finalCarriers = successful.filter(r => !r.name.toLowerCase().includes('poczta'));

    console.log(`Carriers after excluding Poczta Polska: ${finalCarriers.length}\n`);

    if (finalCarriers.length >= 7) {
      console.log('✓ Goal achieved: 7+ carriers available');
    } else {
      console.log(`⚠ Warning: Only ${finalCarriers.length} carriers available (target: 7-8)`);
    }

    console.log('\nFinal carrier list:');
    finalCarriers.forEach(r => {
      console.log(`- ${r.name} (service_id: ${r.service_id})`);
    });

    console.log('\n--- EXCLUDED CARRIERS ---');
    const pocztaPolska = successful.find(r => r.name.toLowerCase().includes('poczta'));
    if (pocztaPolska) {
      console.log(`Poczta Polska (service_id: ${pocztaPolska.service_id}) - Excluded due to dimension requirements (minimum 16x10 cm)`);
    }

    console.log('\n--- OTHER FAILED CARRIERS ---');
    failed.forEach(r => {
      console.log(`${r.name} (ID: ${r.service_id}) - ${r.errorMessage || r.errorPath}`);
    });

  } catch (err) {
    console.error('\nScript failed:', err.message);
    process.exit(1);
  }
}

main();
