import Image from "next/image";

export default function SpotlightHero({ image, tier }: { image: string, tier: "standard" | "gold" }) {
  return (
    <div className="relative h-feature-media w-full overflow-hidden bg-brand-800 rounded-lg">
      <Image
        src={image}
        alt="Product Spotlight"
        fill
        className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
    </div>
  );
}
