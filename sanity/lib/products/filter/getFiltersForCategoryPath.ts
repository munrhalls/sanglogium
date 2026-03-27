import { defineQuery } from "next-sanity";
import { client } from "../../client";
import {
  FilterOptions,
  FilterOptionObject,
} from "@/app/components/ui/filters/FilterTypes";

export const getFiltersForCategoryPath = async (
  catalogueKeys: string[]
): Promise<FilterOptions> => {
  // For empty keys (all products), get all filters from all filter documents
  if (catalogueKeys.length === 0) {
    const ALL_FILTERS_QUERY = defineQuery(`
      *[_type == "categoryFilters"] {
        title,
        "filters": filters.filterItems[]{
          name,
          type,
          options,
          defaultValue,
          min,
          max,
          isMinOnly,
          step
        }
      }
    `);

    try {
      const allFiltersData = await client.fetch(ALL_FILTERS_QUERY);

      if (!allFiltersData || allFiltersData.length === 0) {
        return [];
      }

      // Combine all filters from all categories
      const allFilters = allFiltersData.flatMap((categoryData: any) => categoryData.filters || []);

      // Deduplicate filters by name
      const uniqueFilters = allFilters.reduce((acc: any[], filter: any) => {
        if (!filter.name) return acc;
        const existing = acc.find(f => f.name === filter.name);
        if (!existing) {
          acc.push({
            name: filter.name,
            type: filter.type || null,
            options: filter.options || null,
            defaultValue: filter.defaultValue || null,
            min: filter.min !== undefined ? filter.min : null,
            max: filter.max !== undefined ? filter.max : null,
            isMinOnly: filter.isMinOnly || null,
            step: filter.step !== undefined ? filter.step : null,
          });
        }
        return acc;
      }, []);

      return uniqueFilters;
    } catch (err) {
      console.error("Error fetching all filters:", err);
      return [];
    }
  }

  // Direct VFS key query - single round trip, no category indirection
  const FILTERS_BY_VFS_KEYS_QUERY = defineQuery(`
    *[_type == "categoryFilters" && categoryKey in $catalogueKeys] {
      title,
      "filters": filters.filterItems[]{
        name,
        type,
        options,
        defaultValue,
        min,
        max,
        isMinOnly,
        step
      }
    }
  `);

  try {
    const filtersData = await client.fetch(FILTERS_BY_VFS_KEYS_QUERY, { catalogueKeys });

    if (!filtersData || filtersData.length === 0) {
      console.warn(`No filter documents found for VFS keys: ${catalogueKeys.join(", ")}`);
      return [];
    }

    // Merge filter sets from multiple keys (parent + children)
    const allFilters = filtersData.flatMap((doc: any) => doc.filters || []);

    // Deduplicate by filter name
    const uniqueFilters = allFilters.reduce((acc: FilterOptionObject[], filter: any) => {
      if (!filter.name) return acc;
      const existing = acc.find(f => f.name === filter.name);
      if (!existing) {
        acc.push({
          name: filter.name,
          type: filter.type || null,
          options: filter.options || null,
          defaultValue: filter.defaultValue || null,
          min: filter.min !== undefined ? filter.min : null,
          max: filter.max !== undefined ? filter.max : null,
          isMinOnly: filter.isMinOnly || null,
          step: filter.step !== undefined ? filter.step : null,
        });
      }
      return acc;
    }, []);

    return uniqueFilters;
  } catch (err) {
    console.error("Error fetching filters for VFS keys:", err);
    return [];
  }
};
