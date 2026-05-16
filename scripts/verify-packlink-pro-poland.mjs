#!/usr/bin/env node
/**
 * Packlink PRO API Verification for Poland Domestic Shipping
 * 
 * Purpose: Verify if Packlink PRO API actually works for Poland domestic shipping
 * and returns real calculated rates with delivery time estimates.
 * 
 * Usage:
 *   node scripts/verify-packlink-pro-poland.mjs
 */

const API_KEY = 'dc683894eff353058cfb5df790cff8e66376283da82884c5fd930421bb64f0c1';

async function testPacklinkPRO(fromZip, fromCity, toZip, toCity, scenario) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Scenario: ${scenario}`);
  console.log(`From: ${fromCity} (${fromZip})`);
  console.log(`To: ${toCity} (${toZip})`);
  console.log(`${'='.repeat(70)}\n`);

  const params = new URLSearchParams();
  params.set('from[country]', 'PL');
  params.set('from[zip]', fromZip);
  params.set('to[country]', 'PL');
  params.set('to[zip]', toZip);
  params.set('packages[0][width]', '15');
  params.set('packages[0][height]', '15');
  params.set('packages[0][length]', '15');
  params.set('packages[0][weight]', '1.5');

  const url = `https://api.packlink.com/v1/services?${params}`;

  try {
    console.log('Request URL:', url);
    console.log('\nSending request to Packlink PRO API...\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    console.log(`Response Status: ${res.status} ${res.statusText}\n`);

    if (!res.ok) {
      const text = await res.text();
      console.log('❌ Request failed');
      console.log('Response:', text);
      return { success: false, services: [] };
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) {
      console.log('❌ Unexpected response format:', typeof data);
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: false, services: [] };
    }

    console.log(`✅ Request successful`);
    console.log(`Number of services returned: ${data.length}\n`);

    if (data.length === 0) {
      console.log('⚠️  NO SERVICES RETURNED - Packlink PRO may not support Poland domestic shipping');
      return { success: true, services: [] };
    }

    console.log('Services returned:');
    console.log('-'.repeat(70));
    
    data.forEach((service, index) => {
      console.log(`\nService ${index + 1}:`);
      console.log(`  Carrier: ${service.carrier_name}`);
      console.log(`  Name: ${service.name}`);
      console.log(`  Total Price: ${service.price.total_price} ${service.price.currency}`);
      console.log(`  Transit Time: ${service.transit_time}`);
      console.log(`  Transit Hours: ${service.transit_hours}`);
      console.log(`  First Estimated Delivery: ${service.first_estimated_delivery_date}`);
      console.log(`  Category: ${service.category}`);
    });

    return { success: true, services: data };

  } catch (e) {
    console.log('❌ Error:', e.message);
    return { success: false, services: [] };
  }
}

async function main() {
  console.log('Packlink PRO API Verification for Poland Domestic Shipping');
  console.log('=========================================================\n');

  // Test scenarios
  const scenarios = [
    {
      fromZip: '00-533',
      fromCity: 'Warszawa',
      toZip: '00-001',
      toCity: 'Warszawa (same city)',
      scenario: 'Same City - Warsaw to Warsaw'
    },
    {
      fromZip: '00-533',
      fromCity: 'Warszawa',
      toZip: '30-001',
      toCity: 'Kraków',
      scenario: 'Different City - Warsaw to Kraków (~300km)'
    },
    {
      fromZip: '00-533',
      fromCity: 'Warszawa',
      toZip: '80-001',
      toCity: 'Gdańsk',
      scenario: 'Different Region - Warsaw to Gdańsk (~350km)'
    }
  ];

  const results = [];

  for (const test of scenarios) {
    const result = await testPacklinkPRO(
      test.fromZip,
      test.fromCity,
      test.toZip,
      test.toCity,
      test.scenario
    );
    results.push({ ...test, ...result });
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70) + '\n');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.scenario}`);
    console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Services returned: ${result.services.length}`);
    if (result.services.length > 0) {
      console.log(`   Sample carrier: ${result.services[0].carrier_name}`);
      console.log(`   Sample price: ${result.services[0].price.total_price} ${result.services[0].price.currency}`);
      console.log(`   Has delivery time: ${result.services[0].transit_time ? 'Yes' : 'No'}`);
    }
    console.log('');
  });

  const totalServices = results.reduce((sum, r) => sum + r.services.length, 0);
  const allEmpty = results.every(r => r.services.length === 0);

  console.log('Total services across all scenarios:', totalServices);
  
  if (allEmpty) {
    console.log('\n⚠️  CRITICAL FINDING: Packlink PRO returned NO services for Poland domestic shipping.');
    console.log('   This confirms that Packlink PRO does NOT support Poland domestic shipping.');
    console.log('   Furgonetka API is required for Poland domestic shipping.');
  } else if (totalServices > 0) {
    console.log('\n✅ Packlink PRO returned services for Poland domestic shipping.');
    console.log('   Packlink PRO can be used for Poland domestic shipping.');
  }
}

main();
