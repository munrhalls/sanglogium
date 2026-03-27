#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
import { config } from 'dotenv';
config();

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

async function enrichUnmappedProducts() {
  console.log('Enriching unmapped products with detailed data...');
  
  const unmappedFile = join(process.cwd(), 'catalog_temporary', '01-unmapped-products.md');
  const content = readFileSync(unmappedFile, 'utf8');
  const lines = content.split('\n');
  
  // Find product lines and extract IDs
  const productLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\d+\.\s`[^`]+`\s*-\s*.+/)) {
      const match = line.match(/^\d+\.\s`([^`]+)`\s*-\s*(.+)/);
      if (match) {
        productLines.push({
          lineNumber: i,
          productId: match[1],
          productName: match[2],
          originalLine: line
        });
      }
    }
  }
  
  console.log(`Found ${productLines.length} products to enrich`);
  
  // Fetch detailed data for each product
  const enrichedData = [];
  for (let i = 0; i < productLines.length; i++) {
    const product = productLines[i];
    console.log(`Fetching data for product ${i + 1}/${productLines.length}: ${product.productId}`);
    
    try {
      const query = `*[_type == "product" && _id == $productId][0]{name, slug, brand, overviewFields, specifications}`;
      const productData = await client.fetch(query, { productId: product.productId });
      
      if (productData) {
        enrichedData.push({
          productId: product.productId,
          productName: product.productName,
          data: productData
        });
      } else {
        enrichedData.push({
          productId: product.productId,
          productName: product.productName,
          data: null
        });
      }
    } catch (error) {
      console.error(`Error fetching ${product.productId}: ${error.message}`);
      enrichedData.push({
        productId: product.productId,
        productName: product.productName,
        data: null
      });
    }
  }
  
  // Rebuild the file with enriched data
  const newLines = [];
  let currentProductIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^\d+\.\s`[^`]+`\s*-\s*.+/)) {
      // This is a product line - replace with enriched version
      const enriched = enrichedData[currentProductIndex];
      
      if (enriched.data) {
        newLines.push(line);
        newLines.push(`  Name: ${enriched.data.name || 'N/A'}`);
        newLines.push(`  Slug: ${enriched.data.slug?.current || 'N/A'}`);
        newLines.push(`  Brand: ${enriched.data.brand || 'N/A'}`);
        
        if (enriched.data.overviewFields && enriched.data.overviewFields.length > 0) {
          newLines.push(`  Overview Fields (${enriched.data.overviewFields.length}):`);
          enriched.data.overviewFields.forEach((field, idx) => {
            const value = field.value ? field.value.substring(0, 80) + (field.value.length > 80 ? '...' : '') : 'N/A';
            newLines.push(`    ${idx + 1}. ${field.title || 'N/A'}: ${value}`);
          });
        } else {
          newLines.push(`  Overview Fields: None`);
        }
        
        if (enriched.data.specifications && enriched.data.specifications.length > 0) {
          newLines.push(`  Specifications (${enriched.data.specifications.length}):`);
          enriched.data.specifications.forEach((spec, idx) => {
            const value = spec.value ? spec.value.substring(0, 80) + (spec.value.length > 80 ? '...' : '') : 'N/A';
            newLines.push(`    ${idx + 1}. ${spec.title || 'N/A'}: ${value}`);
          });
        } else {
          newLines.push(`  Specifications: None`);
        }
        
        newLines.push('');
      } else {
        newLines.push(line);
        newLines.push(`  Error: Could not fetch product data`);
        newLines.push('');
      }
      
      currentProductIndex++;
    } else {
      // Keep non-product lines as-is
      newLines.push(line);
    }
  }
  
  // Update total count
  const totalCountLine = newLines.findIndex(line => line.includes('Total Products:'));
  if (totalCountLine !== -1) {
    newLines[totalCountLine] = `Total Products: ${productLines.length}`;
  }
  
  // Write enriched file
  writeFileSync(unmappedFile, newLines.join('\n'));
  
  console.log(`Enriched ${productLines.length} products in 01-unmapped-products.md`);
  console.log('Process completed successfully');
}

enrichUnmappedProducts().catch(error => {
  console.error('Enrichment error:', error.message);
  process.exit(1);
});
