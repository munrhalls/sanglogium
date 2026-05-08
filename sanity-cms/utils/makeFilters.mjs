import client from "./getClient.mjs";

// Configuration - adjust based on your requirements
const CONFIG = {
  // Category-specific filter definitions
  filterDefinitions: {
    // Default filters for all categories
    default: [
      {
        name: "Price Range",
        type: "range",
      },
      {
        name: "Brand",
        type: "multiselect",
      },
      {
        name: "In Stock",
        type: "checkbox", // Changed from boolean to checkbox for better UI support
        options: ["In Stock Only"],
      },
    ],
    // Specific filters for headphones
    headphones: [
      {
        name: "Price Range",
        type: "range",
      },
      {
        name: "Brand",
        type: "multiselect",
      },
      {
        name: "In Stock",
        type: "checkbox",
        options: ["In Stock Only"],
      },
      {
        name: "Design",
        type: "multiselect",
        // Options will be populated from pathComponents (over-ear, in-ear, etc.)
      },
      {
        name: "Connection",
        type: "multiselect",
        options: ["Wired", "Wireless", "Bluetooth"],
      },
    ],
    // Specific filters for speakers
    speakers: [
      {
        name: "Price Range",
        type: "range",
      },
      {
        name: "Brand",
        type: "multiselect",
      },
      {
        name: "In Stock",
        type: "checkbox",
        options: ["In Stock Only"],
      },
      {
        name: "Speaker Type",
        type: "multiselect",
        // Options will be populated from pathComponents
      },
      {
        name: "Connectivity",
        type: "multiselect",
        options: ["Bluetooth", "Wi-Fi", "Wired", "Multi-room"],
      },
    ],
    // Specific filters for hi-fi-audio
    "hi-fi-audio": [
      {
        name: "Price Range",
        type: "range",
      },
      {
        name: "Brand",
        type: "multiselect",
      },
      {
        name: "In Stock",
        type: "checkbox",
        options: ["In Stock Only"],
      },
      {
        name: "Equipment Type",
        type: "multiselect",
        // Options will be populated from pathComponents
      },
    ],
  },

  // Specification normalization map to handle duplicates and variations
  specNormalization: {
    // Format: "detected name": "normalized name"
    weight: "Weight",
    "headphone weight": "Weight",
    "driver size": "Driver Size",
    "frequency response": "Frequency Response",
    frequency: "Frequency Response",
    impedance: "Impedance",
    sensitivity: "Sensitivity",
    thd: "Total Harmonic Distortion",
    "total harmonic distortion": "Total Harmonic Distortion",
    "total harmonic distortion (thd)": "Total Harmonic Distortion",
    "driver materials": "Driver Materials",
    "driver materials & size": "Driver Materials",
    "maximum spl": "Maximum SPL",
    warranty: "Warranty",
  },

  // Important specifications to prioritize for each category
  prioritySpecs: {
    headphones: [
      "Weight",
      "Driver Size",
      "Impedance",
      "Sensitivity",
      "Frequency Response",
      "Driver Type",
    ],
    speakers: ["Power Output", "Frequency Response", "Dimensions", "Weight"],
    "hi-fi-audio": ["Power Output", "Connectivity", "Supported Formats"],
  },

  // Maximum number of specification filters to include
  maxSpecFilters: 8,

  // How many products to process at once
  batchSize: 500,

  // Whether to actually create documents or just do a dry run
  dryRun: false,

  // Enable detailed logging
  debug: true,
};

// Helper function to generate a random key
function generateKey() {
  return Math.random().toString(36).substring(2, 10);
}

// Helper function to normalize specification names
function normalizeSpecName(name) {
  const lowerName = name.toLowerCase();
  return CONFIG.specNormalization[lowerName] || name;
}

// Helper to check if a spec should be prioritized for a category
function isPrioritySpec(specName, category) {
  const normalizedName = normalizeSpecName(specName);
  const priorities = CONFIG.prioritySpecs[category] || [];
  return priorities.includes(normalizedName);
}

