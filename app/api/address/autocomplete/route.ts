import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export interface AutocompleteResult {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  regionCode: string;
}

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  countrycode?: string;
}

// Free, keyless street autocomplete over OpenStreetMap (komoot/Photon).
// Disable with AUTOCOMPLETE=off. Always fails to an empty result list.
export async function GET(request: NextRequest) {
  if (process.env.AUTOCOMPLETE === "off") {
    return NextResponse.json({ results: [] });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=default&limit=6`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = (await res.json()) as {
      features?: Array<{ properties?: PhotonProperties }>;
    };

    const results: AutocompleteResult[] = (data.features ?? [])
      .map((f) => f.properties)
      .filter((p): p is PhotonProperties => Boolean(p && p.countrycode === "PL"))
      .map((p) => ({
        street: p.street ?? p.name ?? "",
        streetNumber: p.housenumber ?? "",
        city: p.city ?? "",
        postalCode: p.postcode ?? "",
        regionCode: "PL",
      }))
      .filter((r) => r.street || r.city);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
