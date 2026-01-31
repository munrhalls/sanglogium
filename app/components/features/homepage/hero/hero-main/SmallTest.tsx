import { PortableText } from "@portabletext/react";
import { smallTest } from "@/sanity/lib/promotions/smallTest";
import CTA from "@/app/components/ui/buttons/CTA";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const components = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-center text-7xl font-bold drop-shadow-md">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-center text-2xl font-semibold opacity-90 drop-shadow-sm">
        {children}
      </h2>
    ),
  },
  marks: {
    color: ({ value, children }: any) => (
      <span style={{ color: value?.hex }}>{children}</span>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },
};

export default async function SmallTest() {
  const data = await smallTest();
  const text = data.promotion_text;
  const ctaText = data.cta_text;

  if (!text) return <div>No headline found</div>;

  return (
    <div className="relative flex min-h-[400px] w-full flex-col items-center justify-center overflow-hidden py-12 md:min-h-[500px] xl:min-h-[600px]">
      <div className="z-10 flex w-[90%] max-w-[1000px] flex-col items-center justify-center gap-3 text-white md:pl-80">
        <PortableText value={text} components={components} />
        <button className="m-auto mt-8 inline-flex items-center justify-center rounded-md border border-white bg-white px-14 py-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:bg-gray-100">
          <span className="font-bold uppercase tracking-wider text-black">
            {ctaText}
          </span>
        </button>
      </div>
    </div>
  );
}
