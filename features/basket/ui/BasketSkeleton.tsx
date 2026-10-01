export default function BasketSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-[65%_1fr] lg-touch:grid-cols-[65%_1fr]"
      aria-busy="true"
      aria-label="Loading basket"
    >
      <div className="pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="card-base overflow-hidden p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/4"></div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/2"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
            <div className="h-10 bg-secondary-800/60 rounded-sm w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
