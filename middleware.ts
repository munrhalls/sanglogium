import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Auth protection for /account/* routes
  if (pathname.startsWith("/account")) {
    const sessionToken = getSessionCookie(request);
    if (!sessionToken) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Filtered, sorted or paged category listings render per request: serve them from the dynamic route.
  // The URL stays /products/<path>. Next's internal _rsc parameter alone does not count as a query.
  if (
    pathname.startsWith("/products/") &&
    Array.from(request.nextUrl.searchParams.keys()).some((key) => key !== "_rsc")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/products/", "/products-faceted/");
    const rewritten = NextResponse.rewrite(url);
    rewritten.headers.set("x-show-modal", "0");
    return rewritten;
  }

  const isAccountRoute = pathname.endsWith("/account");
  response.headers.set("x-show-modal", isAccountRoute ? "1" : "0");
  return response;
};

export const config = {
  matcher: [
    "/account/:path*",
    "/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
