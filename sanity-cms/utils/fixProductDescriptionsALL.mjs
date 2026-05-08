import client from "./getClient.mjs";
import readline from "readline";
import { JSDOM } from "jsdom";

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
 * Convert HTML string to Portable Text blocks
 */
function htmlToPortableText(html) {
  if (!html) return [];

  // Create a DOM to parse the HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const body = document.body;

  // Array to hold our Portable Text blocks
  const blocks = [];

  // Process each child node of the body
  Array.from(body.childNodes).forEach((node) => {
    // Handle different node types
    if (node.nodeType === 1) {
      // Element node
      const tagName = node.tagName.toLowerCase();

      // Handle different elements
      if (tagName === "p") {
        blocks.push({
          _type: "block",
          style: "normal",
          _key: Math.random().toString(36).substring(2, 15),
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: Math.random().toString(36).substring(2, 15),
              text: node.textContent,
              marks: [],
            },
          ],
        });
      } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
        blocks.push({
          _type: "block",
          style: tagName,
          _key: Math.random().toString(36).substring(2, 15),
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: Math.random().toString(36).substring(2, 15),
              text: node.textContent,
              marks: [],
            },
          ],
        });
      } else if (tagName === "ul" || tagName === "ol") {
        // Create a list block
        const listStyle = tagName === "ul" ? "bullet" : "number";
        const listItems = Array.from(node.children);

        listItems.forEach((item) => {
          if (item.tagName.toLowerCase() === "li") {
            blocks.push({
              _type: "block",
              style: listStyle,
              _key: Math.random().toString(36).substring(2, 15),
              level: 1,
              listItem: listStyle,
              markDefs: [],
              children: [
                {
                  _type: "span",
                  _key: Math.random().toString(36).substring(2, 15),
                  text: item.textContent,
                  marks: [],
                },
              ],
            });
          }
        });
      } else {
        // For other elements, just add their text content as a paragraph
        if (node.textContent.trim()) {
          blocks.push({
            _type: "block",
            style: "normal",
            _key: Math.random().toString(36).substring(2, 15),
            markDefs: [],
            children: [
              {
                _type: "span",
                _key: Math.random().toString(36).substring(2, 15),
                text: node.textContent,
                marks: [],
              },
            ],
          });
        }
      }
    } else if (node.nodeType === 3 && node.textContent.trim()) {
      // Text node
      // Add text nodes as paragraphs if they have content
      blocks.push({
        _type: "block",
        style: "normal",
        _key: Math.random().toString(36).substring(2, 15),
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: Math.random().toString(36).substring(2, 15),
            text: node.textContent,
            marks: [],
          },
        ],
      });
    }
    // Ignore comments and other node types
  });

  return blocks;
}

/**
 * Check if portable text blocks contain embedded HTML
 */
