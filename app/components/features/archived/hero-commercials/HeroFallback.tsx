import Image from "next/image";
export default function HeroFallback() {
  return (
    <div className="relative isolate grid h-full grid-rows-[1fr_3rem]">
      <div className="relative z-30 h-full w-full overflow-hidden">
        <div className="flex h-full w-full">
          <Image
            src={"/HeroMain.webp"}
            priority
            loading="eager"
            fetchPriority="high"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
            style={{ objectFit: "cover", objectPosition: "right" }}
            className={`hero-image absolute inset-0 h-full w-full object-cover`}
            quality={75}
            alt={""}
          />
        </div>
      </div>
      <div className="z-50 grid h-full w-full grid-cols-[1fr_3fr_1fr] bg-black">
        <p className="font-black tracking-wide text-white">
          Offer available only until January 30th!
        </p>
      </div>
    </div>
  );
}
