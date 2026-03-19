import { cn } from "@/lib/utils/tailwind";

export default function SliceTitle({ label }: { label: string }) {
  return (
    <div
      key={label}
      className={cn(
        "flex h-full w-full items-center justify-center pt-12",
        "sm:items-center landscape:items-center"
      )}
    >
      <h1
        className={cn(
          "relative z-10 translate-y-2 pb-6 text-center text-h4 font-bold uppercase tracking-[0.3em] text-brand-400 opacity-0 transition-all duration-500 text-cap",
          "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100 group-data-[active=true]/animation-settle:delay-150",
          "sm:text-h2",
          "landscape:text-center",
          "lg-touch:landscape:self-start",
          "lg-desktop:landscape:mt-24 lg-desktop:landscape:self-start lg-desktop:landscape:text-brand-400"
        )}
      >
        {label}
      </h1>
    </div>
  );
}
