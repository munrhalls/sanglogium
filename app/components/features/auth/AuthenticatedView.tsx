"use client";
// import { useUser } from "@clerk/nextjs";
import AccountButtonPOC from "./AccountButtonPOC";

export default function AuthenticatedView() {
  // const { user, isLoaded } = useUser();
  const user = null; // DISABLED CLERK
  const isLoaded = true; // DISABLED CLERK
  
  if (!isLoaded || !user) {
    return null; // DISABLED - Always show guest view
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="grid place-content-center">
        <div className="relative grid place-content-center">
          <AccountButtonPOC />
        </div>
        <div
          style={{ lineHeight: "16px" }}
          className="hidden items-center justify-center sm:flex"
        >
          <p className="mr-1 text-xs text-white md:text-sm">Welcome back,</p>
          <p className="text-xs font-semibold text-white md:text-sm">
            Guest
          </p>
        </div>
      </div>
    </div>
  );
}
