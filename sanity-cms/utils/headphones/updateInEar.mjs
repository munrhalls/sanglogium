import client from "../getClient.mjs";

async function updateProduct(product) {
  // Skip if already correctly categorized
  if (
    Array.isArray(product.categoryPath) &&
    product.categoryPath.includes("headphones/in-ear")
  ) {
    return;
  }

  try {
    const existingCategories = Array.isArray(product.categoryPath)
      ? product.categoryPath
      : [product.categoryPath];

    // Replace or add in-ear category
    const newCategories = existingCategories
      .filter((cat) => !cat.includes("in-ear"))
      .concat(["headphones/in-ear"]);

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
    const products = await client.fetch(`*[
      _type == "product" &&
      categoryPath match "headphones/*"
    ]{
      _id,
      title,
      categoryPath,
      overviewFields
    }`);

    const inEarProducts = products.filter((product) => {
      const wearingStyle = product.overviewFields?.find((field) =>
        field.title?.toLowerCase().includes("wearing style"),
      );
      return wearingStyle?.value === "In-ear";
    });

    console.log(`Found ${inEarProducts.length} in-ear headphones to update`);

    if (inEarProducts.length > 0) {
      console.log("\nIn-ear headphones to be updated:");
      inEarProducts.forEach((product) => {
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
          `\nProceed with updating these ${inEarProducts.length} in-ear headphones? (yes/no): `,
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

      const updates = inEarProducts.map(updateProduct);
      await Promise.all(updates);
      console.log("All in-ear headphones updated successfully!");
    } else {
      console.log("No in-ear headphones found that need updating.");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
