import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";

export default function DetailWatermark({ imageUrl }: { imageUrl: string }) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 z-0",
        "pointer-events-none overflow-hidden",
        "opacity-[0.05] grayscale",
        "h-full min-h-full w-full"
      )}
    >
      <div
        className={cn(
          "relative isolate h-full w-full",
          "translate-x-1/4 translate-y-1/4 scale-[3]"
        )}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          className={cn("object-contain object-center rounded-none", "sm:object-bottom")}
          priority
        />
      </div>
    </div>
  );
}
