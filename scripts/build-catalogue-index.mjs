import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2023-05-03",
});

async function buildCatalogueIndex() {
  console.log("🏗️  Building Catalogue Virtual File System...");

  try {
    const allItems = await client.fetch(`*[_type == "catalogueItem"]{ _id, title, type, slug, icon, sortOrder, "parentId": parent._ref }`);
    if (!allItems || allItems.length === 0) throw new Error("No catalogue items found in Sanity!");

    // Build lookup map
    const itemById = {};
    for (const item of allItems) {
      itemById[item._id] = item;
      // Initialize children array for reconstruction
      item.children = [];
    }

    // Rebuild tree using parent references (adjacency list inversion)
    for (const item of allItems) {
      if (item.parentId) {
        const parent = itemById[item.parentId];
        if (parent) {
          parent.children.push(item);
        }
      }
    }

    // Identify root nodes (those with no parent)
    const rootNodes = allItems
      .filter(item => !item.parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Tree reconstruction function
    function buildTreeNode(doc) {
      const node = {
        _key: doc._id,
        _type: "catalogueItem",
        title: doc.title,
        type: doc.type,
      };

      if (doc.slug?.current) {
        node.slug = doc.slug;
      }

      if (doc.icon) {
        node.icon = doc.icon;
      }

      if (doc.children && doc.children.length > 0) {
        const children = doc.children
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(buildTreeNode);

        if (children.length > 0) {
          node.children = children;
        }
      }

      return node;
    }

    // Reconstruct the full tree
    const tree = rootNodes.map(buildTreeNode);

    const slugToIdMap = {};
    const slotMetadataMap = {};

    function traverse(nodes, parentPath = [], parentBreadcrumbs = []) {
      if (!nodes) return;

      for (const node of nodes) {
        if (!node.type) node.type = "link";

        const isHeader = node.type === "header";
        const currentSlug = node.slug?.current;

        // Skip invalid non-header nodes that lack a slug entirely
        if (!isHeader && !currentSlug) continue;

        const pathSegments = isHeader || !currentSlug
          ? parentPath
          : [...parentPath, currentSlug];

        const urlString = pathSegments.join("/");

        const nextBreadcrumbs = isHeader || !currentSlug
          ? parentBreadcrumbs
          : [
              ...parentBreadcrumbs,
              { label: node.title, url: `/shop/${urlString}` },
            ];

        // Only register nodes that actually have slugs
        if (currentSlug) {
          if (!isHeader) {
            slugToIdMap[urlString] = node._key;
          }

          slotMetadataMap[node._key] = {
            title: node.title,
            url: isHeader ? "#" : `/shop/${urlString}`,
            slug: currentSlug,
            breadcrumbs: nextBreadcrumbs,
            children: node.children?.map((c) => c._key) || [],
            type: node.type,
          };
        }

        traverse(node.children, pathSegments, nextBreadcrumbs);
      }
    }

    traverse(tree);

    const output = {
      generatedAt: new Date().toISOString(),
      slugToIdMap,
      slotMetadataMap,
      tree,
    };

    const outputPath = path.join(process.cwd(), "data", "catalogue-index.json");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `✅ Index Built! Mapped ${Object.keys(slotMetadataMap).length} categories.`
    );
    console.log(`📂 Saved to: src/data/catalogue-index.json`);
  } catch (error) {
    console.error("❌ Build Failed:", error);
    process.exit(1);
  }
}

buildCatalogueIndex();
