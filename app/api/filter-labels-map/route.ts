import { NextResponse } from "next/server";
import { getControlLabels } from "@/features/product-filtering/server";

// The list the Studio's Filter labels draws. Run per request; the data behind it is served from the shop's own cache.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getControlLabels());
  } catch (error) {
    console.error("[filter-labels-map] read failed:", error);
    return NextResponse.json({ error: "could not read the options" }, { status: 502 });
  }
}
