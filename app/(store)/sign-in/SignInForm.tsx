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

  async function handleGitHubSignIn() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/account",
    });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign In</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          Signed in successfully!{" "}
          <Link href="/account" className="underline">
            Go to your account
          </Link>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-300 p-2 text-black"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-gray-300 p-2 text-black"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-gray-300" />
        <span className="mx-4 text-sm text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center rounded border border-gray-300 p-2 hover:bg-gray-50"
        >
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={handleGitHubSignIn}
          className="flex w-full items-center justify-center rounded border border-gray-300 p-2 hover:bg-gray-50"
        >
          Sign in with GitHub
        </button>
      </div>

      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-blue-600 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
