import 'server-only';

// Server door: the user profile document (owner of its schema and every write).
export { createUserProfileIfMissing } from './adapters/sanity/createUserProfileIfMissing';
export { syncUserProfile } from './adapters/sanity/syncUserProfile';
export { deleteUserProfile } from './adapters/sanity/deleteUserProfile';
export { getProfileIdByAuthId } from './adapters/sanity/getProfileIdByAuthId';
export { setProfileName } from './adapters/sanity/setProfileName';
export { setMarketingOptIn } from './adapters/sanity/setMarketingOptIn';
export { addProfileAddress } from './adapters/sanity/addProfileAddress';
export { replaceProfileAddress } from './adapters/sanity/replaceProfileAddress';
export { removeProfileAddress } from './adapters/sanity/removeProfileAddress';
export { addWishlistItem } from './adapters/sanity/addWishlistItem';
export { removeWishlistItem } from './adapters/sanity/removeWishlistItem';
