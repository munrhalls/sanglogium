import SectionHeader from "../shared/SectionHeader";

export default function IemsGalleryHeader({ href }: { href?: string }) {
  return (
    <SectionHeader
      overline="In-Ear Monitors"
      title="IEMs"
      href={href}
      className="mb-12 md:mb-10"
    />
  );
}
