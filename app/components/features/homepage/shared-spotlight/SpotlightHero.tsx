import Image from "next/image";

interface SpotlightHeroProps {
  image: string;
  tier: "standard" | "gold";
}

export default function SpotlightHero({ image }: SpotlightHeroProps) {
  return (
    <div className="relative h-feature-media lg:h-auto w-full overflow-hidden bg-secondary-200 lg:flex-[0.42] rounded-none">
      <Image
        src={image}
        alt="Product Spotlight"
        fill
        className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 42vw"
        priority
      />
    </div>
  );
}
