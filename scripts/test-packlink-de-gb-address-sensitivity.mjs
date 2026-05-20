/**
 * Experiment: Test if Packlink Pro API returns different rates for different recipient addresses
 * 
 * Purpose: Determine whether Packlink Pro's rate calculation is location-independent for domestic DE/GB shipping
 * 
 * Test: Call Packlink Pro services API with two different DE addresses and two different GB addresses, compare results
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.PACKLINK_PRO_API;
const BASE_URL = 'https://api.packlink.com/v1/services';

// Common package data (identical for all calls)
const PACKAGE = {
  width: 15,
  height: 15,
  length: 15,
  weight: 1.5 // kg
};

// Germany test addresses (sender: München 80333)
const DE_ADDRESS_1 = {
  city: 'München',
  postalCode: '80331',
  description: 'Munich city center (close, ~2km)'
};

const DE_ADDRESS_2 = {
  city: 'Berlin',
  postalCode: '10115',
  description: 'Berlin (far, ~584km)'
};

// GB test addresses (sender: London W8 4LF)
const GB_ADDRESS_1 = {
  city: 'London',
  postalCode: 'E1 6AN',
  description: 'London East End (close, ~5km)'
};

const GB_ADDRESS_2 = {
  city: 'Manchester',
  postalCode: 'M1 1AE',
  description: 'Manchester (far, ~340km)'
};

/**
 * Build query parameters for Packlink Pro API
 */
function buildParams(fromCountry, fromZip, toCountry, toZip) {
  const params = new URLSearchParams();
  params.set('from[country]', fromCountry);
  params.set('from[zip]', fromZip);
  params.set('to[country]', toCountry);
  params.set('to[zip]', toZip);
  params.set('packages[0][width]', String(PACKAGE.width));
  params.set('packages[0][height]', String(PACKAGE.height));
  params.set('packages[0][length]', String(PACKAGE.length));
  params.set('packages[0][weight]', String(PACKAGE.weight));
  return params;
}

/**
 * Fetch rates from Packlink Pro API
 */
async function fetchRates(fromCountry, fromZip, toCountry, toZip, label) {
  console.log(`\n=== Testing ${label} (${toZip}) ===`);
  
  const params = buildParams(fromCountry, fromZip, toCountry, toZip);
  const url = `${BASE_URL}?${params}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`API rejected request: ${error.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.error('No services returned');
      return null;
    }

    const services = data;
    console.log(`Received ${services.length} services`);
    
    // Extract rates for comparison
    const rates = services.map(s => ({
      carrier: s.carrier_name,
      service: s.name,
      price: s.price?.total_price,
      currency: s.price?.currency,
      transitHours: s.transit_hours
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
    console.log('Conclusion: Packlink Pro API returns location-independent rates for this route');
  } else {
    console.log('\n❌ RATES DIFFER');
    console.log('Differences found:');
    differences.forEach(d => console.log('  -', d));
    console.log('\nConclusion: Packlink Pro API returns location-dependent rates');
  }
  
  // Show sample rates
  console.log('\n=== SAMPLE RATES ===');
  console.log(`${label1}:`);
  rates1.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} ${r.currency} (${r.transitHours}h)`));
  console.log(`${label2}:`);
  rates2.slice(0, 5).forEach(r => console.log(`  ${r.carrier} - ${r.service}: ${r.price} ${r.currency} (${r.transitHours}h)`));
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('Packlink Pro Address Sensitivity Test');
  console.log('========================================');
  
  if (!API_KEY) {
    console.error('❌ Missing PACKLINK_PRO_API environment variable');
    process.exit(1);
  }
  
  // Get sender addresses from .env
  const deSenderZip = process.env.SENDER_ADDRESS_DE_ZIP || '80333';
  const gbSenderZip = process.env.SENDER_ADDRESS_GB_ZIP || 'W8 4LF';
  
  console.log(`\nDE Sender: ${process.env.SENDER_ADDRESS_DE_CITY} (${deSenderZip})`);
  console.log(`GB Sender: ${process.env.SENDER_ADDRESS_GB_CITY} (${gbSenderZip})`);
  console.log(`Package: ${PACKAGE.width}x${PACKAGE.height}x${PACKAGE.length}cm, ${PACKAGE.weight}kg`);
  
  // Test Germany
  console.log('\n\n========================================');
  console.log('GERMANY (DE) TESTS');
  console.log('========================================');
  
  const deRates1 = await fetchRates('DE', deSenderZip, 'DE', DE_ADDRESS_1.postalCode, DE_ADDRESS_1.description);
  const deRates2 = await fetchRates('DE', deSenderZip, 'DE', DE_ADDRESS_2.postalCode, DE_ADDRESS_2.description);
  
  compareRates(
    deRates1,
    deRates2,
    DE_ADDRESS_1.description,
    DE_ADDRESS_2.description
  );
  
  // Test Great Britain
  console.log('\n\n========================================');
  console.log('GREAT BRITAIN (GB) TESTS');
  console.log('========================================');
  
  const gbRates1 = await fetchRates('GB', gbSenderZip, 'GB', GB_ADDRESS_1.postalCode, GB_ADDRESS_1.description);
  const gbRates2 = await fetchRates('GB', gbSenderZip, 'GB', GB_ADDRESS_2.postalCode, GB_ADDRESS_2.description);
  
  compareRates(
    gbRates1,
    gbRates2,
    GB_ADDRESS_1.description,
    GB_ADDRESS_2.description
  );
  
  console.log('\n\n========================================');
  console.log('EXPERIMENT COMPLETE');
  console.log('========================================');
}

main().catch(console.error);
