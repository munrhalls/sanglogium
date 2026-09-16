// sang-logium-3rv.10 — closes the "no automated check" gap found in the
// headphones professional-readiness audit (docs/filters-sort/
// audit-headphones-professional-readiness.md, Gap 2/5): nothing previously
// verified that lib/catalogue/facetMap.ts's closed-vocab valueVocab arrays
// still match the Sanity schema's options.list for the same field. This is
// exactly the bug class that made "Harman-target-like" (soundSignature)
// silently unfilterable before sang-logium-3rv.9.
//
// Scope: only facets with a real closed vocabulary (type enum/multi, not a
// range/boolean sentinel, not a data-derived placeholder like brand/awards/
// productCategory — those have no options.list to compare against by
// design). Covers every category in FILTER_FACETS, not headphones only.

import { describe, it, expect } from "vitest";
import { productType } from "@/sanity-cms/schemaTypes/productType";
import { FILTER_FACETS, isPlaceholderVocab } from "@/lib/catalogue/facetMap";

type SchemaField = {
  name: string;
  type: string;
  options?: { list?: string[] };
  of?: Array<{ options?: { list?: string[] } }>;
  fields?: SchemaField[];
};

const topLevelFields = (productType.fields ?? []) as unknown as SchemaField[];
const filterAttributesField = topLevelFields.find((f) => f.name === "filterAttributes");
const schemaFields: SchemaField[] = filterAttributesField?.fields ?? [];

function schemaOptionsFor(fieldName: string): string[] | null {
  const field = schemaFields.find((f) => f.name === fieldName);
  if (!field) return null;
  if (field.options?.list) return field.options.list;
  if (field.of?.[0]?.options?.list) return field.of[0].options.list;
  return null;
}

// Range facets (impedance, sensitivity, ...) carry a ['min','max'] sentinel,
// not a real vocab — excluded by the enum/multi type check below, same as
// booleans. Placeholder-vocab facets (brand, awards, productCategory) are
// intentionally data-derived, not schema-closed — excluded via
// isPlaceholderVocab, the same helper production code uses for the same
// distinction.
const closedVocabFacets = FILTER_FACETS.filter(
  (f) => (f.type === "enum" || f.type === "multi") && !isPlaceholderVocab(f.valueVocab),
);

describe("facetMap.ts closed-vocab facets match the Sanity schema options.list", () => {
  it("found the filterAttributes schema block to compare against", () => {
    expect(schemaFields.length).toBeGreaterThan(0);
  });

  it("every closed-vocab facet, across all categories, matches its schema field exactly", () => {
    const mismatches: string[] = [];
    for (const facet of closedVocabFacets) {
      const fieldName = facet.field.replace("filterAttributes.", "");
      const schemaOptions = schemaOptionsFor(fieldName);
      if (!schemaOptions) {
        mismatches.push(`${facet.facet} (${fieldName}): schema field has no options.list to compare`);
        continue;
      }
      const facetSet = new Set(facet.valueVocab);
      const schemaSet = new Set(schemaOptions);
      const missingFromFacetMap = schemaOptions.filter((v) => !facetSet.has(v));
      const extraInFacetMap = facet.valueVocab.filter((v) => !schemaSet.has(v));
      if (missingFromFacetMap.length || extraInFacetMap.length) {
        mismatches.push(
          `${facet.facet} (${fieldName}): schema has ${JSON.stringify(missingFromFacetMap)} missing from facetMap.ts; facetMap.ts has ${JSON.stringify(extraInFacetMap)} not in schema`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  });
});
