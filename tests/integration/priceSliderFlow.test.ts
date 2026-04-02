import { describe, it, expect } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

describe('Price Slider End-to-End Flow', () => {
  // Entry state: products page for subcategory
  const openBackCategoryKey = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back headphones key

  it('traces complete flow: price slider min adjustment -> filtered products', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });

    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);

    // STEP 2: User action - slide price min to 179 (what slider actually generates)
    console.log('=== STEP 2: USER ACTION ===');
    const priceFilter = 'priceRange:min:179'; // This is what useFilterNuqs creates
    console.log(`Filter generated: ${priceFilter}`);

    // STEP 3: URL value collected - pass filter to GROQ construction
    console.log('=== STEP 3: URL VALUE PASSED TO GROQ ===');
    const filteredResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: [priceFilter]
    });

    console.log(`Filtered products returned: ${filteredResults.length}`);

    // STEP 4: Expected results - should show products >= $179
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');

    // This will fail initially because priceRange isn't handled in GROQ construction
    // The failure proves the disconnection point
    const expectedProducts = initialResults.filter(p => p.displayPrice >= 179);
    console.log(`Expected products >= $179: ${expectedProducts.length}`);

    // This assertion will fail, showing the exact disconnection
    expect(filteredResults.length).toBe(expectedProducts.length);

    // Log the actual products returned for debugging
    if (filteredResults.length > 0) {
      console.log('Products actually returned:');
      filteredResults.forEach(p => {
        console.log(`- ${p.name}: $${p.displayPrice}`);
      });
    } else {
      console.log('No products returned - this indicates the GROQ filter is not working');
    }

    // Log expected products for comparison
    console.log('Products that should be returned:');
    expectedProducts.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: price slider max adjustment -> filtered products', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });

    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);

    // STEP 2: User action - slide price max to 1000 (what slider actually generates)
    console.log('=== STEP 2: USER ACTION ===');
    const priceFilter = 'priceRange:max:1000'; // This is what useFilterNuqs creates
    console.log(`Filter generated: ${priceFilter}`);

    // STEP 3: URL value collected - pass filter to GROQ construction
    console.log('=== STEP 3: URL VALUE PASSED TO GROQ ===');
    const filteredResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: [priceFilter]
    });

    console.log(`Filtered products returned: ${filteredResults.length}`);

    // STEP 4: Expected results - should show products <= $1000
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');

    const expectedProducts = initialResults.filter(p => p.displayPrice <= 1000);
    console.log(`Expected products <= $1000: ${expectedProducts.length}`);

    expect(filteredResults.length).toBe(expectedProducts.length);

    // Log the actual products returned for debugging
    if (filteredResults.length > 0) {
      console.log('Products actually returned:');
      filteredResults.forEach(p => {
        console.log(`- ${p.name}: $${p.displayPrice}`);
      });
    } else {
      console.log('No products returned - this indicates the GROQ filter is not working');
    }

    // Log expected products for comparison
    console.log('Products that should be returned:');
    expectedProducts.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: stock slider adjustment -> filtered products', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });

    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);

    // STEP 2: User action - slide stock min to 5 (what slider actually generates)
    console.log('=== STEP 2: USER ACTION ===');
    const stockFilter = 'stockMin:5'; // This is what useFilterNuqs creates
    console.log(`Filter generated: ${stockFilter}`);

    // STEP 3: URL value collected - pass filter to GROQ construction
    console.log('=== STEP 3: URL VALUE PASSED TO GROQ ===');
    const filteredResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: [stockFilter]
    });

    console.log(`Filtered products returned: ${filteredResults.length}`);

    // STEP 4: Expected results - should show products with stock >= 5
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');

    // Note: stock filtering isn't implemented yet, so this will show the disconnection
    console.log(`Expected products with stock >= 5: [UNKNOWN - stock field not in schema]`);

    // For now, just verify the flow works even if results are 0
    expect(Array.isArray(filteredResults)).toBe(true);

    // Log the actual products returned for debugging
    if (filteredResults.length > 0) {
      console.log('Products actually returned:');
      filteredResults.forEach(p => {
        console.log(`- ${p.name}: [STOCK DATA NOT AVAILABLE]`);
      });
    } else {
      console.log('No products returned - stock filtering may not be implemented yet');
    }
  });
});
