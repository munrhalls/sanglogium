RAW INTELLIGENCE REPORT: Sanity → Next.js Image Pipeline Sweep
Status: COMPLETE — All 4 vectors mapped. Zero files modified.

VECTOR 1: Next.js Global Configuration
File: c:\webdev\sang-logium\next.config.ts

Exact images configuration block (lines 28–35):



next.config.ts:28-35
images: {
  formats: ["image/avif", "image/webp"],
  remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }, { protocol: "https", hostname: "images.unsplash.com" }],
  qualities: [75, 90],
  deviceSizes: [640, 750, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000,
},
Key Findings:

cdn.sanity.io is whitelisted in remotePatterns.
No loader or loaderFile field is present. Next.js therefore defaults to the Vercel Image Optimization service (/_next/image?url=...).
No unoptimized flag is set.
deviceSizes match the array used in some manual srcSet constructions (see Vector 3).
VECTOR 2: Sanity Image Pipeline Construction
Primary dependency: @sanity/image-url v1.2.0 (package.json line 68).

File A: c:\webdev\sang-logium\sanity-cms\lib\image.ts



image.ts:1-12
import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
 
import { dataset, projectId } from "../env";
 
const builder = createImageUrlBuilder({ projectId, dataset });
 
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};
File B: c:\webdev\sang-logium\sanity-cms\lib\client.ts



client.ts:36-41
const builder = imageUrlBuilder(client);
 
export function urlFor(source: any) {
  return builder.image(source);
}
File C (active frontend loader): c:\webdev\sang-logium\lib\utils\sanityImageLoader.ts



sanityImageLoader.ts:1-33
import urlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity-cms/env";
 
const builder = urlBuilder({ projectId, dataset });
 
function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }
  return builder
    .image(src)
    .width(width)
    .quality(quality || 75)
    .auto("format")
    .url();
}
 
export { sanityImageLoader };
export default sanityImageLoader;
File D (orphaned legacy loader): c:\webdev\sang-logium\lib\utils\imageUtils.ts



imageUtils.ts:1-13
"use client";
 
import { ImageLoaderProps } from "next/image";
 
export default function sanityLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  return `${src}?w=${width}&q=${quality || 75}&auto=format`;
}
Gap: Zero imports found across the entire codebase. This file is dead code.

File E (orphaned helpers): c:\webdev\sang-logium\lib\sanity\imageUrl.ts Contains generateBlurDataURL, heroImageUrl, thumbnailImageUrl, brandImageUrl. Gap: Zero imports found in app. Dead code.

VECTOR 3: Frontend <Image /> Implementation
Two incompatible patterns coexist. Pattern B is the anomaly source.

Pattern A — Correct: Raw asset ref + loader={sanityImageLoader}
Example 1 (Product Detail — Image Gallery): c:\webdev\sang-logium\app\components\features\products\ImageGallery.tsx



ImageGallery.tsx:64-72
<Image
  src={mainImageRef}
  loader={sanityImageLoader}
  alt={`${productName} - Image ${selectedIndex + 1}`}
  fill
  sizes="(max-width: 1024px) 100vw, 50vw"
  className="object-cover transition-transform duration-300 group-hover:scale-105"
  priority={selectedIndex === 0}
/>
Example 2 (Product Grid — Basket): c:\webdev\sang-logium\app\components\features\basket\BasketItem.tsx



BasketItem.tsx:41-48
<Image
  src={assetRef}
  loader={sanityImageLoader}
  alt={name}
  fill
  sizes="96px"
  className="object-contain"
/>
Example 3 (Shared Component): c:\webdev\sang-logium\app\components\ui\sanity-image\SanityImage.tsx



SanityImage.tsx:19-35
<Image
  src={src.asset._ref || src.asset._id}
  alt={alt}
  loader={sanityImageLoader}
  fill={fill}
  width={fill ? undefined : width}
  height={fill ? undefined : height}
  priority={priority}
  className={className}
  sizes={sizes}
  placeholder="blur"
  blurDataURL={src.asset.metadata.lqip}
