import client from "../getClient.mjs";

async function updateProduct(product) {
  const currentPath = product.categoryPath;

  // Verify this is a wired headphone by checking connectivity
  const connectivityField = product.overviewFields?.find((field) =>
    field.title.toLowerCase().includes("connectivity"),
  );

  if (!connectivityField || connectivityField.value.toLowerCase() !== "wired") {
    console.log(`Skipping ${product.title} - not a wired product`);
    return;
  }

  try {
    // Create array with both categories
    const newCategories = [currentPath, "headphones/wired"];

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

async function updateAllProducts() {
  try {
    // Only fetch headphone products and include their overviewFields
    const products = await client.fetch(`*[
      _type == "product" &&
      categoryPath match "headphones/*"
    ]{
      _id,
      title,
      categoryPath,
      overviewFields
    }`);

    // Filter for wired products before proceeding
    const wiredProducts = products.filter((product) => {
      const connectivityField = product.overviewFields?.find((field) =>
        field.title.toLowerCase().includes("connectivity"),
      );
      return connectivityField?.value.toLowerCase() === "wired";
    });

    console.log(`Found ${wiredProducts.length} wired headphones to update`);
    console.log("\nWired headphones to be updated:");
    wiredProducts.forEach((product) => {
      console.log(
        `- ${product.title} (Current category: ${product.categoryPath})`,
      );
    });

    const readline = (await import("readline")).default;
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldProceed = await new Promise((resolve) => {
      rl.question(
        `\nProceed with updating these ${wiredProducts.length} wired headphones? (yes/no): `,
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

    // Update only the verified wired headphones
    const updates = wiredProducts.map(updateProduct);
    await Promise.all(updates);

    console.log("All wired headphones updated successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
