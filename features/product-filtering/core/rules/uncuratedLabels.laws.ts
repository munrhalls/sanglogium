// Behaviour law: every projected option label is either curated (an entry in
// optionLabelOverrides) or a draft (the humanize fallback). Drafts are legal —
// they are what lets the option set stay exactly the data's — but each one is
// a label no human has reviewed. These todo tests print the draft list per
// slice on every `npm run laws`: promote the bad ones into
// optionLabelOverrides.ts, accept the rest.
//
// The `brand` attribute is excluded: its labels come from brand.name data,
// not the label pipeline.
//
// Needs the live scan output first:
// `node --env-file=.env.local tests/product-filtering/scan-product-data.mjs`.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).
// Temporary: deleted with the declared set and the snapshot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { fieldInventory } from './fieldInventory';
import { projectFacets } from './projectFacets';
import { FACET_SELECTOR } from '@/features/product-filtering/core/definitions/facetSelector';
import { OPTION_LABEL_OVERRIDES } from '@/features/product-filtering/core/definitions/optionLabelOverrides';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';

const SLICES = ['headphones', 'audio-electronics', 'accessories'] as const;
const EXCLUDED_ATTRIBUTES = new Set(['brand']);
const dataPath = (slice: string) => `tests/product-filtering/out/product-data.${slice}.json`;
const SCAN_HINT =
  'run the live scan first: node --env-file=.env.local tests/product-filtering/scan-product-data.mjs';

function draftsFor(slice: (typeof SLICES)[number]): string[] {
  const products = JSON.parse(readFileSync(dataPath(slice), 'utf8')) as RawProduct[];
  const projected = projectFacets(FACET_SELECTOR[slice], fieldInventory(products));
  const drafts: string[] = [];
  for (const facet of projected) {
    if (facet.control !== 'checkbox' || !facet.options || EXCLUDED_ATTRIBUTES.has(facet.attribute)) continue;
    const overrides = OPTION_LABEL_OVERRIDES[facet.attribute] ?? {};
    for (const option of facet.options) {
      if (overrides[option.value] === undefined) {
        drafts.push(`${facet.id} (${facet.attribute}): "${option.value}" -> "${option.label}"`);
      }
    }
  }
  return drafts;
}

for (const slice of SLICES) {
  const skip = existsSync(dataPath(slice)) ? false : SCAN_HINT;
  let cached: string[] | undefined;
  const drafts = () => (cached ??= draftsFor(slice));
  test(
    `${slice}: every option label is curated`,
    { skip, todo: 'owner sign-off: drafts listed below — promote into optionLabelOverrides.ts or accept' },
    () => {
      assert.equal(drafts().length, 0, `\n${drafts().join('\n')}`);
    },
  );
}
