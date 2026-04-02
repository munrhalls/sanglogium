import { sanityFetch } from './sanity/lib/client.ts';
import groq from 'groq';

// Test the exact GROQ query with brand filter
const testBrandFilter = async () => {
  try {
    // Test without brand filter first
    const allProducts = await sanityFetch({
      query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...3] {
        name,
        brand->name
      }`,
      params: { keys: ["o7c6baiuobsr7ni2y2vf22sh"] } // open-back key
    });
    
    console.log('Products in open-back (no filter):');
    allProducts.forEach((p, i) => {
      console.log(`${i}: ${p.name} - Brand: "${p.brand?.name || 'null'}"`);
    });
    
    // Test with brand filter
    const filteredProducts = await sanityFetch({
      query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->name == "Focal"][0...3] {
        name,
        brand->name
      }`,
      params: { keys: ["o7c6baiuobsr7ni2y2vf22sh"] }
    });
    
    console.log('\nProducts filtered by Focal:');
    if (filteredProducts.length === 0) {
      console.log('No Focal products found');
    } else {
      filteredProducts.forEach((p, i) => {
        console.log(`${i}: ${p.name} - Brand: "${p.brand?.name || 'null'}"`);
      });
    }
    
    // Test with different brand formats
    const focalVariations = ["Focal", "focal", "FOCAL"];
    for (const variation of focalVariations) {
      const test = await sanityFetch({
        query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->name == "${variation}"][0...1] {
          name,
          brand->name
        }`,
        params: { keys: ["o7c6baiuobsr7ni2y2vf22sh"] }
      });
      console.log(`\nBrand "${variation}": ${test.length} products`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testBrandFilter();
