import { NextRequest, NextResponse } from "next/server";
import { placesAutocomplete } from "@/features/checkout/server";

export const runtime = "nodejs";

// Disable with AUTOCOMPLETE=off.
export async function GET(request: NextRequest) {
  if (process.env.AUTOCOMPLETE === "off") {
    return NextResponse.json({ results: [] });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const results = await placesAutocomplete(q);
  return NextResponse.json({ results });
}
