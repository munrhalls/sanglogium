import client from "../getClient.mjs";

// Function to update a single product
async function updateProduct(product) {
  const currentPath = product.categoryPath;

  // Skip if categoryPath is already an array
  if (Array.isArray(currentPath)) {
    console.log(`Skipping ${product.title} - already an array`);
    return;
  }

  try {
    // Patch the document to update categoryPath to an array
    const result = await client
      .patch(product._id)
      .set({ categoryPath: [currentPath] })
      .commit();

    console.log(`Updated ${product.title}`);
    return result;
  } catch (error) {
    console.error(`Failed to update ${product.title}:`, error.message);
  }
}

// Main function to fetch and update all products
async function updateAllProducts() {
  try {
    // Fetch all products
    const products = await client.fetch(`*[_type == "product"]`);
    console.log(`Found ${products.length} products to update`);

    // Confirm before proceeding
    const readline = (await import("readline")).default;
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldProceed = await new Promise((resolve) => {
      rl.question(
        `Proceed with updating ${products.length} products? (yes/no): `,
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

    // Update products in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const updates = batch.map(updateProduct);
      await Promise.all(updates);
      console.log(`Completed batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log("All products updated successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
