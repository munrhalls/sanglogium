import { NextRequest, NextResponse } from "next/server";
import { recordWebVital } from "@/platform/analytics/webVitalsLog";

// Receives Core Web Vitals beacons from platform/analytics/WebVitals.
export async function POST(request: NextRequest) {
  try {
    const result = recordWebVital(await request.json());
    return result.ok
      ? NextResponse.json({ ok: true }, { status: 200 })
      : NextResponse.json({ error: "invalid payload" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
