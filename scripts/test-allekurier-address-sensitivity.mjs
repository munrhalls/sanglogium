/**
 * Experiment: Test if AlleKurier API returns different rates for different recipient addresses
 * 
 * Purpose: Determine whether AlleKurier's rate calculation is location-independent for domestic Poland shipping
 * 
 * Test: Call AlleKurier service_list API with two different Poland addresses, compare results
 */

import dotenv from 'dotenv';
dotenv.config();

const ENDPOINT = 'https://allekurier.pl/api_v1/service_list';

// Test addresses
const ADDRESS_1 = {
  city: 'Wrocław',
  postalCode: '54-129',
  street: 'Balonowa',
  streetNumber: '9'
};

const ADDRESS_2 = {
  city: 'Warszawa',
  postalCode: '01-971',
  street: 'Farysa',
  streetNumber: '35'
};

// Common parameters (identical for both calls)
const COMMON_PARAMS = {
  senderCountry: 'PL',
  senderZip: '00-533',
  package: {
    width: 22,
    height: 12,
    length: 25,
    weight: 0.9 // kg
  }
};

/**
 * Build form-encoded body for AlleKurier API
 */
function buildBody(recipientPostalCode) {
  const params = new URLSearchParams();
  params.set('User[email]', process.env.ALLEKURIER_EMAIL);
  params.set('User[password]', process.env.ALLEKURIER_PASSWORD);
  params.set('Order[package]', 'parcel');
  params.set('Order[cod]', '0');
  params.set('Order[insurance]', '0');
  params.set('Sender[country]', COMMON_PARAMS.senderCountry);
  params.set('Sender[postal_code]', COMMON_PARAMS.senderZip);
  params.set('Recipient[country]', 'PL');
  params.set('Recipient[postal_code]', recipientPostalCode);
  params.set('Packages[0][weight]', String(COMMON_PARAMS.package.weight));
  params.set('Packages[0][width]', String(COMMON_PARAMS.package.width));
  params.set('Packages[0][height]', String(COMMON_PARAMS.package.height));
  params.set('Packages[0][length]', String(COMMON_PARAMS.package.length));
  params.set('Packages[0][custom]', '0');
  return params;
}

/**
 * Fetch rates from AlleKurier API
 */
async function fetchRates(recipientPostalCode, label) {
  console.log(`\n=== Testing ${label} (${recipientPostalCode}) ===`);
  
  const body = buildBody(recipientPostalCode);
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      body: body,
    });

    const rawBody = await response.text();
    
    if (!response.ok) {
      console.error(`HTTP ${response.status} - API rejected request`);
      console.error('Response:', rawBody.substring(0, 200));
      return null;
    }

    const data = JSON.parse(rawBody);
    
    if (data.Error && Array.isArray(data.Error) && data.Error.length > 0) {
      console.error('API returned errors:', data.Error);
      return null;
    }

    if (!data.Response || !Array.isArray(data.Response)) {
      console.error('Unexpected response structure');
      return null;
    }

    const services = data.Response;
    console.log(`Received ${services.length} services`);
    
    // Extract rates for comparison
    const rates = services.map(s => ({
      carrier: s.Carrier?.name,
      service: s.Service?.name,
      price: s.Order?.gross
    }));
    
    return rates;
  } catch (error) {
    console.error('Fetch failed:', error.message);
    return null;
  }
}

/**
 * Compare two rate arrays
 */
function compareRates(rates1, rates2, label1, label2) {
  console.log('\n=== COMPARISON ===');
  console.log(`${label1}: ${rates1?.length || 0} services`);
  console.log(`${label2}: ${rates2?.length || 0} services`);
  
  if (!rates1 || !rates2) {
    console.log('\n❌ Cannot compare - one or both API calls failed');
    return;
  }
  
  if (rates1.length !== rates2.length) {
    console.log('\n⚠️  Different number of services returned');
  }
  
  // Check if all rates are identical
  let allIdentical = true;
  let differences = [];
  
  const maxLen = Math.max(rates1.length, rates2.length);
  
  for (let i = 0; i < maxLen; i++) {
    const r1 = rates1[i];
    const r2 = rates2[i];
    
    if (!r1 || !r2) {
      differences.push(`Index ${i}: Missing in one result`);
      allIdentical = false;
      continue;
    }
    
    if (r1.price !== r2.price) {
      differences.push(`Index ${i}: ${r1.carrier} - ${r1.service}: ${r1.price} vs ${r2.price}`);
      allIdentical = false;
    }
  }
  
  if (allIdentical) {
    console.log('\n✅ ALL RATES ARE IDENTICAL');
    console.log('Conclusion: AlleKurier API returns location-independent rates for domestic Poland');
  } else {
    console.log('\n❌ RATES DIFFER');
    console.log('Differences found:');
    differences.forEach(d => console.log('  -', d));
    console.log('\nConclusion: AlleKurier API returns location-dependent rates');
  }
  
  // Show sample rates
  console.log('\n=== SAMPLE RATES ===');
  console.log(`${label1}:`);
  rates1.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} zł`));
  console.log(`${label2}:`);
  rates2.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} zł`));
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('AlleKurier Address Sensitivity Test');
  console.log('========================================');
  
  if (!process.env.ALLEKURIER_EMAIL || !process.env.ALLEKURIER_PASSWORD) {
    console.error('❌ Missing ALLEKURIER_EMAIL or ALLEKURIER_PASSWORD environment variables');
    process.exit(1);
  }
  
  const rates1 = await fetchRates(ADDRESS_1.postalCode, `Wrocław (${ADDRESS_1.street} ${ADDRESS_1.streetNumber})`);
  const rates2 = await fetchRates(ADDRESS_2.postalCode, `Warszawa (${ADDRESS_2.street} ${ADDRESS_2.streetNumber})`);
  
  compareRates(
    rates1,
    rates2,
    `Wrocław (${ADDRESS_1.postalCode})`,
    `Warszawa (${ADDRESS_2.postalCode})`
  );
}

main().catch(console.error);
