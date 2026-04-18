// import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import "@/lib/queue/health"; // Import to ensure queue health interval starts on server startup

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
