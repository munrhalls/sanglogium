import "server-only";

import catalogueIndex from "@/data/catalogue-index.json";
import {
  catalogueToNavigation,
  validateCatalogueIndex,
  type CatalogueIndexData,
  type CatalogueTree,
} from "@/features/catalogue/core/rules/catalogue";

export const getCatalogue = (): CatalogueTree => {
  const data = catalogueIndex as unknown;

  try {
    validateCatalogueIndex(data);
    return (data as CatalogueIndexData).tree || [];
  } catch (error) {
    console.error('❌ Catalogue validation failed:', error);
    // Return empty tree as graceful fallback
    return [];
  }
};

export const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
};

export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  // If ID not in slotMetadataMap, treat as leaf node and return itself
  if (!slotMetadataMap[nodeId]) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[VFS] ID ${nodeId} not in slotMetadataMap, treating as leaf`);
    }
    return [nodeId];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
};

export const getCatalogueForNavigation = () => catalogueToNavigation(getCatalogue());

export const getAllLeafKeys = (): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return Object.entries(data.slotMetadataMap)
    .filter(([_, v]) => v.children.length === 0)
    .map(([id]) => id);
};
