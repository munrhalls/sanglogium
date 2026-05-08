import client from "../getClient.mjs";

async function updateProduct(product) {
  const currentPath = product.categoryPath;

  // Skip if already categorized as gaming
  if (Array.isArray(currentPath) && currentPath.includes("headphones/gaming")) {
    console.log(`Skipping ${product.title} - already in gaming category`);
    return;
  }

  try {
    // Add gaming category while preserving existing categories
    const existingCategories = Array.isArray(currentPath)
      ? currentPath
      : [currentPath];
    const newCategories = [...existingCategories, "headphones/gaming"];

    const result = await client
      .patch(product._id)
      .set({ categoryPath: newCategories })
      .commit();

    console.log(
      `Updated ${product.title} with categories: ${newCategories.join(", ")}`,
    );
    return result;
  } catch (error) {
    console.error(`Failed to update ${product.title}:`, error.message);
  }
}

async function isGamingHeadphone(product) {
  if (!product) return false;

  // Gaming indicators in strings
  const gamingKeywords = [
    "gaming",
    "game",
    "gamer",
    "esports",
    "discord",
    "playstation",
    "xbox",
    "nintendo",
    "ps4",
    "ps5",
    "multiplayer",
    "chat",
    "voice",
    "mic",
    "microphone",
  ];

  // Safely check title
  const title = (product.title || "").toLowerCase();

  // Safely check description
  const hasGamingInDescription =
    Array.isArray(product.description) &&
    product.description.some((block) => {
      if (!block || !Array.isArray(block.children)) return false;
      return block.children.some((child) => {
        const text = (child.text || "").toLowerCase();
        return gamingKeywords.some((keyword) => text.includes(keyword));
      });
    });

  // Safely check overview fields
  const hasGamingInOverview =
    Array.isArray(product.overviewFields) &&
    product.overviewFields.some((field) => {
      const value = (field.value || "").toLowerCase();
      const info = (field.information || "").toLowerCase();
      return gamingKeywords.some(
        (keyword) => value.includes(keyword) || info.includes(keyword),
      );
    });

  // Check specifications for gaming features
  const hasGamingSpecs =
    Array.isArray(product.specifications) &&
    product.specifications.some((spec) => {
      const title = (spec.title || "").toLowerCase();
      const value = (spec.value || "").toLowerCase();
      return gamingKeywords.some(
        (keyword) => title.includes(keyword) || value.includes(keyword),
      );
    });

  // Additional check for common gaming headset features
  const hasMicrophone =
    Array.isArray(product.overviewFields) &&
    product.overviewFields.some((field) => {
      const value = (field.value || "").toLowerCase();
      return value.includes("microphone") || value.includes("mic");
    });

  return (
    gamingKeywords.some((keyword) => title.includes(keyword)) ||
    hasGamingInDescription ||
    hasGamingInOverview ||
    hasGamingSpecs ||
    hasMicrophone
  );
}

async function updateAllProducts() {
  try {
    // Fetch headphone products with all relevant fields for analysis
    const products = await client.fetch(`*[
      _type == "product" &&
      categoryPath match "headphones/*"
    ]{
      _id,
      title,
      categoryPath,
      overviewFields,
      description,
      specifications
    }`);

    // Filter for gaming-appropriate headphones
    const gamingProducts = [];
    for (const product of products) {
      if (await isGamingHeadphone(product)) {
        gamingProducts.push(product);
      }
    }

    console.log(
      `Found ${gamingProducts.length} gaming-appropriate headphones to update`,
    );

    if (gamingProducts.length > 0) {
      console.log("\nGaming headphones to be updated:");
      gamingProducts.forEach((product) => {
        console.log(
          `- ${product.title} (Current category: ${product.categoryPath})`,
        );
      });
    }

    const readline = (await import("readline")).default;
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldProceed = await new Promise((resolve) => {
      rl.question(
        `\nProceed with updating these ${gamingProducts.length} gaming headphones? (yes/no): `,
        (answer) => {
          resolve(answer.toLowerCase() === "yes");
          rl.close();
        },
      );
    });

    if (!shouldProceed) {
      console.log("Update cancelled.");
      return;
    }

    // Update only the verified gaming headphones
    const updates = gamingProducts.map(updateProduct);
    await Promise.all(updates);

    console.log("All gaming headphones updated successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
