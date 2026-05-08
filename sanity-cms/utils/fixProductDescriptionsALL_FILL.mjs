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
 * Check if a description is effectively empty
 */
function isDescriptionEmpty(description) {
  // If description is undefined or null
  if (!description) return true;

  // If description is an empty array
  if (Array.isArray(description) && description.length === 0) return true;

  // If description is an empty string
  if (typeof description === "string" && description.trim() === "") return true;

  // If description is an array with empty text blocks
  if (Array.isArray(description)) {
    // Check if all blocks are empty or have empty text
    const hasContent = description.some((block) => {
      if (
        !block.children ||
        !Array.isArray(block.children) ||
        block.children.length === 0
      ) {
        return false;
      }

      return block.children.some(
        (child) =>
          child.text &&
          typeof child.text === "string" &&
          child.text.trim() !== "",
      );
    });

    return !hasContent;
  }

  return false;
}

/**
 * Generate a simple, generic description based on product name and other properties
 */
function generateSimpleDescription(product) {
  const name = product.title || product.brand || "Product";
  const type = getProductType(product);

  // Create a basic Portable Text block
  return [
    {
      _type: "block",
      style: "normal",
      _key: Math.random().toString(36).substring(2, 15),
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: Math.random().toString(36).substring(2, 15),
          text: getSimpleText(name, type),
          marks: [],
        },
      ],
    },
  ];
}

/**
 * Try to determine product type from categoryPath or other properties
 */
function getProductType(product) {
  // Check for category path
  if (product.categoryPath) {
    const catPath = Array.isArray(product.categoryPath)
      ? product.categoryPath[0]
      : product.categoryPath;

    if (typeof catPath === "string") {
      const parts = catPath.split("/");
      return parts[parts.length - 1] || "product";
    }
  }

  // Check product name for type hints
  const name = (product.title || product.brand || "").toLowerCase();

  if (
    name.includes("headphone") ||
    name.includes("iem") ||
    name.includes("earphone")
  ) {
    return "headphones";
  } else if (
    name.includes("cable") ||
    name.includes("cord") ||
    name.includes("wire")
  ) {
    return "cable";
  } else if (name.includes("amp") || name.includes("amplifier")) {
    return "amplifier";
  } else if (name.includes("dac")) {
    return "DAC";
  } else if (name.includes("speaker")) {
    return "speaker";
  }

  // Default product type
  return "audio product";
}

/**
 * Generate a simple, natural-sounding text description
 * Keeping it short and straightforward
 */
function getSimpleText(name, type) {
  // Simple descriptions based on type
  switch (type.toLowerCase()) {
    case "cable":
    case "cables":
      return `Audio cable with durable construction and solid connectors.`;

    case "headphone":
    case "headphones":
    case "iem":
      return `Quality headphones with clear sound reproduction.`;

    case "speaker":
    case "speakers":
      return `Reliable speaker delivering balanced sound performance.`;

    case "amp":
    case "amplifier":
      return `Solid amplifier for powering audio equipment.`;

    case "dac":
      return `Digital-to-analog converter for audio playback.`;

    default:
      // Very simple fallback templates
      const templates = [
        `Quality audio product for music enthusiasts.`,
        `Reliable audio accessory built to last.`,
        `Audio component with solid performance.`,
        `Well-built audio equipment for home setups.`,
      ];
      return templates[Math.floor(Math.random() * templates.length)];
  }
}

/**
 * Fill in description for a single product
 */
