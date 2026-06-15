export default function TrustBar() {
  const items = [
    "Free Global Shipping",
    "2-Year Warranty",
    "Expert Support",
  ];

  return (
    <div className="w-full border-y border-border-secondary bg-surface-subtle py-4">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4">
        {items.map((item, idx) => (
          <span key={item} className="flex items-center gap-2">
            {idx > 0 && (
              <span className="text-text-secondary" aria-hidden="true">
                ·
              </span>
            )}
            <span className="type-caption text-text-secondary">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
