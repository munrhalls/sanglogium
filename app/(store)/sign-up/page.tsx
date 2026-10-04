import { Suspense } from "react";
import { SignUpForm } from "@/features/auth";
import { isGoogleAuthEnabled } from "@/features/auth/server";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <SignUpForm googleEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
