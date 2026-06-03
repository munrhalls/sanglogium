export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 md:px-0 pt-10 pb-28 md:pb-16">
      {/* Progress skeleton */}
      <div className="flex md:hidden items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-surface-elevated animate-pulse" />
            {i < 4 && <div className="w-4 h-px bg-surface-elevated" />}
          </div>
        ))}
      </div>
      <div className="hidden md:flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-16 h-4 bg-surface-elevated rounded animate-pulse" />
            {i < 4 && <div className="w-4 h-px bg-surface-elevated" />}
          </div>
        ))}
      </div>

      {/* Heading skeleton */}
      <div className="w-64 h-8 bg-surface-elevated rounded animate-pulse mb-8" />

      {/* Option card skeletons */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 md:gap-4 rounded-lg border border-border-secondary px-4 py-4 md:py-5 bg-surface-card"
          >
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              <div className="w-5 h-5 rounded-full bg-surface-elevated animate-pulse flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="w-32 h-5 bg-surface-elevated rounded animate-pulse" />
                <div className="w-24 h-4 bg-surface-elevated rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 text-right flex-shrink-0 min-w-[88px]">
              <div className="w-16 h-5 bg-surface-elevated rounded animate-pulse ml-auto" />
              <div className="w-20 h-4 bg-surface-elevated rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <div className="hidden md:flex w-full justify-center mt-8">
        <div className="w-full h-14 bg-surface-elevated rounded animate-pulse" />
      </div>

      {/* Mobile sticky CTA skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 py-3 bg-surface-page border-t border-border-secondary">
        <div className="w-full h-14 bg-surface-elevated rounded animate-pulse" />
      </div>
    </div>
  );
}
