// import { currentUser } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { getCheckoutCookie } from "@/lib/utils/cookies";
import CheckoutProvider from "./CheckoutProvider";
import { Address, Status } from "./checkout.types";
import { User } from "@/sanity.types";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await currentUser();
  const user = null; // DISABLED CLERK

  let initialAddress: Address | null = null;
  let initialStatus: Status = "EDITING";

  if (user) {
    try {
      const sanityUser: User | null = await backendClient.fetch(
        `*[_type == "user" && clerkUserId == $id][0]{
            addresses
        }`,
        { id: user.id }
      );

      if (sanityUser?.addresses && sanityUser.addresses.length > 0) {
        const savedAddr =
          sanityUser.addresses.find((a) => a.isDefault) ||
          sanityUser.addresses[0];

        if (savedAddr) {
          const hasRequiredFields =
            savedAddr.line1?.trim() &&
            savedAddr.city?.trim() &&
            savedAddr.postalCode?.trim() &&
            savedAddr.country?.trim();

          if (hasRequiredFields) {
            initialAddress = {
              street: savedAddr.line1!,
              streetNumber: savedAddr.line2!,
              city: savedAddr.city!,
              postalCode: savedAddr.postalCode!,
              regionCode: savedAddr.country!,
            };
          } else {
            console.warn("Incomplete address data in Sanity:", {
              hasLine1: !!savedAddr.line1,
              hasCity: !!savedAddr.city,
              hasPostalCode: !!savedAddr.postalCode,
              hasCountry: !!savedAddr.country,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user address from Sanity:", error);
    }
  }

  if (initialAddress === null || initialAddress === undefined) {
    const guestContext = await getCheckoutCookie();

    if (guestContext?.address) {
      initialAddress = {
        street: guestContext.address.line1,
        streetNumber: guestContext.address.line2,
        city: guestContext.address.city,
        postalCode: guestContext.address.postal_code,
        regionCode: guestContext.address.country,
      };
    }
  }

  return (
    <CheckoutProvider
      initialAddress={initialAddress}
      initialStatus={initialStatus}
    >
      {children}
    </CheckoutProvider>
  );
}
