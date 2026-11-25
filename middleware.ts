import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Mirrors AUTH_HINT_COOKIE and AUTH_HINT_MAX_AGE_SECONDS in features/auth/core/definitions/authHint.ts: the edge cannot import a slice door.
const AUTH_HINT_COOKIE = "sl_auth";
const AUTH_HINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// A browser navigation to an HTML page: not an RSC fetch, a prefetch or an API call.
function isPageNavigation(request: NextRequest): boolean {
  return (
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").includes("text/html") &&
    !request.headers.has("rsc") &&
    !request.headers.has("next-router-prefetch") &&
    !(request.headers.get("sec-purpose") ?? "").includes("prefetch") &&
    !request.nextUrl.pathname.startsWith("/api/")
  );
}

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

  // The static pages choose the header variant from the sl_auth hint before first paint, so the hint must agree with the session cookie before a page is served.
  // One redirect to the same URL sets or clears it; a request where they already agree passes through untouched.
  if (isPageNavigation(request)) {
    const hasSession = !!getSessionCookie(request);
    const hasHint = request.cookies.get(AUTH_HINT_COOKIE)?.value === "1";
    if (hasSession !== hasHint) {
      const corrected = NextResponse.redirect(request.nextUrl);
      corrected.headers.set("cache-control", "no-store");
      corrected.cookies.set({
        name: AUTH_HINT_COOKIE,
        value: hasSession ? "1" : "",
        path: "/",
        maxAge: hasSession ? AUTH_HINT_MAX_AGE_SECONDS : 0,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
      return corrected;
    }
  }

  // The faceted route is internal: a direct request goes to the public URL, query kept.
  if (pathname === "/products-faceted" || pathname.startsWith("/products-faceted/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/products-faceted", "/products");
    return NextResponse.redirect(url, 308);
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
