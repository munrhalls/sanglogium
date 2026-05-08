import client from "../getClient.mjs";

async function fixChildCategories() {
  // Step 1: Fetch parent (Hi-Fi Audio) metadata
  const parentCategoryId = "category-hi-fi-audio";
  const parent = await client.fetch(
    `*[_type == "category" && _id == $id][0]{ "path": metadata.path, "depth": metadata.depth }`,
    { id: parentCategoryId },
  );

  if (!parent) {
    console.error("Parent category not found.");
    return;
  }

  const parentPath = parent.path;
  const parentDepth = parent.depth;

  // Step 2: Define children to update
  const childIds = [
    "category-amplifiers",
    "category-dacs",
    "category-speakers",
    "category-turntables",
  ];

  // Step 3: Update each child
  const updates = childIds.map((id) =>
    client
      .patch(id)
      .set({
        "metadata.path": `${parentPath}/${id.split("-")[1]}`,
        "metadata.depth": parentDepth + 1,
      })
      .commit(),
  );

  try {
    const results = await Promise.all(updates);
    console.log("Child categories updated successfully:", results);
  } catch (error) {
    console.error("Failed to update categories:", error);
  }
}

fixChildCategories();
