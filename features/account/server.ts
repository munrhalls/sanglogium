import "server-only";

import type { AddressBookPorts, OrderHistoryPorts, ProfilePorts } from "./core/ports";
import { getAccountSummary } from "./adapters/sanity/getAccountSummary";
import { getFullUserProfile } from "./adapters/sanity/getFullUserProfile";
import { setProfileName } from "./adapters/sanity/setProfileName";
import { setMarketingOptIn } from "./adapters/sanity/setMarketingOptIn";
import { getUserAddresses } from "./adapters/sanity/getUserAddresses";
import { addProfileAddress } from "./adapters/sanity/addProfileAddress";
import { replaceProfileAddress } from "./adapters/sanity/replaceProfileAddress";
import { removeProfileAddress } from "./adapters/sanity/removeProfileAddress";
import { getUserOrders } from "./adapters/sanity/getUserOrders";
import { getUserOrderByNumber } from "./adapters/sanity/getUserOrderByNumber";
import { getAllUserOrdersFull } from "./adapters/sanity/getAllUserOrdersFull";
import { countMergedGuestOrders } from "./adapters/sanity/countMergedGuestOrders";
import { getAccountOverview as getAccountOverviewQ } from "./queries/getAccountOverview";
import { getOrderDetail as getOrderDetailQ } from "./queries/getOrderDetail";
import { getAccountExport as getAccountExportQ } from "./queries/getAccountExport";
import type { AccountOverviewParams } from "./queries/getAccountOverview";

export const profile: ProfilePorts = {
  getAccountSummary,
  getFullUserProfile,
  setProfileName,
  setMarketingOptIn,
};

export const addressBook: AddressBookPorts = {
  getUserAddresses,
  addProfileAddress,
  replaceProfileAddress,
  removeProfileAddress,
};

export const orderHistory: OrderHistoryPorts = {
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
  getAccountSummary,
  getFullUserProfile,
  setProfileName,
  setMarketingOptIn,
  getUserAddresses,
  addProfileAddress,
  replaceProfileAddress,
  removeProfileAddress,
  getUserOrders,
  getUserOrderByNumber,
  getAllUserOrdersFull,
  countMergedGuestOrders,
};