async function generateCategoryFilters() {
  console.log("Starting category filters generation...");

  try {
    // Check for existing documents
    const existingDocs = await client.fetch(`
      *[_type == "categoryFilters"] { _id, title }
    `);

    console.log(
      `Found ${existingDocs.length} existing categoryFilters documents`
    );
    if (existingDocs.length > 0) {
      console.log(
        "Existing documents:",
        existingDocs.map((d) => d.title).join(", ")
      );
    }

    // Get total product count
    const totalCount = await client.fetch(`count(*[_type == "product"])`);
    console.log(`Total products to process: ${totalCount}`);

    // Analyze category structure and collect filter data
    const categoryData = await analyzeCategoryStructure(totalCount);

    // Generate filter documents
    const filterDocuments = buildFilterDocuments(categoryData);

    // Save documents to Sanity
    await saveFilterDocuments(filterDocuments, existingDocs);
  } catch (error) {
    console.error("Fatal error in generateCategoryFilters:", error);
    process.exit(1);
  }
}

async function analyzeCategoryStructure(totalCount) {
  console.log("Analyzing category structure...");

  // Initialize data structures
  const categoryStructure = {};
  const productsByCategory = {};
  let processedCount = 0;

  // Process in batches to handle large datasets
  const batchSize = CONFIG.batchSize;
  for (let i = 0; i < totalCount; i += batchSize) {
    try {
      // Fetch a batch of products with relevant fields
      const products = await client.fetch(`
        *[_type == "product"][${i}...${i + batchSize - 1}]{
          _id,
          name,
          categoryPath,
          brand,
          price,
          stock,
          tags,
          specifications
        }
      `);

      // Process this batch
      products.forEach((product) => {
        processedCount++;

        // Skip products without category path
        if (
          !product.categoryPath ||
          !Array.isArray(product.categoryPath) ||
          product.categoryPath.length === 0
        ) {
          return;
        }

        // Process each category path
        product.categoryPath.forEach((rawPath) => {
          if (typeof rawPath !== "string" || !rawPath.trim()) return;

          // Get top-level category
          const pathParts = rawPath.split("/");
          const topLevel = pathParts[0].trim();

          if (!topLevel) return;

          // Initialize data structures for this top-level category if needed
          if (!categoryStructure[topLevel]) {
            categoryStructure[topLevel] = {
              exactName: topLevel, // Store the exact name for use in title
              subcategories: new Set(),
              pathComponents: new Set(),
              brands: new Set(),
              tags: new Set(),
              specifications: new Map(), // title -> Set of values
              priceRange: { min: Infinity, max: -Infinity },
              hasProducts: new Set(), // Track products with stock > 0
              hasStockInfo: false,
            };
            productsByCategory[topLevel] = new Set();
          }

          // Add this path to subcategories
          categoryStructure[topLevel].subcategories.add(rawPath);

          // Add path components (excluding empty strings and the top level itself)
          pathParts.forEach((part) => {
            if (part && part.trim() && part.trim() !== topLevel) {
              categoryStructure[topLevel].pathComponents.add(part.trim());
            }
          });

          // Add this product to the category's products
          productsByCategory[topLevel].add(product._id);

          // Process brand
          if (product.brand) {
            const brand =
              typeof product.brand === "string"
                ? product.brand.trim()
                : String(product.brand).trim();

            if (brand) {
              categoryStructure[topLevel].brands.add(brand);
            }
          }

          // Process stock information
          if (typeof product.stock === "number") {
            categoryStructure[topLevel].hasStockInfo = true;
            if (product.stock > 0) {
              categoryStructure[topLevel].hasProducts.add(product._id);
            }
          }

          // Process tags
          if (Array.isArray(product.tags)) {
            product.tags.forEach((tag) => {
              if (tag && typeof tag === "string" && tag.trim()) {
                categoryStructure[topLevel].tags.add(tag.trim());
              }
            });
          }

          // Process specifications
          if (Array.isArray(product.specifications)) {
            product.specifications.forEach((spec) => {
              if (!spec || !spec.title || !spec.value) return;

              const title = normalizeSpecName(spec.title.trim());
              const value = spec.value.trim();

              if (!title || !value) return;

              if (!categoryStructure[topLevel].specifications.has(title)) {
                categoryStructure[topLevel].specifications.set(
                  title,
                  new Set()
                );
              }

              categoryStructure[topLevel].specifications.get(title).add(value);
            });
          }

          // Update price range
          if (
            typeof product.price === "number" &&
            !isNaN(product.price) &&
            product.price > 0
          ) {
            categoryStructure[topLevel].priceRange.min = Math.min(
              categoryStructure[topLevel].priceRange.min,
              product.price
            );
            categoryStructure[topLevel].priceRange.max = Math.max(
              categoryStructure[topLevel].priceRange.max,
              product.price
            );
          }
        });
      });

      // Progress update
      console.log(
        `Processed ${processedCount}/${totalCount} products (${Math.round(
          (processedCount / totalCount) * 100
        )}%)`
      );
    } catch (error) {
      console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
      // Continue to next batch instead of failing the entire process
    }
  }

  // Convert sets to arrays and finalize data
  const result = {};
  for (const [category, data] of Object.entries(categoryStructure)) {
    // Only include categories with at least one subcategory
    if (data.subcategories.size === 0) continue;

    result[category] = {
      exactName: data.exactName, // Keep the exact original name
      subcategories: Array.from(data.subcategories).sort(),
      pathComponents: Array.from(data.pathComponents).sort(),
      brands: Array.from(data.brands).sort(),
      tags: Array.from(data.tags).sort(),
      inStockCount: data.hasProducts.size,
      specifications: {},
      priceRange: data.priceRange,
      productCount: productsByCategory[category].size,
    };

    // Convert specification map to object and apply normalization
    const normalizedSpecs = new Map();

    for (const [title, values] of data.specifications.entries()) {
      const normalizedTitle = normalizeSpecName(title);

      if (!normalizedSpecs.has(normalizedTitle)) {
        normalizedSpecs.set(normalizedTitle, new Set());
      }

      // Add all values to the normalized title
      values.forEach((value) => {
        if (value && value.trim()) {
          normalizedSpecs.get(normalizedTitle).add(value.trim());
        }
      });
    }

    // Convert to final format with prioritization
    for (const [title, values] of normalizedSpecs.entries()) {
      const valuesArray = Array.from(values)
        .filter((value) => value.trim() !== "")
        .sort();

      // Only include specifications with multiple distinct values and reasonable count
      if (valuesArray.length >= 2 && valuesArray.length <= 20) {
        // Add priority flag to help with sorting later
        result[category].specifications[title] = {
          values: valuesArray,
          isPriority: isPrioritySpec(title, category),
        };
      }
    }

    // Normalize price ranges
    if (result[category].priceRange.min === Infinity) {
      result[category].priceRange.min = 0;
    }
    if (result[category].priceRange.max === -Infinity) {
      result[category].priceRange.max = 1000;
    }

    // Round price ranges to nice values
    result[category].priceRange.min = Math.max(
      0,
      Math.floor(result[category].priceRange.min / 10) * 10
    );
    result[category].priceRange.max =
      Math.ceil(result[category].priceRange.max / 50) * 50;

    // Ensure min < max
    if (result[category].priceRange.min >= result[category].priceRange.max) {
      result[category].priceRange.max = result[category].priceRange.min + 100;
    }
  }

  return result;
}

