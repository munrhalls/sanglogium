// CRITICAL: Module-scope stripePromise (NOT inside component)
// This prevents B-4: loadStripe at module scope, not in component
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
