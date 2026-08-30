import { Suspense } from "react";
import Image from "next/image";
import { sanityFetch } from "@/sanity-cms/lib/client";
import type { ChunkProduct } from "./types";
import styles from "./reveal.module.css";

/* streaming-poc — blur→sharp image reveal driven by an inline script that runs
 * in the streamed shell, BEFORE any row <img> is parsed and with zero dependency
 * on React hydration.
 *
 * Why the earlier attempts walled: the reveal trigger (React onLoad / a ref
 * callback) only becomes live after hydration. On the dev server hydration is
 * ~15s; every image is `complete` by then, so all 30 flipped in the one
 * hydration pass = synchronized un-blur.
 *
 * This script attaches a capture-phase `load` listener on `document` (load does
 * not bubble but IS delivered in the capture phase). Every image's load is
 * caught the instant its bytes arrive — staggered, ~5s spread on 3G. Double
 * requestAnimationFrame guarantees one painted blurred frame before the flip,
 * so the blur eases (not snaps). `data-shown` is a plain attribute React never
 * renders, so nothing reconciles it away and there is no hydration warning.
 * The page is 100% server components — no "use client" in the tile path. */
const REVEAL_SCRIPT = `
(function(){
  function reveal(t){
    if(!t || t.tagName!=='IMG' || !t.hasAttribute('data-reveal') || t.hasAttribute('data-shown')) return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ t.setAttribute('data-shown',''); });
    });
  }
  document.addEventListener('load', function(e){ reveal(e.target); }, true);
  function scan(){
    var imgs = document.querySelectorAll('img[data-reveal]:not([data-shown])'), i;
    for(i=0;i<imgs.length;i++){ if(imgs[i].complete && imgs[i].naturalWidth>0) reveal(imgs[i]); }
  }
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', scan);
})();
`;

const ROW_SIZE = 5;
const ROW_COUNT = 6;
const PRIORITY_ROWS = 2;

function fetchProductsChunk(offset: number, limit: number) {
  return sanityFetch<ChunkProduct[]>({
    query: `*[_type == "product" && defined(image.asset)] | order(_createdAt asc) [${offset}...${offset + limit}]{
      _id,
      name,
      slug{current},
      price_data,
      image{ asset->{_id, metadata{lqip, isOpaque}} }
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
        const meta = product.image?.asset?.metadata ?? null;
        // Only use the LQIP blur as the underlay for opaque images. A transparent
        // PNG would let the blur bleed through its transparent regions, so those
        // get a plain bg-neutral-100 instead. No cleanup script needed.
        const lqip = meta?.isOpaque === false ? null : (meta?.lqip ?? null);
        const price = product.price_data
          ? (product.price_data.unit_amount / 100).toFixed(2)
          : null;

        return (
          <div key={product._id} className="flex flex-col gap-2">
            <div
              className={`relative aspect-square w-full overflow-hidden rounded bg-neutral-100 ${styles.tile}`}
              style={lqip ? { backgroundImage: `url("${lqip}")` } : undefined}
            >
              {assetId && (
                <Image
                  src={assetId}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className={`object-cover ${styles.reveal}`}
                  priority={priority}
                  data-reveal=""
                  suppressHydrationWarning
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
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => ({
    promise: fetchProductsChunk(i * ROW_SIZE, ROW_SIZE),
    priority: i < PRIORITY_ROWS,
  }));

  return (
    <div className="space-y-8 p-6">
      <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      <h1 className="text-xl font-bold">Streaming POC</h1>
      {rows.map((row, i) => (
        <Suspense key={i} fallback={<RowSkeleton />}>
          <ProductRow promise={row.promise} priority={row.priority} />
        </Suspense>
      ))}
    </div>
  );
}
