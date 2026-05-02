import client from "../getClient.mjs";

const updateCategories = async () => {
  const categories = await client.fetch(`
      *[_type == "category"] {
        _id,
        slug,
        "parent": parentCategory->slug.current
      }
    `);

  const updates = categories.map((cat) => {
    const path = cat.parent
      ? `${cat.parent}/${cat.slug.current}`
      : cat.slug.current;
    const depth = path.split("/").length;

    return client
      .patch(cat._id)
      .set({
        metadata: {
          path,
          depth,
        },
      })
      .unset(["parentCategory"])
      .commit();
  });

  await Promise.all(updates);
  console.log("Category metadata updated successfully!");
};

updateCategories().catch((err) => console.error(err));
