export default function HomepageLoading() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[50vh] min-h-[400px] bg-surface-elevated" />
      <div className="px-4 md:px-8 py-12">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[250px] h-[300px] bg-surface-elevated rounded-lg shrink-0" />
          ))}
        </div>
      </div>
      <div className="px-4 md:px-8 py-12 space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 h-[300px] bg-surface-elevated rounded-lg" />
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-6 w-24 bg-surface-elevated rounded" />
              <div className="h-10 w-3/4 bg-surface-elevated rounded" />
              <div className="h-4 w-full bg-surface-elevated rounded" />
              <div className="h-4 w-5/6 bg-surface-elevated rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-surface-elevated rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}