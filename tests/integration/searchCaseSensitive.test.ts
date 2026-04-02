import { describe, it, expect } from 'vitest';
import { searchProductsFull } from '@/sanity/lib/products/searchProducts';

describe('Search - Case Insensitive Matching Test', () => {
  
  it('should fail with current case-sensitive search', async () => {
    console.log('='.repeat(60));
    console.log('CASE SENSITIVE SEARCH TEST');
    console.log('='.repeat(60));

    // Test case variations
    const testCases = [
      { query: 'Focal', expected: 'Should find "Focal" brand products' },
      { query: 'focal', expected: 'Should find "Focal" brand products (lowercase)' },
      { query: 'FOCAL', expected: 'Should find "Focal" brand products (uppercase)' },
      { query: 'Hifiman', expected: 'Should find "Hifiman" brand products' },
      { query: 'hifiman', expected: 'Should find "Hifiman" brand products (lowercase)' },
      { query: 'HIFIMAN', expected: 'Should find "Hifiman" brand products (uppercase)' }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: "${testCase.query}"`);
      console.log(`Expected: ${testCase.expected}`);
      
      const results = await searchProductsFull(testCase.query);
      console.log(`Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log('Sample results:');
        results.slice(0, 2).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} (${product.brand?.name}) - $${product.displayPrice}`);
        });
      }
      
      // Current implementation should be case-sensitive
      // This test will show which queries fail
      console.log(`Status: ${results.length > 0 ? 'PASS' : 'FAIL (expected with current implementation)'}`);
    }

    console.log('\n✅ CASE SENSITIVITY ANALYSIS COMPLETE');
    console.log('Expected: Some case variations should fail with current implementation');
    console.log('='.repeat(60));
  });

  it('should verify current search behavior with mixed case', async () => {
    console.log('\n🔍 MIXED CASE BEHAVIOR');
    
    // Test specific case that should currently fail
    const lowercaseQuery = 'focal';
    console.log(`Searching for: "${lowercaseQuery}"`);
    
    const results = await searchProductsFull(lowercaseQuery);
    console.log(`Results: ${results.length}`);
    
    // If brand is "Focal" (capital F), lowercase search should fail
    if (results.length === 0) {
      console.log('✅ EXPECTED FAILURE: Case-sensitive search working as designed');
      console.log('This confirms the issue exists and needs fixing');
    } else {
      console.log('⚠️  UNEXPECTED: Search already case-insensitive');
      console.log('May already be fixed or different behavior than expected');
    }
    
    console.log('Current search behavior verified');
  });
});
