import { Suspense } from "react";
import { sanityFetch } from "@/sanity-cms/lib/client";
import { ProductImage } from "@/app/components/features/products/ProductImage";

const ROW_SIZE = 10;

interface ChunkProduct {
  _id: string;
  name: string;
  slug: { current: string } | null;
  price_data: { unit_amount: number } | null;
  image: { asset: { _id: string; metadata: { lqip: string | null } | null } | null } | null;
}

function fetchProductsChunk(offset: number, limit: number) {
  return sanityFetch<ChunkProduct[]>({
    query: `*[_type == "product" && defined(image.asset)] | order(_createdAt asc) [${offset}...${offset + limit}]{
      _id,
      name,
      slug{current},
      price_data,
      image{ asset->{_id, metadata{lqip}} }
    }`,
  });
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({ length: ROW_SIZE }).map((_, i) => (
        <div key={i} className="aspect-square w-full rounded bg-neutral-200 animate-pulse" />
      ))}
    </div>
  );
}

async function ProductRow({
  promise,
  priority,
}: {
  promise: Promise<ChunkProduct[]>;
  priority: boolean;
}) {
  const products = await promise;

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {products.map((product) => {
        const price = product.price_data ? (product.price_data.unit_amount / 100).toFixed(2) : null;

        return (
          <div key={product._id} className="flex flex-col gap-2">
            <div className="aspect-square w-full overflow-hidden rounded bg-white">
              <ProductImage image={product.image} alt={product.name} priority={priority} />
            </div>
            <p className="text-sm">{product.name}</p>
            {price && <p className="text-sm text-neutral-500">${price}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function StreamingPocPage() {
  const row1Promise = fetchProductsChunk(0, ROW_SIZE);
  const row2Promise = fetchProductsChunk(ROW_SIZE, ROW_SIZE);
  const row3Promise = fetchProductsChunk(ROW_SIZE * 2, ROW_SIZE);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold">Streaming POC</h1>

      <Suspense fallback={<RowSkeleton />}>
        <ProductRow promise={row1Promise} priority />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <ProductRow promise={row2Promise} priority={false} />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <ProductRow promise={row3Promise} priority={false} />
      </Suspense>
    </div>
  );
}
