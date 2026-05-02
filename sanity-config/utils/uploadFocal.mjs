import fs from "fs";
import path from "path";
import client from "./getClient.mjs";
import utopiaData from "../../app/components/features/homepage/product-spotlights-dump/focal_utopia.json" with { type: "json" };

const IMAGES_DIR = "C:/webdev/sang-logium/app/components/features/homepage/product-spotlights-dump/focal_utopia_dump_images";

// Explicit mapping between the JSON references and the actual local filenames
const fileNameMap = {
  "image-focal-utopia-main": "focal-utopia-2022-main-07__56680.1678292299.1280.1280.jpg",
  "image-utopia-34": "New_Utopia_34-jpg.jpg",
  "image-utopia-dos": "New_Utopia_Dos-jpg.jpg",
  "image-utopia-profil-g": "New_Utopia_Profil_G-jpg.jpg",
  "_image-utopia-case-ouv": "New_Utopia_Case_Ouv-jpg.jpg",
  "image-utopia-boite": "New_Utopia_Boite-jpg.jpg",
  "image-utopia-cable-01": "New_Utopia_Cable_01-jpg.jpg",
  "image-utopia-moon-03": "focal-utopia-2022-main-03__98826.1678292299.1280.1280.jpg",
  "image-utopia-moon-02": "focal-utopia-2022-main-02__46602.1678292299.1280.1280.jpg",
  "image-utopia-moon-04": "focal-utopia-2022-main-04__53539.1678292299.1280.1280.jpg",
  "image-utopia-moon-05": "focal-utopia-2022-main-05__48352.1678292299.1280.1280.jpg",
  "image-utopia-moon-06": "focal-utopia-2022-main-06__88865.1678292299.1280.1280.jpg"
};

async function uploadLocalImage(imageObj) {
  try {
    if (!imageObj || !imageObj.asset) return null;

    const refId = imageObj.asset._ref || "";
    const fileName = fileNameMap[refId];

    if (!fileName) {
      console.error(`No filename mapping found for reference: ${refId}`);
      return null;
    }

    const filePath = path.join(IMAGES_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found on disk: ${filePath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("image", fileBuffer, {
      filename: fileName,
    });

    return {
      _type: "image",
      alt: imageObj.alt || "",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    };
  } catch (error) {
    console.error(`Failed to upload local image:`, error.message);
    return null;
  }
}

async function importUtopia() {
  try {
    const product = utopiaData;
    console.log("Starting image uploads using mapping...");

    const mainImage = await uploadLocalImage(product.image);

    const galleryImages = [];
    if (product.gallery) {
      for (const item of product.gallery) {
        const uploaded = await uploadLocalImage(item);
        if (uploaded) galleryImages.push(uploaded);
      }
    }

    const doc = {
      _type: "product",
      _id: product._id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      description: product.description,
      stripePriceId: product.stripePriceId,
      displayPrice: product.displayPrice,
      stock: product.stock,
      sku: product.sku,
      image: mainImage,
      gallery: galleryImages,
      catalogueLocationKeys: product.catalogueLocationKeys,
      overviewFields: product.overviewFields.map(field => ({
        _type: "overviewField",
        title: field.title,
        value: field.value,
        information: field.information
      })),
      specifications: product.specifications.map(spec => ({
        _type: "spec",
        title: spec.title,
        value: spec.value,
        information: spec.information
      })),
    };

    const result = await client.createOrReplace(doc);
    console.log(`Successfully imported product: ${result.name} (${result._id})`);
  } catch (error) {
    if (error.message.includes("Insufficient permissions")) {
      console.error("CRITICAL: Your Sanity Token does not have 'Editor' or 'Administrator' permissions.");
    } else {
      console.error("Error importing Focal Utopia:", error.message);
    }
  }
}

importUtopia();