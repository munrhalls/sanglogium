ALL ACCEPTANCE TESTS PASS (human live check, localhost:3000). Closing.

Final acceptance test set (all verified):

Mobile (~375px):
- Exactly one search icon on load, in the bottom bar; none in the header.
- Tapping it opens a full-screen search view, input at top, auto-focused (keyboard up).
- Back-arrow control at top next to the input while open.
- Back arrow OR Escape closes the view; page underneath unchanged.
- While the overlay is open the bottom-bar search icon becomes a Phosphor "X"
  (same size/layout/weight as neighbour icons); tapping the X closes the overlay,
  identical to the back arrow.

Tablet (~768px): bottom bar shows NO search icon; header search field still present.

Desktop (>= ~1024px): unchanged; header field is the only search entry point.

Implementation (working tree, uncommitted): SearchField.tsx (header mobile trigger
removed, overlay state via useSearchOverlay), ActionBar.tsx (bottom-bar search toggles
open/close, swaps magnifying-glass <-> XIcon), new app/hooks/nuqs/useSearchOverlay.ts.
