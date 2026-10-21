// Behaviour law: project each slice's selector through its live product-data
// inventory and check the adapter's invariant — for every selected checkbox
// facet the projected option values are exactly the field's distinct data
// values, in the same order. The adapter may rename a label but can never add,
// remove or reorder an option. Non-checkbox facets must carry no options.
// Loading this file also writes the readable projection —
// tests/product-filtering/out/projected-options.md — every selected facet in
// selector order, with per-option label provenance (override vs humanize).
//
// Needs the live scan output first:
// `node --env-file=.env.local tests/product-filtering/scan-product-data.mjs`.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).
// Temporary: deleted with the declared set and the snapshot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { fieldInventory } from './fieldInventory';
import { projectFacets } from './projectFacets';
import { FACET_SELECTOR } from '@/features/product-filtering/core/definitions/facetSelector';
import { OPTION_LABEL_OVERRIDES } from '@/features/product-filtering/core/definitions/optionLabelOverrides';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import type { FieldInventory, ProjectedFacet } from '@/features/product-filtering/core/types/facetProjection';

const SLICES = ['headphones', 'audio-electronics', 'accessories'] as const;
const OUT_PATH = 'tests/product-filtering/out/projected-options.md';
const dataPath = (slice: string) => `tests/product-filtering/out/product-data.${slice}.json`;
const SCAN_HINT =
  'run the live scan first: node --env-file=.env.local tests/product-filtering/scan-product-data.mjs';

interface SliceProjection {
  products: number;
  inventory: FieldInventory;
  projected: ProjectedFacet[];
  problems: string[];
}

function project(slice: (typeof SLICES)[number]): SliceProjection {
  const products = JSON.parse(readFileSync(dataPath(slice), 'utf8')) as RawProduct[];
  const inventory = fieldInventory(products);
  const projected = projectFacets(FACET_SELECTOR[slice], inventory);
  const problems: string[] = [];
  for (const facet of projected) {
    const stat = inventory[facet.attribute];
    if (facet.control === 'checkbox') {
      const values = facet.options?.map((o) => o.value) ?? [];
      if (values.length === 0) problems.push(`${facet.id} (${facet.attribute}): checkbox with no options`);
      else if (JSON.stringify(values) !== JSON.stringify(stat?.values ?? [])) {
        problems.push(`${facet.id} (${facet.attribute}): option set differs from data values`);
      }
    } else if (facet.options !== undefined) {
      problems.push(`${facet.id} (${facet.attribute}): non-checkbox facet carries options`);
    }
  }
  return { products: products.length, inventory, projected, problems };
}

const projections: Partial<Record<(typeof SLICES)[number], SliceProjection>> = {};
const haveData = SLICES.every((slice) => existsSync(dataPath(slice)));
if (haveData) {
  for (const slice of SLICES) projections[slice] = project(slice);

  const facetBlock = (facet: ProjectedFacet): string[] => {
    const head = `**${facet.label}** (\`${facet.attribute}\`) → `;
    if (facet.control === 'range') {
      return [`${head}range ${facet.min}–${facet.max}${facet.unit ? ` ${facet.unit}` : ''}`];
    }
    if (facet.control === 'boolean') return [`${head}boolean`];
    if (facet.control !== 'checkbox' || !facet.options) {
      return [`${head}${facet.control ?? 'no control'}`];
    }
    const overrides = OPTION_LABEL_OVERRIDES[facet.attribute] ?? {};
    return [
      `${head}checkbox — ${facet.options.length} options`,
      '',
      '| value | label | via |',
      '| --- | --- | --- |',
      ...facet.options.map(
        (o) => `| ${o.value} | ${o.label} | ${overrides[o.value] !== undefined ? 'override' : 'humanize'} |`,
      ),
    ];
  };

  const sections = SLICES.map((slice) => {
    const { products, projected } = projections[slice]!;
    const dormant = Object.entries(OPTION_LABEL_OVERRIDES)
      .map(([attribute, map]) => {
        const stat = projections[slice]!.inventory[attribute];
        const dead = Object.keys(map).filter((v) => !stat?.values.includes(v));
        return dead.length ? `  - \`${attribute}\`: ${dead.join(', ')}` : '';
      })
      .filter(Boolean);
    return [
      `## ${slice} — ${products} products`,
      '',
      ...projected.flatMap((facet) => [...facetBlock(facet), '']),
      `### dormant overrides (labels for values no product carries)`,
      '',
      ...(dormant.length ? dormant : ['  - none']),
    ].join('\n');
  });

  writeFileSync(
    OUT_PATH,
    '# Options projected per slice via the selector\n\n' +
      'options = applyOptionLabels(attribute, deriveOptions(fieldInventory(products))) — value is the raw data value, label is override or humanize.\n\n' +
      `${sections.join('\n\n')}\n`,
  );
}

for (const slice of SLICES) {
  const skip = existsSync(dataPath(slice)) ? false : SCAN_HINT;
  test(`${slice}: projected option sets equal the data values`, { skip }, () => {
    const { problems } = projections[slice]!;
    assert.equal(problems.length, 0, `\n${problems.join('\n')}`);
  });
}
