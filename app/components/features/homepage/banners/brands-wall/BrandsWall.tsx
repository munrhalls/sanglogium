import Image from "next/image";
import * as Brands from "@/public/archived/brands";
import Link from "next/link";
export default async function BrandsWall() {
  return (
    <div className="grid w-full grid-cols-[1fr_7fr_1fr] sm:grid-cols-[1fr_5fr_1fr]">
      <div className="gradient col-start-2 col-end-3 flex h-full items-center justify-center gap-4 pb-4 pt-8">
        {}
        <h1 className="text-3xl font-black text-black">
          World`s best audio gear
        </h1>
      </div>
      <div className="col-start-2 col-end-3 grid h-full grid-cols-2 gap-12 2xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
        {Object.entries(Brands).map(([brand, image], index) => {
          return (
            <Link
              href={`/brand/${brand}`}
              key={brand}
              className="grid place-content-center"
            >
              <Image
                loading={index < 6 ? "eager" : "lazy"}
                src={image.src}
                alt={brand}
                quality={50}
                sizes="150px"
                width={150}
                height={50}
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
