import { cn } from "@/lib/utils/tailwind";

export default function DetailWatermark({ imageUrl }: { imageUrl: string }) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 z-0",
        "pointer-events-none overflow-hidden",
        "opacity-[0.05] grayscale",
        // "h-full w-full",
        "inset-0"
      )}
      style={{ height: '100%' }}
    >
      <div
        className={cn(
          "relative isolate h-full w-full",
          "translate-x-1/4 translate-y-1/4 scale-[3]"
        )}
      >
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className={cn("absolute inset-0 h-full w-full object-contain object-center rounded-none", "sm:object-bottom")}
        />
      </div>
    </div>
  );
}
