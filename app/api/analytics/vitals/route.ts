import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analytics/vitals
 *
 * Receives Core Web Vitals beacons from the WebVitals RUM component.
 * Logs structured JSON for consumption by log aggregators (Netlify logs,
 * Datadog, Grafana, etc.) and maintains lightweight in-memory aggregation
 * for periodic summary logging.
 *
 * Metrics received: LCP, INP, CLS, TTFB, FCP
 * Google's threshold: p75 (75th percentile), not average
 */

interface VitalsPayload {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType: string;
}

const METRIC_NAMES = ["LCP", "INP", "CLS", "TTFB", "FCP"] as const;

const aggregates = new Map<string, number[]>();

METRIC_NAMES.forEach((name) => aggregates.set(name, []));

const MAX_SAMPLES = 1000;
const LOG_INTERVAL = 100;

function p75(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.75) - 1;
  return sorted[idx] ?? 0;
}

function logSummary() {
  const summary: Record<string, { count: number; p75: number }> = {};

  METRIC_NAMES.forEach((name) => {
    const values = aggregates.get(name)!;
    if (values.length > 0) {
      summary[name] = { count: values.length, p75: Math.round(p75(values) * 100) / 100 };
    }
  });

  if (Object.keys(summary).length > 0) {
    console.log(JSON.stringify({ event: "web_vitals_summary", ...summary }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VitalsPayload;

    if (!body.name || typeof body.value !== "number") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    console.log(
      JSON.stringify({
        event: "web_vital",
        name: body.name,
        value: body.value,
        rating: body.rating,
        navigationType: body.navigationType,
      })
    );

    const metricValues = aggregates.get(body.name);
    if (metricValues) {
      metricValues.push(body.value);
      if (metricValues.length > MAX_SAMPLES) {
        metricValues.splice(0, metricValues.length - MAX_SAMPLES);
      }
    }

    const totalSamples = Array.from(aggregates.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    if (totalSamples % LOG_INTERVAL === 0) {
      logSummary();
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
