import client from "./getClient.mjs";
import readline from "readline";

/**
 * Script to fix overviewFields for a specific product by ID
 * Asks for confirmation before making any changes
 */
async function fixSingleProduct(productId) {
  try {
    // Fetch the specific product by ID
    const product = await client.fetch(
      `*[_type == "product" && _id == $productId][0]{
      _id,
      title,
      brand,
      overviewFields
    }`,
      { productId },
    );

    if (!product) {
      console.log(`\n❌ No product found with ID: ${productId}`);
      return;
    }

    console.log("\n======================================================");
    console.log(`📦 PRODUCT: ${product.title || product.brand || product._id}`);
    console.log(`🔑 ID: ${product._id}`);
    console.log("======================================================\n");

    // Check if product has overview fields
    if (!product.overviewFields || product.overviewFields.length === 0) {
      console.log("❌ No overview fields found for this product");
      return;
    }

    // Process the fields to fix them
    const fixedFields = [];
    const changedFields = [];

    // Track changes for clean display
    let changesMade = false;

    for (const field of product.overviewFields) {
      // Create a copy to modify
      const fixedField = { ...field };
      let fieldChanged = false;

      // Check if the title contains "More information"
      if (
        field.title &&
        typeof field.title === "string" &&
        field.title.includes("More information")
      ) {
        changesMade = true;
        fieldChanged = true;

        // Split the title into actual title and description
        const parts = field.title.split("More information");
        fixedField.title = parts[0].trim().replace(/\s*:\s*$/, ""); // Remove trailing colon if present

        // Get description from the title if it exists there
        const descriptionFromTitle = parts[1] ? parts[1].trim() : "";

        // Set the description
        if (
          descriptionFromTitle &&
          (!field.description || field.description === "")
        ) {
          fixedField.description = descriptionFromTitle;
        }

        // Track the changes for display
        changedFields.push({
          original: field,
          fixed: fixedField,
        });
      }

      fixedFields.push(fixedField);
    }

    // If no changes needed, exit
    if (!changesMade) {
      console.log("✅ No issues found with overview fields, no update needed.");
      return;
    }

    // Display changes in a clean format
    console.log("🔍 FIELD CHANGES NEEDED:\n");

    changedFields.forEach((change, index) => {
      console.log(`📝 Field ${index + 1}:`);
      console.log(`  BEFORE:`);
      console.log(`    Title: "${change.original.title}"`);
      console.log(`    Value: "${change.original.value}"`);
      console.log(`    Description: "${change.original.description || ""}"`);

      console.log(`  AFTER:`);
      console.log(`    Title: "${change.fixed.title}"`);
      console.log(`    Value: "${change.fixed.value}"`);
      console.log(`    Description: "${change.fixed.description || ""}"`);
      console.log();
    });

    // Ask for confirmation before updating
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "\n⚠️ Do you want to apply these changes? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          console.log("\n🔄 Updating product in Sanity...");
          try {
            const result = await client
              .patch(product._id)
              .set({ overviewFields: fixedFields })
              .commit();

            console.log("✅ Update successful for product:", result._id);
          } catch (err) {
            console.error("❌ Update failed:", err.message);
          }
        } else {
          console.log("\n⏸️ Update canceled. No changes were made.");
        }
        rl.close();
      },
    );
  } catch (error) {
    console.error("❌ Error fixing overview fields:", error);
  }
}

// Get command line arguments
const productId = process.argv[2];

if (!productId) {
  console.log("Please provide a product ID as an argument.");
  console.log('Usage: node fix-single-product.js "productId"');
} else {
  fixSingleProduct(productId);
}
