Scope: filters & sorting per slice (headphones, audioElectronics, accessories). In: controls, options, sorts — how they're defined. Out: UX/UI, styling.

# Filters & sorting as projection from product data

Mission: delete the separately declared filter/sort set entirely. Replace it with projection from product data — the data is the definition, nothing separate to keep in sync.

Method: small PRs in dependency order, each independently verifiable and human-merged. Checkboxes below are milestones, not PRs — each may take several small PRs to tick.

## Sequence

1. [ ] **Sources** — snapshot current declared set (target) + scan per-slice product data (projection source). Two artifacts; no diff, no migration.
2. [ ] **Converge** — small steps: migrate missing product data / wire projection until it reproduces target.
3. [ ] **Delete** — projection fully covers target → declared set and target snapshot deleted.
4. [ ] **Subset correctness proof** — prove any result subset is correct for any combination of selected filters and sorting options; the single-option and pair-option proofs (`tests/product-filtering/`) already exist — verify they actually test and wire correctly against the finished projection.

Done when: no declared filter/sort set exists — every control, option, and sort is generated from product data, and subset correctness is proven for any filter/sort combination.
