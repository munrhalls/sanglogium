import { describe, it, expect } from 'vitest';
import { searchProductsAutocomplete } from '@/sanity/lib/products/searchProducts';

describe('Search Autocomplete - Overview Fields Test', () => {
  
  it('should fail with current autocomplete - overview fields not searched', async () => {
    console.log('='.repeat(60));
    console.log('AUTOCOMPLETE OVERVIEW FIELDS TEST - SHOULD FAIL');
    console.log('='.repeat(60));

    // Test autocomplete searches that should currently fail
    const autocompleteTests = [
      { query: 'professional', expected: 'Should find professional products in autocomplete' },
      { query: 'portable', expected: 'Should find portable products in autocomplete' },
      { query: 'studio', expected: 'Should find studio products in autocomplete' },
      { query: 'wireless', expected: 'Should find wireless products in autocomplete' }
    ];

    for (const test of autocompleteTests) {
      console.log(`\n🔍 Testing autocomplete: "${test.query}"`);
      console.log(`Expected: ${test.expected}`);
      
      const results = await searchProductsAutocomplete(test.query);
      console.log(`Autocomplete results: ${results.length}`);
      
      if (results.length === 0) {
        console.log('❌ EXPECTED FAILURE: No autocomplete matches found');
        console.log('This confirms autocomplete doesn\'t search overview fields');
      } else {
        console.log('✅ UNEXPECTED SUCCESS: Autocomplete already working');
        results.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} (${product.brand?.name}) - $${product.displayPrice}`);
        });
      }
      
      // Current autocomplete should fail for overview-based searches
      console.log(`Status: ${results.length === 0 ? 'FAIL (expected)' : 'PASS (unexpected)'}`);
    }

    console.log('\n✅ AUTOCOMPLETE OVERVIEW FIELDS ANALYSIS COMPLETE');
    console.log('Expected: Autocomplete searches should fail for overview-based queries');
    console.log('This confirms autocomplete needs overview fields added');
    console.log('='.repeat(60));
  });

  it('should verify specific "professional" autocomplete failure', async () => {
    console.log('\n🔍 SPECIFIC TEST: "professional" autocomplete failure');
    
    const query = 'professional';
    console.log(`Testing autocomplete: "${query}"`);
    
    const results = await searchProductsAutocomplete(query);
    console.log(`Autocomplete results: ${results.length}`);
    
    if (results.length === 0) {
      console.log('✅ CONFIRMED: "professional" autocomplete returns no results');
      console.log('Expected: Should return professional products in autocomplete dropdown');
      console.log('This confirms autocomplete doesn\'t search overview fields like full search');
    } else {
      console.log('⚠️  UNEXPECTED: "professional" autocomplete already works');
      results.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - $${product.displayPrice}`);
      });
    }
    
    // This test should currently fail (return 0 results)
    expect(results.length).toBe(0);
    console.log('✅ TEST FAILED AS EXPECTED - Ready for implementation');
  });

  it('should compare autocomplete vs full search results', async () => {
    console.log('\n🔍 COMPARISON TEST: Autocomplete vs Full Search');
    
    const query = 'professional';
    console.log(`Comparing results for: "${query}"`);
    
    // Test autocomplete (should fail)
    const autocompleteResults = await searchProductsAutocomplete(query);
    console.log(`Autocomplete results: ${autocompleteResults.length}`);
    
    // Test full search (should work)
    const { searchProductsFull } = await import('@/sanity/lib/products/searchProducts');
    const fullSearchResults = await searchProductsFull(query);
    console.log(`Full search results: ${fullSearchResults.length}`);
    
    console.log('\n📊 COMPARISON:');
    console.log(`Autocomplete: ${autocompleteResults.length} results`);
    console.log(`Full search: ${fullSearchResults.length} results`);
    console.log(`Difference: ${fullSearchResults.length - autocompleteResults.length} results`);
    
    if (autocompleteResults.length === 0 && fullSearchResults.length > 0) {
      console.log('✅ CONFIRMED: Autocomplete missing overview fields search');
      console.log('Full search works, autocomplete doesn\'t');
    } else if (autocompleteResults.length > 0) {
      console.log('⚠️  UNEXPECTED: Autocomplete already working');
    }
    
    // Autocomplete should have fewer results than full search
    expect(autocompleteResults.length).toBeLessThan(fullSearchResults.length);
    console.log('✅ COMPARISON TEST COMPLETE');
  });
});
