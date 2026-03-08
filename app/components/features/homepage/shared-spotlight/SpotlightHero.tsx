import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightHeroProps {
    image?: string;
    tier?: 'standard' | 'premium';
    className?: string;
}

export default function SpotlightHero({ image, tier = 'standard', className }: SpotlightHeroProps) {
    // Lead Domino: Prevent "" src error by returning null if no image exists
    if (!image) return null;

    return (
        <div className={cn(
            "relative w-full overflow-hidden bg-secondary-900/10",
            tier === 'premium' ? "aspect-square lg:h-[600px]" : "aspect-video lg:h-[450px]",
            className
        )}>
            <Image
                src={image}
                alt="Product Spotlight"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={tier === 'premium'}
            />
        </div>
    );
}
