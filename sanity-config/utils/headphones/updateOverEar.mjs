import client from "../getClient.mjs";

async function updateProduct(product) {
  // Skip if already correctly categorized
  if (
    Array.isArray(product.categoryPath) &&
    product.categoryPath.includes("headphones/over-ear")
  ) {
    return;
  }

  try {
    const existingCategories = Array.isArray(product.categoryPath)
      ? product.categoryPath
      : [product.categoryPath];

    // Replace or add over-ear category
    const newCategories = existingCategories
      .filter((cat) => !cat.includes("over-ear"))
      .concat(["headphones/over-ear"]);

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

    const overEarProducts = products.filter((product) => {
      const wearingStyle = product.overviewFields?.find((field) =>
        field.title?.toLowerCase().includes("wearing style"),
      );
      return wearingStyle?.value === "Over-ear";
    });

    console.log(
      `Found ${overEarProducts.length} over-ear headphones to update`,
    );

    if (overEarProducts.length > 0) {
      console.log("\nOver-ear headphones to be updated:");
      overEarProducts.forEach((product) => {
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
          `\nProceed with updating these ${overEarProducts.length} over-ear headphones? (yes/no): `,
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

      const updates = overEarProducts.map(updateProduct);
      await Promise.all(updates);
      console.log("All over-ear headphones updated successfully!");
    } else {
      console.log("No over-ear headphones found that need updating.");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
