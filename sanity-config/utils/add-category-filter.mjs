import client from "./getClient.mjs";

/**
 * Targeted script to add a single filter to a specific category
 * Usage: node add-category-filter.js "headphones" "Connection" "multiselect" "Wired,Wireless,Bluetooth"
 */

// Parse command line arguments
const [category, filterName, filterType, filterOptionsStr, path] =
  process.argv.slice(2);

if (!category || !filterName || !filterType) {
  console.log(`
Usage: node add-category-filter.js <category> <filterName> <filterType> [filterOptions] [specificPath]

  category:      Category ID (e.g., "headphones", "speakers")
  filterName:    Name of the filter (e.g., "Price Range", "Connection")
  filterType:    Type of filter ("multiselect", "checkbox", "range", "radio", "boolean")
  filterOptions: Comma-separated list of options (for multiselect, checkbox, radio)
                 For range, provide "min,max,step" (e.g., "100,1000,50")
  specificPath:  (Optional) Specific category path (e.g., "headphones/over-ear")
                 If not provided, the filter will be added to all paths under the category

Examples:
  node add-category-filter.js "headphones" "Connection" "multiselect" "Wired,Wireless,Bluetooth"
  node add-category-filter.js "speakers" "Price Range" "range" "50,2000,50"
  node add-category-filter.js "headphones" "In Stock" "checkbox" "In Stock Only" "headphones/over-ear"
  `);
  process.exit(1);
}

// Helper function to generate a random key
function generateKey() {
  return Math.random().toString(36).substring(2, 10);
}

// Process the filter options based on filter type
function processFilterOptions(type, optionsStr) {
  if (!optionsStr) return null;

  switch (type) {
    case "range":
      const [min, max, step] = optionsStr.split(",").map(Number);
      return { min, max, step };
    case "multiselect":
    case "checkbox":
    case "radio":
      return optionsStr.split(",").map((opt) => opt.trim());
    default:
      return null;
  }
}

// Create filter object based on inputs
function createFilter(name, type, options) {
  const filter = {
    _key: generateKey(),
    name,
    type,
  };

  switch (type) {
    case "range":
      if (options && options.min != null && options.max != null) {
        filter.min = options.min;
        filter.max = options.max;
        filter.step = options.step || 1;
      } else {
        console.error("Range filter requires min,max,step options");
        process.exit(1);
      }
      break;
    case "multiselect":
    case "checkbox":
    case "radio":
      if (Array.isArray(options) && options.length > 0) {
        filter.options = options;
        if (type === "radio") {
          filter.defaultValue = options[0]; // Set first option as default
        }
      } else {
        console.error(`${type} filter requires options`);
        process.exit(1);
      }
      break;
  }

  return filter;
}

async function addFilterToCategory() {
  try {
    console.log(
      `Adding "${filterName}" filter to ${category}${path ? ` (path: ${path})` : ""}...`,
    );

    // Process filter options
    const filterOptions = processFilterOptions(filterType, filterOptionsStr);

    // Create the filter object
    const filter = createFilter(filterName, filterType, filterOptions);

    // Get existing document
    const docId = `categoryFilters-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    let doc;

    try {
      doc = await client.fetch(`*[_id == "${docId}"][0]`);
    } catch (error) {
      console.log("Document not found, will create new one");
    }

    if (!doc) {
      // Create new document if it doesn't exist
      doc = {
        _id: docId,
        _type: "categoryFilters",
        title: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize the category name
        filters: {
          filterItems: [filter],
        },
        categoryMappings: [],
      };

      // If path was specified, add only that path to mappings
      if (path) {
        doc.categoryMappings.push({
          _key: generateKey(),
          path,
          filters: [filterName],
        });
      } else {
        // Get all paths for this category
        const categoryPaths = await client.fetch(`
          *[_type == "product" && count((categoryPath[])[@ match "${category}*"]) > 0].categoryPath[]
        `);

        // Get unique paths that start with the category
        const uniquePaths = [
          ...new Set(categoryPaths.filter((p) => p && p.startsWith(category))),
        ].sort();

        console.log(
          `Found ${uniquePaths.length} paths for category ${category}`,
        );

        // Add each path to mappings
        uniquePaths.forEach((categoryPath) => {
          doc.categoryMappings.push({
            _key: generateKey(),
            path: categoryPath,
            filters: [filterName],
          });
        });
      }

      // Create the document
      await client.create(doc);
      console.log(
        `Created new document "${docId}" with filter "${filterName}"`,
      );
    } else {
      // Document exists, update it
      console.log(`Updating existing document "${docId}"`);

      // Check if filter already exists
      const existingFilterIndex = doc.filters.filterItems.findIndex(
        (f) => f.name.toLowerCase() === filterName.toLowerCase(),
      );

      if (existingFilterIndex >= 0) {
        // Replace existing filter
        doc.filters.filterItems[existingFilterIndex] = filter;
        console.log(`Replaced existing filter "${filterName}"`);
      } else {
        // Add new filter
        doc.filters.filterItems.push(filter);
        console.log(`Added new filter "${filterName}"`);
      }

      // Update category mappings
      if (path) {
        // Find the specific path
        const mappingIndex = doc.categoryMappings.findIndex(
          (m) => m.path === path,
        );

        if (mappingIndex >= 0) {
          // Add filter to existing path if not already there
          if (
            !doc.categoryMappings[mappingIndex].filters.includes(filterName)
          ) {
            doc.categoryMappings[mappingIndex].filters.push(filterName);
          }
        } else {
          // Add new mapping
          doc.categoryMappings.push({
            _key: generateKey(),
            path,
            filters: [filterName],
          });
        }
      } else {
        // Update all existing mappings for this category
        doc.categoryMappings.forEach((mapping) => {
          if (
            mapping.path.startsWith(category) &&
            !mapping.filters.includes(filterName)
          ) {
            mapping.filters.push(filterName);
          }
        });
      }

      // Update the document
      await client.createOrReplace(doc);
    }

    console.log("Operation completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Execute the script
addFilterToCategory();
