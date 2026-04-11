// Redis debugging script for Upstash connectivity verification
// Standalone script to diagnose Redis issues

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('=== Redis Debug Script ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET');
console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'NOT SET');
console.log('');

// Test 1: Basic Redis connection
async function testBasicConnection() {
  console.log('Test 1: Basic Redis Connection');
  console.log('----------------------------');
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test simple PING
    console.log('Testing PING...');
    const pingResult = await redis.ping();
    console.log('PING Result:', pingResult);

    // Test SET/GET
    console.log('\nTesting SET/GET...');
    const testKey = `debug_test_${Date.now()}`;
    const testValue = 'test_value_' + Date.now();
    
    await redis.set(testKey, testValue);
    console.log('SET successful');
    
    const getValue = await redis.get(testKey);
    console.log('GET Result:', getValue);
    
    if (getValue === testValue) {
      console.log('SET/GET test: PASSED');
    } else {
      console.log('SET/GET test: FAILED - Value mismatch');
    }
    
    // Cleanup
    await redis.del(testKey);
    console.log('Test key deleted');
    
    return true;
  } catch (error) {
    console.error('Basic connection test FAILED:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    return false;
  }
}

// Test 2: Direct HTTP request to Upstash REST API
async function testDirectHttp() {
  console.log('\n\nTest 2: Direct HTTP Request to Upstash REST API');
  console.log('-----------------------------------------------');
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.log('ERROR: Missing URL or token');
    return false;
  }

  try {
    // Test PING via REST API
    const pingUrl = `${url}/ping`;
    console.log('Testing direct PING to:', pingUrl);
    
    const response = await fetch(pingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([]),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (response.ok) {
      console.log('Direct HTTP test: PASSED');
      return true;
    } else {
      console.log('Direct HTTP test: FAILED');
      return false;
    }
  } catch (error) {
    console.error('Direct HTTP test FAILED:', error);
    return false;
  }
}

// Test 3: Check if URL is accessible
async function testUrlAccessibility() {
  console.log('\n\nTest 3: URL Accessibility Check');
  console.log('--------------------------------');
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  
  if (!url) {
    console.log('ERROR: No URL provided');
    return false;
  }

  try {
    // Parse URL to get hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    console.log('Hostname:', hostname);
    console.log('Full URL:', url);
    
    // Try to resolve hostname
    // Note: This is a simple check - DNS resolution happens automatically
    const testUrl = `https://${hostname}`;
    console.log('Testing accessibility of:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Redis-Debug-Script/1.0',
      },
    });

    console.log('Response status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      console.log('URL is accessible but requires authentication (expected)');
      return true;
    } else if (response.ok) {
      console.log('URL is accessible');
      return true;
    } else {
      console.log('URL returned unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('URL accessibility test FAILED:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Redis debugging...\n');
  
  const results = {
    basicConnection: await testBasicConnection(),
    directHttp: await testDirectHttp(),
    urlAccessibility: await testUrlAccessibility(),
  };
  
  console.log('\n\n=== Test Results Summary ===');
  console.log('Basic Connection:', results.basicConnection ? 'PASSED' : 'FAILED');
  console.log('Direct HTTP:', results.directHttp ? 'PASSED' : 'FAILED');
  console.log('URL Accessibility:', results.urlAccessibility ? 'PASSED' : 'FAILED');
  
  if (results.basicConnection && results.directHttp) {
    console.log('\nCONCLUSION: Redis connection is working properly');
    console.log('The issue might be in the application code or environment');
  } else if (results.urlAccessibility) {
    console.log('\nCONCLUSION: Upstash URL is accessible but authentication or API is failing');
    console.log('RECOMMENDATION: Check token validity and API format');
  } else {
    console.log('\nCONCLUSION: Cannot reach Upstash servers');
    console.log('RECOMMENDATION: Check network connectivity and URL');
  }
}

// Execute
runAllTests().catch(console.error);
