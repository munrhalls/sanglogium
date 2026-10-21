// Behaviour law: for each slice, every attribute the frozen target snapshot
// points at must derive a real (non-null) control from live product data.
// Loading this file also writes the human-readable extraction —
// tests/product-filtering/out/control-types.md — the menu the selector is
// seeded from: snapshot attributes in facet order, then the attributes the
// data offers that the snapshot does not use.
//
// Needs the live scan output first:
// `node --env-file=.env.local tests/product-filtering/scan-product-data.mjs`.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).
// Temporary: deleted with the declared set and the snapshot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { fieldInventory } from './fieldInventory';
import { deriveControl } from './deriveControl';
import type { FacetControl, FieldInventory } from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';

const SNAPSHOT_PATH =
  '_project/project-management/missions/filters-and-sorting/02-projection-from-product-data/target-snapshot.json';
const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const OUT_PATH = 'tests/product-filtering/out/control-types.md';
const dataPath = (slice: string) => `tests/product-filtering/out/product-data.${slice}.json`;
const SCAN_HINT =
  'run the live scan first: node --env-file=.env.local tests/product-filtering/scan-product-data.mjs';

interface SnapshotFacet {
  id: string;
  control: FacetControl;
  attribute: string;
}

interface Extraction {
  products: number;
  inventory: FieldInventory;
  snapshotAttributes: string[];
  extraAttributes: string[];
  declared: Map<string, FacetControl>;
  problems: string[];
}

function extract(slice: string): Extraction {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
    slices: Record<string, { facets: SnapshotFacet[] }>;
  };
  const facets = snapshot.slices[slice].facets;
  const products = JSON.parse(readFileSync(dataPath(slice), 'utf8')) as RawProduct[];
  const inventory = fieldInventory(products);
  const snapshotAttributes = facets.map((f) => f.attribute);
  const declared = new Map(facets.map((f): [string, FacetControl] => [f.attribute, f.control]));
  const extraAttributes = Object.keys(inventory).filter((a) => !declared.has(a));
  const problems: string[] = [];
  for (const facet of facets) {
    const stat = inventory[facet.attribute];
    const control = stat ? deriveControl(stat) : null;
    if (control === null) {
      problems.push(`${facet.id} (${facet.attribute}): ${stat ? 'derives no control' : 'no product carries it'}`);
    }
  }
  return { products: products.length, inventory, snapshotAttributes, extraAttributes, declared, problems };
}

const extractions: Record<string, Extraction> = {};
const haveData = SLICES.every((slice) => existsSync(dataPath(slice)));
if (haveData) {
  for (const slice of SLICES) extractions[slice] = extract(slice);

  const row = (slice: string, attribute: string, showDeclared: boolean) => {
    const { inventory, declared, products } = extractions[slice];
    const stat = inventory[attribute];
    const declaredCell = showDeclared ? (declared.get(attribute) ?? '—') : '';
    if (!stat) return `| ${attribute} | — | ${declaredCell} | no product carries it | — | — |`;
    const control = deriveControl(stat) ?? 'none';
    const bounds = stat.min === null ? '—' : `${stat.min}–${stat.max}`;
    return `| ${attribute} | ${control} | ${declaredCell} | ${stat.kinds.join(', ')} | ${stat.count}/${products} | ${bounds} |`;
  };

  const sections = SLICES.map((slice) => {
    const { products, snapshotAttributes, extraAttributes } = extractions[slice];
    const head = '| attribute | derived | declared | kinds | carriers | bounds |\n| --- | --- | --- | --- | --- | --- |';
    return [
      `## ${slice} — ${products} products`,
      '',
      `### snapshot attributes, in facet order (${snapshotAttributes.length})`,
      '',
      head,
      ...snapshotAttributes.map((a) => row(slice, a, true)),
      '',
      `### data attributes not in the snapshot (${extraAttributes.length})`,
      '',
      head,
      ...extraAttributes.map((a) => row(slice, a, false)),
    ].join('\n');
  });

  writeFileSync(
    OUT_PATH,
    '# Control types extracted from product data\n\n' +
      'derived = deriveControl(fieldInventory(products)); declared is the frozen snapshot, shown for comparison only. kinds/carriers/bounds are the raw evidence.\n\n' +
      `${sections.join('\n\n')}\n`,
  );
}

for (const slice of SLICES) {
  const skip = existsSync(dataPath(slice)) ? false : SCAN_HINT;
  test(`${slice}: every snapshot attribute derives a control`, { skip }, () => {
    const { problems } = extractions[slice];
    assert.equal(problems.length, 0, `\n${problems.join('\n')}`);
  });
}
