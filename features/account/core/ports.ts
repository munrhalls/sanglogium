import type {
  AccountSummary,
  MergedGuestOrderCountParams,
  OrderDetail,
  UserAddressesProfile,
  UserOrderSummary,
} from "./rules/accountTypes";

export type ProfilePorts = {
  getAccountSummary: (authId: string) => Promise<AccountSummary | null>;
  getFullUserProfile: (authId: string) => Promise<Record<string, unknown> | null>;
};

export type AddressBookPorts = {
  getUserAddresses: (authId: string) => Promise<UserAddressesProfile | null>;
};

export type OrderHistoryPorts = {
  getUserOrders: (userId: string) => Promise<UserOrderSummary[]>;
  getUserOrderByNumber: (
    orderNumber: string,
    userId: string,
  ) => Promise<OrderDetail | null>;
  getAllUserOrdersFull: (userId: string) => Promise<Record<string, unknown>[]>;
  countMergedGuestOrders: (
    params: MergedGuestOrderCountParams,
  ) => Promise<number>;
};

