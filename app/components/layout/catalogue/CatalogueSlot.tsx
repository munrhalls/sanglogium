interface SlotProps {
  data: {
    title: string;
    links: string[];
  } | null;
  index: number;
  symmetryClass: string;
}

export const CatalogueSlot = ({
  data: section,
  index,
  symmetryClass,
}: SlotProps) => {
  return (
    <div
      key={index}
      className={`flex h-20 w-fit flex-nowrap items-center justify-start transition-transform duration-500 ${symmetryClass}`}
    >
      {section && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-tighter text-brand-400">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.links.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="pl-2 text-body text-secondary-300 transition-colors hover:text-white"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
