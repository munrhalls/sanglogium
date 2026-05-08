import { createClient } from "@sanity/client";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import products from "../sang-logium-data/productData.json" with { type: "json" };

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // Requires write permissions
  useCdn: false,
  apiVersion: "2024-11-26", // Use the current date or a specific version
});

// Function to upload an image to Sanity
async function uploadImage(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const asset = await client.assets.upload("image", buffer, {
    filename: url.split("/").pop(),
  });
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
  };
}

// Function to convert HTML to Portable Text
function processBlocks(paragraphs) {
  const blocks = [];

  paragraphs.forEach((element) => {
    blocks.push({
      _type: "block",
      style: element.tagName.toLowerCase(),
      children: [
        {
          _type: "span",
          text: element.textContent,
        },
      ],
    });
  });

  return blocks;
}

async function importProducts() {
  for (const product of products) {
    try {
      // Map and transform data
      const name = product.title || "Unnamed Product";

      // Generate slug from name
      const slug = {
        _type: "slug",
        current: name.toLowerCase().replace(/\s+/g, "-").slice(0, 96),
      };

      // Upload the first image
      let image = null;

      if (product.images && product.images.length > 0) {
        image = await uploadImage(product.images[0]);
      }

      // Convert description HTML to Portable Text
      const dom = new JSDOM(product.description);
      const paragraphs = Array.from(dom.window.document.body.children);
      const description = processBlocks(paragraphs);

      // Parse price to number
      const price = parseFloat(product.price) || 0;

      // Set stock and categories
      const stock = 0; // Default stock value
      // const categories = []; // Add category references if available

      // Create the product document
      // Create the product document
      const doc = {
        _type: "product",
        name: name,
        slug: slug,
        image: image,
        description: description,
        price: price,
        stock: stock,
        // Single category reference
        category: {
          _type: "reference",
          _ref: "some-category-id", // Need to create/fetch category first
        },
        // Subcategory object with reference
        subcategory: {
          ref: {
            _type: "reference",
            _ref: "some-subcategory-id", // Need to create/fetch subcategory first
          },
        },
      };

      // Create the document in Sanity
      await client.create(doc);
    } catch (error) {
      console.error(`Error importing product ${product.title}:`, error.message);
    }
  }
}

importProducts();
