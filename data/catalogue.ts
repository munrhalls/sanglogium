import { Catalogue } from "@/sanity.types";
import catalogueIndex from "./catalogue-index.json";

export type CatalogueTree = Catalogue["catalogue"];

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, unknown>;
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
