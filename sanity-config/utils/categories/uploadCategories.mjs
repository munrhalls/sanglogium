import categoryDocuments from "./categories.json" with { type: "json" };

import readline from "readline";
import client from "../getClient.mjs";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Log categories and prompt for confirmation
async function confirmUpload() {
  console.log("Categories to be uploaded:");
  categoryDocuments.sort((a, b) => a.metadata.depth - b.metadata.depth);
  categoryDocuments.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.name} (${doc._id})`);
    console.log(`   Path: ${doc.metadata?.path}`);
  });

  return new Promise((resolve) => {
    rl.question("Proceed with upload? (yes/no): ", (answer) => {
      resolve(answer.toLowerCase() === "yes");
      rl.close();
    });
  });
}

// Add metadata field
async function computeMetadata(categories) {
  const parent = categories.find((cat) => cat.metadata?.depth === 1); // Identify parent
  if (!parent) {
    throw new Error("Parent category with depth 1 not found.");
  }

  const parentPath = parent.metadata.path;
  const parentDepth = parent.metadata.depth;

  // Update child categories
  categories.forEach((cat) => {
    if (cat._id !== parent._id) {
      // Skip parent
      cat.metadata = {
        path: `${parentPath}/${cat.slug.current}`,
        depth: parentDepth + 1,
      };
    }
  });

  return categories;
}

// Batch create categories
async function uploadCategories() {
  const updatedCategories = await computeMetadata(categoryDocuments);
  const shouldProceed = await confirmUpload();

  if (!shouldProceed) {
    console.log("Upload cancelled.");
    return;
  }

  try {
    const transactions = updatedCategories.map((doc) => client.create(doc));

    const results = await Promise.all(transactions);
    console.log("Categories uploaded successfully:", results);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

uploadCategories();
