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
        id: doc._id,
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

        // Build path segments - headers without slugs inherit parent path
        const pathSegments = isHeader && !currentSlug
          ? parentPath
          : currentSlug
            ? [...parentPath, currentSlug]
            : parentPath;

        const urlString = pathSegments.join("/");

        // For slugToIdMap, use leaf-only slug for leaf nodes (no children)
        const isLeafNode = !node.children || node.children.length === 0;

        // Build breadcrumbs for links only
        const nextBreadcrumbs = isHeader || !currentSlug
          ? parentBreadcrumbs
          : [
              ...parentBreadcrumbs,
              { label: node.title, url: `/shop/${urlString}` },
            ];

        // Register leaf slugs in slugToIdMap (for direct resolution)
        if (currentSlug && !isHeader && isLeafNode) {
          slugToIdMap[currentSlug] = node._key;
        }

        // Also register full path for nested lookups
        if (currentSlug && !isHeader) {
          slugToIdMap[urlString] = node._key;
        }

        // Always add to slotMetadataMap - every node needs metadata
        slotMetadataMap[node._key] = {
          title: node.title,
          url: isHeader ? "#" : currentSlug ? `/shop/${urlString}` : "#",
          slug: currentSlug || "",
          breadcrumbs: nextBreadcrumbs,
          children: node.children?.map((c) => c._key) || [],
          type: node.type,
          path: "/" + urlString,
          sortOrder: node.sortOrder || 0,
          icon: node.icon,
        };

        traverse(node.children, pathSegments, nextBreadcrumbs);
      }
    }

    traverse(tree);

    // Validation: Ensure all referenced children IDs exist in slotMetadataMap
    function validateSlotMetadataCompleteness(metadataMap) {
      const allReferencedIds = new Set();
      const missingIds = new Set();

      // Collect all referenced child IDs
      for (const [nodeId, metadata] of Object.entries(metadataMap)) {
        for (const childId of metadata.children) {
          allReferencedIds.add(childId);
          if (!metadataMap[childId]) {
            missingIds.add(childId);
          }
        }
      }

      const totalNodes = Object.keys(metadataMap).length;
      const leafNodes = Object.values(metadataMap).filter(meta => meta.children.length === 0).length;
      const headerNodes = totalNodes - leafNodes;

      console.log(`📊 VFS Validation Results:`);
      console.log(`   Total nodes: ${totalNodes}`);
      console.log(`   Leaf nodes: ${leafNodes}`);
      console.log(`   Header nodes: ${headerNodes}`);
      console.log(`   Referenced IDs: ${allReferencedIds.size}`);

      if (missingIds.size > 0) {
        console.log(`❌ VALIDATION FAILED - Missing ${missingIds.size} IDs in slotMetadataMap:`);
        for (const missingId of missingIds) {
          // Find which parent references this missing ID
          for (const [parentId, metadata] of Object.entries(metadataMap)) {
            if (metadata.children.includes(missingId)) {
              console.log(`   - ${missingId} (referenced by parent "${metadata.title}" (${parentId}))`);
              break;
            }
          }
        }
        throw new Error(`Build failed: ${missingIds.size} missing IDs in slotMetadataMap`);
      } else {
        console.log(`✅ VALIDATION PASSED - All referenced IDs exist in slotMetadataMap`);
      }
    }

    validateSlotMetadataCompleteness(slotMetadataMap);

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
