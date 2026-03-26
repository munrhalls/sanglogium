import { defineQuery } from "next-sanity";
import { client } from "../../client";
import { SortOption } from "@/app/components/ui/sortables/SortTypes";

interface RawSortOption {
  name: string | null;
  displayName: string | null;
  type: "boolean" | "alphabetic" | "date" | "numeric" | null;
  field: string | null;
  defaultDirection: "asc" | "desc" | null;
}

export const getSortablesForCategoryPath = async (
  catalogueKeys: string[]
): Promise<SortOption[]> => {
  if (catalogueKeys.length === 0) {
    return [];
  }

  const PRODUCTS_BY_VFS_KEYS_QUERY = defineQuery(`
    *[_type == "product" && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0] {
      category
    } | order(category asc)
  `);

  try {
    const products = await client.fetch(PRODUCTS_BY_VFS_KEYS_QUERY, { catalogueKeys });

    if (!products || products.length === 0) {
      return [];
    }

    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
    const topLevelCategory = categories[0];

    const SORTABLES_BY_CATEGORY_QUERY = defineQuery(`
      *[_type == "categorySortables" && title == $topLevelCategory][0] {
        title,
        "sortOptions": sortOptions[]{
          name,
          displayName,
          type,
          field,
          defaultDirection
        }
      }
    `);

    const sortablesData = await client.fetch(SORTABLES_BY_CATEGORY_QUERY, {
      topLevelCategory,
    });

    if (!sortablesData) {
      console.warn(`No sortables document found for category: ${topLevelCategory}`);
      return [];
    }

    const allSortOptions: RawSortOption[] = sortablesData.sortOptions || [];

    const processedOptions: SortOption[] = allSortOptions.map((option) => ({
      name: option.name || "",
      displayName: option.displayName ?? undefined,
      type: option.type ?? undefined,
      field: option.field ?? undefined,
      defaultDirection: option.defaultDirection ?? undefined,
    }));

    return processedOptions;
  } catch (err) {
    console.error("Error fetching sortables for VFS keys:", err);
    return [];
  }
};
