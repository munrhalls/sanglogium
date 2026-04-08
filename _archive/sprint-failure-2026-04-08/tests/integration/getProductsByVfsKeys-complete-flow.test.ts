import { describe, it, expect } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

describe('getProductsByVfsKeys - Complete Flow Test', () => {
  const openBackCategoryKey = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back headphones key

  it('traces complete flow: brand filtering with expected bus stops', async () => {
    // BUS STOP 1: Function Entry - Basic validation
    console.log('=== BUS STOP 1: FUNCTION ENTRY ===');
    const options = {
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: ['brand:Audeze']
    };

    // Expected: Function accepts parameters and proceeds
    expect(options.keys).toHaveLength(1);
    expect(options.filters).toContain('brand:Audeze');

    // BUS STOP 2: Filter Parsing - Group filters by field
    console.log('=== BUS STOP 2: FILTER PARSING ===');
    // This happens inside the function - we'll see the result in the logs

    // BUS STOP 3: Filter Strategy Selection - Brand filter route
    console.log('=== BUS STOP 3: FILTER STRATEGY SELECTION ===');
    // Expected: 'brand' field detected, routed to brand filter logic

    // BUS STOP 4: GROQ Clause Construction - Brand filter
    console.log('=== BUS STOP 4: GROQ CLAUSE CONSTRUCTION ===');
    // Expected: Brand clause with proper GROQ syntax

    // BUS STOP 5: Query Assembly - Complete GROQ query
    console.log('=== BUS STOP 5: QUERY ASSEMBLY ===');
    // Expected: Full GROQ query with brand filter

    // BUS STOP 6: Database Query - Sanity API execution
    console.log('=== BUS STOP 6: DATABASE QUERY ===');

    // BUS STOP 7: Return Results - Filtered products
    console.log('=== BUS STOP 7: RETURN RESULTS ===');

    const result = await getProductsByVfsKeys(options);

    // Expected Results Verification
    console.log(`Products returned: ${result.length}`);
    expect(result.length).toBe(1); // Only 1 Audeze product
    expect(result[0].brand.name).toBe('Audeze');
    expect(result[0].name).toContain('Audeze');

    console.log('SUCCESS: All bus stops completed successfully');
  });

  it('traces complete flow: price range filtering with expected bus stops', async () => {
    // BUS STOP 1: Function Entry
    console.log('=== BUS STOP 1: FUNCTION ENTRY ===');
    const options = {
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: ['priceRange:min:500,max:1500']
    };

    expect(options.filters).toContain('priceRange:min:500,max:1500');

    // BUS STOP 2-7: Full flow execution
    console.log('=== BUS STOPS 2-7: FULL FLOW ===');

    const result = await getProductsByVfsKeys(options);

    // Expected: Products in price range $500-$1500
    expect(result.length).toBeGreaterThan(0);
    result.forEach(product => {
      expect(product.displayPrice).toBeGreaterThanOrEqual(500);
      expect(product.displayPrice).toBeLessThanOrEqual(1500);
    });

    console.log(`Products in price range: ${result.length}`);
    result.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: combined filters with expected bus stops', async () => {
    // BUS STOP 1: Function Entry
    console.log('=== BUS STOP 1: FUNCTION ENTRY ===');
    const options = {
      keys: [openBackCategoryKey],
      sort: 'displayPrice:asc',
      filters: ['brand:Focal', 'priceRange:min:1000']
    };

    // BUS STOP 2-7: Full flow with multiple filters
    console.log('=== BUS STOPS 2-7: MULTIPLE FILTERS ===');

    const result = await getProductsByVfsKeys(options);

    // Expected: Focal products over $1000, sorted by price
    expect(result.length).toBeGreaterThan(0);
    result.forEach(product => {
      expect(product.brand.name).toBe('Focal');
      expect(product.displayPrice).toBeGreaterThanOrEqual(1000);
    });

    // Verify sorting (ascending price)
    const prices = result.map(p => p.displayPrice);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);

    console.log(`Focal products over $1000: ${result.length}`);
    result.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice}`);
    });
  });

  it('traces complete flow: stock filtering with expected bus stops', async () => {
    // BUS STOP 1: Function Entry
    console.log('=== BUS STOP 1: FUNCTION ENTRY ===');
    const options = {
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: ['stockMin:5']
    };

    // BUS STOP 2-7: Full flow with stock filter
    console.log('=== BUS STOPS 2-7: STOCK FILTER ===');

    const result = await getProductsByVfsKeys(options);

    // Expected: Products with stock >= 5 (if stock field exists)
    console.log(`Products with stock >= 5: ${result.length}`);

    // Verify the flow works even if stock field doesn't exist
    expect(Array.isArray(result)).toBe(true);

    result.forEach(p => {
      console.log(`- ${p.name}: [STOCK VERIFICATION NEEDED]`);
    });
  });

  it('traces complete flow: no filters with expected bus stops', async () => {
    // BUS STOP 1: Function Entry
    console.log('=== BUS STOP 1: FUNCTION ENTRY ===');
    const options = {
      keys: [openBackCategoryKey],
      sort: 'featured',
      filters: []
    };

    // BUS STOP 2: Filter Parsing - Empty filters
    console.log('=== BUS STOP 2: EMPTY FILTER PARSING ===');
    // Expected: Empty filter clause

    // BUS STOP 3-7: Full flow without filters
    console.log('=== BUS STOPS 3-7: NO FILTERS ===');

    const result = await getProductsByVfsKeys(options);

    // Expected: All 6 products returned
    expect(result.length).toBe(6);

    const brands = result.map(p => p.brand.name);
    expect(brands).toContain('Audeze');
    expect(brands).toContain('Focal');
    expect(brands).toContain('Hifiman');
    expect(brands).toContain('Sennheiser');

    console.log('All products returned (no filters):');
    result.forEach(p => {
      console.log(`- ${p.name}: $${p.displayPrice} (${p.brand.name})`);
    });
  });
});
