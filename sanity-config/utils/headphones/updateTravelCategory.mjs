import client from "../getClient.mjs";

async function updateProduct(product) {
  const currentPath = product.categoryPath;

  // Skip if already categorized as travel
  if (Array.isArray(currentPath) && currentPath.includes("headphones/travel")) {
    console.log(`Skipping ${product.title} - already in travel category`);
    return;
  }

  try {
    // Add travel category while preserving existing categories
    const existingCategories = Array.isArray(currentPath)
      ? currentPath
      : [currentPath];
    const newCategories = [...existingCategories, "headphones/travel"];

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

async function isTravelHeadphone(product) {
  if (!product) return false;

  // Travel-specific features to look for
  const travelFeatures = {
    isClosedBack: false, // Important for noise isolation
    hasNoiseFeatures: false, // ANC or good passive isolation
    hasPortableDesign: false, // Foldable, comes with case, etc.
    hasGoodBattery: false, // For wireless models
    isWireless: false, // Wireless capability is a plus for travel
  };

  // Check closed-back design
  const cupStyleField = product.overviewFields?.find((field) =>
    field.title.toLowerCase().includes("cup style"),
  );
  travelFeatures.isClosedBack = cupStyleField?.value
    ?.toLowerCase()
    .includes("closed-back");

  // Check noise features (look for ANC or noise isolation mentions)
  const noiseKeywords = [
    "noise",
    "anc",
    "isolation",
    "cancelling",
    "canceling",
    "isolating",
  ];
  const hasNoiseFeatures =
    (Array.isArray(product.specifications) &&
      product.specifications.some((spec) => {
        const title = (spec.title || "").toLowerCase();
        const value = (spec.value || "").toLowerCase();
        return noiseKeywords.some(
          (keyword) => title.includes(keyword) || value.includes(keyword),
        );
      })) ||
    product.description?.some((block) =>
      block.children?.some((child) =>
        noiseKeywords.some((keyword) =>
          child.text?.toLowerCase().includes(keyword),
        ),
      ),
    );
  travelFeatures.hasNoiseFeatures = hasNoiseFeatures;

  // Check for portable design features
  const portabilityKeywords = [
    "fold",
    "portable",
    "travel",
    "case",
    "carrying",
    "compact",
  ];
  const hasPortableDesign =
    (Array.isArray(product.specifications) &&
      product.specifications.some((spec) => {
        const title = (spec.title || "").toLowerCase();
        const value = (spec.value || "").toLowerCase();
        return portabilityKeywords.some(
          (keyword) => title.includes(keyword) || value.includes(keyword),
        );
      })) ||
    product.description?.some((block) =>
      block.children?.some((child) =>
        portabilityKeywords.some((keyword) =>
          child.text?.toLowerCase().includes(keyword),
        ),
      ),
    );
  travelFeatures.hasPortableDesign = hasPortableDesign;

  // Check battery life if available
  const batterySpec = product.specifications?.find(
    (spec) =>
      spec.title?.toLowerCase().includes("battery") ||
      spec.title?.toLowerCase().includes("playback"),
  );
  if (batterySpec) {
    const batteryText = batterySpec.value?.toLowerCase() || "";
    const hourMatch = batteryText.match(/(\d+)\s*h/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      travelFeatures.hasGoodBattery = hours >= 15; // Consider 15+ hours as good for travel
    }
  }

  // Check wireless capability
  const connectivityField = product.overviewFields?.find((field) =>
    field.title.toLowerCase().includes("connectivity"),
  );
  travelFeatures.isWireless = connectivityField?.value
    ?.toLowerCase()
    .includes("wireless");

  // Travel-specific keywords to look for in descriptions
  const travelKeywords = [
    "travel",
    "portable",
    "commute",
    "airplane",
    "flight",
    "journey",
    "transport",
    "mobility",
  ];

  // Check title
  const title = (product.title || "").toLowerCase();

  // Check description for travel-specific mentions
  const hasTravelInDescription =
    Array.isArray(product.description) &&
    product.description.some((block) => {
      if (!block || !Array.isArray(block.children)) return false;
      return block.children.some((child) => {
        const text = (child.text || "").toLowerCase();
        return travelKeywords.some((keyword) => text.includes(keyword));
      });
    });

  // Count how many travel-friendly features it has
  const featureCount = Object.values(travelFeatures).filter(Boolean).length;

  // Explicit travel mention in product
  const hasExplicitTravelMention =
    travelKeywords.some((keyword) => title.includes(keyword)) ||
    hasTravelInDescription;

  // A good travel headphone should have:
  // 1. Either be closed-back OR have good noise features (essential for travel)
  // AND
  // 2. Either have explicit travel marketing OR have at least 3 travel-friendly features
  const hasEssentialFeatures =
    travelFeatures.isClosedBack || travelFeatures.hasNoiseFeatures;
  return (
    hasEssentialFeatures && (hasExplicitTravelMention || featureCount >= 3)
  );
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
     overviewFields,
     description,
     specifications
   }`);

    const travelProducts = [];
    for (const product of products) {
      if (await isTravelHeadphone(product)) {
        travelProducts.push(product);
      }
    }

    console.log(
      `Found ${travelProducts.length} travel-appropriate headphones to update`,
    );

    if (travelProducts.length > 0) {
      console.log("\nTravel headphones to be updated:");
      travelProducts.forEach((product) => {
        console.log(
          `- ${product.title} (Current category: ${product.categoryPath})`,
        );
      });
    }

    const readline = (await import("readline")).default;
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldProceed = await new Promise((resolve) => {
      rl.question(
        `\nProceed with updating these ${travelProducts.length} travel headphones? (yes/no): `,
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

    const updates = travelProducts.map(updateProduct);
    await Promise.all(updates);

    console.log("All travel headphones updated successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
