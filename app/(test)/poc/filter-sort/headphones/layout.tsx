import { NuqsAdapter } from 'nuqs/adapters/next/app';

// (test) has no shared NuqsAdapter — its root layout.tsx is deliberately bare
// (streaming-poc never needed URL state). Scoped here to just this route
// rather than added to app/(test)/layout.tsx, so sibling (test) routes
// (streaming-poc, checkout-seed) are untouched. Mirrors app/(store)/layout.tsx's
// own NuqsAdapter usage — same adapter import, same wrapping pattern.
export default function FilterSortHeadphonesPocLayout({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
