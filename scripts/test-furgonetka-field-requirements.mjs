#!/usr/bin/env node
/**
 * Furgonetka API Field Requirements Test
 * Test which fields are actually required by the Furgonetka API.
 *
 * Tests:
 * 1. Without phone field (keep email and company)
 * 2. Without email field (keep phone and company)
 * 3. Without company field (keep phone and email)
 * 4. Minimal required fields only
 *
 * Usage:
 *   node scripts/test-furgonetka-field-requirements.mjs
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

async function testFieldCombination(token, testName, requestBody) {
  console.log(`\n--- Test: ${testName} ---`);

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
    console.log(`✓ SUCCESS - Status: ${res.status}`);
    console.log(`  Service: ${data.service}`);
    console.log(`  Price: ${data.pricing.price_gross} PLN`);
    return { success: true, status: res.status };
  } else {
    const text = await res.text();
    console.log(`✗ FAILED - Status: ${res.status}`);
    console.log(`  Error: ${text.substring(0, 200)}`);
    return { success: false, status: res.status, error: text };
  }
}

async function main() {
  console.log('Furgonetka API Field Requirements Test');
  console.log('=====================================\n');

  try {
    const token = await getAccessToken();
    console.log('Authentication successful\n');

    const results = [];

    // Base request with all fields
    const baseRequest = {
      type: 'package',
      service_id: 11597700,
      parcels: [{ width: 15, height: 15, depth: 15, weight: 1.5 }],
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

    // Test 1: Without phone field (keep email and company)
    const test1Request = JSON.parse(JSON.stringify(baseRequest));
    delete test1Request.pickup.phone;
    delete test1Request.sender.phone;
    delete test1Request.receiver.phone;
    const result1 = await testFieldCombination(token, 'Without phone field (keep email and company)', test1Request);
    results.push({ test: 'Without phone', ...result1 });

    // Test 2: Without email field (keep phone and company)
    const test2Request = JSON.parse(JSON.stringify(baseRequest));
    delete test2Request.pickup.email;
    delete test2Request.sender.email;
    delete test2Request.receiver.email;
    const result2 = await testFieldCombination(token, 'Without email field (keep phone and company)', test2Request);
    results.push({ test: 'Without email', ...result2 });

    // Test 3: Without company field (keep phone and email)
    const test3Request = JSON.parse(JSON.stringify(baseRequest));
    delete test3Request.pickup.company;
    delete test3Request.sender.company;
    delete test3Request.receiver.company;
    const result3 = await testFieldCombination(token, 'Without company field (keep phone and email)', test3Request);
    results.push({ test: 'Without company', ...result3 });

    // Test 4: Without phone AND company (keep email only)
    const test4Request = JSON.parse(JSON.stringify(baseRequest));
    delete test4Request.pickup.phone;
    delete test4Request.pickup.company;
    delete test4Request.sender.phone;
    delete test4Request.sender.company;
    delete test4Request.receiver.phone;
    delete test4Request.receiver.company;
    const result4 = await testFieldCombination(token, 'Without phone and company (keep email only)', test4Request);
    results.push({ test: 'Without phone and company', ...result4 });

    // Test 5: Without email AND company (keep phone only)
    const test5Request = JSON.parse(JSON.stringify(baseRequest));
    delete test5Request.pickup.email;
    delete test5Request.pickup.company;
    delete test5Request.sender.email;
    delete test5Request.sender.company;
    delete test5Request.receiver.email;
    delete test5Request.receiver.company;
    const result5 = await testFieldCombination(token, 'Without email and company (keep phone only)', test5Request);
    results.push({ test: 'Without email and company', ...result5 });

    // Test 6: Minimal - without phone, email, and company
    const test6Request = JSON.parse(JSON.stringify(baseRequest));
    delete test6Request.pickup.phone;
    delete test6Request.pickup.email;
    delete test6Request.pickup.company;
    delete test6Request.sender.phone;
    delete test6Request.sender.email;
    delete test6Request.sender.company;
    delete test6Request.receiver.phone;
    delete test6Request.receiver.email;
    delete test6Request.receiver.company;
    const result6 = await testFieldCombination(token, 'Minimal (no phone, email, or company)', test6Request);
    results.push({ test: 'Minimal (no phone/email/company)', ...result6 });

    // Summary
    console.log('\n=====================================');
    console.log('SUMMARY');
    console.log('=====================================\n');

    results.forEach(r => {
      console.log(`${r.test}: ${r.success ? '✓ ALLOWED' : '✗ REQUIRED'}`);
    });

    console.log('\n=====================================');
    console.log('FIELD REQUIREMENT ANALYSIS');
    console.log('=====================================\n');

    const phoneRequired = !results.find(r => r.test.includes('Without phone') && r.success);
    const emailRequired = !results.find(r => r.test.includes('Without email') && r.success);
    const companyRequired = !results.find(r => r.test.includes('Without company') && r.success);

    console.log(`Phone field: ${phoneRequired ? 'REQUIRED' : 'OPTIONAL'}`);
    console.log(`Email field: ${emailRequired ? 'REQUIRED' : 'OPTIONAL'}`);
    console.log(`Company field: ${companyRequired ? 'REQUIRED' : 'OPTIONAL'}`);

    console.log('\n=====================================');
    console.log('RECOMMENDATIONS FOR B2C E-COMMERCE');
    console.log('=====================================\n');

    if (!phoneRequired) {
      console.log('✓ Phone is optional - can be made optional in UI for individual customers');
    } else {
      console.log('⚠ Phone is required - must be collected from customers');
    }

    if (!emailRequired) {
      console.log('✓ Email is optional - can be made optional in UI for individual customers');
    } else {
      console.log('⚠ Email is required - must be collected from customers');
    }

    if (!companyRequired) {
      console.log('✓ Company is optional - can be hidden or optional in UI for individual customers');
    } else {
      console.log('⚠ Company is required - must be collected from customers (unusual for B2C)');
    }

  } catch (err) {
    console.error('\nTest failed:', err.message);
    process.exit(1);
  }
}

main();
