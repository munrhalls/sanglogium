Scope: filters & sorting per slice (headphones, audioElectronics, accessories). In: controls, options, sorts — how they're defined. Out: UX/UI, styling.

# Filters & sorting as projection from product data

Mission: delete the separately declared filter/sort set entirely. Replace it with projection from product data — the data is the definition, nothing separate to keep in sync.

Method: small PRs in dependency order, each independently verifiable and human-merged. Checkboxes below are milestones, not PRs — each may take several small PRs to tick.

## Sequence

- [ ] **Sources** — snapshot current declared set (target) + scan per-slice product data (projection source). Two artifacts; no diff, no migration.
- [ ] **Converge** — small steps: migrate missing product data / wire projection until it reproduces target.
- [ ] **Delete** — projection fully covers target → declared set and target snapshot deleted.

Done when: no declared filter/sort set exists — every control, option, and sort is generated from product data.
