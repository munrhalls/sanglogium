import type { Address } from "@/features/checkout";

export interface AccountSummary {
  _id?: string;
  marketingEmailsOptIn?: boolean;
}

export type SavedAddress = Address & { _key: string };

export interface UserAddressesProfile {
  _id: string;
  addresses?: SavedAddress[];
}

export interface UserOrderSummary {
  orderNumber: string;
  status: string;
  pricing: {
    total: number;
    currency: string;
  };
  dates: {
    orderedAt: string;
  };
}

export interface MergedGuestOrderCountParams {
  userId: string;
  email: string;
  userCreatedAt: string;
}
