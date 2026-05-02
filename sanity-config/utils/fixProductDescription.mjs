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
 * Fix description for a single product
 */
async function fixSingleProductDescription(productId) {
  try {
    // Fetch the product by ID
    const product = await client.fetch(
      `*[_type == "product" && _id == $productId][0]{
      _id,
      title,
      brand,
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

    // Check if the description needs fixing
    if (!product.description) {
      console.log("❌ No description found for this product");
      return;
    }

    let needsFix = false;
    let fixedDescription = [];
    let fixReason = "";

    // Check if it's a string with HTML
    if (
      typeof product.description === "string" &&
      /<[a-z][\s\S]*>/i.test(product.description)
    ) {
      needsFix = true;
      fixReason = "Description is an HTML string";
      fixedDescription = htmlToPortableText(product.description);
    }
    // Check if it's portable text with embedded HTML
    else if (
      Array.isArray(product.description) &&
      containsEmbeddedHtml(product.description)
    ) {
      needsFix = true;
      fixReason = "Description is Portable Text with embedded HTML";
      fixedDescription = fixEmbeddedHtml(product.description);
    }

    if (!needsFix) {
      console.log("✅ Description format is correct. No fix needed.");
      console.log("\nCURRENT DESCRIPTION FORMAT:");
      console.log(
        Array.isArray(product.description)
          ? "Portable Text (Array)"
          : typeof product.description,
      );
      console.log("\nDESCRIPTION PREVIEW:");
      console.log(formatDescription(product.description));
      return;
    }

    // Display the changes
    console.log(`🔍 ISSUE DETECTED: ${fixReason}\n`);
    console.log("CURRENT DESCRIPTION:");
    console.log(formatDescription(product.description));

    console.log("\nFIXED DESCRIPTION:");
    console.log(formatDescription(fixedDescription));

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await question(
      rl,
      "\n⚠️ Apply these fixes to the description? (yes/no): ",
    );

    if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
      console.log("\n🔄 Updating product description...");
      try {
        const result = await client
          .patch(product._id)
          .set({ description: fixedDescription })
          .commit();

        console.log("✅ Update successful for product:", result._id);
      } catch (err) {
        console.error("❌ Update failed:", err.message);
      }
    } else {
      console.log("\n⏸️ Update canceled. No changes were made.");
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error fixing product description:", error);
  }
}

// Get product ID from command line
const productId = process.argv[2];

if (!productId) {
  console.log("Please provide a product ID as an argument.");
  console.log('Usage: node fix-product-description.js "productId"');
} else {
  // Install jsdom if not already installed
  console.log("Note: This script requires the 'jsdom' package to parse HTML.");
  console.log("If you haven't installed it, run: npm install jsdom\n");

  fixSingleProductDescription(productId);
}
