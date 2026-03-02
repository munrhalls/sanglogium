export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  return (
    <div className="justify-top flex min-h-dvh flex-col items-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-4xl font-bold">
          {slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          BRAND
        </h1>
        {}
      </div>
    </div>
  );
}
