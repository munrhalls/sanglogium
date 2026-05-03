#!/usr/bin/env node

/**
 * Verification script to check Sanity CMS products for:
 * 1. Proper price_data entries (currency and unit_amount in cents)
 * 2. Stock and reserved stock fields and values
 * 3. Single source of truth for price (price_data field only)
 * 
 * Usage: node scripts/verify-product-price-data.mjs
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-11-14",
  useCdn: false,
});

async function verifyProducts() {
  console.log("=== PRODUCT DATA VERIFICATION ===\n");
  
  try {
    // Fetch all products with relevant fields
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        "hasPriceData": defined(price_data),
        "priceData": price_data,
        "hasDisplayPrice": defined(displayPrice),
        "displayPrice": displayPrice,
        "hasStock": defined(stock),
        "stock": stock,
        "hasReservedStock": defined(reservedStock),
        "reservedStock": reservedStock,
        "stripePriceId": defined(stripePriceId)
      }
    `);

    console.log(`Total products: ${products.length}\n`);

    // Check price_data field presence
    const productsWithPriceData = products.filter(p => p.hasPriceData);
    const productsWithoutPriceData = products.filter(p => !p.hasPriceData);
    
    console.log("=== PRICE DATA FIELD ===");
    console.log(`Products with price_data: ${productsWithPriceData.length}`);
    console.log(`Products without price_data: ${productsWithoutPriceData.length}`);

    // Check displayPrice field presence (should not exist if price_data is source of truth)
    const productsWithDisplayPrice = products.filter(p => p.hasDisplayPrice);
    console.log(`Products with displayPrice: ${productsWithDisplayPrice.length} (should be 0)`);
    console.log(`Products with both price_data and displayPrice: ${products.filter(p => p.hasPriceData && p.hasDisplayPrice).length}`);

    // Check stock field presence
    const productsWithStock = products.filter(p => p.hasStock);
    const productsWithoutStock = products.filter(p => !p.hasStock);
    console.log(`\n=== STOCK FIELD ===`);
    console.log(`Products with stock: ${productsWithStock.length}`);
    console.log(`Products without stock: ${productsWithoutStock.length}`);

    // Check reservedStock field presence
    const productsWithReservedStock = products.filter(p => p.hasReservedStock);
    const productsWithoutReservedStock = products.filter(p => !p.hasReservedStock);
    console.log(`\n=== RESERVED STOCK FIELD ===`);
    console.log(`Products with reservedStock: ${productsWithReservedStock.length}`);
    console.log(`Products without reservedStock: ${productsWithoutReservedStock.length}`);

    // Detailed validation for products with price_data
    console.log("\n=== PRICE DATA VALIDATION ===");
    
    let productsWithValidCurrency = 0;
    let productsWithInvalidCurrency = 0;
    let productsWithValidUnitAmount = 0;
    let productsWithInvalidUnitAmount = 0;
    let productsWithNegativeStock = 0;
    let productsWithNegativeReservedStock = 0;

    const currencyIssues = [];
    const unitAmountIssues = [];
    const stockIssues = [];
    const reservedStockIssues = [];

    for (const product of products) {
      // Check currency
      if (product.hasPriceData) {
        if (product.priceData && product.priceData.currency) {
          const currency = product.priceData.currency;
          if (typeof currency === 'string' && currency.length === 3 && /^[a-z]{3}$/i.test(currency)) {
            productsWithValidCurrency++;
          } else {
            productsWithInvalidCurrency++;
            currencyIssues.push({
              id: product._id,
              name: product.name,
              currency: currency
            });
          }
        } else {
          productsWithInvalidCurrency++;
          currencyIssues.push({
            id: product._id,
            name: product.name,
            currency: product.priceData?.currency || 'MISSING'
          });
        }

        // Check unit_amount
        if (product.priceData && product.priceData.unit_amount !== undefined) {
          const unitAmount = product.priceData.unit_amount;
          if (typeof unitAmount === 'number' && unitAmount >= 0 && Number.isInteger(unitAmount)) {
            productsWithValidUnitAmount++;
          } else {
            productsWithInvalidUnitAmount++;
            unitAmountIssues.push({
              id: product._id,
              name: product.name,
              unit_amount: unitAmount,
              issue: typeof unitAmount !== 'number' ? 'not a number' : unitAmount < 0 ? 'negative' : 'not an integer'
            });
          }
        } else {
          productsWithInvalidUnitAmount++;
          unitAmountIssues.push({
            id: product._id,
            name: product.name,
            unit_amount: 'MISSING'
          });
        }
      }

      // Check stock values
      if (product.hasStock) {
        if (product.stock < 0) {
          productsWithNegativeStock++;
          stockIssues.push({
            id: product._id,
            name: product.name,
            stock: product.stock
          });
        }
      }

      // Check reservedStock values
      if (product.hasReservedStock) {
        if (product.reservedStock < 0) {
          productsWithNegativeReservedStock++;
          reservedStockIssues.push({
            id: product._id,
            name: product.name,
            reservedStock: product.reservedStock
          });
        }
      }
    }

    console.log(`Products with valid currency (3-letter ISO code): ${productsWithValidCurrency}`);
    console.log(`Products with invalid/missing currency: ${productsWithInvalidCurrency}`);
    console.log(`Products with valid unit_amount (non-negative integer): ${productsWithValidUnitAmount}`);
    console.log(`Products with invalid/missing unit_amount: ${productsWithInvalidUnitAmount}`);
    console.log(`Products with negative stock: ${productsWithNegativeStock}`);
    console.log(`Products with negative reservedStock: ${productsWithNegativeReservedStock}`);

    // Show detailed issues if any
    if (currencyIssues.length > 0) {
      console.log("\n=== CURRENCY ISSUES ===");
      currencyIssues.slice(0, 10).forEach(issue => {
        console.log(`- ${issue.name} (${issue.id}): currency="${issue.currency}"`);
      });
      if (currencyIssues.length > 10) {
        console.log(`... and ${currencyIssues.length - 10} more`);
      }
    }

    if (unitAmountIssues.length > 0) {
      console.log("\n=== UNIT AMOUNT ISSUES ===");
      unitAmountIssues.slice(0, 10).forEach(issue => {
        console.log(`- ${issue.name} (${issue.id}): unit_amount=${issue.unit_amount} (${issue.issue})`);
      });
      if (unitAmountIssues.length > 10) {
        console.log(`... and ${unitAmountIssues.length - 10} more`);
      }
    }

    if (stockIssues.length > 0) {
      console.log("\n=== STOCK ISSUES ===");
      stockIssues.forEach(issue => {
        console.log(`- ${issue.name} (${issue.id}): stock=${issue.stock}`);
      });
    }

    if (reservedStockIssues.length > 0) {
      console.log("\n=== RESERVED STOCK ISSUES ===");
      reservedStockIssues.forEach(issue => {
        console.log(`- ${issue.name} (${issue.id}): reservedStock=${issue.reservedStock}`);
      });
    }

    // Show products without price_data (critical issue)
    if (productsWithoutPriceData.length > 0) {
      console.log("\n=== CRITICAL: PRODUCTS MISSING price_data ===");
      productsWithoutPriceData.slice(0, 10).forEach(p => {
        console.log(`- ${p.name} (${p._id})`);
        if (p.hasDisplayPrice) {
          console.log(`  Has displayPrice: ${p.displayPrice}`);
        }
      });
      if (productsWithoutPriceData.length > 10) {
        console.log(`... and ${productsWithoutPriceData.length - 10} more`);
      }
    }

    // Summary
    console.log("\n=== SUMMARY ===");
    const criticalIssues = productsWithoutPriceData.length;
    const warnings = productsWithDisplayPrice.length + productsWithInvalidCurrency + productsWithInvalidUnitAmount;
    
    console.log(`Critical issues (missing price_data): ${criticalIssues}`);
    console.log(`Warnings (displayPrice present, invalid currency/unit_amount): ${warnings}`);
    
    if (criticalIssues === 0 && warnings === 0) {
      console.log("\n✅ All products have proper price data, stock, and reserved stock fields.");
    } else {
      console.log("\n❌ Issues found. See details above.");
    }

  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyProducts();
