// # Test Fixtures: Catalogue Filters & Sorting
//
// Deterministic, in-memory fixtures for unit/integration tests of the category
// filter + sort feature. Pure data only — NO network, NO Sanity client, NO env.
//
// Used by Phase 0+ of `filters-sorting-gap-closure-plan.md`.

// NOTE: tests/ is excluded from tsconfig, so the "@/" alias is not resolved by
// the editor here. Use a relative type-only import (matches tests/helpers).
import type { Product } from "../../sanity-cms/lib/products/getProductsByVfsKeys";

/** Catalogue location key shared by every fixture product. */
export const FIXTURE_CATALOGUE_KEY = "cat-test";

/**
 * Factory for a single fixture product. Provides sane defaults so tests can
 * override only the fields they care about. `availableStock` is derived
 * (stock - reservedStock) to match the GROQ projection.
 */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  const stock = overrides.stock ?? 10;
  const reservedStock = overrides.reservedStock ?? 0;
  return {
    _id: overrides._id ?? "p-default",
    name: overrides.name ?? "Default Product",
    brand:
      overrides.brand !== undefined
        ? overrides.brand
        : { _id: "b-sennheiser", name: "Sennheiser", slug: { current: "sennheiser" } },
    price_data: overrides.price_data ?? { currency: "USD", unit_amount: 10000 },
    image: overrides.image ?? null,
    catalogueLocationKeys: overrides.catalogueLocationKeys ?? [FIXTURE_CATALOGUE_KEY],
    slug: overrides.slug ?? { current: "default-product" },
    stock,
    reservedStock,
    availableStock: overrides.availableStock ?? stock - reservedStock,
  };
}

/**
 * Deterministic 6-product set across 3 brands with varied price and stock.
 *
 * Designed to exercise: brand filter (incl. case-insensitivity), price-range
 * filter, stock-minimum filter, and the stock-vs-availableStock divergence
 * (Focal Clear has stock 5 but availableStock 0 due to reservations).
 *
 * | id  | brand      | price (cents) | stock | reserved | available |
 * |-----|------------|---------------|-------|----------|-----------|
 * | p-1 | Sennheiser | 39900         | 10    | 2        | 8         |
 * | p-2 | Sennheiser | 49900         | 0     | 0        | 0         |
 * | p-3 | Focal      | 149900        | 5     | 5        | 0         |
 * | p-4 | Focal      | 399900        | 3     | 0        | 3         |
 * | p-5 | HiFiMan    | 29900         | 20    | 1        | 19        |
 * | p-6 | HiFiMan    | 159900        | 1     | 0        | 1         |
 */
export const mockProducts: Product[] = [
  makeProduct({
    _id: "p-1",
    name: "HD 600",
    brand: { _id: "b-sennheiser", name: "Sennheiser", slug: { current: "sennheiser" } },
    price_data: { currency: "USD", unit_amount: 39900 },
    slug: { current: "hd-600" },
    stock: 10,
    reservedStock: 2,
  }),
  makeProduct({
    _id: "p-2",
    name: "HD 650",
    brand: { _id: "b-sennheiser", name: "Sennheiser", slug: { current: "sennheiser" } },
    price_data: { currency: "USD", unit_amount: 49900 },
    slug: { current: "hd-650" },
    stock: 0,
    reservedStock: 0,
  }),
  makeProduct({
    _id: "p-3",
    name: "Clear",
    brand: { _id: "b-focal", name: "Focal", slug: { current: "focal" } },
    price_data: { currency: "USD", unit_amount: 149900 },
    slug: { current: "clear" },
    stock: 5,
    reservedStock: 5,
  }),
  makeProduct({
    _id: "p-4",
    name: "Utopia",
    brand: { _id: "b-focal", name: "Focal", slug: { current: "focal" } },
    price_data: { currency: "USD", unit_amount: 399900 },
    slug: { current: "utopia" },
    stock: 3,
    reservedStock: 0,
  }),
  makeProduct({
    _id: "p-5",
    name: "Sundara",
    brand: { _id: "b-hifiman", name: "HiFiMan", slug: { current: "hifiman" } },
    price_data: { currency: "USD", unit_amount: 29900 },
    slug: { current: "sundara" },
    stock: 20,
    reservedStock: 1,
  }),
  makeProduct({
    _id: "p-6",
    name: "Arya",
    brand: { _id: "b-hifiman", name: "HiFiMan", slug: { current: "hifiman" } },
    price_data: { currency: "USD", unit_amount: 159900 },
    slug: { current: "arya" },
    stock: 1,
    reservedStock: 0,
  }),
];

/** Distinct brand names present in `mockProducts`, sorted ascending. */
export const mockBrandNames = ["Focal", "HiFiMan", "Sennheiser"] as const;

/** Price/stock extents across `mockProducts` (cents / units). */
export const mockExtents = {
  minPrice: 29900,
  maxPrice: 399900,
  maxStock: 20,
} as const;

/**
 * Shape of a single CMS `categoryFilters.filterItems[]` entry, matching the
 * projection in `getFiltersForCategoryPath`.
 */
export interface MockFilterItem {
  name: string;
  type: "checkbox" | "radio" | "multiselect" | "range" | "boolean";
  field: string;
  options: string[];
  defaultValue: string | null;
  min: number | null;
  max: number | null;
  isMinOnly: boolean;
  step: number;
}

/**
 * Mock `categoryFilters` document result (the `{ filterItems }` projection),
 * with a checkbox Brand filter and a Price range filter.
 */
export const mockCategoryFilters: { filterItems: MockFilterItem[] } = {
  filterItems: [
    {
      name: "Brand",
      type: "checkbox",
      field: "brand",
      options: ["Sennheiser", "Focal", "HiFiMan"],
      defaultValue: null,
      min: null,
      max: null,
      isMinOnly: false,
      step: 1,
    },
    {
      name: "Price",
      type: "range",
      field: "priceRange",
      options: [],
      defaultValue: null,
      min: 0,
      max: 4000,
      isMinOnly: false,
      step: 1,
    },
  ],
};
