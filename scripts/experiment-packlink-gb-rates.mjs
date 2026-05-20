#!/usr/bin/env node

/**
 * Simple Packlink Pro API Experiment - Great Britain Shipping Rates
 * 
 * Fetches and displays shipping rates for a single GB route
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.PACKLINK_PRO_API;
const BASE_URL = 'https://api.packlink.com/v1/services';

// Simple test: London to Manchester
const FROM = { country: 'GB', zip: 'W8 4LF' };
const TO = { country: 'GB', zip: 'M1 1AE' };
const PACKAGE = { width: 15, height: 15, length: 15, weight: 1.5 };

async function fetchRates() {
  const params = new URLSearchParams({
    'from[country]': FROM.country,
    'from[zip]': FROM.zip,
    'to[country]': TO.country,
    'to[zip]': TO.zip,
    'packages[0][width]': PACKAGE.width.toString(),
    'packages[0][height]': PACKAGE.height.toString(),
    'packages[0][length]': PACKAGE.length.toString(),
    'packages[0][weight]': PACKAGE.weight.toString()
  });

  const url = `${BASE_URL}?${params}`;

  console.log('Packlink Pro API - GB Shipping Rates Experiment');
  console.log('='.repeat(50));
  console.log(`Route: ${FROM.zip} → ${TO.zip}`);
  console.log(`Package: ${PACKAGE.width}x${PACKAGE.height}x${PACKAGE.length}cm, ${PACKAGE.weight}kg`);
  console.log(`URL: ${url}`);
  console.log('');

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error: ${error}`);
      return;
    }

    const services = await response.json();

    if (!Array.isArray(services) || services.length === 0) {
      console.log('No services returned');
      return;
    }

    console.log(`\n✅ ${services.length} services found:\n`);

    services.forEach((service, i) => {
      console.log(`${i + 1}. ${service.carrier_name} - ${service.name}`);
      console.log(`   Price: ${service.price.total_price} ${service.price.currency}`);
      console.log(`   Transit: ${service.transit_hours}h (${service.transit_time})`);
      console.log(`   Delivery: ${service.first_estimated_delivery_date}`);
      console.log('');
    });

  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

fetchRates();
