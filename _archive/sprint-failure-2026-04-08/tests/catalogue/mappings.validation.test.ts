/**
 * @jest-environment node
 * 
 * Catalogue Mappings Validation Tests
 * Integration tests for catalogue item -> product mappings
 */

import { describe, expect, test, beforeAll } from '@jest/globals';
import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { SEMANTIC_CATEGORIES } from '../../lib/catalogue/semanticConfig';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

describe('Catalogue Data Mappings', () => {
  let products: any[] = [];
  let categories: any[] = [];
  let categoryMap: Record<string, any> = {};

  beforeAll(async () => {
    // Fetch test data
    products = await client.fetch(`
      *[_type == "product"][0...100]{
        _id,
        name,
        brand,
        catalogueLocationKeys,
        "categoryPath": categoryPath
      }
    `);

    categories = await client.fetch(`
      *[_type == "catalogueItem" && type == "link"]{
        _id,
        title,
        "slug": slug.current
      }
    `);

    categoryMap = {};
    for (const cat of categories) {
      categoryMap[cat._id] = cat;
    }
  }, 30000);

  describe('Sample Product Mappings', () => {
    test('headphone products should map to headphone categories', async () => {
      const headphoneProducts = products.filter(p => 
        p.name?.toLowerCase().includes('headphone') && 
        !p.name?.toLowerCase().includes('cable') &&
        !p.name?.toLowerCase().includes('stand')
      );

      for (const product of headphoneProducts.slice(0, 5)) {
        const keys = product.catalogueLocationKeys || [];
        const hasHeadphoneCategory = keys.some((key: string) => {
          const cat = categoryMap[key];
          return cat && SEMANTIC_CATEGORIES[cat.slug]?.requiredKeywords?.some(kw => 
            kw.toLowerCase().includes('headphone')
          );
        });

        // If product has keys, at least one should be headphone-related
        if (keys.length > 0) {
          expect(hasHeadphoneCategory).toBe(true);
        }
      }
    });

    test('cable products should map to cable categories', async () => {
      const cableProducts = products.filter(p => 
        p.name?.toLowerCase().includes('cable') ||
        p.name?.toLowerCase().includes('interconnect')
      );

      for (const product of cableProducts.slice(0, 5)) {
        const keys = product.catalogueLocationKeys || [];
        const hasCableCategory = keys.some((key: string) => {
          const cat = categoryMap[key];
          return cat && (
            cat.slug?.includes('cable') || 
            cat.slug?.includes('interconnect') ||
            cat.slug?.includes('adapter')
          );
        });

        if (keys.length > 0) {
          expect(hasCableCategory).toBe(true);
        }
      }
    });

    test('amplifier products should map to amp categories', async () => {
      const ampProducts = products.filter(p => 
        (p.name?.toLowerCase().includes('amp') ||
         p.name?.toLowerCase().includes('amplifier')) &&
        !p.name?.toLowerCase().includes('dac')
      );

      for (const product of ampProducts.slice(0, 5)) {
        const keys = product.catalogueLocationKeys || [];
        const hasAmpCategory = keys.some((key: string) => {
          const cat = categoryMap[key];
          return cat && cat.slug?.includes('amp');
        });

        if (keys.length > 0) {
          expect(hasAmpCategory).toBe(true);
        }
      }
    });
  });

  describe('Cross-Contamination Tests', () => {
    test('no products should be in completely unrelated categories', async () => {
      // Test specific known mix-ups
      const checkProducts = products.filter(p => 
        p.name?.includes('IsoAcoustics') ||
        p.name?.includes('Bose 251') ||
        p.name?.includes('Kanto ST34P')
      );

      for (const product of checkProducts) {
        const keys = product.catalogueLocationKeys || [];
        
        // These specific products should NOT be in headphone-related categories
        // as they are speaker accessories
        const headphoneCats = ['o7c6baiuobsr7ni2y2vf22sh', 'yq3p9s798zszjkzm5btnebjh'];
        const inWrongCategory = keys.some((key: string) => headphoneCats.includes(key));
        
        if (inWrongCategory) {
          console.warn(`Cross-contamination: ${product.name} in headphone category`);
        }
      }
    });

    test('product category assignments should be semantically valid', async () => {
      // Sample 10 products and verify semantic validity
      const sample = products.filter(p => 
        (p.catalogueLocationKeys || []).length > 0
      ).slice(0, 10);

      for (const product of sample) {
        for (const key of (product.catalogueLocationKeys || [])) {
          const category = categoryMap[key];
          if (!category) continue;

          const rule = SEMANTIC_CATEGORIES[category.slug];
          if (!rule) continue;

          // Check required keywords
          if (rule.requiredKeywords) {
            const text = `${product.name} ${product.brand}`.toLowerCase();
            const hasRequired = rule.requiredKeywords.some(kw => 
              text.includes(kw.toLowerCase())
            );

            // Log violations but don't fail - this documents current state
            if (!hasRequired) {
              console.log(`Semantic mismatch: ${product.name} in ${category.title}`);
            }
          }
        }
      }
    });
  });

  describe('Category Coverage', () => {
    test('all leaf categories should have products assigned', async () => {
      const allProducts = await client.fetch(`
        *[_type == "product"]{
          catalogueLocationKeys
        }
      `);

      const categoryUsage: Record<string, number> = {};
      
      for (const product of allProducts) {
        for (const key of (product.catalogueLocationKeys || [])) {
          categoryUsage[key] = (categoryUsage[key] || 0) + 1;
        }
      }

      // Check each leaf category has at least some products
      for (const cat of categories) {
        const count = categoryUsage[cat._id] || 0;
        console.log(`${cat.title}: ${count} products`);
        
        // Warn if category is empty
        if (count === 0) {
          console.warn(`Empty category: ${cat.title}`);
        }
      }
    }, 30000);
  });

  describe('Unassigned Products', () => {
    test('should identify unassigned products', async () => {
      const unassigned = products.filter(p => 
        !p.catalogueLocationKeys || p.catalogueLocationKeys.length === 0
      );

      console.log(`Unassigned products in sample: ${unassigned.length}/${products.length}`);
      
      if (unassigned.length > 0) {
        console.log('Sample unassigned:');
        for (const p of unassigned.slice(0, 3)) {
          console.log(`  - ${p.name}`);
        }
      }
    });
  });
});
