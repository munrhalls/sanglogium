import { getCommercialsByFeature } from "@/sanity/lib/commercials/getCommercialsByFeature";
import { PortableText } from "@portabletext/react";
import { PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity/imageUrl";
import Link from "next/link";
export default async function NewestRelease() {
  const [commercial] = await getCommercialsByFeature("newest-release");
  if (!commercial.image || !commercial.products || !commercial.text)
    return null;
  const text = commercial.text;
  const image = commercial?.image;
  const products = commercial?.products;
  const product = products[0];
  const components: PortableTextComponents = {
    block: {
      h1: ({ children }) => (
        <h1 className="flex justify-center text-xl font-black text-white lg:text-3xl">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="flex justify-center text-sm font-bold text-white lg:text-xl">
          {children}
        </h2>
      ),
      normal: ({ children }) => (
        <p className="flex justify-center text-sm text-white lg:text-xl">
          {children}
        </p>
      ),
    },
    marks: {
      textColor: ({ value, children }) => (
        <span style={{ color: value?.value || "inherit" }}>{children}</span>
      ),
    },
  };
  return (
    <div className="grid bg-gradient-to-b from-blue-950/95 via-gray-950/100 to-black py-24 md:grid-cols-2 lg:pb-40 lg:pt-60 xl:grid-cols-[1fr_3fr_3fr_1fr]">
      <Image
        src={imageUrl(image).url()}
        loading="lazy"
        height={980}
        width={1280}
        alt={""}
        quality={60}
        className="z-50 mx-auto mb-12 max-w-[300px] rounded-lg object-cover sm:max-w-[400px] md:max-w-[450px] lg:col-span-1 lg:col-start-1 lg:max-w-[600px] xl:col-start-2 xl:max-h-[800px] xl:max-w-[850px]"
      />
      <div className="grid h-full w-full gap-1 text-blue-950 md:place-content-center md:gap-2 lg:col-span-2 lg:col-start-2 xl:col-span-1 xl:col-start-3 xl:justify-center">
        <PortableText value={text} components={components} />;
        <Link
          href={`/product/${product._id}`}
          className="group grid place-content-center"
        >
          <button
            className="rounded-sm bg-blue-950 px-4 py-2 text-white transition-all duration-300 ease-out hover:border-blue-700 hover:bg-blue-900 hover:shadow-xl hover:shadow-blue-950/50 hover:drop-shadow-xl"
            type="button"
          >
            SHOP NOW
          </button>
        </Link>
      </div>
    </div>
  );
}
