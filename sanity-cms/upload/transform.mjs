import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(
  __dirname,
  "../../../sang-logium-data/products.json"
);
const outputFilePath = path.join(__dirname, "./sanityProducts.json");

const makeUrlComplete = (url) => {
  if (!url) return "";
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
};

const transformProduct = (product) => {
  console.log(`Transforming product: ${product.title || product.name} ...`);
  if (product.categoryPath && !Array.isArray(product.categoryPath)) {
    console.warn(
      `Invalid categoryPath for product ${product.title || product.name}:`,
      product.categoryPath
    );
  }

  // Safely transform description
  const description = Array.isArray(product.description)
    ? product.description.map((block) => ({
        _type: "block",
        _key: uuidv4(),
        style: block.style || "normal",
        children: block.children.map((child) => ({
          _type: "span",
          _key: uuidv4(),
          text: child.text || "",
        })),
      }))
    : [
        {
          _type: "block",
          _key: uuidv4(),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: uuidv4(),
              text: product.description || "No description available",
            },
          ],
        },
      ];

  // Safely transform specifications
  const specifications = (product.specifications || []).map((spec) => ({
    _type: "spec",
    _key: uuidv4(),
    title: spec.title || "",
    value: spec.value || "",
    information: spec.information || "",
  }));

  // Safely transform overviewFields
  const overviewFields = (product.overviewFields || []).map((field) => ({
    _type: "overviewField",
    _key: uuidv4(),
    title: field.title || "",
    value: field.value || "",
    information: field.information || "",
  }));

  // Safely transform image URLs - handle both structures
  const imageUrl =
    product.image?.src || makeUrlComplete(product.imageUrl || "");

  // Handle both gallery structures
  const galleryUrls = product.gallery
    ? product.gallery.map((img) => makeUrlComplete(img.src || ""))
    : (product.galleryUrls || []).map((url) => makeUrlComplete(url));

  return {
    _type: "product",
    name: product.title || product.name || "",
    slug: {
      _type: "slug",
      current:
        typeof product.slug === "string" ? product.slug : product.slug?.current,
    },
    brand: product.brand || "",
    description: description,
    price: product.price || 0,
    sku: product.sku || "",
    stock: product.stock || 0,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: imageUrl,
      },
    },
    gallery: galleryUrls.map((url) => ({
      _type: "image",
      _key: uuidv4(),
      asset: {
        _type: "reference",
        _ref: url,
      },
    })),
    specifications: specifications,
    overviewFields: overviewFields,
    categoryPath: Array.isArray(product.categoryPath)
      ? product.categoryPath
      : typeof product.categoryPath === "string"
        ? [product.categoryPath]
        : [],
  };
};

const transformProducts = (products) => {
  return products.filter((p) => p.title || p.name).map(transformProduct);
};

const transform = async () => {
  try {
    console.log(`Deleting existing file at: ${outputFilePath}`);
    await fs.unlink(outputFilePath).catch((err) => {
      if (err.code !== "ENOENT") {
        throw err;
      }
    });

    console.log("Reading input file and transforming products...");
    const data = await fs.readFile(inputFilePath, "utf8");
    const products = JSON.parse(data);
    const sanityProducts = transformProducts(products);

    console.log(`Writing transformed products to: ${outputFilePath}`);
    await fs.writeFile(
      outputFilePath,
      JSON.stringify(sanityProducts, null, 2),
      "utf8"
    );

    console.log("Sanity products JSON file has been created successfully.");
  } catch (err) {
    console.error("Error during transformation:", err);
  }
};

transform();
