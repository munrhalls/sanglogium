import { cn } from "@/lib/utils/tailwind";

interface ContentLayoutProps {
  title: string;
  intro?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export default function ContentLayout({
  title,
  intro,
  lastUpdated,
  children,
}: ContentLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl px-4 md:px-8",
        "py-12 md:py-16 lg:py-20"
      )}
    >
      <header
        className={cn(
          "mb-10 flex flex-col gap-3",
          "border-b border-border-secondary pb-8"
        )}
      >
        <h1 className="type-section-hed">{title}</h1>
        {intro && (
          <p className="type-body text-text-secondary text-pretty">{intro}</p>
        )}
        {lastUpdated && (
          <p className="type-caption text-text-caption">
            Last updated: {lastUpdated}
          </p>
        )}
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </div>
  );
}

export function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-section-sub">{heading}</h2>
      <div className="type-body text-text-body flex flex-col gap-3 text-pretty">
        {children}
      </div>
    </section>
  );
}