/>
Pattern B — Double-Processing Anomaly: sanityImageLoader() called directly as src string, loader prop omitted
In these components, sanityImageLoader(...) pre-builds a full https://cdn.sanity.io/... URL. Because the loader prop is absent, Next.js passes that URL to the default Vercel loader, which re-optimizes it.

Example 1 (Homepage Hero — also generates manual srcSet): c:\webdev\sang-logium\app\components\features\homepage\hero\Hero.tsx



Hero.tsx:30-38
const desktopSrcSet = [640, 750, 1080, 1200, 1920, 2048]
  .map((w) => `${sanityImageLoader({ src: desktopRef, width: w, quality: 75 })} ${w}w`)
  .join(", ");
 
const mobileImageUrl = mobileRef ? sanityImageLoader({ src: mobileRef, width: 828, quality: 75 }) : "";


Hero.tsx:53-65
<Image
  src={mobileImageUrl}
  alt={heroData.backgroundImage.alt || "Hero Image"}
  fill
  priority
  fetchPriority="high"
  placeholder={blurDataURL ? "blur" : undefined}
  blurDataURL={blurDataURL}
  className="object-cover rounded-none"
  sizes="100vw"
  quality={75}
  style={{ objectPosition: getPosition(mobileBackgroundImage) }}
/>
Note: No loader prop. src is already a fully-formed Sanity CDN URL.

Example 2 (Homepage Featured): c:\webdev\sang-logium\app\components\features\homepage\featured\Featured.tsx



Featured.tsx:45-52
<Image
  src={product.image?.asset?._id ? sanityImageLoader({ src: product.image?.asset?._id, width: 450, quality: 75 }) : ""}
  alt={product.name}
  width={450}
  height={450}
  priority={idx === 0}
  loading={idx === 0 ? "eager" : "lazy"}
  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
/>
Example 3 (Homepage IEM Card Grid): c:\webdev\sang-logium\app\components\features\homepage\iems-gallery\IemCard.tsx



IemCard.tsx:22-28
<Image
  src={product.image?.asset?._id ? sanityImageLoader({ src: product.image?.asset?._id, width: 375, quality: 75 }) : ""}
  alt={product.name}
  width={375}
  height={375}
  loading="lazy"
  className="h-[70%] w-[70%] object-cover object-center transition-transform duration-300 group-hover:scale-105 xs:h-[60%] xs:w-[60%]"
/>
Complete list of Pattern B files (all in homepage):

Hero.tsx
Featured.tsx
IemCard.tsx
NewestRelease.tsx
ProductSpotlight1.tsx
ProductSpotlight2.tsx
ProductSpotlight3.tsx
DacCard.tsx
AccessoryCard.tsx
VECTOR 4: Custom Loader Scan
Active custom loader: c:\webdev\sang-logium\lib\utils\sanityImageLoader.ts

Named export: sanityImageLoader
Default export: sanityImageLoader (intended for images.loaderFile but never wired up in next.config.ts)
Uses @sanity/image-url to generate https://cdn.sanity.io/... URLs at runtime.
Orphaned legacy loader: c:\webdev\sang-logium\lib\utils\imageUtils.ts

Dead file. Zero imports. Different function name (sanityLoader) and implementation (${src}?w=${width}&q=...).
Gap: next.config.ts does not set images.loaderFile, so the default export in sanityImageLoader.ts is never invoked globally. The custom loader only works when explicitly passed via the loader prop (Pattern A).

SUMMARY OF ANOMALY
Root cause identified: Pattern B components pre-build Sanity CDN URLs via sanityImageLoader() and pass them as plain strings to <Image src={...} /> without the loader={sanityImageLoader} prop. Because next.config.ts has no custom loader configured, Next.js falls back to the Vercel Image Optimization service. Every image in Pattern B hits /_next/image?url=https%3A%2F%2Fcdn.sanity.io%2F..., resulting in double-processing (Sanity CDN URL fed into Vercel's optimizer) and quota exhaustion.

Pattern A components bypass Vercel entirely because the loader prop intercepts the URL generation and returns the Sanity CDN URL directly to the browser.

Sweep complete. Ready for gap review and fix architecture.