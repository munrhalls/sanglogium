import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "About Us — Sang Logium";
const description =
  "Sang Logium is a premium audio retailer curating the world's finest headphones, in-ear monitors, and audio electronics for discerning listeners.";
const url = "https://sanglogium.com/about-us";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function AboutUsPage() {
  return (
    <ContentLayout
      title="About Sang Logium"
      intro="We exist for people who hear the difference, curating the finest audio equipment and standing behind every recommendation."
    >
      <ContentSection heading="Our story">
        <p>
          Sang Logium was founded by audio engineers and lifelong enthusiasts
          who were tired of compromise. We set out to build a store where every
          product earns its place, chosen for genuine performance rather than
          marketing noise. From flagship headphones to reference-grade
          electronics, each item in our catalogue is selected with the same
          ear for detail we bring to our own listening rooms.
        </p>
      </ContentSection>

      <ContentSection heading="What we stand for">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            <strong>Curation over clutter.</strong> We stock only equipment we
            would use ourselves.
          </li>
          <li>
            <strong>Honest guidance.</strong> Our recommendations are driven by
            your needs, not our margins.
          </li>
          <li>
            <strong>Service that lasts.</strong> Expert support, fair returns,
            and warranty backing on everything we sell.
          </li>
        </ul>
      </ContentSection>

      <ContentSection heading="The brands we carry">
        <p>
          We partner with the most respected names in audio &mdash; Sennheiser,
          Sony, Bose, Focal, Beyerdynamic, Shure, Universal Audio, and many
          more &mdash; to bring you authentic products backed by full
          manufacturer warranties.
        </p>
      </ContentSection>

      <ContentSection heading="Here to help">
        <p>
          Whether you are assembling a professional studio or chasing your first
          taste of high-fidelity sound, our team is ready to help you choose
          well. Reach out any time through our Contact page.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
