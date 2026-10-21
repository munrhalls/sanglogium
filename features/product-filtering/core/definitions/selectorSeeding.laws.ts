// Behaviour law: the seeded facet selector equals the frozen target
// snapshot's rendered facet set, per slice — same groups and same facets in
// the same order, carrying only id, attribute, label, group and unit. Proves
// the seed was a faithful transcription, nothing hand-altered. Deleted with
// the snapshot; after that the selector is the source and edits are free.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { FACET_SELECTOR, type SliceSelector } from './facetSelector';
import type { FacetControl } from '@/features/product-filtering/core/types/facetProjection';

const SNAPSHOT_PATH =
  '_project/project-management/missions/filters-and-sorting/02-projection-from-product-data/target-snapshot.json';
const SLICES = ['headphones', 'audio-electronics', 'accessories'] as const;

interface SnapshotFacet {
  id: string;
  group: string;
  label: string;
  control: FacetControl;
  unit?: string;
  attribute: string;
}

interface SnapshotSlice {
  groups: { id: string; label: string }[];
  facets: SnapshotFacet[];
}

const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as {
  slices: Record<(typeof SLICES)[number], SnapshotSlice>;
};

// What the selector is allowed to carry: everything except control, options,
// min/max, storage and vocab — those are the data's job.
const seededFacet = ({ id, attribute, label, group, unit }: SnapshotFacet) =>
  unit === undefined ? { id, attribute, label, group } : { id, attribute, label, group, unit };

for (const slice of SLICES) {
  test(`${slice}: seeded selector reproduces the snapshot facet set`, () => {
    const seeded: SliceSelector = FACET_SELECTOR[slice];
    const snap = snapshot.slices[slice];
    assert.deepEqual(seeded.groups, snap.groups);
    assert.deepEqual(
      seeded.facets,
      snap.facets.map(seededFacet),
    );
  });
}
