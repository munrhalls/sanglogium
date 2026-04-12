"use client";
// import { SignedIn } from "@clerk/nextjs";
// import { SignedOut } from "@clerk/nextjs";
import SignInBtn from "./SignInBtn";
import AuthenticatedView from "./AuthenticatedView";
export default function Authentication() {
  return (
    <div className="text-white">
      {/* <SignedIn>
        <AuthenticatedView />
      </SignedIn>
      <SignedOut>
        <SignInBtn />
      </SignedOut> */}
      <SignInBtn />
    </div>
  );
}
