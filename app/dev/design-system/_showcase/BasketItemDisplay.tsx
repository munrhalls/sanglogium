export function BasketItemDisplay() {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start px-6 py-5 gap-8 border-b border-secondary-700 hover:bg-surface-elevated transition-colors">
      <div className="flex gap-4">
        <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage border border-secondary-700" />
        <div className="flex flex-col gap-1">
          <h3 className="type-card-title">Sennheiser HD 560S</h3>
          <span className="type-metadata">Open-back Headphones</span>
          <span className="type-caption text-text-secondary tabular-nums">
            1 259,65 zł
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8 justify-end mt-5">
        <div className="flex items-center gap-2 border border-secondary-700 rounded-sm px-3 py-1">
          <button className="text-sm text-secondary-400" disabled>−</button>
          <span className="text-sm font-medium text-brand-200">1</span>
          <button className="text-sm text-secondary-400" disabled>+</button>
        </div>
      </div>

      <div className="flex items-center justify-center mt-5">
        <button className="text-text-secondary hover:text-red-500/80 transition-colors p-2" disabled>
          Remove
        </button>
      </div>
    </article>
  );
}
