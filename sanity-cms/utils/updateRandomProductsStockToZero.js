import client from "./getClient.mjs";

async function updateRandomProductsStockToZero() {
  try {
    // Get all products with their IDs and categories
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      categoryPath
    }`);

    console.log(`Total products found: ${allProducts.length}`);

    // Group products by top-level category
    const productsByCategory = new Map();

    allProducts.forEach((product) => {
      // Handle both array and string cases for categoryPath
      const cats = Array.isArray(product.categoryPath)
        ? product.categoryPath
        : [product.categoryPath];

      cats.forEach((cat) => {
        if (typeof cat === "string") {
          const topCategory = cat.split("/")[0];

          if (!productsByCategory.has(topCategory)) {
            productsByCategory.set(topCategory, []);
          }

          productsByCategory.get(topCategory).push(product._id);
        }
      });
    });

    console.log(`Found ${productsByCategory.size} top-level categories`);

    // Track all products that will be updated
    const productsToUpdate = [];

    // For each category, select 1-4 random products to update
    for (const [category, productIds] of productsByCategory.entries()) {
      // Determine random number between 1 and 4 (or the max available products)
      const numToUpdate = Math.min(
        Math.floor(Math.random() * 4) + 1,
        productIds.length,
      );

      console.log(
        `Category ${category}: Selecting ${numToUpdate} of ${productIds.length} products to update`,
      );

      // Shuffle and select random products
      const shuffled = [...productIds].sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, numToUpdate);

      // Add to our update list
      productsToUpdate.push(...selectedIds);
    }

    console.log(`Total products to update: ${productsToUpdate.length}`);

    // Perform the updates one by one - setting stock to exactly 0
    const updatePromises = productsToUpdate.map((id) => {
      // Set stock value to 0
      const stockValue = 0;

      // Use Sanity's patch and commit pattern for safety
      return client
        .patch(id)
        .set({ stock: stockValue })
        .commit()
        .then((updatedDoc) => {
          console.log(`Updated product ${id} with stock value ${stockValue}`);
          return updatedDoc;
        })
        .catch((err) => {
          console.error(`Failed to update product ${id}:`, err.message);
          return null;
        });
    });

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    const successCount = results.filter((result) => result !== null).length;

    console.log(
      `Update complete. Successfully updated ${successCount} of ${productsToUpdate.length} products with stock value 0.`,
    );
  } catch (error) {
    console.error("Error in update process:", error);
  }
}

// Run the function
updateRandomProductsStockToZero();
