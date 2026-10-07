import { getLighthouseReport, PerformanceBaselineView } from "@/features/performance/server";

// This page is intentionally admin-only. It renders a baseline performance table
// from the committed Lighthouse CI assertion results. It does not fake data.

export default async function PerformanceBaselinePage() {
  const report = await getLighthouseReport();
  return <PerformanceBaselineView report={report} />;
}
