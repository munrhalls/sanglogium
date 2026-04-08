import { describe, it, expect } from 'vitest';
import { searchProductsFull } from '@/sanity/lib/products/searchProducts';

describe('Search - Professional Results Analysis', () => {
  
  it('should analyze what "professional" search actually finds', async () => {
    console.log('='.repeat(60));
    console.log('PROFESSIONAL SEARCH RESULTS ANALYSIS');
    console.log('='.repeat(60));

    const query = 'professional';
    console.log(`\n🔍 Analyzing search for: "${query}"`);
    
    const results = await searchProductsFull(query);
    console.log(`Total results: ${results.length}`);
    
    if (results.length > 0) {
      console.log('\n📋 Found products:');
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.brand?.name}) - $${product.displayPrice}`);
      });
      
      console.log('\n🤔 Analysis:');
      console.log('These results likely come from:');
      console.log('1. Product names containing "professional"');
      console.log('2. Brand names containing "professional"');
      console.log('3. Specifications with "professional"');
      console.log('4. Overview fields with "professional"');
      
      // Check if any results seem like actual professional gear
      const actualProfessionalGear = results.filter(product => 
        product.name.toLowerCase().includes('professional') ||
        product.brand?.name.toLowerCase().includes('professional')
      );
      
      console.log(`\n🎯 Products with "professional" in name/brand: ${actualProfessionalGear.length}`);
      actualProfessionalGear.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - $${product.displayPrice}`);
      });
      
    } else {
      console.log('❌ No results found');
    }
    
    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('='.repeat(60));
  });
});
