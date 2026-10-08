import "server-only";

import type { AddressBookPorts, OrderHistoryPorts, ProfilePorts } from "./core/ports";
import { getAccountSummary } from "./adapters/sanity/getAccountSummary";
import { getFullUserProfile } from "./adapters/sanity/getFullUserProfile";
import { getUserAddresses } from "./adapters/sanity/getUserAddresses";
import { getUserOrders } from "./adapters/sanity/getUserOrders";
import { getUserOrderByNumber } from "./adapters/sanity/getUserOrderByNumber";
import { getAllUserOrdersFull } from "./adapters/sanity/getAllUserOrdersFull";
import { countMergedGuestOrders } from "./adapters/sanity/countMergedGuestOrders";
import { getAccountOverview as getAccountOverviewQ } from "./queries/getAccountOverview";
import { getOrderDetail as getOrderDetailQ } from "./queries/getOrderDetail";
import { getAccountExport as getAccountExportQ } from "./queries/getAccountExport";
import type { AccountOverviewParams } from "./queries/getAccountOverview";

const profile: ProfilePorts = {
  getAccountSummary,
  getFullUserProfile,
};

const addressBook: AddressBookPorts = {
  getUserAddresses,
};

const orderHistory: OrderHistoryPorts = {
  getUserOrders,
  getUserOrderByNumber,
  getAllUserOrdersFull,
  countMergedGuestOrders,
};

export const getAccountOverview = (params: AccountOverviewParams) =>
  getAccountOverviewQ({ profile, orderHistory }, params);

export const getOrderDetail = (orderNumber: string, userId: string) =>
  getOrderDetailQ({ orderHistory }, orderNumber, userId);

export const getAccountExport = (userId: string) =>
  getAccountExportQ({ profile, orderHistory }, userId);

export { default as AccountHomeView } from "./view/AccountHomeView";
export { default as AddressesView } from "./view/AddressesView";
export { default as OrdersView } from "./view/OrdersView";
export { default as OrderDetailView } from "./view/OrderDetailView";

export {
  getUserAddresses,
  getUserOrders,
};
