// Fetch example product from Sanity and save to JSON
import { config } from "dotenv";
import { createClient } from "next-sanity";
import fs from "fs";
import path from "path";

// Load environment variables BEFORE any other imports
config({ path: ".env.local" });

// Inline env setup (matching sanity/env.ts logic)
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!projectId || !dataset) {
  console.error("Missing required Sanity environment variables");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

async function fetchExampleProduct() {
  try {
    // Fetch first product with all fields
    const product = await client.fetch(`
      *[_type == "product"][0] {
        _id,
        _createdAt,
        _updatedAt,
        _rev,
        _type,
        name,
        slug,
        brand->{
          _id,
          _type,
          name,
          slug
        },
        stripePriceId,
        displayPrice,
        stock,
        sku,
        image {
          _type,
          asset->{
            _id,
            _type,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          },
          hotspot,
          crop
        },
        gallery[] {
          _type,
          asset->{
            _id,
            _type,
            url,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              }
            }
          }
        },
        catalogueLocationKeys,
        overviewFields[] {
          _key,
          title,
          value,
          information
        },
        specifications[] {
          _key,
          title,
          value,
          information
        }
      }
    `);

    if (!product) {
      console.error("No products found in dataset");
      process.exit(1);
    }

    // Ensure directory exists
    const outputDir = path.join(process.cwd(), "_temporary", "filters");
    fs.mkdirSync(outputDir, { recursive: true });

    // Write JSON file
    const outputPath = path.join(outputDir, "example-product.json");
    fs.writeFileSync(outputPath, JSON.stringify(product, null, 2));

    console.log(`✅ Example product saved to: ${outputPath}`);
    console.log(`📦 Product: ${product.name}`);
    console.log(`🆔 ID: ${product._id}`);
  } catch (error) {
    console.error("❌ Failed to fetch product:", error);
    process.exit(1);
  }
}

fetchExampleProduct();
