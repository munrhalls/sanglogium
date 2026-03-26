"use server";
import { getFiltersForCategoryPath } from "@/sanity/lib/products/filter/getFiltersForCategoryPath";
import { getSortablesForCategoryPath } from "@/sanity/lib/products/sort/getSortablesForCategoryPath";

export async function getFiltersForCategoryPathAction(catalogueKeys: string[]) {
  try {
    const filters = await getFiltersForCategoryPath(catalogueKeys);
    return filters;
  } catch (error) {
    console.error("Error:", error);
    return [];
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
