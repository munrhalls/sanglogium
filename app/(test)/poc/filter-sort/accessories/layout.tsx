import { NuqsAdapter } from 'nuqs/adapters/next/app';

// (test) has no shared NuqsAdapter — its root layout.tsx is deliberately bare
// (streaming-poc never needed URL state). Scoped here to just this route
// rather than added to app/(test)/layout.tsx, so sibling (test) routes are
// untouched. Mirrors headphones/layout.tsx's own NuqsAdapter usage — same
// adapter import, same wrapping pattern, same page-level scroll container
// rationale (see that file's comment for the full h-dvh/overflow explanation).
export default function FilterSortAccessoriesPocLayout({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <main className="h-dvh overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </main>
    </NuqsAdapter>
  );
}
