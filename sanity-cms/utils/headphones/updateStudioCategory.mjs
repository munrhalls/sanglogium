import client from "../getClient.mjs";

async function updateProduct(product) {
  const currentPath = product.categoryPath;

  // Skip if already categorized as studio
  if (
    Array.isArray(currentPath) &&
    currentPath.includes("headphones/studio-and-recording")
  ) {
    console.log(`Skipping ${product.title} - already in studio category`);
    return;
  }

  try {
    // Add studio category while preserving existing categories
    const existingCategories = Array.isArray(currentPath)
      ? currentPath
      : [currentPath];
    const newCategories = [
      ...existingCategories,
      "headphones/studio-and-recording",
    ];

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

async function isStudioHeadphone(product) {
  if (!product) return false;

  // Safely check title
  const title = (product.title || "").toLowerCase();

  // Safely check description
  const hasStudioInDescription =
    Array.isArray(product.description) &&
    product.description.some((block) => {
      if (!block || !Array.isArray(block.children)) return false;
      return block.children.some((child) => {
        const text = (child.text || "").toLowerCase();
        return (
          text.includes("studio") ||
          text.includes("monitor") ||
          text.includes("reference") ||
          text.includes("mixing") ||
          text.includes("mastering") ||
          text.includes("producer")
        );
      });
    });

  // Safely check overview fields
  const hasStudioInOverview =
    Array.isArray(product.overviewFields) &&
    product.overviewFields.some((field) => {
      const value = (field.value || "").toLowerCase();
      const info = (field.information || "").toLowerCase();
      return (
        value.includes("studio") ||
        value.includes("monitor") ||
        value.includes("reference") ||
        info.includes("studio use")
      );
    });

  return (
    title.includes("studio") ||
    title.includes("monitor") ||
    title.includes("reference") ||
    title.includes("professional") ||
    hasStudioInDescription ||
    hasStudioInOverview
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

    // Filter for studio-appropriate headphones
    const studioProducts = [];
    for (const product of products) {
      if (await isStudioHeadphone(product)) {
        studioProducts.push(product);
      }
    }

    console.log(
      `Found ${studioProducts.length} studio-appropriate headphones to update`,
    );

    if (studioProducts.length > 0) {
      console.log("\nStudio headphones to be updated:");
      studioProducts.forEach((product) => {
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
        `\nProceed with updating these ${studioProducts.length} studio headphones? (yes/no): `,
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

    // Update only the verified studio headphones
    const updates = studioProducts.map(updateProduct);
    await Promise.all(updates);

    console.log("All studio headphones updated successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
