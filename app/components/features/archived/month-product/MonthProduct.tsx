import LogoOrbitWhite from "@/public/logo-orbit-white.svg";
import Image from "next/image";
import TimeStamp from "./TimeStamp";
import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
import PriceLineCross from "@/public/icons/PriceLineCross.svg";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";
const DiscountPrice = function ({
  price,
  discount,
  priceColor,
}: {
  price: number;
  discount: number;
  priceColor: string;
}) {
  const discountPrice = price - (discount / 100) * price;
  return (
    <div className="2xs:row-start-3 md:row-start-2 mx-2 grid grid-cols-5 2xs:grid-rows-2 md:grid-rows-1">
      <span className="col-start-1 col-span-2 sm:col-start-2 relative text-gray-400 text-md 2xs:row-start-1 md:text-md lg:text-lg lg:pb-2 flex justify-center items-center">
        ${price.toFixed(2)}
        <div className="z-40 absolute inset-0 h-full w-full flex justify-center items-center lg:pb-2">
          <Image
            loading="lazy"
            src={PriceLineCross}
            alt="Price line cross"
            width={52}
            height={4}
            style={{ width: "auto" }}
          />
        </div>
        <SparklesIcon
          className="col-start-3 ml-2 font-bold text-2xl 2xs:row-start-2 2xs:col-start-1 2xs:col-span-4 md:text-xl lg:font-black  lg:text-2xl xl:text-3xl block"
          style={{ color: priceColor }}
        />
        ${discountPrice?.toFixed(2)}
      </span>
    </div>
  );
};
const Title = function ({ name }: { name: string }) {
  return (
    <div className="lg:p-0">
      <div className="flex gap-1">
        <Image
          src={LogoOrbitWhite}
          alt="Logo"
          height={30}
          width={30}
          loading="lazy"
          style={{ width: "auto" }}
        />
        <h1 className="text-2xl sm:text-3xl">Product of the month</h1>
      </div>
      <p className="mt-1 lg:max-w-[400px]">{name}</p>
    </div>
  );
};
const CTA = function ({ id }: { id: string }) {
  return (
    <Link href={`/product/${id}`} className="h-full max-w-40">
      <button className="bg-white text-black font-bold p-2 rounded-lg">
        Shop now
      </button>
    </Link>
  );
};
export default async function MonthProduct() {
  const [commercial] = await getCommercialsByFeature("mvp-month");
  const { products, sale } = commercial;
  const product = products && products[0];
  if (!product) return null;
  const { _id, name, image, price } = product;
  if (!sale) return null;
  const { discount, validUntil } = sale;
  return (
    <div className="h-[800px] py-8 md:h-[600px] lg:h-[500px] bg-black grid md:grid-cols-4 lg:p-12 lg:grid-cols-8 lg:grid-rows-3 lg:gap-1">
      <div className="md:col-start-2 md:col-span-1 md:grid md:justify-start md:row-start-3 lg:col-start-2 lg:row-start-1 lg:row-span-1">
        {validUntil && <TimeStamp validUntil={validUntil} />}
      </div>
      <div className=" grid p-6 content-center justify-start 2xs:justify-center text-white row-start-3 md:p-0 md:row-start-2 md:col-start-2 md:col-span-2 md:grid md:justify-start lg:content-start lg:p-0 lg:col-start-2 lg:col-span-3 lg:row-start-2">
        {name && <Title name={name} />}
      </div>
      <div className="grid place-content-center  l row-start-4 md:row-start-3 md:col-start-3 md:col-span-1 md:grid md:place-content-center lg:col-start-2  lg:row-start-3 lg:justify-start ">
        <CTA id={_id} />
      </div>
      <div className=" md:col-start-1 md:col-span-4 lg:col-start-5 lg:row-start-1 lg:row-span-3 xl:col-start-4 xl:col-span-5 p-6  lg:py-6 md:p-6 lg:max-w-[1000px] 2xl:max-w-[800px]">
        <div className="bg-white rounded-xl grid grid-rows-3 2xs:grid-cols-8 min-h-[350px]">
          {image && name && (
            <Image
              loading="lazy"
              src={image}
              alt={name}
              quality={60}
              sizes="(max-width: 300px) 75vw, 350px"
              width={1024}
              height={1024}
              style={{ width: "100%", height: "auto" }}
              className="row-start-1 row-span-2 min-h-[300px] max-h-[350px] 2xs:row-start-1 2xs:row-span-3 2xs:col-start-2 2xs:col-span-4 2xs:gap-1"
            />
          )}
          <div className="p-4 text-black row-start-3 2xs:row-start-1 2xs:row-span-3 2xs:col-start-6 2xs:col-span-3 md:col-start-5 lg:col-start-6 grid place-items-center 2xs:grid-rows-5 md:grid-rows-2">
            <h2 className="text-xl font-bold mb-4 2xs:mb-1 2xs:row-start-2 md:row-start-1">
              {name}
            </h2>
            {price && discount && (
              <DiscountPrice
                price={price}
                discount={discount}
                priceColor="#f21212"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
