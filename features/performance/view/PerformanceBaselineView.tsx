import {
  METRICS,
  assertionKey,
  formatExpected,
  formatValue,
  groupByUrl,
  pageLabel,
  unit,
  type Assertion,
  type LighthouseReport,
} from "@/features/performance/core/rules/lighthouse";

function badgeClass(a: Assertion): string {
  if (a.passed) return "bg-emerald-100 text-emerald-800";
  if (a.level === "error") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export default function PerformanceBaselineView({ report }: { report: LighthouseReport }) {
  const byUrl = groupByUrl(report.assertions);
  const links = report.links;
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
