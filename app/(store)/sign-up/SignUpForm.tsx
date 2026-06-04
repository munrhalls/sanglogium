"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { createUserProfile } from "./actions";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

      const user = result.data?.user;
      if (!user?.id) {
        return { error: "User created but no ID returned" };
      }

      const profileResult = await createUserProfile({
        authId: user.id,
        email,
        name,
      });

      if (!profileResult.success) {
        return { error: `Signed up but profile creation failed: ${profileResult.error}` };
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

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Create Account</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Account created successfully! Redirecting...
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
