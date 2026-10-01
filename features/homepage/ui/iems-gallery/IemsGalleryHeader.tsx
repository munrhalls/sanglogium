import SectionHeader from "../shared/SectionHeader";

export default function IemsGalleryHeader({ href }: { href?: string }) {
  return (
    <SectionHeader
      overline="Pro Audio Quality"
      title="In-Ear Monitors"
      href={href}
      titleClassName="text-h3 xs:text-h1 lg:text-h3"
    />
  );
}
