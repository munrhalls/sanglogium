import type { Address } from "@/features/address";
import type { Order } from "@/sanity.types";
import type {
  AccountSummary,
  MergedGuestOrderCountParams,
  UserAddressesProfile,
  UserOrderSummary,
} from "./rules/accountTypes";

export type ProfilePorts = {
  getAccountSummary: (authId: string) => Promise<AccountSummary | null>;
  getFullUserProfile: (authId: string) => Promise<Record<string, unknown> | null>;
  setProfileName: (profileId: string, name: string) => Promise<void>;
  setMarketingOptIn: (profileId: string, marketingEmailsOptIn: boolean) => Promise<void>;
};

export type AddressBookPorts = {
  getUserAddresses: (authId: string) => Promise<UserAddressesProfile | null>;
  addProfileAddress: (
    profileId: string,
    address: { _key: string } & Address,
  ) => Promise<void>;
  replaceProfileAddress: (
    profileId: string,
    addressKey: string,
    address: { _key: string } & Address,
  ) => Promise<void>;
  removeProfileAddress: (profileId: string, addressKey: string) => Promise<void>;
};

export type OrderHistoryPorts = {
  getUserOrders: (userId: string) => Promise<UserOrderSummary[]>;
  getUserOrderByNumber: (
    orderNumber: string,
    userId: string,
  ) => Promise<Order | null>;
  getAllUserOrdersFull: (userId: string) => Promise<Record<string, unknown>[]>;
  countMergedGuestOrders: (
    params: MergedGuestOrderCountParams,
  ) => Promise<number>;
};

