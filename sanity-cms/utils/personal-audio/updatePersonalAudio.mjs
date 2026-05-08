import client from "../getClient.mjs";

async function updateProduct(product, categories) {
  if (!categories || categories.length === 0) return;

  try {
    // Get existing categories if any
    const existingCategories = Array.isArray(product.categoryPath)
      ? product.categoryPath
      : [product.categoryPath];

    // Add new categories while preserving any that aren't personal-audio-related
    const newCategories = [
      ...existingCategories.filter((cat) => !cat.includes("personal-audio/")),
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

  // Earbuds
  const earbudKeywords = [
    "earbud",
    "ear-bud",
    "ear bud",
    "tws",
    "true wireless",
  ];
  if (
    containsKeywords(title, earbudKeywords) ||
    containsKeywords(description, earbudKeywords)
  ) {
    categories.add("personal-audio/earbuds");
  }

  // MP3 & Digital Audio Players
  const playerKeywords = [
    "mp3 player",
    "digital audio player",
    "dap",
    "music player",
    "portable player",
    "hi-res player",
    "walkman",
  ];
  if (
    containsKeywords(title, playerKeywords) ||
    containsKeywords(description, playerKeywords)
  ) {
    categories.add("personal-audio/digital-audio-players");
  }

  // Bluetooth receivers & transmitters
  const bluetoothKeywords = [
    "bluetooth receiver",
    "bluetooth transmitter",
    "bt receiver",
    "wireless adapter",
    "bluetooth adapter",
    "wireless transmitter",
  ];
  if (
    containsKeywords(title, bluetoothKeywords) ||
    containsKeywords(description, bluetoothKeywords)
  ) {
    categories.add("personal-audio/bluetooth-receivers-transmitters");
  }

  // Portable DACs and Amps
  const portableDacAmpKeywords = [
    "portable dac",
    "portable amp",
    "portable amplifier",
    "usb dac",
    "mobile dac",
    "dongle dac",
    "portable dac/amp",
  ];
  if (
    containsKeywords(title, portableDacAmpKeywords) ||
    containsKeywords(description, portableDacAmpKeywords)
  ) {
    categories.add("personal-audio/portable-dacs-amps");
  }

  // Headphone amplifiers
  const ampKeywords = [
    "headphone amp",
    "headphone amplifier",
    "headamp",
    "amp for headphones",
    "desktop amplifier",
  ];
  if (
    containsKeywords(title, ampKeywords) ||
    containsKeywords(description, ampKeywords)
  ) {
    categories.add("personal-audio/headphone-amplifiers");
  }

  // Phone & tablet accessories
  const phoneTabletKeywords = [
    "phone accessory",
    "tablet accessory",
    "smartphone",
    "iphone",
    "ipad",
    "android",
    "mobile device",
  ];
  if (
    containsKeywords(title, phoneTabletKeywords) ||
    containsKeywords(description, phoneTabletKeywords)
  ) {
    categories.add("personal-audio/phone-tablet-accessories");
  }

  // Carrying cases & protection
  const caseKeywords = [
    "case",
    "carrying case",
    "protective case",
    "travel case",
    "protection",
    "pouch",
    "bag",
    "cover",
  ];
  if (
    containsKeywords(title, caseKeywords) ||
    containsKeywords(description, caseKeywords)
  ) {
    categories.add("personal-audio/cases-protection");
  }

  // Replacement parts
  const partsKeywords = [
    "ear tip",
    "eartip",
    "ear pad",
    "earpad",
    "replacement",
    "spare part",
    "cushion",
    "foam tip",
    "silicon tip",
    "cable",
    "adapter",
    "replacement part",
  ];
  if (
    containsKeywords(title, partsKeywords) ||
    containsKeywords(description, partsKeywords)
  ) {
    categories.add("personal-audio/replacement-parts");
  }

  return Array.from(categories);
}

async function updateAllProducts() {
  try {
    // Expanded query to catch all relevant products
    const products = await client.fetch(`*[
      _type == "product" && (
        categoryPath match "personal-audio/*" ||
        title match ".*[Ee]arbud.*" ||
        title match ".*[Pp]layer.*" ||
        title match ".*[Dd]ac.*" ||
        title match ".*[Aa]mp.*" ||
        title match ".*[Cc]ase.*" ||
        title match ".*[Bb]luetooth.*" ||
        title match ".*[Aa]ccessor.*" ||
        title match ".*[Pp]art.*"
      )
    ]{
      _id,
      title,
      categoryPath,
      description,
      specifications,
      overviewFields
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
      `Found ${productsToUpdate.length} personal audio products to categorize`,
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
      console.log("All personal audio products updated successfully!");
    } else {
      console.log("No personal audio products found that need updating.");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
