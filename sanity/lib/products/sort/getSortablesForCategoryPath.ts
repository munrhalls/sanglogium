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
  // For empty keys (all products), get all sortables from all documents
  if (catalogueKeys.length === 0) {
    const ALL_SORTABLES_QUERY = defineQuery(`
      *[_type == "categorySortables"] {
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

    try {
      const allSortablesData = await client.fetch(ALL_SORTABLES_QUERY);

      if (!allSortablesData || allSortablesData.length === 0) {
        return [];
      }

      // Combine all sortables from all categories
      const allSortOptions = allSortablesData.flatMap((categoryData: any) => categoryData.sortOptions || []);

      // Deduplicate sortables by name
      const uniqueSortOptions = allSortOptions.reduce((acc: RawSortOption[], option: RawSortOption) => {
        if (!option.name) return acc;
        const existing = acc.find(s => s.name === option.name);
        if (!existing) {
          acc.push(option);
        }
        return acc;
      }, []);

      const processedOptions: SortOption[] = uniqueSortOptions.map((option) => ({
        name: option.name || "",
        displayName: option.displayName ?? undefined,
        type: option.type ?? undefined,
        field: option.field ?? undefined,
        defaultDirection: option.defaultDirection ?? undefined,
      }));

      return processedOptions;
    } catch (err) {
      console.error("Error fetching all sortables:", err);
      return [];
    }
  }

  // Direct VFS key query - single round trip, no category indirection
  const SORTABLES_BY_VFS_KEYS_QUERY = defineQuery(`
    *[_type == "categorySortables" && categoryKey in $catalogueKeys] {
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

  try {
    const sortablesData = await client.fetch(SORTABLES_BY_VFS_KEYS_QUERY, { catalogueKeys });

    if (!sortablesData || sortablesData.length === 0) {
      console.warn(`No sortables documents found for VFS keys: ${catalogueKeys.join(", ")}`);
      return [];
    }

    // Merge sortable sets from multiple keys (parent + children)
    const allSortOptions: RawSortOption[] = sortablesData.flatMap((doc: any) => doc.sortOptions || []);

    // Deduplicate by sortable name
    const uniqueSortOptions = allSortOptions.reduce((acc: RawSortOption[], option) => {
      if (!option.name) return acc;
      const existing = acc.find(s => s.name === option.name);
      if (!existing) {
        acc.push(option);
      }
      return acc;
    }, []);

    const processedOptions: SortOption[] = uniqueSortOptions.map((option) => ({
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
