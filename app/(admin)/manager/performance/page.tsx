import { promises as fs } from "fs";
import path from "path";

// This page is intentionally admin-only. It renders a baseline performance table
// from the committed Lighthouse CI assertion results. It does not fake data.

type Assertion = {
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

const METRICS: { id: string; label: string; kind: "score" | "ms" | "cls" | "bytes" }[] = [
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

function assertionKey(a: Assertion): string {
  if (a.auditId === "categories" && a.auditProperty) {
    return `categories:${a.auditProperty}`;
  }
  return a.auditId || a.name;
}

function formatValue(value: number, kind: "score" | "ms" | "cls" | "bytes"): string {
  if (kind === "score") return `${Math.round(value * 100)}`;
  if (kind === "ms") return `${Math.round(value)}`;
  if (kind === "cls") return value.toFixed(3);
  if (kind === "bytes") return formatBytes(value);
  return String(value);
}

function formatExpected(value: number, kind: "score" | "ms" | "cls" | "bytes"): string {
  if (kind === "score") return `${Math.round(value * 100)}`;
  if (kind === "ms") return `${Math.round(value)} ms`;
  if (kind === "cls") return value.toFixed(3);
  if (kind === "bytes") return formatBytes(value);
  return String(value);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function unit(kind: "score" | "ms" | "cls" | "bytes"): string {
  if (kind === "score") return "%";
  if (kind === "ms") return "ms";
  if (kind === "cls") return "";
  if (kind === "bytes") return "";
  return "";
}

function badgeClass(a: Assertion): string {
  if (a.passed) return "bg-emerald-100 text-emerald-800";
  if (a.level === "error") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

function pageLabel(url: string): string {
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

export default async function PerformanceBaselinePage() {
  const dataDir = path.join(process.cwd(), ".lighthouseci");
  let assertions: Assertion[] = [];
  let links: Record<string, string> = {};

  try {
    const [assertionsRaw, linksRaw] = await Promise.all([
      fs.readFile(path.join(dataDir, "assertion-results.json"), "utf8"),
      fs.readFile(path.join(dataDir, "links.json"), "utf8"),
    ]);
    assertions = JSON.parse(assertionsRaw) as Assertion[];
    links = JSON.parse(linksRaw) as Record<string, string>;
  } catch {
    // Keep defaults; the UI will show the empty state.
  }

  const byUrl = new Map<string, Assertion[]>();
  for (const a of assertions) {
    const list = byUrl.get(a.url) || [];
    list.push(a);
    byUrl.set(a.url, list);
  }

  const urls = Array.from(byUrl.keys());

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Performance baseline</h1>
        <p className="mt-2 text-slate-600">
          Admin-only view of the committed Lighthouse CI assertion results.
          Values are the Lighthouse thresholds; cells are color-coded as pass, warn, or fail.
        </p>

        {urls.length === 0 ? (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            No Lighthouse CI assertion data found in <code>.lighthouseci/assertion-results.json</code>.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-100 p-3 font-semibold">Metric</th>
                  {urls.map((url) => (
                    <th key={url} className="p-3 font-semibold">
                      <div className="min-w-[8rem]">
                        <div>{pageLabel(url)}</div>
                        {links[url] ? (
                          <a
                            href={links[url]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-normal text-blue-600 hover:underline"
                          >
                            Open report
                          </a>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric) => (
                  <tr key={metric.id} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white p-3 font-medium">
                      {metric.label}
                    </td>
                    {urls.map((url) => {
                      const match = (byUrl.get(url) || []).find(
                        (a) => assertionKey(a) === metric.id
                      );
                      if (!match) {
                        return (
                          <td key={`${url}-${metric.id}`} className="p-3 text-slate-300">
                            —
                          </td>
                        );
                      }
                      const value = formatValue(match.actual, metric.kind);
                      const expected = formatExpected(match.expected, metric.kind);
                      const operator = match.operator === ">=" ? "≥" : "≤";
                      return (
                        <td key={`${url}-${metric.id}`} className="p-3">
                          <span
                            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${badgeClass(match)}`}
                            title={`Expected ${operator} ${expected}`}
                          >
                            {value}
                            {unit(metric.kind) ? <span className="ml-0.5">{unit(metric.kind)}</span> : null}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Data source: <code>.lighthouseci/assertion-results.json</code> and <code>.lighthouseci/links.json</code>.
          Missing values mean the metric was not asserted in the current run.
        </p>
      </div>
    </main>
  );
}
