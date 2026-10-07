import 'server-only';
// Server-only entry: the auth instance, the session guards and the provider flag. Never import from client components or Node .mjs scripts.
import { createAuth } from './adapters/better-auth/auth';
import { createSessionReaders } from './adapters/better-auth/session';
import type { UserProfiles, OrderLifecycle, AuthEmails } from './core/ports';
import { createUserProfileIfMissing } from './adapters/sanity/createUserProfileIfMissing';
import { syncUserProfile } from './adapters/sanity/syncUserProfile';
import { deleteUserProfile } from './adapters/sanity/deleteUserProfile';
import { getProfileIdByAuthId } from './adapters/sanity/getProfileIdByAuthId';
import { hasOpenOrders } from './adapters/sanity/hasOpenOrders';
import { anonymizeUserOrders, mergeGuestOrders } from '@/features/order/server';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendDeleteAccountVerification,
} from './adapters/resend/authEmails';

const profiles: UserProfiles = {
  createUserProfileIfMissing,
  syncUserProfile,
  deleteUserProfile,
  getProfileIdByAuthId,
};

const orders: OrderLifecycle = {
  anonymizeUserOrders,
  hasOpenOrders,
  mergeGuestOrders,
};

const emails: AuthEmails = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendDeleteAccountVerification,
};

export const auth = createAuth({ profiles, orders, emails });

const { getSession, requireSession, verifySession } = createSessionReaders(auth, profiles);
export { getSession, requireSession, verifySession };
export { isGoogleAuthEnabled } from './adapters/better-auth/providers';
export { getProfileIdByAuthId } from './adapters/sanity/getProfileIdByAuthId';
