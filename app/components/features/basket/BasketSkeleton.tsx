export default function BasketSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3"
      aria-busy="true"
      aria-label="Loading basket"
    >
      <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
        <div className="card-base overflow-hidden p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-elevated rounded-sm w-1/4"></div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-surface-elevated rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-elevated rounded-sm w-3/4"></div>
                <div className="h-3 bg-surface-elevated rounded-sm w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-surface-elevated rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-elevated rounded-sm w-2/3"></div>
                <div className="h-3 bg-surface-elevated rounded-sm w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg-desktop:col-span-1 lg-touch:col-span-1">
        <div className="card-base sticky top-4 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-elevated rounded-sm w-1/2"></div>
            <div className="h-4 bg-surface-elevated rounded-sm w-3/4"></div>
            <div className="h-4 bg-surface-elevated rounded-sm w-2/3"></div>
            <div className="h-10 bg-surface-elevated rounded-sm w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
