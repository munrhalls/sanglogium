// Simple test to check if filters are generated
const { getFiltersForCategoryPath } = require('./sanity/lib/products/filter/getFiltersForCategoryPath.ts');

async function testFilters() {
  try {
    const filters = await getFiltersForCategoryPath(['o7c6baiuobsr7ni2y2vf22sh']);
    console.log('Filters:', JSON.stringify(filters, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testFilters();
