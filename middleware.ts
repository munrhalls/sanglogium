import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  const response = NextResponse.next();
  const isAccountRoute = request.nextUrl.pathname.endsWith("/account");
  response.headers.set("x-show-modal", isAccountRoute ? "1" : "0");
  return response;
});

export const config = {
  matcher: [
    /*
     * 1. Protect specific user-facing routes
     */
    "/account/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/basket/:path*",
    /*
     * 2. EXCLUSION STRATEGY (The "Antigravity" Guard)
     * This regex prevents the middleware from running on:
     * - _next/static (Static files)
     * - _next/image (Image optimization)
     * - favicon.ico
     * - /studio (Sanity Studio)
     * - Any file with a common image/media extension
     */
    "/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    /*
     * 3. Include API routes if they need auth
     */
    "/(api|trpc)(.*)",
  ],
};
