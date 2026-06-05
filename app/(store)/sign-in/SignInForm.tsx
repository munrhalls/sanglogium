"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await authClient.signIn.email({
        email,
        password,
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
      router.push("/account");
    }
  }, [state, router]);

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/account",
    });
  }

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Sign In</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Signed in successfully!{" "}
          <Link href="/account" className="underline hover:text-success-700">
            Go to your account
          </Link>
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

        <div>
          <label htmlFor="password" className="type-caption text-text-caption mb-1 block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input-field"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="type-caption text-text-accent underline hover:text-text-primary"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-border-secondary" />
        <span className="type-caption text-text-caption mx-4">or</span>
        <div className="flex-1 border-t border-border-secondary" />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
        >
          Sign in with Google
        </button>
      </div>

      <p className="mt-4 text-center type-body">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-text-accent underline hover:text-text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
