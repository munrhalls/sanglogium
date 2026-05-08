import client from "../getClient.mjs";

async function updateProduct(product, categories) {
  if (!categories || categories.length === 0) return;

  try {
    // Get existing categories if any
    const existingCategories = Array.isArray(product.categoryPath)
      ? product.categoryPath
      : [product.categoryPath];

    // Add new categories while preserving any that aren't accessories-related
    const newCategories = [
      ...existingCategories.filter((cat) => !cat.includes("accessories/")),
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

  const containsKeywords = (text, keywords) =>
    keywords.some((keyword) => text.includes(keyword));

  // Speaker wire
  const speakerWireKeywords = [
    "speaker wire",
    "speaker cable",
    "speaker wiring",
    "awg",
    "gauge wire",
    "speaker connecting wire",
  ];
  if (
    containsKeywords(title, speakerWireKeywords) ||
    containsKeywords(description, speakerWireKeywords)
  ) {
    categories.add("accessories/speaker-wire");
  }

  // Audio cables
  const audioCableKeywords = [
    "audio cable",
    "rca cable",
    "xlr cable",
    "interconnect",
    "3.5mm",
    "aux cable",
    "optical cable",
    "toslink",
    "digital cable",
    "balanced cable",
    "audio interconnect",
  ];
  if (
    containsKeywords(title, audioCableKeywords) ||
    containsKeywords(description, audioCableKeywords)
  ) {
    categories.add("accessories/audio-cables");
  }

  // Power cables
  const powerCableKeywords = [
    "power cable",
    "power cord",
    "power supply cable",
    "ac cable",
    "power adapter cable",
    "mains cable",
    "iec cable",
    "power connector",
  ];
  if (
    containsKeywords(title, powerCableKeywords) ||
    containsKeywords(description, powerCableKeywords)
  ) {
    categories.add("accessories/power-cables");
  }

  // Wall mounts
  const wallMountKeywords = [
    "wall mount",
    "wall bracket",
    "mounting bracket",
    "wall mounting",
    "speaker mount",
    "wall-mount kit",
    "mounting system",
    "wall attachment",
  ];
  if (
    containsKeywords(title, wallMountKeywords) ||
    containsKeywords(description, wallMountKeywords)
  ) {
    categories.add("accessories/wall-mounts");
  }

  // Speaker stands
  const standKeywords = [
    "speaker stand",
    "monitor stand",
    "studio stand",
    "bookshelf stand",
    "speaker platform",
    "isolation stand",
    "desktop stand",
    "floor stand",
  ];
  if (
    containsKeywords(title, standKeywords) ||
    containsKeywords(description, standKeywords)
  ) {
    categories.add("accessories/speaker-stands");
  }

  // Acoustic treatment
  const acousticKeywords = [
    "acoustic panel",
    "sound panel",
    "acoustic foam",
    "diffuser",
    "bass trap",
    "acoustic treatment",
    "room treatment",
    "sound absorption",
    "soundproofing",
    "acoustic dampening",
    "acoustic absorber",
  ];
  if (
    containsKeywords(title, acousticKeywords) ||
    containsKeywords(description, acousticKeywords)
  ) {
    categories.add("accessories/acoustic-treatment");
  }

  return Array.from(categories);
}

async function updateAllProducts() {
  try {
    // Expanded query to catch all relevant products
    const products = await client.fetch(`*[
      _type == "product" && (
        categoryPath match "accessories/*" ||
        title match ".*[Cc]able.*" ||
        title match ".*[Ww]ire.*" ||
        title match ".*[Mm]ount.*" ||
        title match ".*[Ss]tand.*" ||
        title match ".*[Aa]coustic.*" ||
        title match ".*[Pp]anel.*" ||
        title match ".*[Bb]racket.*"
      )
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

    console.log(
      `Found ${productsToUpdate.length} accessories products to categorize`,
    );

    if (productsToUpdate.length > 0) {
      console.log("\nProducts and their determined categories:");
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
          `\nProceed with updating these ${productsToUpdate.length} products? (yes/no): `,
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
      console.log("All accessories products updated successfully!");
    } else {
      console.log("No accessories products found that need updating.");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
