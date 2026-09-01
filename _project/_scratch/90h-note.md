Implemented (working tree, uncommitted):
1. Removed header's mobile (<sm) search trigger button + mobileTriggerRef from SearchField.tsx.
2. ActionBar bottom-bar search is now a <button> calling useSearchOverlay().openSearch() instead of the no-op ?search=true link.
3. Bottom-bar search button hidden at >=sm via "sm:hidden".

Shared open/close state via app/hooks/nuqs/useSearchOverlay.ts (nuqs "search" boolean param).
SearchField's full-screen overlay open-state now driven by that hook; Escape + back-arrow call closeSearch().
Overlay markup/animation/autocomplete untouched.

Awaiting human live check on localhost:3000.
