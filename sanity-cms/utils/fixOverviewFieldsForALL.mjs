import client from "./getClient.mjs";
import readline from "readline";

/**
 * Create a promise-based readline question
 */
function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Script to fix overviewFields for all products
 * Shows and confirms the first three products individually, then processes the rest
 */
async function fixAllProducts() {
  try {
    console.log("🔍 Analyzing products with overviewFields...");

    // Get all products with overviewFields
    const allProducts =
      await client.fetch(`*[_type == "product" && defined(overviewFields)]{
      _id,
      title,
      brand,
      overviewFields
    }`);

    console.log(`📊 Found ${allProducts.length} products with overviewFields`);

    // Analyze products to see which ones need fixing
    const productsToFix = [];

    for (const product of allProducts) {
      let needsFix = false;
      const fixedFields = [];

      // Check each field in the product
      for (const field of product.overviewFields) {
        const fixedField = { ...field };

        // Check if this field has the "More information" issue
        if (
          field.title &&
          typeof field.title === "string" &&
          field.title.includes("More information")
        ) {
          needsFix = true;

          // Split the title into actual title and description
          const parts = field.title.split("More information");
          fixedField.title = parts[0].trim().replace(/\s*:\s*$/, ""); // Remove trailing colon

          // Get description from the title if it exists there
          const descriptionFromTitle = parts[1] ? parts[1].trim() : "";

          // Set the description
          if (
            descriptionFromTitle &&
            (!field.description || field.description === "")
          ) {
            fixedField.description = descriptionFromTitle;
          }
        }

        fixedFields.push(fixedField);
      }

      // If this product needs fixing, add it to our list
      if (needsFix) {
        productsToFix.push({
          _id: product._id,
          title: product.title || product.brand || product._id,
          originalFields: product.overviewFields,
          fixedFields,
        });
      }
    }

    // Show summary
    console.log(`\n📋 SUMMARY:`);
    console.log(`Total products analyzed: ${allProducts.length}`);
    console.log(`Products needing fixes: ${productsToFix.length}`);

    if (productsToFix.length === 0) {
      console.log("\n✅ No products need fixing. Exiting.");
      return;
    }

    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Get confirmation to proceed
    const initialAnswer = await question(
      rl,
      `\n⚠️ Found ${productsToFix.length} products to fix. Proceed with individual confirmation for the first 3? (yes/no): `,
    );

    if (
      initialAnswer.toLowerCase() !== "yes" &&
      initialAnswer.toLowerCase() !== "y"
    ) {
      console.log("\n⏸️ Process canceled. No changes were made.");
      rl.close();
      return;
    }

    // Process the first 3 products with individual confirmation
    const firstThree = productsToFix.slice(0, 3);
    const remainingProducts = productsToFix.slice(3);
    let proceedWithRemaining = true;

    for (const [index, product] of firstThree.entries()) {
      console.log(`\n======================================================`);
      console.log(`PRODUCT ${index + 1} OF 3: ${product.title}`);
      console.log(`ID: ${product._id}`);
      console.log(`======================================================`);

      // Display the changes
      console.log("\n🔍 FIELD CHANGES:\n");

      product.originalFields.forEach((originalField, fieldIndex) => {
        const fixedField = product.fixedFields[fieldIndex];

        // Check if this field was changed
        if (
          originalField.title !== fixedField.title ||
          originalField.description !== fixedField.description
        ) {
          console.log(`📝 Field ${fieldIndex + 1}:`);
          console.log(`  BEFORE:`);
          console.log(`    Title: "${originalField.title}"`);
          console.log(`    Value: "${originalField.value}"`);
          console.log(`    Description: "${originalField.description || ""}"`);

          console.log(`  AFTER:`);
          console.log(`    Title: "${fixedField.title}"`);
          console.log(`    Value: "${fixedField.value}"`);
          console.log(`    Description: "${fixedField.description || ""}"`);
          console.log();
        }
      });

      // Get confirmation for this specific product
      const answer = await question(
        rl,
        `\n⚠️ Apply these changes to product ${index + 1} (${product.title})? (yes/no): `,
      );

      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        console.log(`🔄 Updating product ${index + 1}...`);
        try {
          await client
            .patch(product._id)
            .set({ overviewFields: product.fixedFields })
            .commit();

          console.log(`✅ Successfully updated product: ${product.title}`);
        } catch (err) {
          console.error(
            `❌ Failed to update product ${product._id}: ${err.message}`,
          );

          // Ask if we should continue with the rest
          const continueAnswer = await question(
            rl,
            `\n⚠️ Error occurred. Continue with remaining products? (yes/no): `,
          );
          if (
            continueAnswer.toLowerCase() !== "yes" &&
            continueAnswer.toLowerCase() !== "y"
          ) {
            proceedWithRemaining = false;
            break;
          }
        }
      } else {
        console.log(
          `⏸️ Skipped updating product ${index + 1}: ${product.title}`,
        );

        // Ask if we should continue with the rest
        const continueAnswer = await question(
          rl,
          `\n⚠️ Continue with remaining products? (yes/no): `,
        );
        if (
          continueAnswer.toLowerCase() !== "yes" &&
          continueAnswer.toLowerCase() !== "y"
        ) {
          proceedWithRemaining = false;
          break;
        }
      }
    }

    // Process remaining products if confirmed
    if (proceedWithRemaining && remainingProducts.length > 0) {
      const finalConfirmation = await question(
        rl,
        `\n⚠️ Process the remaining ${remainingProducts.length} products automatically? (yes/no): `,
      );

      if (
        finalConfirmation.toLowerCase() === "yes" ||
        finalConfirmation.toLowerCase() === "y"
      ) {
        console.log(
          `\n🔄 Processing remaining ${remainingProducts.length} products...`,
        );

        let successCount = 0;
        let errorCount = 0;

        for (const [index, product] of remainingProducts.entries()) {
          try {
            await client
              .patch(product._id)
              .set({ overviewFields: product.fixedFields })
              .commit();

            successCount++;

            // Show progress every 10 products or at the end
            if (
              successCount % 10 === 0 ||
              successCount === remainingProducts.length
            ) {
              console.log(
                `Progress: ${successCount}/${remainingProducts.length} additional products updated`,
              );
            }
          } catch (err) {
            console.error(
              `❌ Failed to update product ${product._id}: ${err.message}`,
            );
            errorCount++;
          }
        }

        console.log("\n✅ COMPLETED!");
        console.log(
          `Successfully updated: ${successCount} additional products`,
        );
        console.log(`Failed to update: ${errorCount} products`);
      } else {
        console.log("\n⏸️ Remaining updates canceled.");
      }
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error fixing products:", error);
  }
}

// Run the function
fixAllProducts();
