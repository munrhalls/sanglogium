/**
 * Experiment: Test if AlleKurier API actually uses postal codes for parcel rate calculation
 * 
 * Purpose: Verify if postal codes affect rates for parcel shipments
 * According to API docs: postal codes are "only for pallets", not for parcels
 */

import dotenv from 'dotenv';
dotenv.config();

const ENDPOINT = 'https://allekurier.pl/api_v1/service_list';

/**
 * Build body WITH postal codes (current implementation)
 */
function buildBodyWithPostalCodes(recipientPostalCode) {
  const params = new URLSearchParams();
  params.set('User[email]', process.env.ALLEKURIER_EMAIL);
  params.set('User[password]', process.env.ALLEKURIER_PASSWORD);
  params.set('Order[package]', 'parcel');
  params.set('Order[cod]', '0');
  params.set('Order[insurance]', '0');
  params.set('Sender[country]', 'PL');
  params.set('Sender[postal_code]', '00-533'); // WITH postal code
  params.set('Recipient[country]', 'PL');
  params.set('Recipient[postal_code]', recipientPostalCode); // WITH postal code
  params.set('Packages[0][weight]', '0.9');
  params.set('Packages[0][width]', '22');
  params.set('Packages[0][height]', '12');
  params.set('Packages[0][length]', '25');
  params.set('Packages[0][custom]', '0');
  return params;
}

/**
 * Build body WITHOUT postal codes (test if API cares)
 */
function buildBodyWithoutPostalCodes() {
  const params = new URLSearchParams();
  params.set('User[email]', process.env.ALLEKURIER_EMAIL);
  params.set('User[password]', process.env.ALLEKURIER_PASSWORD);
  params.set('Order[package]', 'parcel');
  params.set('Order[cod]', '0');
  params.set('Order[insurance]', '0');
  params.set('Sender[country]', 'PL');
  // NO Sender[postal_code]
  params.set('Recipient[country]', 'PL');
  // NO Recipient[postal_code]
  params.set('Packages[0][weight]', '0.9');
  params.set('Packages[0][width]', '22');
  params.set('Packages[0][height]', '12');
  params.set('Packages[0][length]', '25');
  params.set('Packages[0][custom]', '0');
  return params;
}

/**
 * Fetch rates
 */
async function fetchRates(body, label) {
  console.log(`\n=== Testing: ${label} ===`);
  console.log('Parameters sent:');
  for (const [key, value] of body.entries()) {
    console.log(`  ${key}=${value}`);
  }
  
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
 * Compare results
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
  
  let allIdentical = true;
  
  for (let i = 0; i < Math.max(rates1.length, rates2.length); i++) {
    const r1 = rates1[i];
    const r2 = rates2[i];
    
    if (!r1 || !r2) {
      allIdentical = false;
      continue;
    }
    
    if (r1.price !== r2.price) {
      allIdentical = false;
    }
  }
  
  if (allIdentical) {
    console.log('\n✅ RATES ARE IDENTICAL');
    console.log('Conclusion: Postal codes do NOT affect parcel rate calculation');
  } else {
    console.log('\n❌ RATES DIFFER');
    console.log('Conclusion: Postal codes DO affect parcel rate calculation');
  }
  
  console.log('\n=== SAMPLE RATES ===');
  console.log(`${label1}:`);
  rates1.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} zł`));
  console.log(`${label2}:`);
  rates2.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} zł`));
}

async function main() {
  console.log('========================================');
  console.log('AlleKurier Postal Code Impact Test');
  console.log('Testing: Do postal codes affect parcel rates?');
  console.log('========================================');
  
  if (!process.env.ALLEKURIER_EMAIL || !process.env.ALLEKURIER_PASSWORD) {
    console.error('❌ Missing ALLEKURIER_EMAIL or ALLEKURIER_PASSWORD environment variables');
    process.exit(1);
  }
  
  // Test 1: WITH postal codes (current implementation)
  const ratesWithPostalCodes = await fetchRates(
    buildBodyWithPostalCodes('54-129'),
    'WITH postal codes (Wrocław 54-129)'
  );
  
  // Test 2: WITHOUT postal codes
  const ratesWithoutPostalCodes = await fetchRates(
    buildBodyWithoutPostalCodes(),
    'WITHOUT postal codes'
  );
  
  compareRates(
    ratesWithPostalCodes,
    ratesWithoutPostalCodes,
    'With postal codes',
    'Without postal codes'
  );
}

main().catch(console.error);
