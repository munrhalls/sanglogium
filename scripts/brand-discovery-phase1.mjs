/**
 * Phase 1: Brand Discovery & Validation
 * 
 * This script analyzes existing brand patterns and suggests assignments
 * for products with null brands - NO CHANGES MADE, analysis only
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2023-05-03",
  useCdn: false,
});

async function brandDiscovery() {
  console.log("=== PHASE 1: Brand Discovery & Analysis ===\n");

  try {
    // Step 1: Extract all existing brands
    console.log("Step 1: Extracting existing brands from products...");
    const productsWithBrands = await client.fetch(`
      *[_type == "product" && defined(brand) && brand != null]{
        _id,
        name,
        brand
      }
    `);
    
    const existingBrands = [...new Set(productsWithBrands.map(p => p.brand))];
    console.log(`Found ${existingBrands.length} unique brands:`);
    existingBrands.sort().forEach(brand => console.log(`  - ${brand}`));
    
    // Step 2: Extract products with null brands
    console.log("\nStep 2: Finding products with null brands...");
    const nullBrandProducts = await client.fetch(`
      *[_type == "product" && brand == null]{
        _id,
        name,
        sku
      }
    `);
    
    console.log(`Found ${nullBrandProducts.length} products with null brands`);
    
    if (nullBrandProducts.length === 0) {
      console.log("✅ No products with null brands found!");
      return;
    }
    
    // Step 3: Pattern matching analysis
    console.log("\nStep 3: Analyzing brand patterns...");
    const suggestions = [];
    const brandPatternCounts = {};
    
    nullBrandProducts.forEach(product => {
      const firstWord = product.name.split(" ")[0];
      const secondWord = product.name.split(" ")[1] || "";
      const firstTwoWords = `${firstWord} ${secondWord}`.trim();
      
      // Check for exact brand matches
      const exactMatch = existingBrands.find(brand => 
        brand.toLowerCase() === firstWord.toLowerCase()
      );
      
      // Check for two-word brand matches
      const twoWordMatch = existingBrands.find(brand => 
        brand.toLowerCase() === firstTwoWords.toLowerCase()
      );
      
      // Check for partial matches
      const partialMatches = existingBrands.filter(brand => 
        brand.toLowerCase().includes(firstWord.toLowerCase()) ||
        firstWord.toLowerCase().includes(brand.toLowerCase())
      );
      
      let suggestedBrand = null;
      let confidence = 0;
      let matchType = 'none';
      
      if (exactMatch) {
        suggestedBrand = exactMatch;
        confidence = 95;
        matchType = 'exact';
      } else if (twoWordMatch) {
        suggestedBrand = twoWordMatch;
        confidence = 98;
        matchType = 'two-word';
      } else if (partialMatches.length === 1) {
        suggestedBrand = partialMatches[0];
        confidence = 70;
        matchType = 'partial-single';
      } else if (partialMatches.length > 1) {
        suggestedBrand = partialMatches[0]; // Take first, but low confidence
        confidence = 30;
        matchType = 'partial-multiple';
      }
      
      // Track pattern counts
      if (suggestedBrand) {
        brandPatternCounts[suggestedBrand] = (brandPatternCounts[suggestedBrand] || 0) + 1;
      }
      
      suggestions.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        firstWord,
        firstTwoWords,
        suggestedBrand,
        confidence,
        matchType,
        partialMatches: partialMatches.length > 0 ? partialMatches : []
      });
    });
    
    // Step 4: Analysis summary
    console.log("\nStep 4: Pattern Analysis Summary");
    console.log("================================");
    
    const highConfidence = suggestions.filter(s => s.confidence >= 90);
    const mediumConfidence = suggestions.filter(s => s.confidence >= 70 && s.confidence < 90);
    const lowConfidence = suggestions.filter(s => s.confidence < 70);
    
    console.log(`High confidence (90%+): ${highConfidence.length} products`);
    console.log(`Medium confidence (70-89%): ${mediumConfidence.length} products`);
    console.log(`Low confidence (<70%): ${lowConfidence.length} products`);
    
    console.log("\nTop suggested brands by count:");
    Object.entries(brandPatternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products`);
      });
    
    // Step 5: Generate CSV for manual review
    console.log("\nStep 5: Generating review CSV...");
    const csvHeader = "Product ID,Product Name,SKU,First Word,First Two Words,Suggested Brand,Confidence,Match Type,Partial Matches\n";
    const csvRows = suggestions.map(s => 
      `"${s.productId}","${s.productName}","${s.sku || ''}","${s.firstWord}","${s.firstTwoWords}","${s.suggestedBrand || ''}",${s.confidence},"${s.matchType}","${s.partialMatches.join(';')}"`
    ).join("\n");
    
    const csvContent = csvHeader + csvRows;
    fs.writeFileSync("brand-assignments-review.csv", csvContent);
    console.log("✅ Generated: brand-assignments-review.csv");
    
    // Step 6: High confidence samples
    console.log("\nStep 6: High Confidence Assignment Samples");
    console.log("==========================================");
    
    highConfidence.slice(0, 10).forEach(s => {
      console.log(`  ${s.productName} → ${s.suggestedBrand} (${s.confidence}% - ${s.matchType})`);
    });
    
    if (mediumConfidence.length > 0) {
      console.log("\nMedium Confidence Samples (need manual review):");
      mediumConfidence.slice(0, 5).forEach(s => {
        console.log(`  ${s.productName} → ${s.suggestedBrand} (${s.confidence}% - ${s.matchType})`);
      });
    }
    
    if (lowConfidence.length > 0) {
      console.log("\nLow Confidence Samples (manual review required):");
      lowConfidence.slice(0, 5).forEach(s => {
        console.log(`  ${s.productName} → ${s.suggestedBrand || 'UNKNOWN'} (${s.confidence}% - ${s.matchType})`);
      });
    }
    
    console.log("\n=== PHASE 1 COMPLETE ===");
    console.log("Next steps:");
    console.log("1. Review brand-assignments-review.csv");
    console.log("2. Approve high-confidence assignments");
    console.log("3. Manual review medium/low confidence");
    console.log("4. Run Phase 2: Pilot Update");
    
  } catch (error) {
    console.error("Discovery failed:", error.message);
  }
}

brandDiscovery();
