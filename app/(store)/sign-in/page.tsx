import { Suspense } from "react";
import SignInForm from "./SignInForm";
import { isGoogleAuthEnabled } from "@/lib/auth/providers";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <SignInForm googleEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
