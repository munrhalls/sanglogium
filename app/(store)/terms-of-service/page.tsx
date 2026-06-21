import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "Terms of Service — Sang Logium";
const description =
  "The terms and conditions governing your use of the Sang Logium website and your purchase of products from our store.";
const url = "https://sanglogium.com/terms-of-service";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function TermsOfServicePage() {
  return (
    <ContentLayout
      title="Terms of Service"
      intro="These terms govern your use of the Sang Logium website and the purchase of products from our store. By using our site, you agree to them."
      lastUpdated="June 2026"
    >
      <ContentSection heading="1. Overview">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) apply to all visitors and
          customers of Sang Logium. Please read them carefully. If you do not
          agree with any part of these Terms, please do not use our website.
        </p>
      </ContentSection>

      <ContentSection heading="2. Orders and acceptance">
        <p>
          Placing an order constitutes an offer to purchase. All orders are
          subject to acceptance and product availability. We reserve the right
          to refuse or cancel any order, including where a pricing or
          description error has occurred. A binding contract is formed only when
          we confirm dispatch of your order.
        </p>
      </ContentSection>

      <ContentSection heading="3. Pricing and payment">
        <p>
          All prices are shown in the currency displayed at checkout and include
          applicable taxes unless stated otherwise. Payment is processed
          securely through our payment provider. We do not store full card
          details on our servers.
        </p>
      </ContentSection>

      <ContentSection heading="4. Shipping and returns">
        <p>
          Delivery and returns are governed by our Shipping Policy and Returns
          Policy, which form part of these Terms. Please review them for
          processing times, costs, and eligibility.
        </p>
      </ContentSection>

      <ContentSection heading="5. Product information">
        <p>
          We take care to describe products accurately, but specifications,
          images, and availability may change. Minor variations between the
          product shown and the product delivered do not constitute grounds for
          a defect claim.
        </p>
      </ContentSection>

      <ContentSection heading="6. Intellectual property">
        <p>
          All content on this site, including text, graphics, logos, and images,
          is the property of Sang Logium or its licensors and is protected by
          applicable intellectual property laws. You may not reproduce it
          without prior written permission.
        </p>
      </ContentSection>

      <ContentSection heading="7. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Sang Logium is not liable for
          indirect or consequential losses arising from the use of our website
          or products. Nothing in these Terms limits your statutory consumer
          rights.
        </p>
      </ContentSection>

      <ContentSection heading="8. Changes to these Terms">
        <p>
          We may update these Terms from time to time. The version published on
          this page at the time of your order is the version that applies to
          that order.
        </p>
      </ContentSection>

      <ContentSection heading="9. Contact">
        <p>
          Questions about these Terms can be directed to our team through the
          Contact page.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
