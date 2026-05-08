import client from "../getClient.mjs";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""); // Clean edges

const updateMetadataPaths = async () => {
  const query = `*[_type == "category" && defined(metadata.path)] {_id, name, metadata}`;
  const categories = await client.fetch(query);

  const updates = categories
    .filter(({ name, metadata }) => slugify(name) !== metadata.path)
    .map(({ _id, name }) => ({
      id: _id,
      path: slugify(name),
    }));

  console.log(`Updating ${updates.length} metadata paths...`);
  if (updates.length === 0) return;

  for (const { id, path } of updates) {
    try {
      console.log(`Updating category ID: ${id} with metadata.path:`, path);

      // Update each category in a transaction
      await client
        .transaction()
        .patch(id, (patch) => patch.set({ "metadata.path": path }))
        .commit();

      console.log(`Successfully updated ID: ${id}`);
    } catch (error) {
      console.error(`Error updating ID: ${id}`, error.message);
    }
  }
};

updateMetadataPaths()
  .then(() => console.log("Metadata path update complete."))
  .catch((error) => console.error("Error updating metadata paths:", error));
