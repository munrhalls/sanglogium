import { Suspense } from "react";
import Image from "next/image";
import { sanityFetch } from "@/sanity-cms/lib/client";
import { ROW_SIZE } from "@/sanity-cms/lib/products/getProductsSlice";

interface ProductWithImageRef {
  name: string;
  image: { asset: { _ref: string; metadata: { lqip: string | null } } | null } | null;
}

async function fetchSlice(offset: number, limit: number, requestStart: number) {
  const startedAt = Date.now() - requestStart;
  const items = await sanityFetch<ProductWithImageRef[]>({
    query: `*[_type == "product"][${offset}...${offset + limit}]{ name, image{ asset{ _ref, metadata{ lqip } } } }`,
  });
  const resolvedAt = Date.now() - requestStart;
  return { items, startedAt, resolvedAt };
}

function Timing({
  label,
  startedAt,
  resolvedAt,
}: {
  label: string;
  startedAt: number;
  resolvedAt: number;
}) {
  return (
    <div>
      <strong>{label}</strong> — started at {startedAt}ms, resolved at {resolvedAt}ms
      (took {resolvedAt - startedAt}ms)
    </div>
  );
}

function ProductCard({
  name,
  imageRef,
  lqip,
  priority,
}: {
  name: string;
  imageRef: string | null;
  lqip: string | null;
  priority: boolean;
}) {
  return (
    <div style={{ textAlign: "center", fontSize: 10 }}>
      <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto", background: "#ddd" }}>
        {imageRef && (
          <Image
            src={imageRef}
            alt={name}
            width={140}
            height={140}
            priority={priority}
            placeholder={lqip ? "blur" : "empty"}
            blurDataURL={lqip ?? undefined}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        )}
      </div>
      <div>{name}</div>
    </div>
  );
}

async function BatchBox({
  label,
  offset,
  requestStart,
  priority,
}: {
  label: string;
  offset: number;
  requestStart: number;
  priority: boolean;
}) {
  const { items, startedAt, resolvedAt } = await fetchSlice(offset, ROW_SIZE, requestStart);
  return (
    <div style={{ padding: 8, background: "#bbf7d0" }}>
      <Timing label={label} startedAt={startedAt} resolvedAt={resolvedAt} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 8,
          marginTop: 6,
        }}
      >
        {items.map((item, i) => (
          <ProductCard
            key={i}
            name={item.name}
            imageRef={item.image?.asset?._ref ?? null}
            lqip={item.image?.asset?.metadata?.lqip ?? null}
            priority={priority}
          />
        ))}
      </div>
    </div>
  );
}

const BATCH_COUNT = 8; // 8 rows x ROW_SIZE(8) = up to 64 products, enough to exceed one viewport

export default function StreamingPocPage() {
  const requestStart = Date.now();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, fontSize: 13 }}>
      <h2 style={{ margin: "0 0 4px" }}>
        Batched — {ROW_SIZE} at a time, {BATCH_COUNT} rows (row 1 images get priority)
      </h2>
      {Array.from({ length: BATCH_COUNT }, (_, i) => (
        <Suspense
          key={i}
          fallback={<div style={{ padding: 8, background: "#eee" }}>Loading batch {i + 1}…</div>}
        >
          <BatchBox
            label={`Batch ${i + 1} (offset ${i * ROW_SIZE})`}
            offset={i * ROW_SIZE}
            requestStart={requestStart}
            priority={i === 0}
          />
        </Suspense>
      ))}
    </div>
  );
}
