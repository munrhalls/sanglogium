import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "Contact Us — Sang Logium";
const description =
  "Get in touch with the Sang Logium team for product advice, order support, and warranty enquiries. We're here to help.";
const url = "https://sanglogium.com/contact";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function ContactPage() {
  return (
    <ContentLayout
      title="Contact Us"
      intro="Questions about a product, an order, or a recommendation? Our audio specialists are ready to help."
    >
      <ContentSection heading="Customer support">
        <p>
          For order status, returns, and general enquiries, email us and we will
          respond within one business day.
        </p>
        <p>
          <a
            href="mailto:support@sanglogium.com"
            className="text-accent-500 underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            support@sanglogium.com
          </a>
        </p>
      </ContentSection>

      <ContentSection heading="Product advice">
        <p>
          Not sure which headphones or DAC are right for you? Our specialists are
          happy to guide your choice.
        </p>
        <p>
          <a
            href="mailto:advice@sanglogium.com"
            className="text-accent-500 underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            advice@sanglogium.com
          </a>
        </p>
      </ContentSection>

      <ContentSection heading="Support hours">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Monday&ndash;Friday: 9:00&ndash;18:00 CET</li>
          <li>Saturday: 10:00&ndash;16:00 CET</li>
          <li>Sunday and public holidays: closed</li>
        </ul>
      </ContentSection>

      <ContentSection heading="Before you reach out">
        <p>
          Many questions about shipping, returns, and warranties are answered on
          our FAQ, Shipping Policy, and Returns Policy pages. Having your order
          number ready helps us assist you faster.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
