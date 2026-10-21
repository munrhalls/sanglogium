// Behaviour law: the frozen target-snapshot.json equals the declared modules
// it was frozen from — groups, facets, facetMap fields and sort options.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).
// Temporary: deleted with the declared set and the snapshot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import * as headphones from '@/features/product-filtering/core/definitions/categories/headphones';
import * as audioElectronics from '@/features/product-filtering/core/definitions/categories/audioElectronics';
import * as accessories from '@/features/product-filtering/core/definitions/categories/accessories';
import { SORT_OPTIONS, SORT_DEFAULT } from './sortOptions';
import { FILTER_FACETS, SORT_OPTIONS as URL_SORT_OPTIONS } from './facetMap';

const SNAPSHOT_PATH =
  '_project/project-management/missions/filters-and-sorting/02-projection-from-product-data/target-snapshot.json';
const MODULES = { headphones, 'audio-electronics': audioElectronics, accessories };
const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));

test('the snapshot freezes every declared group and facet of each module', () => {
  assert.deepEqual(Object.keys(snapshot.slices).sort(), Object.keys(MODULES).sort());
  for (const [slice, mod] of Object.entries(MODULES)) {
    assert.deepEqual(snapshot.slices[slice].groups, mod.FACET_GROUPS, `${slice}: groups`);
    const declared = snapshot.slices[slice].facets.map(
      ({ attribute, storage, vocab, ...rest }: any) => rest,
    );
    assert.deepEqual(declared, mod.FACETS, `${slice}: facets`);
  }
});

test('the snapshot carries the facetMap side of every facet', () => {
  const facets = Object.values<any>(snapshot.slices).flatMap((s) => s.facets);
  const ids = new Set(facets.map((f) => f.id));
  for (const facet of facets) {
    const entry = FILTER_FACETS.find((f) => f.urlParam === facet.id);
    assert.ok(entry, `${facet.id}: no FILTER_FACETS entry`);
    assert.equal(facet.attribute, entry.attribute, `${facet.id}: attribute`);
    assert.equal(facet.storage, entry.type, `${facet.id}: storage`);
    assert.deepEqual(facet.vocab, entry.valueVocab, `${facet.id}: vocab`);
  }
  const queryOnly = FILTER_FACETS.filter((f) => !ids.has(f.urlParam)).map((f) => ({
    id: f.urlParam,
    label: f.facet,
    attribute: f.attribute,
    storage: f.type,
    vocab: f.valueVocab,
    categories: f.categories,
  }));
  assert.deepEqual(snapshot.queryOnlyFacets, queryOnly, 'queryOnlyFacets');
});

test('the snapshot freezes the sort options', () => {
  assert.equal(snapshot.sort.default, SORT_DEFAULT);
  assert.deepEqual(snapshot.sort.options, SORT_OPTIONS);
  assert.deepEqual(
    snapshot.sort.urlAllowlist,
    URL_SORT_OPTIONS.map((o) => ({ value: o.urlValue, label: o.sort, direction: o.direction })),
  );
});
