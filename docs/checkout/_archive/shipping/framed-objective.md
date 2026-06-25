# Framed Objective - Shipping Page

**Happy path tracer only.**

- Server Component reads address from iron-session cookie
- Server Component calls AlleKurier API to fetch available shipping rates for the address/parcel for PL
- Display shipping options to user (service name, price, delivery time)
- User selects shipping option (e.g., DPD Courier)
- UI submits selected shipping serviceCode to Server Action (CRITICAL: Never submit price from client)
- Server Action receives shippingCode, calls AlleKurier API server-side using shippingCode and session.address to fetch exact current price
- Server Action converts price to integer (grosz)
- Server Action saves BOTH session.shippingCode AND session.shippingCost to encrypted iron-session
- Server Action redirects to `/checkout/payment`
- Session state becomes: `{ basket, address, shippingCode, shippingCost }`
- On Payment page, server uses trusted session.shippingCost (fetched server-side, tamper-proof)
- Prevent price tampering by never trusting client-submitted price
