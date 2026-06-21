import type { Metadata } from "next";
import ContentLayout from "@/app/components/layout/content/ContentLayout";

const title = "FAQ — Sang Logium";
const description =
  "Answers to frequently asked questions about ordering, shipping, returns, warranties, and product authenticity at Sang Logium.";
const url = "https://sanglogium.com/faq";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website" },
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "How long will my order take to arrive?",
    answer:
      "Orders are processed within 1–2 business days. Delivery then takes 1–3 business days within Poland, 3–6 across the EU, and 7–14 for the rest of the world. See our Shipping Policy for full details.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes. As soon as your order ships you will receive an email with a tracking number, and you can also follow it from the Order Status section of your account.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "Most items can be returned within 30 days of delivery in their original condition and packaging. Refunds are issued to your original payment method within 5–10 business days of inspection.",
  },
  {
    question: "Are your products genuine and warranty-backed?",
    answer:
      "Absolutely. We are an authorised retailer for every brand we carry, and all products include the full manufacturer's warranty alongside your statutory rights.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept major credit and debit cards, PayPal, and Apple Pay. All payments are processed securely, and we never store your full card details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship worldwide. Orders outside the EU may be subject to import duties and taxes set by the destination country, which are the recipient's responsibility.",
  },
  {
    question: "How do I get product advice before buying?",
    answer:
      "Our audio specialists are happy to help you choose. Reach out through our Contact page and we'll recommend the right gear for your needs.",
  },
];

export default function FaqPage() {
  return (
    <ContentLayout
      title="Frequently Asked Questions"
      intro="Quick answers to the questions we hear most. Can't find what you need? Our team is one message away."
    >
      <div className="flex flex-col divide-y divide-border-secondary">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="type-card-title flex cursor-pointer items-center justify-between gap-4 list-none">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="text-text-caption transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="type-body text-text-secondary mt-3 text-pretty">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </ContentLayout>
  );
}
