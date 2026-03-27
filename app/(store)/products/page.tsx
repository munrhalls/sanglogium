import ProductsGrid from "@/app/components/features/products/ProductsGrid";
import AppliedFilters from "@/app/components/ui/tag-elements/AppliedFilters";
import FilterSortBtns from "@/app/components/ui/buttons/FilterSortBtns";
import ProductsFilterSortDrawersWrapper from "@/app/components/ui/drawers/ProductsFilterSortDrawersWrapper";
import { getFiltersForCategoryPathAction } from "@/app/actions/categories";
import { getSortablesForCategoryPathAction } from "@/app/actions/categories";
import getSelectedFilters from "./helpers/getSelectedFilters";
import { getSelectedProducts } from "@/sanity/lib/products/getSelectedProducts";
import SidebarClient from "./SidebarClient";
import getSelectedSort from "./helpers/getSelectedSort";
import formatSortName from "@/app/components/ui/sortables/helpers/formatSortName";
import formatSortDirection from "@/app/components/ui/sortables/helpers/formatSortDirection";
import Footer from "@/app/components/layout/footer/Footer";
import getSelectedPagination from "./helpers/getSelectedPagination";
import Pagination from "@/app/components/ui/pagination/Pagination";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function RootProductsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const catalogueKeys: string[] = [];
  const searchParamsResolved = await props.searchParams;
  const selectedFilters = getSelectedFilters(searchParamsResolved);
  const selectedSort = getSelectedSort(searchParamsResolved);
  const selectedPagination = getSelectedPagination(searchParamsResolved);
  const sortField =
    typeof searchParamsResolved.sort === "string"
      ? searchParamsResolved.sort
      : "";
  const sortDirection =
    typeof searchParamsResolved.dir === "string"
      ? searchParamsResolved.dir
      : "asc";
  const [productsResult, filterOptions, sortOptions] = await Promise.all([
    getSelectedProducts(
      catalogueKeys,
      selectedFilters,
      selectedSort,
      selectedPagination
    ).catch((error) => {
      console.error("Failed to fetch products:", error);
      return { products: [], totalProductsCount: 0 };
    }),
    getFiltersForCategoryPathAction(catalogueKeys).catch((error) => {
      console.error("Failed to fetch filters:", error);
      return [];
    }),
    getSortablesForCategoryPathAction(catalogueKeys).catch((error) => {
      console.error("Failed to fetch sort options:", error);
      return [];
    }),
  ]);
  const { products, totalProductsCount } = productsResult;
  return (
    <>
      <main className="container mx-auto hidden px-4 py-8 md:block">
        <div className="mb-6">
          <div className="mb-6 mt-8 flex items-center justify-center gap-3 border-b border-gray-300 pb-12">
            <h1 className="text-5xl font-bold tracking-wide">All Products</h1>
          </div>
        </div>
        <AppliedFilters filterOptions={filterOptions} />
        <div className="mt-4 grid grid-cols-[280px_1fr] gap-6">
          <SidebarClient
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            sortField={sortField}
          />
          <div>
            <div className="mb-1 rounded-lg bg-slate-200 p-1 shadow">
              <p className="text-md p-2 text-gray-500 lg:text-xl">
                Showing {products.length} product{products.length !== 1 && "s"}
                {sortField &&
                  ` sorted by ${formatSortName(sortField)} (${formatSortDirection(sortDirection)})`}
              </p>
              <ProductsGrid products={products} />
            </div>
          </div>
        </div>
        <ProductsFilterSortDrawersWrapper categoryPath={catalogueKeys} />
      </main>
      <div className="flex h-dvh flex-col overflow-hidden md:hidden">
        <div className="flex-none bg-white">
          <div className="container mx-auto px-4 py-1">
            <div className="mb-1">
              <div className="mb-1 mt-2 flex items-center justify-center gap-1 pb-1">
                <h1 className="text-lg font-bold tracking-wide">
                  All Products
                </h1>
              </div>
            </div>
            <div className="grid grid-cols-1 items-center bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
              <FilterSortBtns />
            </div>
            <Pagination totalProductsCount={totalProductsCount} />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="container mx-auto px-4">
            <AppliedFilters filterOptions={filterOptions} />
            <div className="mt-4 grid grid-cols-1 gap-6">
              <SidebarClient
                filterOptions={filterOptions}
                sortOptions={sortOptions}
                sortField={sortField}
              />
              <div>
                <div className="mb-1 rounded-lg bg-slate-200 p-1 shadow">
                  <p className="text-md p-2 text-gray-500 lg:text-xl">
                    Showing {products.length} product
                    {products.length !== 1 && "s"}
                    {sortField &&
                      ` sorted by ${formatSortName(sortField)} (${formatSortDirection(sortDirection)})`}
                  </p>
                  <ProductsGrid products={products} />
                </div>
              </div>
            </div>
            <ProductsFilterSortDrawersWrapper categoryPath={catalogueKeys} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
