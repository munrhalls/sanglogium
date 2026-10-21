// Behaviour law: per catalogue slice, derive controls, options and option
// labels from the slice's live product data and compare them with the frozen
// declared target (target-snapshot.json). Reports every difference; never
// hides or fixes one. Needs the live scan output first:
// `node --env-file=.env.local tests/product-filtering/scan-product-data.mjs`.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).
// Temporary: deleted with the declared set and the snapshot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { fieldInventory } from './fieldInventory';
import { deriveControl } from './deriveControl';
import { deriveOptions } from './deriveOptions';
import { applyOptionLabels } from './applyOptionLabels';
import type { FacetControl } from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';

const SNAPSHOT_PATH = '_project/project-management/missions/filters-and-sorting/02-projection-from-product-data/target-snapshot.json';
const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const dataPath = (slice: string) => `tests/product-filtering/out/product-data.${slice}.json`;
const SCAN_HINT = 'run the live scan first: node --env-file=.env.local tests/product-filtering/scan-product-data.mjs';

interface SnapshotFacet {
  id: string;
  control: FacetControl;
  options?: 'derived' | { value: string; label: string }[];
  attribute: string;
}

interface Deltas {
  controls: string[];
  options: string[];
  labels: string[];
}

function deltasFor(slice: string): Deltas {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
    slices: Record<string, { facets: SnapshotFacet[] }>;
  };
  const products = JSON.parse(readFileSync(dataPath(slice), 'utf8')) as RawProduct[];
  const inventory = fieldInventory(products);
  const deltas: Deltas = { controls: [], options: [], labels: [] };

  for (const facet of snapshot.slices[slice].facets) {
    const where = `${facet.id} (${facet.attribute})`;
    const stat = inventory[facet.attribute];
    if (!stat) {
      deltas.controls.push(`${where}: no product carries a value`);
      continue;
    }
    const control = deriveControl(stat);
    if (control !== facet.control) {
      deltas.controls.push(`${where}: declared ${facet.control}, derived ${control}`);
    }
    if (facet.control !== 'checkbox' || !Array.isArray(facet.options)) continue;

    const derived = new Map(
      applyOptionLabels(facet.attribute, deriveOptions(stat)).map((o): [string, string] => [o.value, o.label]),
    );
    const declared = new Map(facet.options.map((o): [string, string] => [o.value, o.label]));
    for (const [value, label] of declared) {
      if (!derived.has(value)) {
        deltas.options.push(`${where}: declared option "${value}" is in no product`);
      } else if (facet.attribute !== 'brand' && derived.get(value) !== label) {
        // brand labels come from brand.name, outside the label pipeline — no parity to check
        deltas.labels.push(`${where} "${value}": declared "${label}", derived "${derived.get(value)}"`);
      }
    }
    for (const value of derived.keys()) {
      if (!declared.has(value)) {
        deltas.options.push(`${where}: data has "${value}", which is not a declared option`);
      }
    }
  }
  return deltas;
}

// Options and labels are todo: they differ by owner decision (the data replaces the declared set, the adapter's override ?? humanize replaces hand-typed labels), so every run prints them without failing. Controls must match.
for (const slice of SLICES) {
  const skip = existsSync(dataPath(slice)) ? false : SCAN_HINT;
  let cached: Deltas | undefined;
  const deltas = () => (cached ??= deltasFor(slice));
  test(`${slice}: derived controls reproduce the target`, { skip }, () => {
    assert.equal(deltas().controls.length, 0, `\n${deltas().controls.join('\n')}`);
  });
  test(`${slice}: derived options reproduce the target`, { skip, todo: 'owner sign-off: the data options replace the declared set' }, () => {
    assert.equal(deltas().options.length, 0, `\n${deltas().options.join('\n')}`);
  });
  test(`${slice}: derived labels reproduce the target`, { skip, todo: 'owner sign-off: the adapter (override ?? humanize) replaces hand-typed labels' }, () => {
    assert.equal(deltas().labels.length, 0, `\n${deltas().labels.join('\n')}`);
  });
}