function buildFilterDocuments(categoryData) {
  console.log("Building filter documents...");

  const documents = [];

  for (const [category, data] of Object.entries(categoryData)) {
    try {
      console.log(
        `Building document for "${data.exactName}" (${data.productCount} products)`
      );

      // Create a sanitized document ID
      const docId = `categoryFilters-${category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`;

      // Start building the document - use exact category name as the title
      const document = {
        _id: docId,
        _type: "categoryFilters",
        title: data.exactName, // Just use the category name without "Filters"
        filters: {
          filterItems: [],
        },
        categoryMappings: [],
      };

      // Create a map to track filter names (case-insensitive)
      const existingFilterNames = new Set();
      const filterNameMap = new Map(); // Maps lowercase name to actual filter name

      // Get the appropriate filter definitions for this category
      const filterDefinitions =
        CONFIG.filterDefinitions[category.toLowerCase()] ||
        CONFIG.filterDefinitions.default;

      // Build filter items based on definitions and collected data
      for (const filterDef of filterDefinitions) {
        const filter = {
          _key: generateKey(),
          name: filterDef.name,
          type: filterDef.type,
        };

        // Track filter name (for duplicate detection)
        existingFilterNames.add(filter.name.toLowerCase());
        filterNameMap.set(filter.name.toLowerCase(), filter.name);

        // Handle different filter types
        switch (filter.type) {
          case "range":
            if (filter.name === "Price Range") {
              filter.min = data.priceRange.min;
              filter.max = data.priceRange.max;
              // Create reasonable step size (aim for about 20 steps)
              filter.step = Math.max(
                1,
                Math.round((filter.max - filter.min) / 20)
              );
            }
            break;

          case "multiselect":
          case "checkbox":
            if (filter.name === "Brand") {
              // Use brands data for the Brand filter
              if (data.brands.length > 0) {
                filter.options = data.brands
                  .filter((brand) => brand && brand.trim() !== "")
                  .sort();

                // Skip if no valid options remain
                if (!filter.options.length) {
                  console.warn(
                    `Skipping filter "${filter.name}" for ${category} - no valid options`
                  );
                  continue;
                }
              } else {
                // Skip brand filter if no brands found
                console.warn(
                  `No brands found for ${category}, skipping Brand filter`
                );
                continue;
              }
            } else if (filter.name === "Design" && category === "headphones") {
              // Use subcategory names for headphone design types
              const designTypes = data.pathComponents.filter((comp) =>
                ["over-ear", "on-ear", "in-ear", "earbuds"].includes(comp)
              );

              if (designTypes.length > 0) {
                filter.options = designTypes.sort();
              } else {
                filter.options = ["Over-ear", "On-ear", "In-ear", "Earbuds"];
              }
            } else if (
              filter.name === "Speaker Type" &&
              category === "speakers"
            ) {
              // Use subcategory names for speaker types
              const speakerTypes = data.pathComponents.filter((comp) =>
                [
                  "bookshelf",
                  "floor-standing",
                  "portable",
                  "bluetooth",
                  "smart",
                  "soundbar",
                ].includes(comp)
              );

              if (speakerTypes.length > 0) {
                filter.options = speakerTypes.sort();
              } else {
                filter.options = [
                  "Bookshelf",
                  "Floor-standing",
                  "Portable",
                  "Bluetooth",
                  "Smart",
                  "Soundbar",
                ];
              }
            } else if (
              filter.name === "Equipment Type" &&
              category === "hi-fi-audio"
            ) {
              // Use subcategory names for equipment types
              filter.options = data.pathComponents.sort();
            } else if (filterDef.options && filterDef.options.length > 0) {
              // Use options defined in config
              filter.options = filterDef.options.filter(
                (opt) => opt && opt.trim() !== ""
              );

              if (!filter.options.length) {
                console.warn(
                  `Skipping filter "${filter.name}" for ${category} - no valid options`
                );
                continue;
              }
            } else {
              // Initialize empty array if no specific options defined
              filter.options = [];
              console.warn(`Filter "${filter.name}" has no options defined`);
              continue;
            }
            break;

          case "radio":
            if (filterDef.options && filterDef.options.length > 0) {
              // Use options defined in config
              filter.options = filterDef.options.filter(
                (opt) => opt && opt.trim() !== ""
              );

              // Skip if no valid options remain
              if (!filter.options.length) {
                console.warn(
                  `Skipping filter "${filter.name}" for ${category} - no valid options`
                );
                continue;
              }

              // Check if defaultValue is valid
              if (
                filterDef.defaultValue &&
                filter.options.includes(filterDef.defaultValue)
              ) {
                filter.defaultValue = filterDef.defaultValue;
              } else if (filter.options.length > 0) {
                filter.defaultValue = filter.options[0]; // Set to first option
              }
            } else {
              // Skip if no options defined
              console.warn(
                `Skipping radio filter "${filter.name}" - no options defined`
              );
              continue;
            }
            break;

          case "boolean":
            // Boolean doesn't need special handling
            break;
        }

        // Add the filter if it's valid
        const isValid = validateFilter(filter);
        if (isValid) {
          document.filters.filterItems.push(filter);
        } else {
          console.warn(
            `Skipping invalid filter "${filter.name}" for ${category}`
          );
        }
      }

      // Add specification-based filters if available
      // Sort specs by priority first, then by name
      const specEntries = Object.entries(data.specifications).sort((a, b) => {
        // First sort by priority (priority specs first)
        if (a[1].isPriority && !b[1].isPriority) return -1;
        if (!a[1].isPriority && b[1].isPriority) return 1;

        // Then sort alphabetically by name
        return a[0].localeCompare(b[0]);
      });

      // Limit to maximum number of specification filters
      let specFilterCount = 0;

      for (const [specTitle, specData] of specEntries) {
        // Skip if we've reached the max number of spec filters
        if (specFilterCount >= CONFIG.maxSpecFilters) {
          console.log(
            `Reached maximum spec filters (${CONFIG.maxSpecFilters}) for ${category}`
          );
          break;
        }

        // Skip specs that would create duplicate filters (case-insensitive comparison)
        if (existingFilterNames.has(specTitle.toLowerCase())) {
          console.log(
            `Skipping duplicate filter "${specTitle}" for ${category}`
          );
          continue;
        }

        // Ensure we have valid options (the values array)
        const validOptions = specData.values;
        if (!Array.isArray(validOptions) || validOptions.length < 2) {
          continue;
        }

        // Only add specs with reasonable number of valid values
        if (validOptions.length >= 2 && validOptions.length <= 20) {
          const filter = {
            _key: generateKey(),
            name: specTitle,
            type: "multiselect",
            options: validOptions,
          };

          if (validateFilter(filter)) {
            document.filters.filterItems.push(filter);
            existingFilterNames.add(specTitle.toLowerCase());
            filterNameMap.set(specTitle.toLowerCase(), specTitle);
            specFilterCount++;
          }
        }
      }

      // Create mappings for each subcategory with _key property
      document.categoryMappings = data.subcategories.map((path) => {
        return {
          _key: generateKey(),
          path,
          // Include all valid filter names
          filters: document.filters.filterItems.map((f) => f.name),
        };
      });

      // Only add documents with actual filters
      if (document.filters.filterItems.length > 0) {
        documents.push(document);
      } else {
        console.warn(`Skipping document for ${category} - no valid filters`);
      }
    } catch (error) {
      console.error(`Error building document for ${category}:`, error);
    }
  }

  return documents;
}

