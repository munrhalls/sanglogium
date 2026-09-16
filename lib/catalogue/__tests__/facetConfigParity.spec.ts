// sang-logium-3rv.11 — closes the other half of the "no automated check" gap
// (docs/filters-sort/audit-headphones-professional-readiness.md, Gap 2/5):
// lib/catalogue/facetMap.ts (query/count vocabulary) and the three POC
// facetConfig.ts modules (UI vocabulary shown to shoppers) are independently
// hand-typed and linked only by matching urlParam/id strings, by convention,
// with nothing enforcing their value sets agree. sang-logium-3rv.10 covers
// schema <-> facetMap.ts; this file covers facetMap.ts <-> facetConfig.ts.

import { describe, it, expect } from "vitest";
import { FILTER_FACETS, isPlaceholderVocab, type FilterFacet } from "@/lib/catalogue/facetMap";
import { FACETS as headphonesFacets } from "@/lib/filter-sort/headphones/facetConfig";
import { FACETS as audioElectronicsFacets } from "@/app/(test)/poc/filter-sort/audio-electronics/lib/facetConfig";
import { FACETS as accessoriesFacets } from "@/app/(test)/poc/filter-sort/accessories/lib/facetConfig";

// Loose, duck-typed shape — deliberately not importing each POC module's own
// FacetDef type, since the three modules declare structurally-identical but
// separately-defined types (see facetRegistry.ts's own AnyFacetDef comment).
type PocFacet = {
  id: string;
  control: string;
  options?: Array<{ value: string }> | "derived";
};

const CATEGORY_FACETS: Record<string, PocFacet[]> = {
  headphones: headphonesFacets as unknown as PocFacet[],
  "audio-electronics": audioElectronicsFacets as unknown as PocFacet[],
  accessories: accessoriesFacets as unknown as PocFacet[],
};

function facetMapEntryFor(category: string, urlParam: string): FilterFacet | undefined {
  return FILTER_FACETS.find(
    (f) => f.urlParam === urlParam && (f.categories.includes("*") || f.categories.includes(category)),
  );
}

describe("POC facetConfig.ts checkbox options match lib/catalogue/facetMap.ts, per category", () => {
  for (const [category, facets] of Object.entries(CATEGORY_FACETS)) {
    it(`${category}: every checkbox facet with a closed option list matches facetMap.ts exactly`, () => {
      const mismatches: string[] = [];
      for (const facet of facets) {
        if (facet.control !== "checkbox" || facet.options === "derived" || !facet.options) continue;

        const mapEntry = facetMapEntryFor(category, facet.id);
        if (!mapEntry) {
          mismatches.push(`${category}/${facet.id}: no matching facetMap.ts entry for this urlParam in this category`);
          continue;
        }
        if (isPlaceholderVocab(mapEntry.valueVocab)) continue; // derived on both sides, nothing closed to compare

        const configValues = facet.options.map((o) => o.value);
        const configSet = new Set(configValues);
        const mapSet = new Set(mapEntry.valueVocab);
        const missingFromConfig = mapEntry.valueVocab.filter((v) => !configSet.has(v));
        const extraInConfig = configValues.filter((v) => !mapSet.has(v));
        if (missingFromConfig.length || extraInConfig.length) {
          mismatches.push(
            `${category}/${facet.id}: facetMap.ts has ${JSON.stringify(missingFromConfig)} not in facetConfig.ts; facetConfig.ts has ${JSON.stringify(extraInConfig)} not in facetMap.ts`,
          );
        }
      }
      expect(mismatches).toEqual([]);
    });
  }
});
