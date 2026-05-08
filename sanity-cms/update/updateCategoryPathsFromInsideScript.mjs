import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, "./updateProducts.json");
const outputFilePath = path.join(__dirname, "./updateProducts_updated.json");

const categoryPathMap = {
  "meze-audio-silver-pcuhd-4-pin-mini-xlr-replacement-cable": [
    "/accessories/audio-cables",
  ],
  "meze-audio-99-series-2-5mm": ["/accessories/audio-cables"],
  "moondrop-free-dsp-usb-c": ["/accessories/audio-cables"],
  "heddphone-balanced-4-pin-xlr": ["/accessories/audio-cables"],
  "audioquest-evergreen-rca-rca": ["/accessories/audio-cables"],
  "audioquest-cinnamon-usb": ["/accessories/audio-cables"],
  "meze-audio-copper-pcuhd": ["/accessories/audio-cables"],
  "audioquest-evergreen-3-5mm-rca": ["/accessories/audio-cables"],
  "audioquest-carbon-usb": ["/accessories/audio-cables"],
  "audioquest-pearl-usb": ["/accessories/audio-cables"],
  "audioquest-forest-usb": ["/accessories/audio-cables"],
  "audioquest-golden-gate-3-5mm-rca": ["/accessories/audio-cables"],
  "64-audio-premium-pearl-cable-3-5mm": ["/accessories/audio-cables"],
  "meze-audio-ofc-mini-4-pin-xlr-replacement-cable": [
    "/accessories/audio-cables",
  ],
  "audioquest-nrg-x2-power-cable": ["/accessories/power-cables"],
  "audioquest-nrg-z3": ["/accessories/power-cables"],
  "aune-audio-ar3": ["/accessories/audio-cables"],
  "audioquest-carbon-optilink": ["/accessories/audio-cables"],
  "audioquest-golden-gate-rca-rca-analog-interconnect": [
    "/accessories/audio-cables",
  ],
  "audioquest-dragontail-usb-extender-and-adapter": [
    "/accessories/audio-cables",
  ],
  "audioquest-pearl-optilink": ["/accessories/audio-cables"],
  "audioquest-chicago-rca-cable": ["/accessories/audio-cables"],
};

const updateCategoryPaths = async () => {
  try {
    // Read the input file
    const data = await fs.readFile(inputFilePath, "utf8");
    const products = JSON.parse(data);

    // Update categoryPath for each product
    const updatedProducts = products.map((product) => {
      // Get the slug current value
      const slugCurrent = product.slug?.current;

      // If we have a matching category path, update it
      if (slugCurrent && categoryPathMap[slugCurrent]) {
        return {
          ...product,
          categoryPath: categoryPathMap[slugCurrent],
        };
      }

      // If no match, return the original product
      return product;
    });

    // Write the updated products to a new file
    await fs.writeFile(
      outputFilePath,
      JSON.stringify(updatedProducts, null, 2),
      "utf8",
    );

    console.log("Category paths updated successfully!");
    console.log(`Updated file saved to: ${outputFilePath}`);

    // Count how many products were updated
    const updatedCount = updatedProducts.filter(
      (product, index) =>
        JSON.stringify(product.categoryPath) !==
        JSON.stringify(products[index].categoryPath),
    ).length;

    console.log(`Number of products updated: ${updatedCount}`);
  } catch (error) {
    console.error("Error updating category paths:", error);
  }
};

updateCategoryPaths();
