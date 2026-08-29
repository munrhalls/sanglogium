import { Suspense } from "react";
import Image from "next/image";
import { sanityFetch } from "@/sanity-cms/lib/client";

const ROW_SIZE = 10;

/* Plain text in the server output — not a React component, so it cannot
   hydrate, cannot throw, and cannot collapse the row-by-row streaming.
   It does what the isolated harness did: once a tile has real pixels
   (load event, or already-complete by the time we look), wait two frames,
   then add `-done` so the CSS blur→sharp transition runs. Rows arrive after
   this script, hence the MutationObserver. */
const REVEAL_SCRIPT = `(function(){
var SEL='img.spoc-reveal';
function done(img){requestAnimationFrame(function(){requestAnimationFrame(function(){img.classList.add('spoc-reveal-done');});});}
function arm(img){
if(img.getAttribute('data-spoc-armed'))return;
img.setAttribute('data-spoc-armed','1');
if(img.complete&&img.naturalWidth>0){done(img);return;}
img.addEventListener('load',function(){done(img);},{once:true});
img.addEventListener('error',function(){done(img);},{once:true});
}
function scan(){var l=document.querySelectorAll(SEL);for(var i=0;i<l.length;i++)arm(l[i]);}
scan();
try{new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',scan);
window.addEventListener('load',scan);
})();`;

interface ChunkProduct {
  _id: string;
  name: string;
  slug: { current: string } | null;
  price_data: { unit_amount: number } | null;
  image: {
    asset: { _id: string; metadata: { lqip: string | null } | null } | null;
  } | null;
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
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {Array.from({ length: ROW_SIZE }).map((_, i) => (
        <div
          key={i}
          className="rounded aspect-square w-full animate-pulse bg-neutral-200"
        />
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
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {products.map((product) => {
        const assetId = product.image?.asset?._id ?? null;
        const lqip = product.image?.asset?.metadata?.lqip ?? null;
        const price = product.price_data
          ? (product.price_data.unit_amount / 100).toFixed(2)
          : null;

        return (
          <div key={product._id} className="flex flex-col gap-2">
            <div className="rounded relative aspect-square w-full overflow-hidden bg-neutral-100">
              {assetId && (
                <Image
                  src={assetId}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover spoc-reveal"
                  priority={priority}
                  {...(lqip
                    ? { placeholder: "blur" as const, blurDataURL: lqip }
                    : {})}
                />
              )}
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
    <div className="space-y-8 p-6">
      <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />

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
