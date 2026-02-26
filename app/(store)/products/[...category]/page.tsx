import ProductsGrid from "@/app/components/features/products/ProductsGrid";
import CategoryBreadcrumbs from "@/app/components/ui/breadcrumbs/CategoryBreadcrumbs";
import CategoryTitleIcon from "@/app/components/ui/icons/CategoryTitleIcon";
import AppliedFilters from "@/app/components/ui/tag-elements/AppliedFilters";
import FilterSortBtns from "@/app/components/ui/buttons/FilterSortBtns";
import ProductsFilterSortDrawersWrapper from "@/app/components/ui/drawers/ProductsFilterSortDrawersWrapper";
import { getFiltersForCategoryPathAction } from "@/app/actions/categories";
import { getSortablesForCategoryPathAction } from "@/app/actions/categories";
import getSelectedFilters from "../helpers/getSelectedFilters";
import { getSelectedProducts } from "@/sanity/lib/products/getSelectedProducts";
import SidebarClient from "../SidebarClient";
import getSelectedSort from "../helpers/getSelectedSort";
import formatCategoryTitle from "../helpers/formatCategoryTitle";
import formatSortName from "@/app/components/ui/sortables/helpers/formatSortName";
import formatSortDirection from "@/app/components/ui/sortables/helpers/formatSortDirection";
import Footer from "@/app/components/layout/footer/Footer";
import Pagination from "@/app/components/ui/pagination/Pagination";
import getSelectedPagination from "../helpers/getSelectedPagination";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const path = Array.isArray(params.category)
    ? params.category
    : [params.category];
  const [root, leaf] = [path[0], path[path.length - 1]];
  const categoryTitle = formatCategoryTitle(leaf);
  const searchParamsResolved = searchParams;
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
      path,
      selectedFilters,
      selectedSort,
      selectedPagination
    ).catch((error) => {
      console.error("Failed to fetch products:", error);
      return { products: [], totalProductsCount: 0 };
    }),
    getFiltersForCategoryPathAction(path).catch((error) => {
      console.error("Failed to fetch filters:", error);
      return [];
    }),
    getSortablesForCategoryPathAction(path.join("/")).catch((error) => {
      console.error("Failed to fetch sort options:", error);
      return [];
    }),
  ]);
  const { products, totalProductsCount } = productsResult;
  return (
    <>
      <main className="container mx-auto hidden px-4 py-8 md:block">
        <div className="mb-6">
          <CategoryBreadcrumbs categoryParts={path} isMobile={false} />
          <div className="mb-6 mt-8 flex items-center justify-center gap-3 pb-12">
            <CategoryTitleIcon category={root} />
            <h1 className="text-5xl font-bold tracking-wide">
              {categoryTitle}
            </h1>
          </div>
          <div className="hidden items-center justify-start border-b border-gray-300 md:ml-auto md:flex">
            <Pagination totalProductsCount={totalProductsCount} />
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
                Showing {products.length} product
                {products.length !== 1 && "s"}
                {sortField &&
                  ` sorted by ${formatSortName(sortField)} (${formatSortDirection(sortDirection)})`}
              </p>
              <ProductsGrid products={products} />
            </div>
          </div>
        </div>
        <ProductsFilterSortDrawersWrapper categoryPath={path} />
      </main>
      <div className="flex h-screen flex-col overflow-hidden md:hidden">
        <div className="flex-none bg-white">
          <div className="container mx-auto flex px-1 py-1">
            <div className="mb-1">
              <CategoryBreadcrumbs categoryParts={path} isMobile={true} />
              <div className="m-1 flex items-center justify-start gap-1">
                <CategoryTitleIcon category={root} />
                <h1 className="text-lg font-bold tracking-wide">
                  {categoryTitle}
                </h1>
              </div>
            </div>
            <div className="flex flex-1 justify-center">
              <FilterSortBtns />
            </div>
          </div>
          <Pagination totalProductsCount={totalProductsCount} />
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
            <ProductsFilterSortDrawersWrapper categoryPath={path} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// import { notFound } from "next/navigation";
// import catalogueIndex from "@/data/catalogue-index.json"; // 👈 The Virtual File System

// // ... imports remain the same ...
// import ProductsGrid from "@/app/components/features/products/ProductsGrid";
// import CategoryBreadcrumbs from "@/app/components/ui/breadcrumbs/CategoryBreadcrumbs";
// import CategoryTitleIcon from "@/app/components/ui/icons/CategoryTitleIcon";
// import AppliedFilters from "@/app/components/ui/tag-elements/AppliedFilters";
// import FilterSortBtns from "@/app/components/ui/buttons/FilterSortBtns";
// import ProductsFilterSortDrawersWrapper from "@/app/components/ui/drawers/ProductsFilterSortDrawersWrapper";
// import { getFiltersForCategoryPathAction } from "@/app/actions/categories";
// import { getSortablesForCategoryPathAction } from "@/app/actions/categories";
// import getSelectedFilters from "../helpers/getSelectedFilters";
// import { getSelectedProducts } from "@/sanity/lib/products/getSelectedProducts";
// import SidebarClient from "../SidebarClient";
// import getSelectedSort from "../helpers/getSelectedSort";
// import formatSortName from "@/app/components/ui/sortables/helpers/formatSortName";
// import formatSortDirection from "@/app/components/ui/sortables/helpers/formatSortDirection";
// import Footer from "@/app/components/layout/footer/Footer";
// import Pagination from "@/app/components/ui/pagination/Pagination";
// import getSelectedPagination from "../helpers/getSelectedPagination";

// type Params = Promise<{ slug: string[] }>; // Note: Next.js usually names catch-all 'slug'
// type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// export default async function ProductsPage(props: {
//   params: Params;
//   searchParams: SearchParams;
// }) {
//   const params = await props.params;
//   const searchParams = await props.searchParams;

//   // 1. 🔍 O(1) LOOKUP: Resolve URL to ID
//   // Join slug array to match map keys (e.g., "headphones/wired")
//   const urlPath = params.slug.join("/");
//   const catalogueId = (catalogueIndex.urlMap as Record<string, string>)[urlPath];

//   // 2. 🛑 SAFETY: Handle 404
//   if (!catalogueId) {
//     notFound();
//   }

//   // 3. 📦 METADATA: Get pre-computed data
//   const catalogueNode = (catalogueIndex.idMap as Record<string, any>)[catalogueId];
//   const categoryTitle = catalogueNode.title;
//   const breadcrumbs = catalogueNode.breadcrumbs;

//   // ... Search Params Logic (Same as before) ...
//   const selectedFilters = getSelectedFilters(searchParams);
//   const selectedSort = getSelectedSort(searchParams);
//   const selectedPagination = getSelectedPagination(searchParams);
//   const sortField = typeof searchParams.sort === "string" ? searchParams.sort : "";
//   const sortDirection = typeof searchParams.dir === "string" ? searchParams.dir : "asc";

//   // 4. ⚡ FETCH: Pass the ID, not the path
//   const [productsResult, filterOptions, sortOptions] = await Promise.all([
//     // ⚠️ CRITICAL: You must update getSelectedProducts to accept `catalogueId`
//     getSelectedProducts(
//       catalogueId, // Passing ID now
//       selectedFilters,
//       selectedSort,
//       selectedPagination
//     ).catch((error) => {
//       console.error("Failed to fetch products:", error);
//       return { products: [], totalProductsCount: 0 };
//     }),

//     // ⚠️ These actions also need to be updated to use the ID
//     getFiltersForCategoryPathAction(catalogueId).catch((e) => []),
//     getSortablesForCategoryPathAction(catalogueId).catch((e) => []),
//   ]);

//   const { products, totalProductsCount } = productsResult;

//   return (
//     <>
//       <main className="container mx-auto hidden px-4 py-8 md:block">
//         <div className="mb-6">
//           {/* 5. 🍞 BREADCRUMBS: Use pre-computed data */}
//           <CategoryBreadcrumbs items={breadcrumbs} isMobile={false} />

//           <div className="mb-6 mt-8 flex items-center justify-center gap-3 pb-12">
//             {/* Note: You might need to map 'root' from breadcrumbs[0] if needed */}
//             <CategoryTitleIcon category={breadcrumbs[0]?.label || ""} />
//             <h1 className="text-5xl font-bold tracking-wide">
//               {categoryTitle}
//             </h1>
//           </div>

//           <div className="hidden items-center justify-start border-b border-gray-300 md:ml-auto md:flex">
//              <Pagination totalProductsCount={totalProductsCount} />
//           </div>
//         </div>

//         <AppliedFilters filterOptions={filterOptions} />

//         <div className="mt-4 grid grid-cols-[280px_1fr] gap-6">
//           <SidebarClient
//             filterOptions={filterOptions}
//             sortOptions={sortOptions}
//             sortField={sortField}
//           />
//           <div>
//             <div className="mb-1 rounded-lg bg-slate-200 p-1 shadow">
//               <p className="text-md p-2 text-gray-500 lg:text-xl">
//                 Showing {products.length} product
//                 {products.length !== 1 && "s"}
//                 {sortField &&
//                   ` sorted by ${formatSortName(sortField)} (${formatSortDirection(sortDirection)})`}
//               </p>
//               <ProductsGrid products={products} />
//             </div>
//           </div>
//         </div>

//         {/* Pass ID to Drawers wrapper too */}
//         <ProductsFilterSortDrawersWrapper catalogueId={catalogueId} />
//       </main>

//       {/* ... Mobile Layout (Apply similar changes: Breadcrumbs, Titles) ... */}
//        <div className="flex h-screen flex-col overflow-hidden md:hidden">
//         <div className="flex-none bg-white">
//           <div className="container mx-auto flex px-1 py-1">
//             <div className="mb-1">
//                {/* Mobile Breadcrumbs */}
//               <CategoryBreadcrumbs items={breadcrumbs} isMobile={true} />
//               <div className="m-1 flex items-center justify-start gap-1">
//                 <CategoryTitleIcon category={breadcrumbs[0]?.label || ""} />
//                 <h1 className="text-lg font-bold tracking-wide">
//                   {categoryTitle}
//                 </h1>
//               </div>
//             </div>
//             {/* ... Rest of mobile layout ... */}
//       </div>
//       <Footer />
//     </>
//   );
// }
