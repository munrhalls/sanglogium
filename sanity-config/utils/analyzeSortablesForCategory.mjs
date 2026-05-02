import client from "./getClient.mjs";

/**
 * Analyzes products in a specific top-level category to determine appropriate sortable fields
 * @param {string} topLevelCategory - The top-level category to analyze (e.g. "electronics", "clothing")
 */
async function analyzeSortablesForCategory(topLevelCategory) {
  try {
    // Fetch all products in this top-level category
    const products = await client.fetch(
      `*[_type == "product" && categoryPath match $categoryPattern]{
        _id,
        title,
        brand,
        categoryPath,
        price,
        rating,
        releaseDate,
        specifications,
        overviewFields
      }`,
      { categoryPattern: `${topLevelCategory}/*` }
    );

    console.log(`\n===== SORTABLES ANALYSIS FOR: ${topLevelCategory} =====`);
    console.log(`Total products found: ${products.length}`);

    if (products.length === 0) {
      console.log("No products found in this category.");
      return;
    }

    // 1. Identify universal sortable fields available on all/most products
    const fieldPresence = analyzeFieldPresence(products);

    // 2. Identify numeric fields that would be good for sorting
    const numericFields = analyzeNumericFields(products);

    // 3. Identify date fields for chronological sorting
    const dateFields = analyzeDateFields(products);

    // 4. Analyze specifications for common specs across products
    const commonSpecifications = analyzeSpecifications(products);

    // 5. Generate recommended sortable fields
    const recommendedSortables = generateRecommendedSortables(
      fieldPresence,
      numericFields,
      dateFields,
      commonSpecifications,
      topLevelCategory
    );

    // Output the recommendations in a format suitable for Sanity schema
    outputSanitySortablesSchema(recommendedSortables, topLevelCategory);
  } catch (error) {
    console.error(`Error analyzing sortables for ${topLevelCategory}:`, error);
  }
}

/**
 * Analyzes which fields are present in what percentage of products
 */
function analyzeFieldPresence(products) {
  const totalProducts = products.length;
  const fieldCounts = {
    title: 0,
    brand: 0,
    price: 0,
    rating: 0,
    releaseDate: 0,
  };

  products.forEach((product) => {
    for (const field in fieldCounts) {
      if (product[field] !== undefined && product[field] !== null) {
        fieldCounts[field]++;
      }
    }
  });

  // Convert counts to percentages
  const fieldPresence = {};
  for (const field in fieldCounts) {
    fieldPresence[field] = (fieldCounts[field] / totalProducts) * 100;
  }

  console.log("\nField presence percentage:");
  for (const [field, percentage] of Object.entries(fieldPresence)) {
    console.log(`${field}: ${percentage.toFixed(1)}%`);
  }

  return fieldPresence;
}

/**
 * Identifies fields that contain numeric values
 */
function analyzeNumericFields(products) {
  const numericFields = new Set();
  const hasNumericValue = {};

  // Check main product fields
  products.forEach((product) => {
    // Check direct numeric fields
    if (typeof product.price === "number") numericFields.add("price");
    if (typeof product.rating === "number") numericFields.add("rating");

    // Check specifications for numeric values
    if (Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        if (spec.title && !isNaN(Number(spec.value))) {
          const fieldName = spec.title.toLowerCase().replace(/\s+/g, "_");
          numericFields.add(`specification.${fieldName}`);

          hasNumericValue[fieldName] = (hasNumericValue[fieldName] || 0) + 1;
        }
      });
    }

    // Check overview fields for numeric values
    if (Array.isArray(product.overviewFields)) {
      product.overviewFields.forEach((field) => {
        if (field.title && !isNaN(Number(field.value))) {
          const fieldName = field.title.toLowerCase().replace(/\s+/g, "_");
          numericFields.add(`overview.${fieldName}`);

          hasNumericValue[fieldName] = (hasNumericValue[fieldName] || 0) + 1;
        }
      });
    }
  });

  console.log("\nNumeric fields identified:");
  numericFields.forEach((field) => console.log(`- ${field}`));

  // List the most common numeric specification fields
  console.log("\nMost common numeric specification fields:");
  Object.entries(hasNumericValue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([field, count]) => {
      console.log(`- ${field}: found in ${count} products`);
    });

  return {
    fields: Array.from(numericFields),
    specFrequency: hasNumericValue,
  };
}

/**
 * Identifies fields that contain date values
 */
