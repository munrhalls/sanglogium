import { NextResponse } from "next/server";

export default async function middleware(request: Request) {
  const response = NextResponse.next();
  const isAccountRoute = new URL(request.url).pathname.endsWith("/account");
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
