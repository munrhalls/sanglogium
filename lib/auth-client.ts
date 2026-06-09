import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
export const authClient = createAuthClient(baseURL ? { baseURL } : {});
