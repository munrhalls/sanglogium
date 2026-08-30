import React from "react";

/* Non-hydrating inline reveal trigger — ported verbatim from
 * app/(test)/streaming-poc (issue sang-logium-7j8, Attempt I).
 *
 * Runs in the streamed shell, BEFORE any grid <img> is parsed and with zero
 * dependency on React hydration. It attaches a capture-phase `load` listener
 * on `document` (`load` does not bubble but IS delivered capture-phase), so
 * every product image's load is caught the instant its bytes arrive —
 * staggered, not batched (a React `onLoad` / ref-`complete` check only goes
 * live after hydration, by which point every image is already `complete` and
 * they flip in one pass = one wall; AI_LESSONS L07).
 *
 * Double requestAnimationFrame guarantees one painted blurred frame before the
 * flip, so the blur eases rather than snaps. `data-shown` is a plain attribute
 * React never renders, so nothing reconciles it away — no hydration warning.
 *
 * This is a Server Component returning a static <script> string: no
 * "use client", it cannot throw or suspend in SSR, so it cannot collapse the
 * per-chunk <Suspense> streaming (L02). The `window` guard makes it safe to
 * render from more than one grid on a page. */
export const REVEAL_SCRIPT = `
(function(){
  if (window.__slImageReveal) return;
  window.__slImageReveal = 1;
  function reveal(t, instant){
    if(!t || t.tagName!=='IMG' || !t.hasAttribute('data-reveal') || t.hasAttribute('data-shown')) return;
    if(instant){ t.setAttribute('data-instant',''); t.setAttribute('data-shown',''); return; }
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ t.setAttribute('data-shown',''); });
    });
  }
  document.addEventListener('load', function(e){ reveal(e.target); }, true);
  function scan(instant){
    var imgs = document.querySelectorAll('img[data-reveal]:not([data-shown])'), i;
    for(i=0;i<imgs.length;i++){ if(imgs[i].complete && imgs[i].naturalWidth>0) reveal(imgs[i], instant); }
  }
  // Exposed so the client companion (ImageRevealClient) can re-scan on soft
  // navigation and bf/RSC-cache restore without re-deriving the logic.
  window.__slImageRevealScan = scan;
  new MutationObserver(function(){ scan(); }).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded', function(){ scan(); });
  window.addEventListener('load', function(){ scan(); });
})();
`;

export function ImageRevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />;
}
