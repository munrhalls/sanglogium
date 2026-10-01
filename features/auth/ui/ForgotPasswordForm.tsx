"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const email = formData.get("email") as string;

      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true };
    },
    null
  );

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Reset Password</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          If an account exists for this email, a reset link has been sent.
          Please check your inbox.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="type-caption text-text-caption mb-1 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3"
        >
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-4 text-center type-body">
        Remember your password?{" "}
        <Link href="/sign-in" className="text-text-accent underline hover:text-text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
