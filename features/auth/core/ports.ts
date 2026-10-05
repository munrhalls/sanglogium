import type { AuthUser } from "./rules/authTypes";

export type UserProfiles = {
  createUserProfileIfMissing: (user: AuthUser) => Promise<"existing" | "created">;
  syncUserProfile: (user: AuthUser) => Promise<void>;
  deleteUserProfile: (authId: string) => Promise<void>;
  getProfileIdByAuthId: (authId: string) => Promise<{ _id: string } | null>;
};

export type OrderLifecycle = {
  anonymizeUserOrders: (userId: string) => Promise<void>;
  hasOpenOrders: (userId: string) => Promise<boolean>;
  mergeGuestOrders: (
    userId: string,
    verifiedEmail: string
  ) => Promise<{ linked: number }>;
};

export type AuthEmails = {
  sendVerificationEmail: (data: {
    user: AuthUser;
    url: string;
    token: string;
  }) => Promise<void>;
  sendResetPasswordEmail: (data: {
    user: AuthUser;
    url: string;
    token: string;
  }) => Promise<void>;
  sendDeleteAccountVerification: (data: {
    user: AuthUser;
    url: string;
    token: string;
  }) => Promise<void>;
};

export type AuthDeps = {
  profiles: UserProfiles;
  orders: OrderLifecycle;
  emails: AuthEmails;
};
