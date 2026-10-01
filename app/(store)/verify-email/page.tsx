import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
