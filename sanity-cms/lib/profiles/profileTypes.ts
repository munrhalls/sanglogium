export interface UserProfile {
  _id: string;
  _type: "userProfile";
  clerkId: string;
  displayName?: string;
  primaryAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    receiveMarketingEmails?: boolean;
    darkMode?: boolean;
    savePaymentInfo?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfileOptions {
  clerkId: string;
  primaryAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    receiveMarketingEmails?: boolean;
    darkMode?: boolean;
    savePaymentInfo?: boolean;
  };
}

export interface UpdateProfileOptions {
  clerkId: string;
  primaryAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    receiveMarketingEmails?: boolean;
    darkMode?: boolean;
    savePaymentInfo?: boolean;
  };
}

export interface FetchProfileOptions {
  clerkId: string;
}
