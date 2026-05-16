#!/usr/bin/env node
/**
 * Multi-Address Rate Calculation for Polish Carriers
 * Test carrier pricing across 5 geographically diverse Polish recipient addresses.
 *
 * Usage:
 *   node scripts/multi-address-rate-calculation.mjs
 */

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const credentials = {
  client_id: 'sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7',
  client_secret: 'bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7',
  username: 'antarcticdepths71@gmail.com',
  password: 'Furgonetkaguars77@',
};

// Verified carriers from Issue sang-logium-09y
const carriers = [
  { name: 'InPost', service_id: 11597700 },
  { name: 'FedEx', service_id: 11597696 },
  { name: 'DHL', service_id: 11597702 },
  { name: 'DPD', service_id: 11597695 },
  { name: 'UPS', service_id: 11597697 },
  { name: 'Ambro Express', service_id: 11597704 },
];

// Fixed sender address (Warsaw)
const sender = {
  name: 'Test Sender',
  email: 'test@example.com',
  phone: '600123456',
  street: 'Marszałkowska 1',
  postcode: '00-533',
  city: 'Warszawa',
  country: 'PL',
};

// 5 geographically diverse Polish recipient addresses
const recipients = [
  {
    name: 'Warsaw Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Nowy Świat 1',
    postcode: '00-001',
    city: 'Warszawa',
    country: 'PL',
    region: 'Central Poland',
  },
  {
    name: 'Kraków Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Floriańska 1',
    postcode: '30-001',
    city: 'Kraków',
    country: 'PL',
    region: 'Southern Poland',
  },
  {
    name: 'Gdańsk Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Długa 1',
    postcode: '80-001',
    city: 'Gdańsk',
    country: 'PL',
    region: 'Northern Poland',
  },
  {
    name: 'Wrocław Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Rynek 1',
    postcode: '50-001',
    city: 'Wrocław',
    country: 'PL',
    region: 'Western Poland',
  },
  {
    name: 'Poznań Recipient',
    email: 'test@example.com',
    phone: '600123456',
    street: 'Półwiejska 1',
    postcode: '61-001',
    city: 'Poznań',
    country: 'PL',
    region: 'Western Poland',
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

async function testRateCalculation(token, carrier, recipient) {
  const requestBody = {
    type: 'package',
    service_id: carrier.service_id,
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
      price_gross: data.pricing.price_gross,
      price_net: data.pricing.price_net,
    };
  } else {
    const text = await res.text();
    try {
      const errorData = JSON.parse(text);
      return {
        success: false,
        errorMessage: errorData.errors?.[0]?.message || 'unknown',
      };
    } catch {
      return {
        success: false,
        error: text,
      };
    }
  }
}

async function main() {
  console.log('Multi-Address Rate Calculation for Polish Carriers');
  console.log('===================================================\n');

  try {
    const token = await getAccessToken();
    console.log('Authentication successful\n');

    const results = [];

    // Test each carrier against each address
    for (const recipient of recipients) {
      console.log(`--- Testing: ${recipient.city} (${recipient.region}) ---`);

      for (const carrier of carriers) {
        const result = await testRateCalculation(token, carrier, recipient);
        results.push({
          carrier: carrier.name,
          service_id: carrier.service_id,
          recipient_city: recipient.city,
          recipient_region: recipient.region,
          recipient_postcode: recipient.postcode,
          ...result,
        });

        if (result.success) {
          console.log(`  ${carrier.name}: ${result.price_gross} PLN`);
        } else {
          console.log(`  ${carrier.name}: FAILED - ${result.errorMessage}`);
        }
      }
      console.log('');
    }

    // Generate comparison table
    console.log('===================================================');
    console.log('CARRIER PRICING COMPARISON BY ADDRESS');
    console.log('===================================================\n');

    // Table header
    console.log('Carrier'.padEnd(20) + '| ' + recipients.map(r => r.city.padEnd(12)).join(' | '));
    console.log('-'.repeat(20) + '-+-' + '-'.repeat(12) + '-+-'.repeat(4) + '-'.repeat(12));

    // Table rows
    for (const carrier of carriers) {
      const row = [carrier.name.padEnd(20)];
      for (const recipient of recipients) {
        const result = results.find(
          r => r.carrier === carrier.name && r.recipient_city === recipient.city
        );
        if (result && result.success) {
          row.push(result.price_gross.toFixed(2).padEnd(12));
        } else {
          row.push('FAILED'.padEnd(12));
        }
      }
      console.log(row.join(' | '));
    }

    // Identify inconsistent carriers
    console.log('\n===================================================');
    console.log('CARRIER CONSISTENCY ANALYSIS');
    console.log('===================================================\n');

    for (const carrier of carriers) {
      const carrierResults = results.filter(r => r.carrier === carrier.name);
      const successful = carrierResults.filter(r => r.success);
      const failed = carrierResults.filter(r => !r.success);

      console.log(`${carrier.name}:`);
      console.log(`  Successful: ${successful.length}/${recipients.length}`);
      console.log(`  Failed: ${failed.length}/${recipients.length}`);

      if (failed.length > 0) {
        console.log(`  Failed addresses: ${failed.map(f => f.recipient_city).join(', ')}`);
        console.log(`  Errors: ${failed.map(f => f.errorMessage).join(', ')}`);
      }

      if (successful.length === recipients.length) {
        console.log(`  ✓ Consistent across all addresses`);
      } else {
        console.log(`  ⚠ Inconsistent - fails for some addresses`);
      }
      console.log('');
    }

    // Price variance analysis
    console.log('===================================================');
    console.log('PRICE VARIANCE ANALYSIS');
    console.log('===================================================\n');

    for (const carrier of carriers) {
      const carrierResults = results.filter(r => r.carrier === carrier.name && r.success);
      if (carrierResults.length > 1) {
        const prices = carrierResults.map(r => r.price_gross);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const variance = max - min;

        console.log(`${carrier.name}:`);
        console.log(`  Price range: ${min.toFixed(2)} - ${max.toFixed(2)} PLN`);
        console.log(`  Variance: ${variance.toFixed(2)} PLN`);

        if (variance === 0) {
          console.log(`  ✓ Flat-rate pricing (no geographic variance)`);
        } else {
          console.log(`  ⚠ Geographic pricing variance detected`);
        }
        console.log('');
      }
    }

  } catch (err) {
    console.error('\nScript failed:', err.message);
    process.exit(1);
  }
}

main();
