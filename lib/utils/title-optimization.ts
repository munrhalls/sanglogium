/**
 * Smart Title Optimization for Product Pages
 * 
 * Handles browser tab character limits while preserving SEO value
 * and brand recognition across all product pages systematically.
 */

export interface TitleOptions {
  productName: string;
  brand?: string | null;
  siteName?: string;
  maxLength?: number;
}

/**
 * Generates optimized page titles for browser tabs and SEO
 * 
 * Strategy:
 * 1. Prioritize product name (most important for search)
 * 2. Include brand if space allows
 * 3. Always include site name for brand recognition
 * 4. Use smart truncation to preserve readability
 */
export function generateOptimizedTitle(options: TitleOptions): string {
  const {
    productName,
    brand,
    siteName = "Sang Logium",
    maxLength = 60 // Optimal for browser tabs + SERP display
  } = options;

  // Base components
  const components = [productName];
  
  // Add brand if it exists and isn't already in product name
  if (brand && !productName.toLowerCase().includes(brand.toLowerCase())) {
    components.push(brand);
  }
  
  // Always add site name
  components.push(siteName);

  // Build title with different strategies based on length
  let title = components.join(" — ");
  
  // If title is within limits, return as-is
  if (title.length <= maxLength) {
    return title;
  }

  // Strategy 1: Remove site name if product name is very long
  if (productName.length > maxLength - 10) {
    return productName.length <= maxLength 
      ? productName 
      : truncateProductName(productName, maxLength);
  }

  // Strategy 2: Try brand + site name (shorter product names)
  const withBrandAndSite = `${productName} — ${brand} — ${siteName}`;
  if (withBrandAndSite.length <= maxLength) {
    return withBrandAndSite;
  }

  // Strategy 3: Product name + site name only
  const withSiteOnly = `${productName} — ${siteName}`;
  if (withSiteOnly.length <= maxLength) {
    return withSiteOnly;
  }

  // Strategy 4: Truncate product name intelligently
  const truncatedProduct = truncateProductName(productName, maxLength - siteName.length - 3);
  return `${truncatedProduct} — ${siteName}`;
}

/**
 * Intelligently truncates product names while preserving readability
 */
function truncateProductName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;

  // For very short limits, just truncate and add ellipsis
  if (maxLength < 20) {
    return name.substring(0, maxLength - 3) + "...";
  }

  // Try to preserve important words (avoid cutting in middle of brand names)
  const words = name.split(" ");
  
  // If we can fit most words, truncate the last one
  let result = "";
  for (const word of words) {
    const testResult = result ? `${result} ${word}` : word;
    if (testResult.length <= maxLength - 3) {
      result = testResult;
    } else {
      break;
    }
  }

  // Add ellipsis if we truncated
  if (result.length < name.length) {
    result += "...";
  }

  return result;
}

/**
 * Generates comprehensive SEO titles (for search engines, not browser tabs)
 * Can be longer since SERPs show more characters
 */
export function generateSEOTitle(options: TitleOptions): string {
  const { productName, brand, siteName = "Sang Logium" } = options;
  
  if (brand && !productName.toLowerCase().includes(brand.toLowerCase())) {
    return `${productName} — ${brand} — ${siteName}`;
  }
  
  return `${productName} — ${siteName}`;
}

/**
 * Generates meta descriptions with smart truncation
 */
export function generateMetaDescription(
  description: string | undefined | null,
  productName: string,
  brand?: string | null,
  maxLength: number = 160
): string {
  // If we have a proper description, use it
  if (description && typeof description === 'string') {
    return description.length <= maxLength 
      ? description 
      : description.substring(0, maxLength - 3) + "...";
  }

  // Generate fallback description
  const fallback = brand 
    ? `Buy ${productName} from ${brand}. Premium audio equipment with fast shipping and expert support.`
    : `Buy ${productName}. Premium audio equipment with fast shipping and expert support.`;

  return fallback.length <= maxLength 
    ? fallback 
    : fallback.substring(0, maxLength - 3) + "...";
}

/**
 * Utility for testing title lengths across different contexts
 */
export function analyzeTitleLength(title: string): {
  length: number;
  browserTabDisplay: string;
  serpDisplay: string;
  recommendations: string[];
} {
  const browserTabLimit = 60;
  const serpLimit = 70; // Google typically shows ~70 chars
  
  return {
    length: title.length,
    browserTabDisplay: title.length <= browserTabLimit 
      ? title 
      : title.substring(0, browserTabLimit - 3) + "...",
    serpDisplay: title.length <= serpLimit 
      ? title 
      : title.substring(0, serpLimit - 3) + "...",
    recommendations: [
      ...(title.length > browserTabLimit ? [`Browser tab: Consider shorter title (${browserTabLimit} chars)`] : []),
      ...(title.length > serpLimit ? [`SERP: Consider shorter title (${serpLimit} chars)`] : []),
      ...(title.length < 30 ? ["Consider adding more detail for better SEO"] : []),
    ]
  };
}