async function fillSingleProduct(productId) {
  try {
    // Fetch the product by ID
    const product = await client.fetch(
      `*[_type == "product" && _id == $productId][0]{
      _id,
      title,
      brand,
      categoryPath,
      description
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

    // Check if the product already has a non-empty description
    if (product.description && !isDescriptionEmpty(product.description)) {
      console.log("ℹ️ This product already has a description.");
      console.log("Description preview:");
      console.log("--------------------------");

      if (Array.isArray(product.description)) {
        const text = product.description
          .filter((block) => block.children)
          .map((block) => block.children.map((child) => child.text).join(""))
          .join("\n");
        console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
      } else if (typeof product.description === "string") {
        console.log(
          product.description.substring(0, 200) +
            (product.description.length > 200 ? "..." : ""),
        );
      } else {
        console.log(
          JSON.stringify(product.description).substring(0, 200) + "...",
        );
      }

      return;
    }

    // Generate a simple description
    const simpleDescription = generateSimpleDescription(product);

    console.log("Proposed description:");
    console.log("--------------------");
    const descriptionText = simpleDescription[0].children[0].text;
    console.log(descriptionText);
    console.log("--------------------");

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await question(
      rl,
      `\n⚠️ Add this description to the product? (yes/no): `,
    );

    if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
      console.log("\n🔄 Adding description to product...");
      try {
        const result = await client
          .patch(product._id)
          .set({ description: simpleDescription })
          .commit();

        console.log(
          `✅ Successfully added description to product: ${result._id}`,
        );
      } catch (err) {
        console.error("❌ Update failed:", err.message);
      }
    } else {
      console.log("\n⏸️ Operation canceled. No changes were made.");
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error processing product:", error);
  }
}

/**
 * Fill in descriptions for all products with empty descriptions
 */
async function fillAllProducts() {
  try {
    console.log("🔍 Finding products with empty descriptions...");

    // First get all products - we need to check each one for empty descriptions
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      brand,
      categoryPath,
      description
    }`);

    console.log(`📊 Found ${allProducts.length} total products`);

    // Filter for products with empty descriptions
    const productsWithEmptyDescriptions = allProducts.filter((product) =>
      isDescriptionEmpty(product.description),
    );

    console.log(
      `📊 Found ${productsWithEmptyDescriptions.length} products with empty or missing descriptions`,
    );

    if (productsWithEmptyDescriptions.length === 0) {
      console.log("\n✅ All products already have descriptions. Exiting.");
      return;
    }

    // Create a readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Show sample of products to be processed
    console.log("\n🔍 SAMPLE OF PRODUCTS WITH EMPTY DESCRIPTIONS (up to 3):");
    productsWithEmptyDescriptions.slice(0, 3).forEach((product, index) => {
      const simpleDescription = generateSimpleDescription(product);
      const descriptionText = simpleDescription[0].children[0].text;

      console.log(
        `\n${index + 1}. ${product.title || product.brand || product._id} (${product._id})`,
      );
      console.log(
        "Current description: " + (product.description ? "Empty" : "None"),
      );
      console.log("Proposed description:");
      console.log("--------------------");
      console.log(descriptionText);
      console.log("--------------------");
    });

    // Get confirmation to proceed
    const initialAnswer = await question(
      rl,
      `\n⚠️ Found ${productsWithEmptyDescriptions.length} products with empty descriptions. Proceed with individual confirmation for the first 3? (yes/no): `,
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
    const firstThree = productsWithEmptyDescriptions.slice(0, 3);
    const remainingProducts = productsWithEmptyDescriptions.slice(3);
    let proceedWithRemaining = true;

    for (const [index, product] of firstThree.entries()) {
      console.log(`\n======================================================`);
      console.log(
        `PRODUCT ${index + 1} OF 3: ${product.title || product.brand || product._id}`,
      );
      console.log(`ID: ${product._id}`);
      console.log(`======================================================`);

      // Generate a simple description
      const simpleDescription = generateSimpleDescription(product);
      const descriptionText = simpleDescription[0].children[0].text;

      console.log(
        "Current description: " + (product.description ? "Empty" : "None"),
      );
      console.log("Proposed description:");
      console.log("--------------------");
      console.log(descriptionText);
      console.log("--------------------");

      // Get confirmation for this specific product
      const answer = await question(
        rl,
        `\n⚠️ Add this description to the product? (yes/no): `,
      );

      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        console.log(`🔄 Adding description to product ${index + 1}...`);
        try {
          await client
            .patch(product._id)
            .set({ description: simpleDescription })
            .commit();

          console.log(
            `✅ Successfully added description to product: ${product.title || product.brand || product._id}`,
          );
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
        console.log(`⏸️ Skipped product ${index + 1}`);

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
            const simpleDescription = generateSimpleDescription(product);

            await client
              .patch(product._id)
              .set({ description: simpleDescription })
              .commit();

            successCount++;

            // Show progress every 10 products or at the end
            if (
              successCount % 10 === 0 ||
              successCount === remainingProducts.length
            ) {
              console.log(
                `Progress: ${successCount}/${remainingProducts.length} additional products processed`,
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
          `Successfully added descriptions to: ${successCount} additional products`,
        );
        console.log(`Failed to update: ${errorCount} products`);
      } else {
        console.log("\n⏸️ Remaining operations canceled.");
      }
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error processing products:", error);
  }
}

// Get command line arguments
const command = process.argv[2];
const productId = process.argv[3];

if (command === "single" && productId) {
  console.log(`🔍 Checking if product needs a description...`);
  fillSingleProduct(productId);
} else if (command === "all") {
  console.log(`🔍 Finding all products with empty descriptions...`);
  fillAllProducts();
} else {
  console.log("Please provide a valid command and product ID (if applicable).");
  console.log("Usage:");
  console.log(
    '  For a single product: node fill-empty-descriptions.js single "productId"',
  );
  console.log("  For all products: node fill-empty-descriptions.js all");
}
