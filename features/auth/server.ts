import 'server-only';
// Server-only entry: session guards, the auth route handlers, account name updates, the sign-in record and the provider flag. Never import from client components or Node .mjs scripts.
import { createAuth } from './adapters/better-auth/auth';
import { createSessionReaders } from './adapters/better-auth/session';
import { createRouteHandlers, createUserNameUpdater, createSignInRecordReader } from './adapters/better-auth/serverApi';
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
export const getSignInRecord = createSignInRecordReader(auth);

const { getSession, requireSession, verifySession, getSignInFacts } = createSessionReaders(auth, profiles);
export { getSession, requireSession, verifySession, getSignInFacts };
export { isGoogleAuthEnabled } from './adapters/better-auth/providers';
