import Carousel from "../../../../ui/carousel-single-slide/carouselSingleSlide";
import SegmentTitle from "../../../../ui/segment-title/SegmentTitle";
import BrandTitle from "../../../../ui/commercials/minor/brandTitle";
import Link from "next/link";
import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity/imageUrl";
import { BlockContent } from "@/sanity.types";
import { PortableText } from "@portabletext/react";
type Product = {
  _id: string;
  name: string;
  brand: string;
  description: BlockContent;
  price: number;
  image: string;
};
function isProduct(item: unknown): item is Product {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as Product)._id === "string" &&
    typeof (item as Product).name === "string" &&
    typeof (item as Product).brand === "string" &&
    typeof (item as Product).description === "object" &&
    typeof (item as Product).price === "number" &&
    typeof (item as Product).image === "string"
  );
}
export default async function ExtremeQuality() {
  const [commercial] = await getCommercialsByFeature("extreme-quality");
  if (!commercial || !commercial.products) return null;
  const eqproducts = commercial?.products;
  const verified = eqproducts?.filter(isProduct);
  const keys: string[] =
    verified?.map((eqproduct) => eqproduct._id + "_eqcarousel") || [];
  const prebuiltCommercials = verified?.map((eqproduct) => {
    return (
      <div
        key={eqproduct._id + "_eqproduct"}
        className="relative grid border border-black p-4 md:grid-cols-[5fr_2fr]"
      >
        <div className="grid w-full grid-rows-[4rem_2fr] place-items-center">
          <BrandTitle brand={eqproduct.brand} />
          <div className="max-h-[600px] max-w-[600px]">
            <Image
              loading="lazy"
              src={imageUrl(eqproduct.image).url()}
              quality={60}
              height={400}
              width={400}
              alt={"eqproduct.brand"}
              className="h-full w-full rounded-sm object-cover"
            />
          </div>
          <div className="my-2 grid place-content-center">
            <span className="ml-1 text-xs font-black sm:text-lg sm:font-black md:text-xl lg:text-2xl xl:text-3xl">
              ${eqproduct.displayPrice.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="grid h-full w-full place-content-center gap-3">
          <h1 className="text-xl font-bold">{eqproduct.name}</h1>
          <PortableText value={eqproduct.description} />
          <Link
            href={`/product/${eqproduct._id}`}
            className="mt-3 grid place-content-center"
          >
            <button
              type="button"
              className="rounded-sm bg-black px-4 py-2 text-white transition-all duration-300 ease-out hover:border-black hover:bg-white hover:text-black hover:shadow-black/50"
            >
              SHOP NOW
            </button>
          </Link>
        </div>
      </div>
    );
  });
  return (
    <div className="grid w-full grid-rows-[8rem_5fr]">
      <SegmentTitle title="Extreme Quality Series" />
      <div className="h-full min-h-[800px] w-full">
        <Carousel prebuiltSlides={prebuiltCommercials} keys={keys} />
      </div>
    </div>
  );
}
