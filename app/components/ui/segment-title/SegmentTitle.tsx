import Image from "next/image";

export default function SegmentTitle({
  title,
  white = false,
}: {
  title: string;
  white?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Image
        src="/logo-orbit.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 text-brand-400"
      />
      <h1 className="type-section-hed uppercase section-header-anchor text-center">
        {title}
      </h1>
      <Image
        src="/logo-orbit.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 text-brand-400"
      />
    </div>
  );
}
