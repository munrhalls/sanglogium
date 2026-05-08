import fs from "fs";
import path from "path";
import client from "../utils/getClient.mjs";
import axios from "axios";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, "./sanityProducts.json");

const formatUrl = (url) => {
  console.log("URL!!!!!", url);
  if (!url) throw new Error(`Invalid URL: ${url}`);
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  throw new Error(`Invalid URL format: ${url}`);
};

const uploadImage = async (url) => {
  try {
    const formattedUrl = formatUrl(url);
    console.log(`Uploading image from URL: ${formattedUrl}`);

    const response = await axios.get(formattedUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const buffer = Buffer.from(response.data, "binary");
    const asset = await client.assets.upload("image", buffer, {
      filename: path.basename(formattedUrl),
    });
    return asset._id;
  } catch (error) {
    console.error(
      `Error uploading image with url: ${url}. Error message:`,
      error.message
    );
    throw error;
  }
};

const checkDuplicateProduct = async (slug) => {
  const query = `*[_type == "product" && slug.current == $slug][0]`;
  const params = { slug };
  const existingProduct = await client.fetch(query, params);
  return !!existingProduct;
};

const transformProduct = async (product) => {
  console.log(`Transforming product: ${product.name}`);

  try {
    // Upload main image
    const imageId = await uploadImage(product.image.asset._ref);
    console.log("Main image uploaded:", imageId);

    // Upload gallery images
    const galleryIds = await Promise.all(
      product.gallery.map(async (img) => {
        const id = await uploadImage(img.asset._ref);
        console.log("Gallery image uploaded:", id);
        return id;
      })
    );

    return {
      _type: "product",
      name: product.name,
      slug: {
        _type: "slug",
        current: product.slug.current,
      },
      brand: product.brand,
      description: product.description,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageId,
        },
      },
      gallery: galleryIds.map((id) => ({
        _type: "image",
        _key: uuidv4(),
        asset: {
          _type: "reference",
          _ref: id,
        },
      })),
      specifications: product.specifications,
      overviewFields: product.overviewFields,
      categoryPath: Array.isArray(product.categoryPath)
        ? product.categoryPath
        : typeof product.categoryPath === "string"
          ? [product.categoryPath]
          : [],
    };
  } catch (error) {
    console.error(`Error transforming product ${product.name}:`, error.message);
    throw error;
  }
};

const upload = async () => {
  try {
    const data = await fs.promises.readFile(inputFilePath, "utf8");
    const products = JSON.parse(data);
    let productsAdded = 0;
    let productsSkipped = 0;

    for (const product of products) {
      try {
        console.log("SLUG !!!!!", product.slug.current);
        if (!product.slug || !product.slug.current) {
          console.error(`Product is missing slug: ${product.name}`);
          continue;
        }

        const isDuplicate = await checkDuplicateProduct(product.slug.current);
        if (isDuplicate) {
          console.log(`Skipping duplicate product: ${product.slug.current}`);
          productsSkipped++;
          continue;
        }

        const transformedProduct = await transformProduct(product);
        const response = await client.create(transformedProduct);
        console.log("Product created:", response._id);
        productsAdded++;
      } catch (error) {
        console.error(
          `Error processing product ${product.name}:`,
          error.message
        );
      }
    }

    console.log(`Upload completed:`);
    console.log(`Products added: ${productsAdded}`);
    console.log(`Products skipped: ${productsSkipped}`);
  } catch (error) {
    console.error("Error during upload:", error.message);
  }
};

upload();
