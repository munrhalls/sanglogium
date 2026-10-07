import 'server-only';
// Server-only entry: session guards, the auth route handlers, account name updates and the provider flag. Never import from client components or Node .mjs scripts.
import { createAuth } from './adapters/better-auth/auth';
import { createSessionReaders } from './adapters/better-auth/session';
import { createRouteHandlers, createUserNameUpdater } from './adapters/better-auth/serverApi';
import type { UserProfiles, OrderLifecycle, AuthEmails } from './core/ports';
import { createUserProfileIfMissing, syncUserProfile, deleteUserProfile, getProfileIdByAuthId } from '@/features/profile/server';
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

const auth = createAuth({ profiles, orders, emails });

export const authRouteHandlers = createRouteHandlers(auth);
export const updateUserName = createUserNameUpdater(auth);

const { getSession, requireSession, verifySession } = createSessionReaders(auth, profiles);
export { getSession, requireSession, verifySession };
export { hasSessionCookie } from './adapters/better-auth/serverApi';
export { isGoogleAuthEnabled } from './adapters/better-auth/providers';
