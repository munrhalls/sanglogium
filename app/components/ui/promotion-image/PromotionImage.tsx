import Image from "next/image";

interface PromotionImageData {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

export default function PromotionImage({
  imageData,
  alt,
}: {
  imageData: PromotionImageData;
  alt: string;
  fullscreen?: boolean;
}) {
  console.log("@promo img", imageData.src);

  return (
    <div className={`absolute h-full w-full overflow-hidden`}>
      <Image
        src={imageData.src}
        alt={alt}
        width={imageData.width}
        height={imageData.height}
        placeholder="blur"
        blurDataURL={imageData.blurDataURL}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
        priority
        className={
          "h-full w-full object-cover object-[35%_center] lg:object-[0%_center]"
        }
      />
    </div>
  );
}
