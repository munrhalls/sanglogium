import client from "./getClient.mjs";

/**
 * Creates and uploads a categorySortables document to Sanity for a specific top-level category
 * @param {string} topLevelCategory - The top-level category to create sortables for
 * @param {boolean} dryRun - If true, only logs the document without uploading to Sanity
 */
async function createSortablesDocument(topLevelCategory, dryRun = false) {
  if (!topLevelCategory || typeof topLevelCategory !== "string") {
    console.error(
      "Error: Please provide a valid top-level category name as a string"
    );
    process.exit(1);
  }

  try {
    console.log(
      `\n===== CREATING SORTABLES DOCUMENT FOR: ${topLevelCategory} =====`
    );

    // 1. Check if document already exists to avoid duplicates
    const existingDocuments = await client.fetch(
      `*[_type == "categorySortables" && name == $categoryName][0]`,
      { categoryName: topLevelCategory }
    );

    if (existingDocuments) {
      console.log(
        `Warning: A categorySortables document already exists for ${topLevelCategory}`
      );
      console.log("Document ID:", existingDocuments._id);

      if (!(await confirmOverwrite())) {
        console.log("Operation cancelled. Existing document was not modified.");
        return;
      }
    }

    // 2. Fetch all products in this top-level category
    console.log(`Fetching products in ${topLevelCategory} category...`);
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

    console.log(`Found ${products.length} products in this category.`);

    if (products.length === 0) {
      console.log(
        "Error: No products found in this category. Unable to analyze sortables."
      );
      return;
    }

    // 3. Analyze products and generate recommended sortables
    const recommendedSortables = analyzeCategoryForSortables(
      products,
      topLevelCategory
    );

    // 4. Get all subcategories for this top-level category
    const subcategories = await getSubcategories(topLevelCategory);

    // 5. Create the document
    const sortablesDocument = {
      _type: "categorySortables",
      title: topLevelCategory, // Only use title, not name
      sortOptions: recommendedSortables.map((sort) => ({
        ...sort,
        _key: `sort_${sort.name}_${Math.random().toString(36).substring(2, 10)}`, // Add unique _key for each sort option
      })),
      categoryMappings: [
        // Main category mapping
        {
          _key: `mapping_main_${Math.random().toString(36).substring(2, 10)}`, // Add unique _key
          path: `/${topLevelCategory}`,
          sortOptions: recommendedSortables.map((sort) => sort.name),
        },
        // Add subcategory mappings
        ...subcategories.map((subcategory) => ({
          _key: `mapping_${subcategory.replace(/[^a-z0-9]/gi, "_")}_${Math.random().toString(36).substring(2, 10)}`, // Add unique _key
          path: subcategory,
          sortOptions: recommendedSortables.map((sort) => sort.name), // Use same sortables by default
        })),
      ],
    };

    // 6. Output the document
    console.log("\n===== GENERATED SORTABLES DOCUMENT =====");
    console.log(JSON.stringify(sortablesDocument, null, 2));

    // 7. Upload to Sanity if not a dry run
    if (dryRun) {
      console.log("\nDRY RUN: Document not uploaded to Sanity");
    } else {
      let result;

      if (existingDocuments) {
        // Update existing document
        console.log("\nUpdating existing document...");
        result = await client.createOrReplace({
          ...sortablesDocument,
          _id: existingDocuments._id,
          _rev: existingDocuments._rev,
        });
      } else {
        // Create new document
        console.log("\nUploading new document to Sanity...");
        result = await client.create(sortablesDocument);
      }

      console.log("Successfully created/updated document in Sanity");
      console.log("Document ID:", result._id);
    }
  } catch (error) {
    console.error(
      `Error creating sortables document for ${topLevelCategory}:`,
      error
    );
    process.exit(1);
  }
}

/**
 * Analyzes products from a category to determine appropriate sortable fields
 * @param {Array} products - Array of product objects from the category
 * @param {string} categoryName - The category name for context
 * @returns {Array} Array of sortable field objects
 */