function analyzeDateFields(products) {
  const dateFields = new Set();
  const hasDateValue = {};

  // Helper function to check if a value looks like a date
  const looksLikeDate = (value) => {
    if (!value) return false;
    if (value instanceof Date) return true;

    // Check if it's an ISO date string
    if (typeof value === "string") {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }

    return false;
  };

  products.forEach((product) => {
    // Check direct date fields
    if (looksLikeDate(product.releaseDate)) dateFields.add("releaseDate");

    // Check specifications for date values
    if (Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        if (spec.title && looksLikeDate(spec.value)) {
          const fieldName = spec.title.toLowerCase().replace(/\s+/g, "_");
          dateFields.add(`specification.${fieldName}`);

          hasDateValue[fieldName] = (hasDateValue[fieldName] || 0) + 1;
        }
      });
    }

    // Check overview fields for date values
    if (Array.isArray(product.overviewFields)) {
      product.overviewFields.forEach((field) => {
        if (field.title && looksLikeDate(field.value)) {
          const fieldName = field.title.toLowerCase().replace(/\s+/g, "_");
          dateFields.add(`overview.${fieldName}`);

          hasDateValue[fieldName] = (hasDateValue[fieldName] || 0) + 1;
        }
      });
    }
  });

  console.log("\nDate fields identified:");
  dateFields.forEach((field) => console.log(`- ${field}`));

  return {
    fields: Array.from(dateFields),
    specFrequency: hasDateValue,
  };
}

/**
 * Analyzes specifications to find common ones across products
 */
function analyzeSpecifications(products) {
  const specCounts = {};
  const totalProducts = products.length;

  products.forEach((product) => {
    if (Array.isArray(product.specifications)) {
      // Track unique specs per product
      const uniqueSpecsInProduct = new Set();

      product.specifications.forEach((spec) => {
        if (spec.title) {
          const specName = spec.title.trim().toLowerCase();
          uniqueSpecsInProduct.add(specName);
        }
      });

      // Count each unique spec once per product
      uniqueSpecsInProduct.forEach((specName) => {
        specCounts[specName] = (specCounts[specName] || 0) + 1;
      });
    }
  });

  // Convert to percentage of products having each spec
  const commonSpecs = {};
  for (const [spec, count] of Object.entries(specCounts)) {
    commonSpecs[spec] = (count / totalProducts) * 100;
  }

  console.log("\nMost common specifications:");
  Object.entries(commonSpecs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([spec, percentage]) => {
      console.log(`- ${spec}: ${percentage.toFixed(1)}% of products`);
    });

  return commonSpecs;
}

/**
 * Generates recommended sortable fields based on analysis
 */
function generateRecommendedSortables(
  fieldPresence,
  numericFields,
  dateFields,
  commonSpecs,
  category
) {
  const THRESHOLD_PERCENTAGE = 50; // Minimum % of products that should have the field
  const recommendedSortables = [];

  // Always include title for alphabetical sorting
  recommendedSortables.push({
    name: "name",
    displayName: "Name",
    type: "alphabetic",
    field: "title",
    defaultDirection: "asc",
  });

  // Include price if present in enough products
  if (fieldPresence.price >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "price",
      displayName: "Price",
      type: "numeric",
      field: "price",
      defaultDirection: "asc",
    });
  }

  // Include rating if present in enough products
  if (fieldPresence.rating >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "rating",
      displayName: "Rating",
      type: "numeric",
      field: "rating",
      defaultDirection: "desc",
    });
  }

  // Include release date if present in enough products
  if (fieldPresence.releaseDate >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "release_date",
      displayName: "Release Date",
      type: "date",
      field: "releaseDate",
      defaultDirection: "desc",
    });
  }

  // Add category-specific sortable fields based on numeric specifications
  const totalProducts = (Object.values(fieldPresence)[0] / 100) * 100; // Calculate from percentage

  // Add numeric specification fields that appear in enough products
  Object.entries(numericFields.specFrequency)
    .filter(
      ([_, count]) => (count / totalProducts) * 100 >= THRESHOLD_PERCENTAGE
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) // Top 3 most common numeric specs
    .forEach(([field, _]) => {
      const displayName = field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()); // Title case

      recommendedSortables.push({
        name: field,
        displayName: displayName,
        type: "numeric",
        field: `specifications[title=="${displayName}"].value`,
        defaultDirection: "desc",
      });
    });

  console.log("\nRecommended sortable fields for this category:");
  recommendedSortables.forEach((sort) => {
    console.log(`- ${sort.displayName} (${sort.type})`);
  });

  return recommendedSortables;
}

/**
 * Outputs the recommended sortables in a format suitable for a Sanity schema
 */
function outputSanitySortablesSchema(recommendedSortables, topLevelCategory) {
  // Create a sample document for the categorySortables schema
  const sampleDocument = {
    _type: "categorySortables",
    title: `${topLevelCategory.charAt(0).toUpperCase() + topLevelCategory.slice(1)} Sortables`,
    sortOptions: recommendedSortables,
    categoryMappings: [
      {
        path: `/${topLevelCategory}`,
        sortOptions: recommendedSortables.map((sort) => sort.name),
      },
    ],
  };

  console.log("\n===== SANITY SCHEMA DOCUMENT TEMPLATE =====");
  console.log(JSON.stringify(sampleDocument, null, 2));
}

// Example usage
// Run with a specific top-level category
const topLevelCategory = process.argv[2];
if (!topLevelCategory) {
  console.error("Please provide a top-level category as an argument");
  process.exit(1);
}

analyzeSortablesForCategory(topLevelCategory);
