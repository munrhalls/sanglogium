import client from "../getClient.mjs";

async function updateProduct(product, categories) {
  if (!categories || categories.length === 0) return;

  try {
    // Get existing categories if any
    const existingCategories = Array.isArray(product.categoryPath)
      ? product.categoryPath
      : [product.categoryPath];

    // Add new categories while preserving any that aren't speaker-related
    const newCategories = [
      ...existingCategories.filter((cat) => !cat.includes("speakers/")),
      ...categories,
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

async function determineCategories(product) {
  if (!product) return [];

  const categories = new Set();
  const title = (product.title || "").toLowerCase();
  const description =
    product.description
      ?.map((block) =>
        block.children
          ?.map((child) => child.text?.toLowerCase() || "")
          .join(" "),
      )
      .join(" ") || "";

  // Helper function to check if text contains any of the keywords
  const containsKeywords = (text, keywords) =>
    keywords.some((keyword) => text.includes(keyword));

  // Floor standing speakers
  const floorstandingKeywords = [
    "floor standing",
    "floorstanding",
    "tower speaker",
    "tower-speaker",
  ];
  if (
    containsKeywords(title, floorstandingKeywords) ||
    containsKeywords(description, floorstandingKeywords)
  ) {
    categories.add("speakers/floor-standing");
  }

  // Subwoofers
  const subwooferKeywords = [
    "subwoofer",
    "sub-woofer",
    "sub woofer",
    "bass speaker",
  ];
  if (
    containsKeywords(title, subwooferKeywords) ||
    containsKeywords(description, subwooferKeywords)
  ) {
    categories.add("speakers/subwoofers");
  }

  // Soundbars
  const soundbarKeywords = ["soundbar", "sound bar", "sound-bar"];
  if (
    containsKeywords(title, soundbarKeywords) ||
    containsKeywords(description, soundbarKeywords)
  ) {
    categories.add("speakers/soundbars");
  }

  // Smart speakers
  const smartKeywords = [
    "smart speaker",
    "voice control",
    "alexa",
    "google assistant",
    "siri",
  ];
  if (
    containsKeywords(title, smartKeywords) ||
    containsKeywords(description, smartKeywords)
  ) {
    categories.add("speakers/smart");
  }

  // Bookshelf speakers
  const bookshelfKeywords = [
    "bookshelf",
    "book-shelf",
    "book shelf",
    "desktop speaker",
  ];
  if (
    containsKeywords(title, bookshelfKeywords) ||
    containsKeywords(description, bookshelfKeywords)
  ) {
    categories.add("speakers/bookshelf");
  }

  // Powered/Active speakers
  const poweredKeywords = ["powered", "active", "self-powered", "amplified"];
  if (
    containsKeywords(title, poweredKeywords) ||
    containsKeywords(description, poweredKeywords)
  ) {
    categories.add("speakers/powered");
  }

  // Bluetooth speakers
  const bluetoothKeywords = ["bluetooth", "wireless", "portable speaker"];
  if (
    containsKeywords(title, bluetoothKeywords) ||
    containsKeywords(description, bluetoothKeywords)
  ) {
    categories.add("speakers/bluetooth");
  }

  // Outdoor speakers
  const outdoorKeywords = [
    "outdoor",
    "weather-resistant",
    "weatherproof",
    "all-weather",
    "water-resistant",
    "waterproof",
    "ip67",
    "ip65",
    "ip66",
  ];
  if (
    containsKeywords(title, outdoorKeywords) ||
    containsKeywords(description, outdoorKeywords)
  ) {
    categories.add("speakers/outdoor");
  }

  return Array.from(categories);
}

async function updateAllProducts() {
  try {
    const products = await client.fetch(`*[
      _type == "product" &&
      (categoryPath match "speakers/*" ||
       title match ".*[Ss]peaker.*" ||
       title match ".*[Ss]oundbar.*" ||
       title match ".*[Ss]ubwoofer.*")
    ]{
      _id,
      title,
      categoryPath,
      description,
      specifications
    }`);

    const categorizedProducts = await Promise.all(
      products.map(async (product) => ({
        product,
        categories: await determineCategories(product),
      })),
    );

    const productsToUpdate = categorizedProducts.filter(
      ({ categories }) => categories.length > 0,
    );

    console.log(`Found ${productsToUpdate.length} speakers to categorize`);

    if (productsToUpdate.length > 0) {
      console.log("\nSpeakers and their determined categories:");
      productsToUpdate.forEach(({ product, categories }) => {
        console.log(`\n- ${product.title}`);
        console.log(`  Current category: ${product.categoryPath}`);
        console.log(`  New categories: ${categories.join(", ")}`);
      });

      const readline = (await import("readline")).default;
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const shouldProceed = await new Promise((resolve) => {
        rl.question(
          `\nProceed with updating these ${productsToUpdate.length} speakers? (yes/no): `,
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

      const updates = productsToUpdate.map(({ product, categories }) =>
        updateProduct(product, categories),
      );
      await Promise.all(updates);
      console.log("All speakers updated successfully!");
    } else {
      console.log("No speakers found that need updating.");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