function validateFilter(filter) {
  // Check required fields according to schema
  if (!filter.name || !filter.type || !filter._key) return false;

  // Check if type is valid according to schema
  const validTypes = ["checkbox", "radio", "range", "boolean", "multiselect"];
  if (!validTypes.includes(filter.type)) return false;

  // Validate type-specific requirements
  switch (filter.type) {
    case "range":
      if (typeof filter.min !== "number" || typeof filter.max !== "number")
        return false;
      if (filter.min >= filter.max) return false;
      if (typeof filter.step !== "number" || filter.step <= 0) return false;
      break;

    case "multiselect":
    case "checkbox":
      if (
        !filter.options ||
        !Array.isArray(filter.options) ||
        filter.options.length === 0
      ) {
        return false;
      }

      // Ensure all options are strings
      if (!filter.options.every((opt) => typeof opt === "string")) {
        return false;
      }
      break;

    case "radio":
      if (
        !filter.options ||
        !Array.isArray(filter.options) ||
        filter.options.length === 0
      ) {
        return false;
      }

      // Ensure all options are strings
      if (!filter.options.every((opt) => typeof opt === "string")) {
        return false;
      }

      // defaultValue is optional for radio
      if (
        filter.defaultValue &&
        !filter.options.includes(filter.defaultValue)
      ) {
        return false;
      }
      break;

    case "boolean":
      // No specific validation for boolean type
      break;
  }

  return true;
}

