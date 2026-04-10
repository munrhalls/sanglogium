"use server";

import { BasketItem } from "@/app/(store)/basket/basket.types";

export async function validateBasketIntegrity(basket: BasketItem[]) {
  console.log('=== Bus Stop 1: Validate Basket Integrity ===');

  const validationResults = {
    totalItems: basket.length,
    validItems: 0,
    invalidItems: 0,
    issues: [] as Array<{
      _id: string;
      issue: string;
      severity: 'error' | 'warning';
    }>
  };

  console.log(`Validating ${basket.length} basket items...`);

  for (const item of basket) {
    console.log(`\nValidating item: ${item.name || item._id}`);

    // Required fields check
    const requiredFields = ['_id', 'name', 'displayPrice', 'stock', 'quantity', 'image', 'slug'];
    const missingFields = requiredFields.filter(field =>
      item[field as keyof BasketItem] === undefined ||
      item[field as keyof BasketItem] === null ||
      item[field as keyof BasketItem] === ''
    );

    if (missingFields.length > 0) {
      validationResults.invalidItems++;
      validationResults.issues.push({
        _id: item._id,
        issue: `Missing required fields: ${missingFields.join(', ')}`,
        severity: 'error'
      });
      console.log(`  ERROR: Missing fields: ${missingFields.join(', ')}`);
      continue;
    }

    // Data type validation
    const typeIssues = [];

    if (typeof item.displayPrice !== 'number' || item.displayPrice < 0) {
      typeIssues.push('displayPrice must be a positive number');
    }

    if (item.stock != null && (typeof item.stock !== 'number' || item.stock < 0)) {
      typeIssues.push('stock must be a positive number or null');
    }

    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      typeIssues.push('quantity must be a positive number');
    }

    if (typeof item._id !== 'string' || item._id.trim() === '') {
      typeIssues.push('_id must be a non-empty string');
    }

    if (typeof item.name !== 'string' || item.name.trim() === '') {
      typeIssues.push('name must be a non-empty string');
    }

    if (typeof item.image !== 'string' || item.image.trim() === '') {
      typeIssues.push('image must be a non-empty string');
    }

    if (typeof item.slug !== 'string' || item.slug.trim() === '') {
      typeIssues.push('slug must be a non-empty string');
    }

    if (typeIssues.length > 0) {
      validationResults.invalidItems++;
      validationResults.issues.push({
        _id: item._id,
        issue: `Type validation failed: ${typeIssues.join(', ')}`,
        severity: 'error'
      });
      console.log(`  ERROR: ${typeIssues.join(', ')}`);
      continue;
    }

    // Business logic validation
    const businessIssues = [];

    if (item.stock != null && item.quantity > item.stock) {
      businessIssues.push(`Quantity (${item.quantity}) exceeds stock (${item.stock})`);
    }

    if (item.displayPrice === 0) {
      businessIssues.push('Price is zero');
    }

    // Check for reasonable price ranges
    if (item.displayPrice > 10000) {
      businessIssues.push('Price seems unusually high');
    }

    if (item.quantity > 100) {
      businessIssues.push('Quantity seems unusually high');
    }

    if (businessIssues.length > 0) {
      validationResults.issues.push({
        _id: item._id,
        issue: `Business validation warnings: ${businessIssues.join(', ')}`,
        severity: 'warning'
      });
      console.log(`  WARNING: ${businessIssues.join(', ')}`);
    }

    validationResults.validItems++;
    console.log(`  OK: Item passes validation`);
  }

  console.log('\n=== Integrity Validation Summary ===');
  console.log(`Total items: ${validationResults.totalItems}`);
  console.log(`Valid items: ${validationResults.validItems}`);
  console.log(`Invalid items: ${validationResults.invalidItems}`);
  console.log(`Total issues: ${validationResults.issues.length}`);

  if (validationResults.issues.length > 0) {
    console.log('\nAll issues:');
    validationResults.issues.forEach(issue => {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue._id}: ${issue.issue}`);
    });
  }

  const errors = validationResults.issues.filter(i => i.severity === 'error');
  const warnings = validationResults.issues.filter(i => i.severity === 'warning');

  return {
    success: errors.length === 0,
    validItems: validationResults.validItems,
    invalidItems: validationResults.invalidItems,
    errors,
    warnings,
    message: errors.length === 0
      ? `Basket integrity valid (${validationResults.validItems} items)`
      : `Basket has ${errors.length} errors and ${warnings.length} warnings`
  };
}
