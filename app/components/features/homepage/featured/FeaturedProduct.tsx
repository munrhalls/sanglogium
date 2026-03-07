import Image from "next/image";

interface FeaturedProductProps {
    name: string;
    imageUrl: string;
}

export default function FeaturedProduct({ name, imageUrl }: FeaturedProductProps) {
    return (
        <div className="bg-brand-800/20 border border-brand-600/10 p-8 flex flex-col items-center justify-center h-[400px] group hover:border-brand-400/30 transition-all duration-500">
            <div className="relative flex-1 flex items-center justify-center w-full">
                <div className="relative w-full h-full">
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="max-h-48 object-contain mb-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
            </div>
            <h3 className="text-h4 font-regular text-brand-100 text-center tracking-wide uppercase">
                {name}
            </h3>
        </div>
    );
}