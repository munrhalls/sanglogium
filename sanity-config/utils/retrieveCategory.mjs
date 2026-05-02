import client from "./getClient.mjs";

/**
 * Retrieves a category document by name
 * @param {string} categoryName - The name of the category to retrieve
 */
async function retrieveCategory(categoryName) {
  try {
    // Fetch the category document
    const category = await client.fetch(
      `*[_type == "category" && name == $categoryName][0]`,
      {
        categoryName,
      },
    );

    if (!category) {
      console.log(`Category "${categoryName}" not found.`);
      return null;
    }

    console.log(`Found category "${categoryName}":`);
    console.log(JSON.stringify(category, null, 2));

    return category;
  } catch (error) {
    console.error("Error retrieving category:", error);
    return null;
  }
}

// Retrieve the Accessories category
retrieveCategory("Accessories");
