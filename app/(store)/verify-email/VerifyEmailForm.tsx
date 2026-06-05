"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("redirecting");
    // Redirect to Better Auth's verification endpoint.
    // Better Auth validates the token server-side and redirects to baseURL on success.
    window.location.href = `/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  }, [token]);

  if (status === "error" || !token) {
    return (
      <div className="card-base w-full max-w-[440px] text-center">
        <h1 className="type-section-hed mb-4">Invalid Link</h1>
        <p className="type-body mb-4 text-text-secondary">
          The verification link is missing or invalid.
        </p>
        <Link
          href="/sign-in"
          className="text-text-accent underline hover:text-text-primary"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card-base w-full max-w-[440px] text-center">
      <h1 className="type-section-hed mb-4">Verifying Email</h1>
      <p className="type-body text-text-secondary">
        Please wait while we verify your email address...
      </p>
    </div>
  );
}
