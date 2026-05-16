#!/usr/bin/env node

/**
 * Packlink API Rate Calculation Validation Script
 * 
 * Validates that Packlink API returns properly calculated rates and timelines
 * across available carriers for different receiver addresses at varying distances.
 * 
 * Tests:
 * - Poland: 00-533 (Warszawa) → 00-001 (close), 01-001 (medium), 30-001 (Kraków, far)
 * - Germany: 80333 (München) → 80331 (close), 80539 (medium), 10115 (Berlin, far)
 * - UK: W8 4LF (London) → W1 0AX (close), E1 6AN (medium), M1 1AE (Manchester, far)
 */

import dotenv from 'dotenv';
dotenv.config();

const PACKLINK_API_KEY = process.env.PACKLINK_PRO_API;
const BASE_URL = 'https://api.packlink.com';

// Package dimensions for testing (standard small package)
const TEST_PACKAGE = {
  width: 15,
  height: 15,
  length: 15,
  weight: 1.5
};

// Test scenarios
const SCENARIOS = {
  poland: {
    sender: { country: 'PL', zip: '00-533' },
    receivers: [
      { zip: '01-001', description: 'Warsaw (close, ~2km)' },
      { zip: '05-100', description: 'Warsaw Praga (medium, ~5km)' },
      { zip: '30-001', description: 'Kraków (far, ~300km)' }
    ]
  },
  germany: {
    sender: { country: 'DE', zip: '80333' },
    receivers: [
      { zip: '80331', description: 'Munich city center (close)' },
      { zip: '80539', description: 'Munich different district (medium)' },
      { zip: '10115', description: 'Berlin (far, ~584km)' }
    ]
  },
  uk: {
    sender: { country: 'GB', zip: 'W8 4LF' },
    receivers: [
      { zip: 'W1 0AX', description: 'London West End (close)' },
      { zip: 'E1 6AN', description: 'London East End (medium)' },
      { zip: 'M1 1AE', description: 'Manchester (far, ~340km)' }
    ]
  }
};

async function fetchPacklinkRates(fromCountry, fromZip, toCountry, toZip) {
  // Based on Crystal SDK: services endpoint uses GET with nested query parameters
  // Format: from[country]=PL&from[zip]=00-533&to[country]=PL&to[zip]=00-001&packages[0][width]=15...
  const endpoint = `${BASE_URL}/v1/services`;
  
  const queryParams = new URLSearchParams({
    'from[country]': fromCountry,
    'from[zip]': fromZip,
    'to[country]': toCountry,
    'to[zip]': toZip,
    'packages[0][width]': TEST_PACKAGE.width.toString(),
    'packages[0][height]': TEST_PACKAGE.height.toString(),
    'packages[0][length]': TEST_PACKAGE.length.toString(),
    'packages[0][weight]': TEST_PACKAGE.weight.toString()
  });

  const url = `${endpoint}?${queryParams.toString()}`;

  console.log(`\n📦 Request: ${fromCountry} ${fromZip} → ${toCountry} ${toZip}`);
  console.log(`   URL: ${url}`);
  console.log(`   Method: GET`);
  console.log(`   Auth: Authorization header`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': PACKLINK_API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log(`   Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success!`);
      return data;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 200)}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

function analyzeRates(services) {
  if (!services || !Array.isArray(services) || services.length === 0) {
    return { count: 0, minPrice: null, maxPrice: null, minTransit: null, maxTransit: null };
  }

  const prices = services
    .map(s => s.price?.total_price)
    .filter(p => p !== null && p !== undefined);

  const transitTimes = services
    .map(s => parseInt(s.transit_hours) || 0)
    .filter(t => t > 0);

  return {
    count: services.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minTransit: Math.min(...transitTimes),
    maxTransit: Math.max(...transitTimes),
    carriers: [...new Set(services.map(s => s.carrier_name))]
  };
}

async function runScenario(countryName, scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${countryName.toUpperCase()}`);
  console.log(`Sender: ${scenario.sender.country} ${scenario.sender.zip}`);
  console.log(`${'='.repeat(60)}`);

  const results = [];

  for (const receiver of scenario.receivers) {
    const services = await fetchPacklinkRates(
      scenario.sender.country,
      scenario.sender.zip,
      scenario.sender.country,
      receiver.zip
    );

    const analysis = analyzeRates(services);

    results.push({
      receiver: receiver,
      services: services,
      analysis: analysis
    });

    if (services && services.length > 0) {
      console.log(`\n✅ ${receiver.description}`);
      console.log(`   Services found: ${analysis.count}`);
      console.log(`   Price range: ${analysis.minPrice} - ${analysis.maxPrice}`);
      console.log(`   Transit time: ${analysis.minTransit}h - ${analysis.maxTransit}h`);
      console.log(`   Carriers: ${analysis.carriers.slice(0, 5).join(', ')}${analysis.carriers.length > 5 ? '...' : ''}`);
      
      // Show first service details
      const first = services[0];
      console.log(`   Example: ${first.carrier_name} - ${first.name} - €${first.price?.total_price} - ${first.transit_hours}h`);
    } else {
      console.log(`\n❌ ${receiver.description}`);
      console.log(`   No services returned`);
    }
  }

  return results;
}

function validateDistanceVariation(results) {
  console.log(`\n📊 Distance Variation Analysis:`);
  
  const validResults = results.filter(r => r.services && r.services.length > 0);
  
  if (validResults.length < 2) {
    console.log(`   ⚠️  Insufficient valid results for distance analysis`);
    return false;
  }

  const prices = validResults.map(r => r.analysis.maxPrice);
  const transitTimes = validResults.map(r => r.analysis.maxTransit);

  const priceVariation = Math.max(...prices) - Math.min(...prices);
  const transitVariation = Math.max(...transitTimes) - Math.min(...transitTimes);

  console.log(`   Price variation: €${priceVariation.toFixed(2)}`);
  console.log(`   Transit time variation: ${transitVariation}h`);

  // Check if there's meaningful variation (at least 10% price difference or 2h transit difference)
  const hasPriceVariation = priceVariation > 0.5;
  const hasTransitVariation = transitVariation >= 2;

  if (hasPriceVariation || hasTransitVariation) {
    console.log(`   ✅ Rates/timelines vary appropriately with distance`);
    return true;
  } else {
    console.log(`   ⚠️  Limited variation detected - may need investigation`);
    return false;
  }
}

async function main() {
  console.log('Packlink API Rate Calculation Validation');
  console.log('=========================================\n');
  const apiKeyDisplay = PACKLINK_API_KEY ? PACKLINK_API_KEY.substring(0, 20) + '...' : 'NOT SET';
  console.log('API Key: ' + apiKeyDisplay);
  console.log('Base URL: ' + BASE_URL);
  console.log('Test Package: ' + TEST_PACKAGE.width + 'x' + TEST_PACKAGE.height + 'x' + TEST_PACKAGE.length + 'cm, ' + TEST_PACKAGE.weight + 'kg');

  const allResults = {};

  for (const [country, scenario] of Object.entries(SCENARIOS)) {
    const results = await runScenario(country, scenario);
    allResults[country] = results;
    validateDistanceVariation(results);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);

  for (const [country, results] of Object.entries(allResults)) {
    const successCount = results.filter(r => r.services && r.services.length > 0).length;
    const totalCount = results.length;
    console.log(`${country.toUpperCase()}: ${successCount}/${totalCount} successful`);
  }

  console.log(`\n✅ Validation complete`);
}

main().catch(console.error);
