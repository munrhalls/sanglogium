export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type SignInFacts = { email: string; emailVerified: boolean; twoFactorEnabled: boolean; signedInAt: number; providers: string[] };
