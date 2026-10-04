import { Suspense } from "react";
import { SignInForm } from "@/features/auth";
import { isGoogleAuthEnabled } from "@/features/auth/server";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <SignInForm googleEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
