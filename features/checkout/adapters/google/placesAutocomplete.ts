import "server-only";

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
// Always fails to an empty result list.
export async function placesAutocomplete(q: string): Promise<AutocompleteResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=default&limit=6`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as {
      features?: Array<{ properties?: PhotonProperties }>;
    };

    return (data.features ?? [])
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
  } catch {
    return [];
  }
}
