import { NuqsAdapter } from 'nuqs/adapters/next/app';

// (test) has no shared NuqsAdapter — its root layout.tsx is deliberately bare
// (streaming-poc never needed URL state). Scoped here to just this route
// rather than added to app/(test)/layout.tsx, so sibling (test) routes
// (streaming-poc, checkout-seed) are untouched. Mirrors app/(store)/layout.tsx's
// own NuqsAdapter usage — same adapter import, same wrapping pattern.
//
// The bare (test) root layout never re-establishes a scroll container under
// globals.css's `html`/`body { h-dvh overflow-hidden }` (that CSS assumes
// (store)/layout.tsx's own `<main overflow-y-auto>`, which this route group
// doesn't have) — so without this, page content past the viewport is simply
// clipped and unreachable, not just "not scrolling". This `<main>` is that
// same page-level scroll container, scoped to just this route. It's what lets
// the product grid scroll at all, while FilterSidebar's own `sticky` + inner
// `overflow-y-auto` keeps the filters scrolling independently of it.
export default function FilterSortHeadphonesPocLayout({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <main className="h-dvh overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </main>
    </NuqsAdapter>
  );
}