function analyzeCategoryForSortables(products, categoryName) {
  console.log(
    "\nAnalyzing products to determine appropriate sortable fields..."
  );

  const totalProducts = products.length;
  const THRESHOLD_PERCENTAGE = 40; // Minimum % of products that should have the field

  // Analyze field presence
  const fieldCounts = {
    title: 0,
    brand: 0,
    price: 0,
    rating: 0,
    releaseDate: 0,
  };

  // Track numeric and date specifications
  const specCounts = {};
  const numericSpecs = {};
  const dateSpecs = {};

  // Helper function to generate random unique key
  const generateKey = (prefix) => {
    return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
  };

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

  // Analyze products
  products.forEach((product) => {
    // Count basic fields
    for (const field in fieldCounts) {
      if (product[field] !== undefined && product[field] !== null) {
        fieldCounts[field]++;
      }
    }

    // Analyze specifications
    if (Array.isArray(product.specifications)) {
      const uniqueSpecsInProduct = new Set();

      product.specifications.forEach((spec) => {
        if (!spec || !spec.title) return;

        const specName = spec.title.trim();
        uniqueSpecsInProduct.add(specName);

        // Check for numeric specs
        if (!isNaN(Number(spec.value))) {
          numericSpecs[specName] = (numericSpecs[specName] || 0) + 1;
        }

        // Check for date specs
        if (looksLikeDate(spec.value)) {
          dateSpecs[specName] = (dateSpecs[specName] || 0) + 1;
        }
      });

      // Count each unique spec once per product
      uniqueSpecsInProduct.forEach((specName) => {
        specCounts[specName] = (specCounts[specName] || 0) + 1;
      });
    }
  });

  // Convert counts to percentages
  const fieldPercentages = {};
  for (const field in fieldCounts) {
    fieldPercentages[field] = (fieldCounts[field] / totalProducts) * 100;
  }

  // Log field presence
  console.log("\nField presence in products:");
  for (const [field, percentage] of Object.entries(fieldPercentages)) {
    console.log(`${field}: ${percentage.toFixed(1)}%`);
  }

  // Log common specifications
  console.log("\nCommon specifications:");
  Object.entries(specCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([spec, count]) => {
      const percentage = (count / totalProducts) * 100;
      console.log(`${spec}: ${percentage.toFixed(1)}% of products`);
    });

  // Generate recommended sortables
  const recommendedSortables = [];

  // 1. Always include name/title for alphabetical sorting
  recommendedSortables.push({
    name: "name",
    displayName: "Name",
    type: "alphabetic",
    field: "title",
    defaultDirection: "asc",
  });

  // 2. Include price if present in enough products
  if (fieldPercentages.price >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "price",
      displayName: "Price",
      type: "numeric",
      field: "price",
      defaultDirection: "asc",
    });
  }

  // 3. Include rating if present in enough products
  if (fieldPercentages.rating >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "rating",
      displayName: "Rating",
      type: "numeric",
      field: "rating",
      defaultDirection: "desc", // Higher ratings first
    });
  }

  // 4. Include release date if present in enough products
  if (fieldPercentages.releaseDate >= THRESHOLD_PERCENTAGE) {
    recommendedSortables.push({
      name: "release_date",
      displayName: "Release Date",
      type: "date",
      field: "releaseDate",
      defaultDirection: "desc", // Newest first
    });
  }

  // 5. Add category-specific numeric specifications
  Object.entries(numericSpecs)
    .filter(
      ([_, count]) => (count / totalProducts) * 100 >= THRESHOLD_PERCENTAGE
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2) // Limit to top 2 numeric specs
    .forEach(([specName, _]) => {
      // Create a safe name for the field
      const safeName = specName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      recommendedSortables.push({
        name: `spec_${safeName}`,
        displayName: specName,
        type: "numeric",
        field: `specifications[title=="${specName}"].value`,
        defaultDirection: "desc",
      });
    });

  // 6. Add category-specific date specifications
  Object.entries(dateSpecs)
    .filter(
      ([_, count]) => (count / totalProducts) * 100 >= THRESHOLD_PERCENTAGE
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1) // Limit to top 1 date spec
    .forEach(([specName, _]) => {
      // Create a safe name for the field
      const safeName = specName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      recommendedSortables.push({
        name: `spec_date_${safeName}`,
        displayName: specName,
        type: "date",
        field: `specifications[title=="${specName}"].value`,
        defaultDirection: "desc", // Newest first
      });
    });

  // Log recommended sortables
  console.log("\nRecommended sortable fields:");
  recommendedSortables.forEach((sort) => {
    console.log(`- ${sort.displayName} (${sort.type})`);
  });

  return recommendedSortables;
}

/**
 * Gets all subcategories for a top-level category
 * @param {string} topLevelCategory - The top-level category
 * @returns {Array} Array of subcategory paths
 */
async function getSubcategories(topLevelCategory) {
  try {
    console.log(`\nFetching subcategories for ${topLevelCategory}...`);

    // Get all unique category paths that start with this top-level category
    const result = await client.fetch(
      `*[_type == "product" && categoryPath match $categoryPattern]{
        "categoryPath": categoryPath
      }`,
      { categoryPattern: `${topLevelCategory}/*` }
    );

    // Extract unique paths
    const paths = new Set();
    result.forEach((item) => {
      if (item.categoryPath && typeof item.categoryPath === "string") {
        paths.add(item.categoryPath);
      }
    });

    const subcategories = Array.from(paths);
    console.log(`Found ${subcategories.length} subcategories`);

    return subcategories;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return []; // Return empty array as fallback
  }
}

/**
 * Helper function to prompt for confirmation to overwrite
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
async function confirmOverwrite() {
  if (process.env.FORCE_OVERWRITE === "true") {
    return true;
  }

  return new Promise((resolve) => {
    process.stdout.write(
      "Do you want to overwrite the existing document? (y/N): "
    );

    process.stdin.once("data", (data) => {
      const response = data.toString().trim().toLowerCase();
      resolve(response === "y" || response === "yes");
    });
  });
}

/**
 * Helper function to capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Main execution
// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-d");

// Remove flags from arguments
const categoryArg = args.find((arg) => !arg.startsWith("-"));

if (!categoryArg) {
  console.error("Please provide a top-level category name");
  console.error(
    "Usage: node createSortablesDocument.mjs <category> [--dry-run]"
  );
  process.exit(1);
}

// Execute with the specified category
createSortablesDocument(categoryArg, dryRun);
