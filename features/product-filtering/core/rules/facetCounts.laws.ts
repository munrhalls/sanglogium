// Behaviour laws for ./facetCounts: the disjunctive counting contract — an
// option's count ignores selections in its own facet group and respects the
// selections in every other group — and no count is ever negative.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).

import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCatalogueFacets } from './facetCounts';
import type { ProductQueryState, RawProduct } from './filterTypes';

// Six products over two facet groups (wearingStyle: multi, connectivity:
// enum) so each group's count can be checked against a narrowing selection
// in the other.
const PRODUCTS: RawProduct[] = [
  { _id: 'p1', filterAttributes: { wearingStyle: 'over-ear', connectivity: 'wired' } },
  { _id: 'p2', filterAttributes: { wearingStyle: 'over-ear', connectivity: 'wireless' } },
  { _id: 'p3', filterAttributes: { wearingStyle: 'on-ear', connectivity: 'wired' } },
  { _id: 'p4', filterAttributes: { wearingStyle: 'in-ear', connectivity: 'true-wireless' } },
  { _id: 'p5', filterAttributes: { wearingStyle: 'on-ear', connectivity: 'wireless' } },
  { _id: 'p6', filterAttributes: { connectivity: 'wired' } },
];

const STATE: ProductQueryState = {
  sort: 'newest',
  minPrice: null,
  maxPrice: null,
  inStock: false,
  wearingStyle: ['on-ear'],
  connectivity: ['wired'],
};

function option(groups: ReturnType<typeof computeCatalogueFacets>['groups'], param: string, value: string) {
  const opt = groups[param]?.find((o) => o.value === value);
  assert.ok(opt, `expected ${param} option "${value}" to exist`);
  return opt;
}

test('an option ignores its own group selection and respects other groups', () => {
  const { groups } = computeCatalogueFacets(PRODUCTS, STATE);
  // Over-ear is not selected; if own-group selections leaked in it would be 0.
  // Respecting only connectivity=wired: wired products are p1, p3, p6 and the
  // single over-ear among them is p1.
  assert.equal(option(groups, 'wearingStyle', 'over-ear').count, 1);
  // Connectivity=wired ignores its own selection, respects wearingStyle=on-ear:
  // on-ear products are p3, p5 and only p3 is wired.
  assert.equal(option(groups, 'connectivity', 'wired').count, 1);
});

test('an option with no matches is present with count zero (not omitted)', () => {
  const { groups } = computeCatalogueFacets(PRODUCTS, STATE);
  // Closed-vocab value in-ear, no wired product has it.
  assert.equal(option(groups, 'wearingStyle', 'in-ear').count, 0);
  assert.equal(option(groups, 'connectivity', 'hybrid').count, 0);
});

test('no option or boolean count is negative', () => {
  const { groups, booleans } = computeCatalogueFacets(PRODUCTS, STATE);
  for (const options of Object.values(groups)) {
    for (const o of options) assert.ok(o.count >= 0, `${o.value} counted ${o.count}`);
  }
  for (const [param, count] of Object.entries(booleans)) {
    assert.ok(count >= 0, `${param} counted ${count}`);
  }
});
