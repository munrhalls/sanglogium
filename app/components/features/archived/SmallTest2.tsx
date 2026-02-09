import { PortableText } from "@portabletext/react";
import { smallTest } from "@/sanity/lib/promotions/smallTest";

const components = {
  block: {
    normal: ({ children }: any) => (
      <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl">{children}</h1>
    ),
  },
  marks: {
    color: ({ value, children }: any) => (
      <span style={{ color: value?.hex }}>{children}</span>
    ),
  },
};

export default async function SmallTest2() {
  const data = await smallTest();
  const subHeadline = data.subheadline;

  if (!subHeadline) {
    return <div>No subheadline found</div>;
  }

  return <PortableText value={subHeadline} components={components} />;
}
