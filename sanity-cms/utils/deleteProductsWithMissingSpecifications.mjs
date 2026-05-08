import client from "./getClient.mjs";

async function deleteProductsWithGenericSpecs() {
  try {
    // Get all products with their specifications
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      brand,
      categoryPath,
      specifications
    } | order(title asc)`);

    console.log(`Total products in database: ${allProducts.length}`);

    // Filter products that have specifications with "See product documentation"
    const productsToDelete = allProducts.filter((product) => {
      if (!product.specifications || product.specifications.length === 0) {
        return false;
      }

      // Check if any specification has the value "See product documentation"
      return product.specifications.some(
        (spec) =>
          spec.value === "See product documentation" ||
          spec.value === "See product documentation." ||
          spec.value.toLowerCase().includes("see product documentation"),
      );
    });

    console.log(
      `Found ${productsToDelete.length} products with generic specifications to delete`,
    );

    // Import fs module for saving backup
    const fs = await import("fs");

    // Create backup before deletion
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilename = `deleted-products-backup-${timestamp}.json`;
    fs.writeFileSync(backupFilename, JSON.stringify(productsToDelete, null, 2));
    console.log(`Backup saved to ${backupFilename}`);

    // Ask for confirmation before deletion
    console.log(
      "\n*** WARNING: This will permanently delete products from the database ***",
    );
    console.log(`About to delete ${productsToDelete.length} products.`);
    console.log("Review the backup file before proceeding.");

    // In a real script, you might want to add a user confirmation step here
    // For this example, I'll include the deletion code with a commented confirmation step

    /*
    // Example confirmation code (requires readline module)
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Type "DELETE" to confirm deletion: ', (answer) => {
      if (answer !== 'DELETE') {
        console.log('Deletion cancelled.');
        readline.close();
        return;
      }
      // Proceed with deletion if confirmed
      performDeletion();
      readline.close();
    });
    */

    // Proceed with deletion
    await performDeletion(productsToDelete);
  } catch (error) {
    console.error(
      "Error deleting products with generic specifications:",
      error,
    );
  }
}

async function performDeletion(productsToDelete) {
  console.log("\nStarting deletion process...");

  const deletionResults = {
    success: [],
    failed: [],
  };

  // Delete each product
  for (const product of productsToDelete) {
    try {
      // Perform the deletion
      await client.delete({
        query: `*[_type == "product" && _id == $id]`,
        params: { id: product._id },
      });

      // Log successful deletion
      console.log(`Deleted product: ${product.title || product._id}`);
      deletionResults.success.push(product._id);
    } catch (error) {
      console.error(`Failed to delete product ${product._id}:`, error);
      deletionResults.failed.push({
        id: product._id,
        error: error.message,
      });
    }
  }

  // Print deletion summary
  console.log("\nDeletion completed!");
  console.log(
    `Successfully deleted: ${deletionResults.success.length} products`,
  );
  console.log(`Failed to delete: ${deletionResults.failed.length} products`);

  if (deletionResults.failed.length > 0) {
    console.log("\nProducts that failed to delete:");
    deletionResults.failed.forEach((item) => {
      console.log(`- ${item.id}: ${item.error}`);
    });
  }

  // Export deletion results
  const fs = await import("fs");
  fs.writeFileSync(
    "deletion-results.json",
    JSON.stringify(deletionResults, null, 2),
  );
  console.log("\nDeletion results saved to deletion-results.json");
}

// Run the script
deleteProductsWithGenericSpecs();
