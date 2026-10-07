import 'server-only';
// Server door: the order record. Placement (ADR-002 transaction), guest-order merge and anonymisation.
export { createOrderFromPayment } from './adapters/sanity/createOrderFromPayment';
export { anonymizeUserOrders } from './adapters/sanity/anonymizeUserOrders';
export { mergeGuestOrdersByEmail as mergeGuestOrders } from './adapters/sanity/mergeGuestOrders';
