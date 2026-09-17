# sang-logium-0bi.5 — [Headphones] Coherent Bluetooth codec casing

Parent: sang-logium-0bi. Depends on: none structurally, but Phase 1 output needs human sign-off before Phase 2 — do not let Devin auto-proceed past Phase 1.

Beads goal (do not restate/duplicate elsewhere):
Codec names (SBC, AAC, aptX, aptX HD, aptX Adaptive, aptX LL, LDAC, LC3) must read coherently together despite mixed true-name casing, without renaming any codec away from its true name.

## Verified ground truth
- Rendered via the same `CheckboxGroup` facet-list rendering in `FilterControls.tsx` used by every other checkbox facet (not yet read directly — locate the Bluetooth codec facet's option list there).
- This is an open design decision, not a mechanical fix — explicitly flagged in the beads issue notes as needing a "whiteboard" pass. Devin must not silently pick an aesthetic and ship it.

## Phase 1 — Propose, do not implement
Scope: no code changes in this phase.
Steps:
1. Locate the codec facet's option rendering in `CheckboxGroup`/`FilterControls.tsx`.
2. Propose 2–3 concrete, purely-presentational display treatments that leave every codec's true name/casing untouched (e.g.: a consistent label column treatment via CSS such as small-caps or consistent tracking/letter-spacing applied uniformly regardless of source casing; a subtle visual separator or badge style per option; consistent font-weight/size normalization). For each option, state exactly what CSS/markup would change and show what the 8 codec labels would look like rendered under it.
Do not touch: any facet data/labels, any other facet's styling.
Acceptance criteria:
- [ ] 2–3 concrete options presented, each showing all 8 real codec names as they'd render.
- [ ] None of the options alter any codec's true name/casing in the underlying data.
Done signal: the 2–3 options written out — stop here and wait for a human pick.

## Phase 2 — Implement the chosen option (do not start until a human has picked one from Phase 1)
Scope: the codec facet's rendering only, in whatever component Phase 1 located.
Do not touch: codec label data/strings, any other facet.
Acceptance criteria:
- [ ] The chosen treatment is applied to the Bluetooth Codec list only.
- [ ] All 8 codec names still read their true names (e.g. "aptX HD" is still "aptX HD," not "APTX HD" or "Aptx Hd").
Done signal: screenshot of the Bluetooth Codec filter list showing the implemented treatment.
