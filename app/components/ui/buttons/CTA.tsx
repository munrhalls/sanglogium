import { PortableText } from "@portabletext/react";

const components = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold md:text-3xl lg:text-5xl">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold md:text-2xl lg:text-3xl">
        {children}
      </h2>
    ),
    normal: ({ children }: any) => (
      <p className="text-lg md:text-lg lg:text-xl">{children}</p>
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

export default function CTA({
  text,
  background,
}: {
  text: any;
  background: string;
}) {
  return (
    <button
      className="m-auto inline-flex max-w-60 items-center justify-center rounded-lg border border-transparent px-6 py-3 text-base font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-8 sm:max-w-96 sm:py-6"
      style={{
        backgroundColor: background,
      }}
    >
      <PortableText value={text} components={components} />
    </button>
  );
}