function containsEmbeddedHtml(blocks) {
  if (!Array.isArray(blocks)) return false;

  for (const block of blocks) {
    // Check if any block's text contains HTML tags
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (child.text && typeof child.text === "string") {
          // Check for HTML tags in the text
          if (/<[a-z][\s\S]*>/i.test(child.text)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Extract and convert embedded HTML from Portable Text
 */
function fixEmbeddedHtml(blocks) {
  if (!Array.isArray(blocks)) return [];

  let allHtml = "";

  // Extract all HTML text
  for (const block of blocks) {
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (child.text && typeof child.text === "string") {
          allHtml += child.text + "\n";
        }
      }
    }
  }

  // Convert the combined HTML to proper Portable Text
  return htmlToPortableText(allHtml);
}

/**
 * Determine if and how a product description needs fixing
 */
function analyzeDescription(description) {
  // Check if it's a string with HTML
  if (typeof description === "string" && /<[a-z][\s\S]*>/i.test(description)) {
    return {
      needsFix: true,
      fixReason: "HTML string",
      fixedDescription: htmlToPortableText(description),
    };
  }
  // Check if it's portable text with embedded HTML
  else if (Array.isArray(description) && containsEmbeddedHtml(description)) {
    return {
      needsFix: true,
      fixReason: "Portable Text with embedded HTML",
      fixedDescription: fixEmbeddedHtml(description),
    };
  }

  // No fix needed
  return {
    needsFix: false,
    fixReason: "",
    fixedDescription: description,
  };
}

/**
 * Format description for display
 */
function formatDescription(description) {
  if (Array.isArray(description)) {
    return description
      .map((block) => {
        if (block._type === "block" && block.children) {
          const text = block.children.map((child) => child.text).join(" ");
          const preview =
            text.length > 100 ? text.substring(0, 100) + "..." : text;
          return `${block.style?.toUpperCase() || "BLOCK"}: ${preview}`;
        }
        return JSON.stringify(block);
      })
      .join("\n");
  } else if (typeof description === "string") {
    // Truncate long strings for display
    if (description.length > 300) {
      return description.substring(0, 300) + "...";
    }
    return description;
  }
  return JSON.stringify(description);
}

/**
 * Fix descriptions for all products
 */
async function fixAllProductDescriptions() {
  try {
    console.log("🔍 Analyzing products with descriptions...");

    // Get all products with descriptions
    const allProducts =
      await client.fetch(`*[_type == "product" && defined(description)]{
      _id,
      title,
      brand,
      description
    }`);

    console.log(`📊 Found ${allProducts.length} products with descriptions`);

    // Identify products that need fixing
    const productsToFix = [];

    for (const product of allProducts) {
      const analysis = analyzeDescription(product.description);

      if (analysis.needsFix) {
        productsToFix.push({
          ...product,
          fixReason: analysis.fixReason,
          fixedDescription: analysis.fixedDescription,
        });
      }
    }

    console.log(`\n📋 SUMMARY:`);
    console.log(`Total products analyzed: ${allProducts.length}`);
    console.log(`Products needing fixes: ${productsToFix.length}`);

    if (productsToFix.length === 0) {
      console.log("\n✅ No products need fixing. Exiting.");
      return;
    }

    // Show breakdown of issues
    const htmlStringCount = productsToFix.filter(
      (p) => p.fixReason === "HTML string",
    ).length;
    const embeddedHtmlCount = productsToFix.filter(
      (p) => p.fixReason === "Portable Text with embedded HTML",
    ).length;

    console.log(`\nIssue breakdown:`);
    console.log(`- HTML strings: ${htmlStringCount} products`);
    console.log(
      `- Embedded HTML in Portable Text: ${embeddedHtmlCount} products`,
    );

    // Create a readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Get confirmation to proceed
    const initialAnswer = await question(
      rl,
      `\n⚠️ Found ${productsToFix.length} products with description issues. Proceed with individual confirmation for the first 3? (yes/no): `,
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
      console.log(
        `PRODUCT ${index + 1} OF 3: ${product.title || product.brand || product._id}`,
      );
      console.log(`ID: ${product._id}`);
      console.log(`ISSUE: ${product.fixReason}`);
      console.log(`======================================================`);

      // Display the changes
      console.log("\n🔍 DESCRIPTION CHANGES:\n");
      console.log("BEFORE:");
      console.log(formatDescription(product.description));

      console.log("\nAFTER:");
      console.log(formatDescription(product.fixedDescription));

      // Get confirmation for this specific product
      const answer = await question(
        rl,
        `\n⚠️ Apply these changes to product ${index + 1}? (yes/no): `,
      );

      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        console.log(`🔄 Updating product ${index + 1}...`);
        try {
          await client
            .patch(product._id)
            .set({ description: product.fixedDescription })
            .commit();

          console.log(
            `✅ Successfully updated product: ${product.title || product.brand || product._id}`,
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
        console.log(`⏸️ Skipped updating product ${index + 1}`);

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
              .set({ description: product.fixedDescription })
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
    console.error("❌ Error fixing product descriptions:", error);
  }
}

// Install jsdom if not already installed
console.log("Note: This script requires the 'jsdom' package to parse HTML.");
console.log("If you haven't installed it, run: npm install jsdom\n");

// Run the function
fixAllProductDescriptions();
