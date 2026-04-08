1. The "Dynamic Viewport" Rule (Fixes the #1 Mobile Bug)
   The Risk: On iOS Safari, the address bar at the bottom expands and retracts. If you use height: 100vh, your "Checkout" button will be hidden behind the browser UI.

The Smart Practice: Stop using vh for full-screen layouts. Use dvh (Dynamic Viewport Height).

100vh: Ignores the URL bar. (Button hidden).

100dvh: Adapts instantly when the URL bar slides in/out. (Button always visible).

CSS

/_ BAD _/
.modal { height: 100vh; }

/_ GOOD (Smart) _/
.modal { height: 100dvh; } 2. The "Hover" Media Query (Fixes Sticky Buttons)
The Risk: On mobile, there is no "mouse." If you tap a button, the browser thinks you are "hovering." The button stays stuck in its "Hover Color" state until you tap somewhere else. It looks broken.

The Smart Practice: Wrap all your hover logic in a "Hardware Capability" media query.

CSS

/_ Only apply hover styles if the user actually has a mouse _/
@media (hover: hover) {
.button:hover {
background: blue;
transform: translateY(-2px);
}
}
Desktop: Hover works.

Mobile: Hover styles are completely ignored. No sticky buttons.

3. The "Automated Police" (ESLint Compat)
   The Risk: You use a new cool CSS feature (like subgrid or text-wrap: balance) that works on Chrome but breaks on Safari 15.

The Smart Practice: Don't check "Can I Use" manually. Install eslint-plugin-compat. It looks at your browserslist (e.g., "defaults, not dead") and screams at you in VS Code if you type CSS that isn't supported by your target browsers.

It turns "Cross-browser testing" into a spell-check error.

4. The "Flexbox Gap" Safety
   The Risk: Older Safari versions hate gap in Flexbox, or handle margins differently. This leads to elements smashing into each other.

The Smart Practice: Use a CSS Reset that specifically targets these inconsistencies. I recommend Josh Comeau's reset or Tailwind's Preflight. They normalize box-sizing, margins, and line-heights so Chrome and Safari start from the exact same baseline.

5. The "Input Zoom" Prevention
   The Risk: On iPhone, if a user taps an input field with font size smaller than 16px, the browser force-zooms into the page. The user then has to pinch-zoom out to see the checkout button. It is a UX disaster.

The Smart Practice: Ensure all inputs are at least 16px by default.

CSS

/_ Prevents iOS zoom-on-focus _/
input, select, textarea {
font-size: 16px;
}
Summary of the "Smart" Strategy
Bug Source The "Smart" Fix
Hidden Buttons Use dvh units, not vh.
Sticky States Wrap hovers in @media (hover: hover).
Unsupported CSS Use eslint-plugin-compat.
Janky Zoom Set input font-size to 16px.
Layout Math Use a modern CSS Reset.

Eksportuj do Arkuszy

If you do these 5 things, you eliminate the need for a device farm. You can sleep knowing your code is robust by design.
