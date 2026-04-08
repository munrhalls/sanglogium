import { describe, it, expect } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

describe('Sorting End-to-End Flow', () => {
  // Entry state: products page for subcategory
  const openBackCategoryKey = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back headphones key

  it('traces complete flow: sort by price ascending -> products sorted correctly', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });
    
    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);
    
    // STEP 2: User action - select "Price: Low to High" in dropdown
    console.log('=== STEP 2: USER ACTION ===');
    const sortValue = 'displayPrice:asc'; // This is what the dropdown generates
    console.log(`Sort selected: ${sortValue}`);
    
    // STEP 3: URL value collected - pass sort to GROQ construction
    console.log('=== STEP 3: SORT VALUE PASSED TO GROQ ===');
    const sortedResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: sortValue,
      filters: []
    });
    
    console.log(`Sorted products returned: ${sortedResults.length}`);
    
    // STEP 4: Expected results - should show products sorted by price ascending
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');
    
    // Verify we have the same number of products
    expect(sortedResults.length).toBe(initialResults.length);
    
    // Verify products are actually sorted by price ascending
    const prices = sortedResults.map(p => p.displayPrice);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    console.log('Actual prices:', prices);
    console.log('Expected sorted prices:', sortedPrices);
    
    // Verify the sorting is correct
    expect(prices).toEqual(sortedPrices);
    
    // Log the actual products returned for verification
    console.log('Products actually returned (sorted by price):');
    sortedResults.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: sort by price descending -> products sorted correctly', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });
    
    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);
    
    // STEP 2: User action - select "Price: High to Low" in dropdown
    console.log('=== STEP 2: USER ACTION ===');
    const sortValue = 'displayPrice:desc'; // This is what the dropdown generates
    console.log(`Sort selected: ${sortValue}`);
    
    // STEP 3: URL value collected - pass sort to GROQ construction
    console.log('=== STEP 3: SORT VALUE PASSED TO GROQ ===');
    const sortedResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: sortValue,
      filters: []
    });
    
    console.log(`Sorted products returned: ${sortedResults.length}`);
    
    // STEP 4: Expected results - should show products sorted by price descending
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');
    
    // Verify we have the same number of products
    expect(sortedResults.length).toBe(initialResults.length);
    
    // Verify products are actually sorted by price descending
    const prices = sortedResults.map(p => p.displayPrice);
    const sortedPrices = [...prices].sort((a, b) => b - a);
    
    console.log('Actual prices:', prices);
    console.log('Expected sorted prices (descending):', sortedPrices);
    
    // Verify the sorting is correct
    expect(prices).toEqual(sortedPrices);
    
    // Log the actual products returned for verification
    console.log('Products actually returned (sorted by price descending):');
    sortedResults.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: sort by name ascending -> products sorted correctly', async () => {
    // STEP 1: Entry state - all products should show
    console.log('=== STEP 1: ENTRY STATE ===');
    const initialResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    });
    
    console.log(`Initial products: ${initialResults.length}`);
    expect(initialResults.length).toBe(6);
    
    // STEP 2: User action - select "Name: A to Z" in dropdown
    console.log('=== STEP 2: USER ACTION ===');
    const sortValue = 'name:asc'; // This is what the dropdown generates
    console.log(`Sort selected: ${sortValue}`);
    
    // STEP 3: URL value collected - pass sort to GROQ construction
    console.log('=== STEP 3: SORT VALUE PASSED TO GROQ ===');
    const sortedResults = await getProductsByVfsKeys({
      keys: [openBackCategoryKey],
      sort: sortValue,
      filters: []
    });
    
    console.log(`Sorted products returned: ${sortedResults.length}`);
    
    // STEP 4: Expected results - should show products sorted by name ascending
    console.log('=== STEP 4: EXPECTED RESULTS VERIFICATION ===');
    
    // Verify we have the same number of products
    expect(sortedResults.length).toBe(initialResults.length);
    
    // Verify products are actually sorted by name ascending
    const names = sortedResults.map(p => p.name);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    
    console.log('Actual names:', names);
    console.log('Expected sorted names:', sortedNames);
    
    // Verify the sorting is correct
    expect(names).toEqual(sortedNames);
    
    // Log the actual products returned for verification
    console.log('Products actually returned (sorted by name):');
    sortedResults.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });
});
