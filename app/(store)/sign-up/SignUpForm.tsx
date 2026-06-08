"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const name = formData.get("name") as string;

      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, email };
    },
    null
  );

  if (state?.success) {
    return (
      <div className="card-base w-full max-w-[440px] text-center">
        <h1 className="type-section-hed mb-4">Check your email</h1>
        <p className="type-body mb-2">
          We sent a verification link to <strong>{state.email}</strong>.
        </p>
        <p className="type-body mb-4 text-text-secondary">
          Click the link to activate your account. The link expires in 1 hour.
        </p>
        <p className="type-caption text-text-caption">
          Already verified?{" "}
          <Link href="/sign-in" className="text-text-accent underline hover:text-text-primary">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Create Account</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="type-caption text-text-caption mb-1 block">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="type-caption text-text-caption mb-1 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={emailFromUrl ?? ''}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="password" className="type-caption text-text-caption mb-1 block">
            Password
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

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3"
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center type-body">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-text-accent underline hover:text-text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
