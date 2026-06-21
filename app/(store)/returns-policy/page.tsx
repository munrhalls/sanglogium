import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "Returns Policy — Sang Logium";
const description =
  "Sang Logium's 30-day returns policy: eligibility, how to start a return, refunds, exchanges, and warranty coverage on premium audio equipment.";
const url = "https://sanglogium.com/returns-policy";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function ReturnsPolicyPage() {
  return (
    <ContentLayout
      title="Returns Policy"
      intro="We want you to love the way you listen. If something isn't right, returning it is simple and transparent."
      lastUpdated="June 2026"
    >
      <ContentSection heading="30-day returns">
        <p>
          You may return most items within 30 days of delivery for a full
          refund or exchange. To be eligible, items must be in their original
          condition and packaging, with all accessories and documentation
          included.
        </p>
      </ContentSection>

      <ContentSection heading="How to start a return">
        <p>
          Begin a return from the Order Status section of your account, or
          contact our support team with your order number. We will issue a
          prepaid return label and step-by-step instructions.
        </p>
      </ContentSection>

      <ContentSection heading="Refunds">
        <p>
          Once your return is received and inspected, we will notify you by
          email. Approved refunds are issued to your original payment method
          within 5&ndash;10 business days. Original shipping charges are
          non-refundable unless the return is due to our error.
        </p>
      </ContentSection>

      <ContentSection heading="Exchanges">
        <p>
          Prefer a different model or variant? Start an exchange the same way you
          would a return. We will ship your replacement as soon as the original
          item is on its way back to us.
        </p>
      </ContentSection>

      <ContentSection heading="Non-returnable items">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            In-ear monitors and earphones once the hygiene seal has been opened
          </li>
          <li>Gift cards and downloadable software</li>
          <li>Items marked as final sale</li>
        </ul>
      </ContentSection>

      <ContentSection heading="Warranty">
        <p>
          All products are covered by the manufacturer's warranty in addition to
          your statutory rights. If you experience a fault outside the return
          window, contact us and we will help arrange a repair or replacement.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
