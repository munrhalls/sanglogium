import 'server-only';
// Server door: newsletter subscription.
import { subscribeToNewsletter } from './adapters/resend/subscribeNewsletter';
import { subscribeNewsletter as subscribeNewsletterUseCase } from './commands/subscribeNewsletter';
import type { NewsletterSubscriptions } from './core/ports';

const newsletterSubscriptions: NewsletterSubscriptions = { subscribe: subscribeToNewsletter };

export const subscribeNewsletter = (input: unknown) =>
  subscribeNewsletterUseCase(newsletterSubscriptions, input);
