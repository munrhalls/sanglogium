import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "Privacy Policy — Sang Logium";
const description =
  "How Sang Logium collects, uses, and protects your personal data, and the rights you have over your information under GDPR.";
const url = "https://sanglogium.com/privacy-policy";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function PrivacyPolicyPage() {
  return (
    <ContentLayout
      title="Privacy Policy"
      intro="Your trust matters to us. This policy explains what data we collect, why we collect it, and the control you have over it."
      lastUpdated="June 2026"
    >
      <ContentSection heading="1. Who we are">
        <p>
          Sang Logium is the data controller responsible for your personal data.
          This policy describes how we handle that data when you visit our
          website or place an order.
        </p>
      </ContentSection>

      <ContentSection heading="2. Data we collect">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>
            <strong>Account &amp; order data:</strong> name, email, shipping and
            billing address, and order history.
          </li>
          <li>
            <strong>Payment data:</strong> processed securely by our payment
            provider; we do not store full card numbers.
          </li>
          <li>
            <strong>Usage data:</strong> device, browser, and interaction data
            collected through cookies and analytics.
          </li>
        </ul>
      </ContentSection>

      <ContentSection heading="3. How we use your data">
        <p>
          We use your data to process orders, provide customer support, prevent
          fraud, improve our store, and &mdash; where you have consented &mdash;
          send marketing communications. We process data only where we have a
          lawful basis to do so.
        </p>
      </ContentSection>

      <ContentSection heading="4. Cookies">
        <p>
          We use essential cookies to operate the site and optional cookies for
          analytics and personalisation. You can manage your preferences through
          your browser settings or our cookie controls.
        </p>
      </ContentSection>

      <ContentSection heading="5. Sharing your data">
        <p>
          We share data only with service providers who help us operate &mdash;
          such as payment processors, shipping carriers, and analytics providers
          &mdash; and only to the extent necessary. We never sell your personal
          data.
        </p>
      </ContentSection>

      <ContentSection heading="6. Your rights">
        <p>
          Under the GDPR you have the right to access, correct, delete, or
          export your data, and to object to or restrict its processing. To
          exercise these rights, contact us through the Contact page.
        </p>
      </ContentSection>

      <ContentSection heading="7. Data retention">
        <p>
          We keep your data only for as long as necessary to fulfil the purposes
          described here, including legal, accounting, and reporting
          obligations.
        </p>
      </ContentSection>

      <ContentSection heading="8. Changes to this policy">
        <p>
          We may update this policy periodically. The version published on this
          page reflects our current practices and supersedes earlier versions.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
