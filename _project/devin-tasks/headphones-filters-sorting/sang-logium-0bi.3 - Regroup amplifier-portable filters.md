# sang-logium-0bi.3 — [Headphones] Regroup amplifier/portable filters

Parent: sang-logium-0bi. Depends on: none — safe to run in parallel with anything else in this tree.

Beads goal (do not restate/duplicate elsewhere):
"Requires Amplifier" and "Portable" must appear under the "Material factors" section, grouped with "Microphone."

## Verified ground truth (from direct code read this session)
- `FilterSidebar.tsx` renders one `PanelSection` per entry in `FACET_GROUPS`, and each group's facets come from `facetsForGroup(group.id)` — both sourced from `getFacetModule(category)` (`facetRegistry.ts`). A facet's group membership is a data-level assignment, not layout code — this should be a config change, not a JSX change.
- Not yet located: the exact file defining the headphones facet list with each facet's `group` field (resolve it via `facetRegistry.ts` → the headphones-specific facet module it imports). "Microphone" facet's current group id is the target group id for "Requires Amplifier" and "Portable."

## Phase 1 — Locate and change (single phase, low risk)
Scope: the headphones facet definitions file resolved via `facetRegistry.ts` (`getFacetModule('headphones')`). Do not touch `facetRegistry.ts` itself unless the facet definitions genuinely live there.
Steps:
1. Find the facet definitions for "Requires Amplifier," "Portable," and "Microphone." Confirm Microphone's group id (expected: `material`, per `HEADPHONES_GROUP_ICONS` in `FilterSidebar.tsx` which maps `material: FaLayerGroup`).
2. Change "Requires Amplifier" and "Portable" to that same group id. Do not change their facet id, label, control type, or count logic — only the group assignment.
3. Do not reorder other facets within the Material factors group unless there's an existing explicit order field — if so, append these two, don't reshuffle existing ones.
Do not touch: any other facet's group, any non-headphones facet module, `FilterSidebar.tsx`/`FilterControls.tsx` rendering code.
Acceptance criteria:
- [ ] On `/products/headphones`, opening the "Material factors" panel section shows "Requires Amplifier," "Portable," and "Microphone" together.
- [ ] No other group lost or gained a facet.
Done signal: the Material factors panel's rendered facet list, before and after.
