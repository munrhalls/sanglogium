import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
export const authClient = createAuthClient(
  baseURL
    ? {
        baseURL,
        plugins: [
          twoFactorClient({
            onTwoFactorRedirect: () => {
              // Handled in SignInForm so the sign-in flow stays local.
            },
          }),
        ],
      }
    : {
        plugins: [
          twoFactorClient({
            onTwoFactorRedirect: () => {
              // Handled in SignInForm so the sign-in flow stays local.
            },
          }),
        ],
      }
);
