#!/usr/bin/env node
/**
 * Furgonetka Rate Calculation Experiment
 * Minimal script to execute rate calculation experiment comparing close vs far recipients.
 *
 * Usage:
 *   node scripts/run-furgonetka-experiment.mjs
 *
 * This script:
 * - Tests with Recipient A (close: Warsaw to Warsaw, ~2 km)
 * - Tests with Recipient B (far: Warsaw to Kraków, ~300 km)
 * - Compares cost differences across carriers
 * - Analyzes rate realism
 */

const BASE_URL = 'https://api.sandbox.furgonetka.pl';
const OAUTH_URL = `${BASE_URL}/oauth/token`;

const credentials = {
  client_id: 'sanglogiumsandbox-809e5808a56792b32ed4c06b051b6ad7',
  client_secret: 'bc73ff41ebe5326108df998a8531e2d1fa483678bcc4e3bdfcf1ec50873270d7',
  username: 'antarcticdepths71@gmail.com',
  password: 'Furgonetkaguars77@',
};

// Test addresses from Chunk 6 (B2C e-commerce - no company field)
const sender = {
  name: 'Test Sender',
  email: 'test@example.com',
  phone: '600123456',
  street: 'Marszałkowska 1',
  postcode: '00-533',
  city: 'Warszawa',
  country: 'PL',
};

const recipientA = {
  name: 'Test Receiver Close',
  email: 'test@example.com',
  phone: '600123456',
  street: 'Nowy Świat 1',
  postcode: '00-001',
  city: 'Warszawa',
  country: 'PL',
};

const recipientB = {
  name: 'Test Receiver Far',
  email: 'test@example.com',
  phone: '600123456',
  street: 'Floriańska 1',
  postcode: '30-001',
  city: 'Kraków',
  country: 'PL',
};

// Carriers from Chunk 2
const carriers = [
  { name: 'InPost', service_id: 11597700 },
  { name: 'DPD', service_id: 11597695 },
  { name: 'DHL', service_id: 11597702 },
  { name: 'Poczta Polska', service_id: 11597699 },
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

async function testRateCalculation(token, carrier, recipient, scenario) {
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    carrier: carrier.name,
    scenario,
    recipient_city: recipient.city,
    price_gross: data.pricing.price_gross,
    price_net: data.pricing.price_net,
    tax: data.pricing.tax,
    service: data.service,
  };
}

async function main() {
  console.log('Furgonetka Rate Calculation Experiment');
  console.log('=======================================\n');

  try {
    const token = await getAccessToken();
    console.log('Authentication successful\n');

    const results = [];

    // Test Recipient A (close: Warsaw to Warsaw, ~2 km)
    console.log('--- Scenario 1: Close Recipient (Warsaw to Warsaw, ~2 km) ---');
    for (const carrier of carriers) {
      try {
        const result = await testRateCalculation(token, carrier, recipientA, 'close');
        results.push(result);
        console.log(`${result.carrier}: ${result.price_gross} PLN (gross), ${result.price_net} PLN (net)`);
      } catch (err) {
        console.log(`${carrier.name}: FAILED - ${err.message}`);
      }
    }

    // Test Recipient B (far: Warsaw to Kraków, ~300 km)
    console.log('\n--- Scenario 2: Far Recipient (Warsaw to Kraków, ~300 km) ---');
    for (const carrier of carriers) {
      try {
        const result = await testRateCalculation(token, carrier, recipientB, 'far');
        results.push(result);
        console.log(`${result.carrier}: ${result.price_gross} PLN (gross), ${result.price_net} PLN (net)`);
      } catch (err) {
        console.log(`${carrier.name}: FAILED - ${err.message}`);
      }
    }

    // Analysis
    console.log('\n=======================================');
    console.log('ANALYSIS');
    console.log('=======================================\n');

    const closeResults = results.filter(r => r.scenario === 'close');
    const farResults = results.filter(r => r.scenario === 'far');

    console.log('Close Scenario (Warsaw to Warsaw):');
    closeResults.forEach(r => {
      console.log(`  ${r.carrier}: ${r.price_gross} PLN`);
    });

    console.log('\nFar Scenario (Warsaw to Kraków):');
    farResults.forEach(r => {
      console.log(`  ${r.carrier}: ${r.price_gross} PLN`);
    });

    console.log('\nPrice Differences by Carrier:');
    for (const carrier of carriers) {
      const close = closeResults.find(r => r.carrier === carrier.name);
      const far = farResults.find(r => r.carrier === carrier.name);
      if (close && far) {
        const diff = far.price_gross - close.price_gross;
        const diffPercent = ((diff / close.price_gross) * 100).toFixed(2);
        console.log(`  ${carrier.name}: ${diff > 0 ? '+' : ''}${diff.toFixed(2)} PLN (${diffPercent}%)`);
      }
    }

    console.log('\nCarrier Price Comparison (Far Scenario):');
    farResults.sort((a, b) => a.price_gross - b.price_gross);
    farResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.carrier}: ${r.price_gross} PLN`);
    });

    console.log('\n=======================================');
    console.log('REALISM ASSESSMENT');
    console.log('=======================================\n');

    // Realism analysis
    const priceVariance = Math.max(...farResults.map(r => r.price_gross)) - Math.min(...farResults.map(r => r.price_gross));
    console.log(`Price variance across carriers: ${priceVariance.toFixed(2)} PLN`);

    if (priceVariance > 5) {
      console.log('✓ Carriers show meaningful price differences (realistic)');
    } else {
      console.log('⚠ Carriers show minimal price differences (may be simplified sandbox pricing)');
    }

    const distanceImpact = results.some(r => r.scenario === 'close') && results.some(r => r.scenario === 'far');
    if (distanceImpact) {
      const closeAvg = closeResults.reduce((sum, r) => sum + r.price_gross, 0) / closeResults.length;
      const farAvg = farResults.reduce((sum, r) => sum + r.price_gross, 0) / farResults.length;
      const avgDiff = farAvg - closeAvg;
      console.log(`Average price difference (far vs close): ${avgDiff.toFixed(2)} PLN`);

      if (avgDiff > 1) {
        console.log('✓ Distance affects pricing (realistic)');
      } else {
        console.log('⚠ Distance has minimal impact on pricing (sandbox flat-rate behavior)');
      }
    }

    console.log('\n⚠ NOTE: delivery_time field is null for all requests.');
    console.log('  This experiment only validates cost realism, not delivery time estimates.');
    console.log('  See issue sang-logium-nuu for delivery_time investigation.');

  } catch (err) {
    console.error('\nExperiment failed:', err.message);
    process.exit(1);
  }
}

main();
