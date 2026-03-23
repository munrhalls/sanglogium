Research Report: Reconciling Next.js Image and Sanity v3 Image Optimization
Executive Summary
After analyzing official documentation and performance best practices, the optimal approach is to use next-sanity/image component, which provides a purpose-built integration that combines Next.js image optimization features with Sanity's CDN capabilities.

Key Findings
1. Architecture Overview
Two optimization layers exist:

Sanity CDN: Handles image transformations (resize, format conversion, quality adjustment) at the edge
Next.js Image Optimization: Provides lazy loading, srcSet generation, priority hints, and layout stability
The reconciliation challenge: Avoid double-processing while maintaining benefits from both systems.

2. Recommended Solution: next-sanity/image Component
What it does:

Wraps next/image with a Sanity-aware loader
Bypasses Next.js optimization proxy entirely
Points directly to Sanity's CDN with proper transformation parameters
Maintains all Next.js image component features (lazy loading, srcSet, priority, layout stability)
How it works:

typescript
import { Image } from 'next-sanity/image'
import { urlFor } from '@/sanity/lib/image'

<Image
  src={urlFor(image).url()}
  alt="Product"
  width={800}
  height={600}
  priority // for LCP images
/>
3. Technical Benefits
Performance advantages:

No double processing: Images aren't processed by Next.js server, reducing CPU/memory load
Edge optimization: Sanity CDN handles format negotiation (WebP, AVIF) via auto=format parameter based on browser's Accept header
Automatic srcSet: Loader generates responsive breakpoints with proportional height recalculation
Smart fit parameters: fit=max when only width specified (prevents upscaling), fit=min when both dimensions present
Zero configuration: No remotePatterns needed in next.config.js
Developer experience:

Same API as next/image (all props pass through except loader)
Respects crop and hotspot from Sanity Studio
Chainable transformations via sanity/image-url
4. LCP & Core Web Vitals Optimization
Critical for ProductSpotlight images:

For above-the-fold images (LCP candidates):

typescript
<Image
  src={urlFor(image).url()}
  alt="Product"
  width={800}
  height={600}
  priority // Prevents lazy loading
  loading="eager" // Explicit eager loading
  fetchPriority="high" // Browser prioritization hint
/>
For below-the-fold images:

typescript
<Image
  src={urlFor(image).url()}
  alt="Product"
  width={800}
  height={600}
  // Default lazy loading applies
/>
Key metrics impact:

LCP: 60-80% file size reduction, target <2.5s
CLS: Zero layout shift with explicit width/height
FCP: Faster initial paint with priority images
5. Implementation Requirements
Dependencies:

bash
npm install next-sanity @sanity/image-url
Setup image URL builder:

typescript
// sanity/lib/image.ts
import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
Usage pattern:

typescript
import { Image } from 'next-sanity/image'
import { urlFor } from '@/sanity/lib/image'

// Single image
<Image
  src={urlFor(product.image).width(800).url()}
  alt={product.name}
  width={800}
  height={600}
/>

// With transformations
<Image
  src={urlFor(product.image)
    .width(1200)
    .quality(85)
    .url()}
  alt={product.name}
  width={1200}
  height={675}
  priority
/>
6. Tradeoffs & Constraints
Limitations:

src must be a string (no static imports)
Cannot use custom loader prop (component ships with its own)
Requires Sanity CDN URLs
When to use regular next/image:

Static local images
Need custom loader chaining
Images from non-Sanity sources
Conclusion
Recommended approach for ProductSpotlight components:

Use next-sanity/image component for all Sanity-sourced product images
Set priority prop on the first carousel slide (LCP candidate)
Provide explicit width/height to prevent layout shift
Let default lazy loading handle subsequent carousel slides
Leverage Sanity CDN transformations via urlFor() builder for quality/size control
Performance outcome:

Lean file sizes (WebP/AVIF automatic)
Robust responsive behavior (automatic srcSet)
Optimal LCP (<2.5s target achievable)
Zero layout shift (CLS = 0)
Reduced Next.js server load (no image processing)
This approach provides the best of both worlds: Sanity's powerful CDN transformations with Next.js's image component UX benefits, without double-processing overhead.