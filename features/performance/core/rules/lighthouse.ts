export type MetricKind = "score" | "ms" | "cls" | "bytes";

export type Assertion = {
  name: "minScore" | "maxNumericValue";
  expected: number;
  actual: number;
  values: number[];
  operator: ">=" | "<=";
  passed: boolean;
  auditProperty?: string;
  auditId?: string;
  auditTitle?: string;
  auditDocumentationLink?: string;
  level?: "error" | "warn";
  url: string;
};

export type LighthouseReport = { assertions: Assertion[]; links: Record<string, string> };

export const METRICS: { id: string; label: string; kind: MetricKind }[] = [
  { id: "categories:performance", label: "Performance", kind: "score" },
  { id: "categories:accessibility", label: "Accessibility", kind: "score" },
  { id: "categories:best-practices", label: "Best Practices", kind: "score" },
  { id: "categories:seo", label: "SEO", kind: "score" },
  { id: "largest-contentful-paint", label: "LCP", kind: "ms" },
  { id: "first-contentful-paint", label: "FCP", kind: "ms" },
  { id: "total-blocking-time", label: "TBT", kind: "ms" },
  { id: "cumulative-layout-shift", label: "CLS", kind: "cls" },
  { id: "server-response-time", label: "TTFB", kind: "ms" },
  { id: "speed-index", label: "Speed Index", kind: "ms" },
  { id: "uses-responsive-images", label: "Responsive Images", kind: "score" },
  { id: "total-byte-weight", label: "Total Bytes", kind: "bytes" },
  { id: "uses-long-cache-ttl", label: "Cache TTL", kind: "score" },
  { id: "unused-javascript", label: "Unused JS", kind: "bytes" },
];

export function assertionKey(a: Assertion): string {
  if (a.auditId === "categories" && a.auditProperty) {
    return `categories:${a.auditProperty}`;
  }
  return a.auditId || a.name;
}

export function formatValue(value: number, kind: MetricKind): string {
  if (kind === "score") return `${Math.round(value * 100)}`;
  if (kind === "ms") return `${Math.round(value)}`;
  if (kind === "cls") return value.toFixed(3);
  if (kind === "bytes") return formatBytes(value);
  return String(value);
}

export function formatExpected(value: number, kind: MetricKind): string {
  if (kind === "score") return `${Math.round(value * 100)}`;
  if (kind === "ms") return `${Math.round(value)} ms`;
  if (kind === "cls") return value.toFixed(3);
  if (kind === "bytes") return formatBytes(value);
  return String(value);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function unit(kind: MetricKind): string {
  if (kind === "score") return "%";
  if (kind === "ms") return "ms";
  if (kind === "cls") return "";
  if (kind === "bytes") return "";
  return "";
}

export function pageLabel(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname === "/") return "Home";
    if (u.pathname.startsWith("/product/")) return "Product";
    if (u.pathname.startsWith("/products/")) return "Category";
    return u.pathname;
  } catch {
    return url;
  }
}

export function groupByUrl(assertions: Assertion[]): Map<string, Assertion[]> {
  const byUrl = new Map<string, Assertion[]>();
  for (const a of assertions) {
    const list = byUrl.get(a.url) || [];
    list.push(a);
    byUrl.set(a.url, list);
  }
  return byUrl;
}