async function saveFilterDocuments(documents, existingDocs) {
  console.log(`\nReady to save ${documents.length} filter documents`);

  // Display document summaries
  for (const doc of documents) {
    console.log(`\n${doc.title}:`);
    console.log(` - ${doc.filters.filterItems.length} filters`);
    console.log(` - ${doc.categoryMappings.length} category mappings`);

    if (CONFIG.debug) {
      console.log(
        ` - Filters: ${doc.filters.filterItems.map((f) => f.name).join(", ")}`
      );
      console.log(` - Sample mappings (first 3):`);
      doc.categoryMappings.slice(0, 3).forEach((mapping) => {
        console.log(`   * ${mapping.path}: ${mapping.filters.join(", ")}`);
      });
    }
  }

  // In dry run mode, just show what would happen
  if (CONFIG.dryRun) {
    console.log("\nDRY RUN - No documents were created or updated");
    console.log("Set CONFIG.dryRun = false to actually save the documents");
    return;
  }

  // Create/update documents
  console.log("\nSaving documents to Sanity...");

  const results = {
    created: 0,
    updated: 0,
    errors: 0,
  };

  // Process documents sequentially to avoid race conditions
  for (const doc of documents) {
    try {
      // Check if document already exists
      const existingDoc = existingDocs.find(
        (existing) => existing._id === doc._id
      );

      if (existingDoc) {
        // Update existing document
        await client.createOrReplace(doc);
        console.log(`Updated document: ${doc.title}`);
        results.updated++;
      } else {
        // Create new document
        await client.create(doc);
        console.log(`Created document: ${doc.title}`);
        results.created++;
      }
    } catch (error) {
      console.error(`Error saving document ${doc.title}:`, error);
      console.error("Error details:", error.message);
      results.errors++;
    }
  }

  console.log(
    `\nDone! Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors}`
  );
}

// Execute the script
generateCategoryFilters().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
