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
    const allItems = await client.fetch(`*[_type == "catalogueItem"]{ _id, title, type, slug, icon, sortOrder, "childRefs": children[]._ref }`);
    if (!allItems || allItems.length === 0) throw new Error("No catalogue items found in Sanity!");

    // Build lookup map
    const itemById = {};
    for (const item of allItems) {
      itemById[item._id] = item;
    }

    // Identify root nodes (those that are not referenced as children)
    const referencedIds = new Set();
    for (const item of allItems) {
      if (item.childRefs) {
        for (const ref of item.childRefs) {
          referencedIds.add(ref);
        }
      }
    }

    const rootNodes = allItems
      .filter(item => !referencedIds.has(item._id))
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

      if (doc.childRefs && doc.childRefs.length > 0) {
        const children = doc.childRefs
          .map(ref => itemById[ref])
          .filter(Boolean)
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
        if (!node.slug?.current) continue;

        if (!node.type && node.type) node.type = node.type;
        if (!node.type) node.type = "link";

        const isHeader = node.type === "header";
        const currentSlug = node.slug.current;

        const pathSegments = isHeader
          ? parentPath
          : [...parentPath, currentSlug];

        const urlString = pathSegments.join("/");

        const nextBreadcrumbs = isHeader
          ? parentBreadcrumbs
          : [
              ...parentBreadcrumbs,
              { label: node.title, url: `/shop/${urlString}` },
            ];

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
