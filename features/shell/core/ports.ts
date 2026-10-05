import type { NewsletterSubscribeOutcome } from "@/features/shell/core/rules/newsletter";

export type NewsletterSubscriptions = {
  subscribe(email: string): Promise<NewsletterSubscribeOutcome>;
};
