import client from "./getClient.mjs";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""); // Clean edges

const updateCategorySlugs = async () => {
  const query = `*[_type == "category"] {_id, name, slug}`;
  const categories = await client.fetch(query);

  const updates = categories
    .filter(({ name, slug }) => slugify(name) !== slug?.current)
    .map(({ _id, name }) => ({
      id: _id,
      slug: { _type: "slug", current: slugify(name) },
    }));

  console.log(`Updating ${updates.length} slugs...`);
  if (updates.length === 0) return;

  for (const { id, slug } of updates) {
    try {
      console.log(`Updating category ID: ${id} with slug:`, slug);

      // Update each category in a transaction
      await client
        .transaction()
        .patch(id, (patch) => patch.set({ slug }))
        .commit();

      console.log(`Successfully updated ID: ${id}`);
    } catch (error) {
      console.error(`Error updating ID: ${id}`, error.message);
    }
  }
};

updateCategorySlugs()
  .then(() => console.log("Slug update complete."))
  .catch((error) => console.error("Error updating slugs:", error));
