import { Suspense } from "react";
import SignUpForm from "./SignUpForm";
import { isGoogleAuthEnabled } from "@/lib/auth/providers";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <SignUpForm googleEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
