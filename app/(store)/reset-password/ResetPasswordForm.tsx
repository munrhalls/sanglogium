"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const callbackError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      if (!token) {
        return { error: "Invalid or missing reset token. Please request a new link." };
      }

      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
      }

      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true };
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Set New Password</h1>

      {!token && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          Invalid or missing reset token.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new link
          </Link>
        </div>
      )}

      {callbackError && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          Invalid or expired reset token.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new link
          </Link>
        </div>
      )}

      {state?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Password reset successfully. Redirecting to sign in...
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="type-caption text-text-caption mb-1 block">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="type-caption text-text-caption mb-1 block">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !token || state?.success}
          className="btn-primary w-full py-3"
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-4 text-center type-body">
        <Link href="/sign-in" className="text-text-accent underline hover:text-text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
