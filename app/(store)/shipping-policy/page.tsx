import type { Metadata } from "next";
import ContentLayout, {
  ContentSection,
} from "@/app/components/layout/content/ContentLayout";

const title = "Shipping Policy — Sang Logium";
const description =
  "How and when Sang Logium ships your premium audio gear: processing times, delivery estimates, carriers, costs, and tracking.";
const url = "https://sanglogium.com/shipping-policy";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

export default function ShippingPolicyPage() {
  return (
    <ContentLayout
      title="Shipping Policy"
      intro="Everything you need to know about how your order reaches you, fully tracked from our warehouse to your door."
      lastUpdated="June 2026"
    >
      <ContentSection heading="Order processing">
        <p>
          Orders are processed within 1&ndash;2 business days. Orders placed
          after 2:00 PM CET, on weekends, or on public holidays are processed on
          the next business day. You will receive a confirmation email the
          moment your order ships, complete with a tracking number.
        </p>
      </ContentSection>

      <ContentSection heading="Delivery times">
        <p>
          Delivery estimates begin once your order has been dispatched, not from
          the time the order is placed.
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Poland: 1&ndash;3 business days</li>
          <li>European Union: 3&ndash;6 business days</li>
          <li>Rest of the world: 7&ndash;14 business days</li>
        </ul>
        <p>
          Delivery windows are estimates provided by our carriers and may vary
          during peak periods or due to customs processing.
        </p>
      </ContentSection>

      <ContentSection heading="Shipping costs">
        <p>
          Shipping is calculated at checkout based on your destination and the
          carrier you select. Any applicable free-shipping thresholds and
          promotions are applied automatically before payment.
        </p>
      </ContentSection>

      <ContentSection heading="Tracking your order">
        <p>
          Once dispatched, you can track your parcel using the link in your
          shipping confirmation email or from the Order Status section of your
          account. Please allow up to 24 hours for tracking information to
          become active.
        </p>
      </ContentSection>

      <ContentSection heading="Customs, duties &amp; taxes">
        <p>
          Orders shipped outside the European Union may be subject to import
          duties and taxes levied by the destination country. These charges are
          the responsibility of the recipient and are not included in the order
          total.
        </p>
      </ContentSection>

      <ContentSection heading="Lost or damaged parcels">
        <p>
          Every order is insured in transit. If your parcel arrives damaged or
          fails to arrive, contact us within 14 days of the expected delivery
          date and we will resolve it promptly.
        </p>
      </ContentSection>
    </ContentLayout>
  );
}
