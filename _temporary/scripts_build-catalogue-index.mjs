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
    const catalogue = await client.fetch(`*[_id == "catalogue"][0].catalogue`);
    if (!catalogue) throw new Error("No catalogue found in Sanity!");

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

    traverse(catalogue);

    const output = {
      generatedAt: new Date().toISOString(),
      slugToIdMap,
      slotMetadataMap,
      tree: catalogue,
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
