"use server";
import { getFiltersForCategoryPath } from "@/sanity/lib/products/filter/getFiltersForCategoryPath";
import { getSortablesForCategoryPath } from "@/sanity/lib/products/sort/getSortablesForCategoryPath";

export async function getFiltersForCategoryPathAction(catalogueKeys: string[]) {
  try {
    const filterResult = await getFiltersForCategoryPath(catalogueKeys);
    return filterResult;
  } catch (error) {
    console.error("Error:", error);
    return {
      filters: [],
      priceRange: { minPrice: null, maxPrice: null },
      maxStock: null
    };
  }
}

export async function getSortablesForCategoryPathAction(catalogueKeys: string[]) {
  try {
    const sortables = await getSortablesForCategoryPath(catalogueKeys);
    return sortables;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
