import { Catalogue } from "@/sanity.types";
import catalogueIndex from "./catalogue-index.json";

export type CatalogueTree = Catalogue["catalogue"];

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[] }>;
  tree: CatalogueTree;
}

export const getCatalogue = (): CatalogueTree => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.tree || [];
};

export const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
};

export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  if (!slotMetadataMap[nodeId]) {
    return [];
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

export const buildGroqKeysParam = (keys: string[]): string[] => {
  return keys;
};
