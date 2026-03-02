import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
import ProductsGrid from "@/app/components/features/products/ProductsGrid";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = params.query;
  if (!query) {
    return (
      <div className="justify-top flex min-h-dvh flex-col items-center bg-slate-200 p-4">
        <div className="w-ful max-w-4xl rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-3xl font-bold">
            No products found
          </h1>
          <p className="text-gray text-center">
            Try searching with different keywords
          </p>
        </div>
      </div>
    );
  }
  const products = await searchProductsByName(query);
  const productsCount = products.length;
  if (!productsCount) {
    return (
      <div className="justify-top flex min-h-dvh flex-col items-center bg-slate-200 p-4">
        <div className="w-ful max-w-4xl rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-3xl font-bold">
            No products found for: {query}
          </h1>
          <p className="text-gray text-center">
            Try searching with different keywords
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="justify-top flex min-h-dvh flex-col items-center bg-slate-200 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white">
        <h1 className="my-6 text-center text-3xl font-bold">
          Search results for: <span className="font-light">{query}</span>
        </h1>
        <p className="text-gray font-oswald mb-6 text-center">
          {productsCount} product{productsCount > 1 ? "s" : ""} found{" "}
        </p>
      </div>
      <div className="mt-4 w-full max-w-4xl rounded-lg">
        <ProductsGrid products={products} />
      </div>
    </div>
  );
}
