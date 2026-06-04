import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
