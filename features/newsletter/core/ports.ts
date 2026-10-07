import type { NewsletterSubscribeOutcome } from "@/features/newsletter/core/rules/newsletter";

export type NewsletterSubscriptions = {
  subscribe(email: string): Promise<NewsletterSubscribeOutcome>;
};
