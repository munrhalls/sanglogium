"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { createUserProfile } from "./actions";

export default function SignUpForm() {
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

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>

      {state?.error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          Account created successfully!{" "}
          <Link href="/account" className="underline">
            Go to your account
          </Link>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border border-gray-300 p-2 text-black"
          />
        </div>

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
            minLength={8}
            className="w-full rounded border border-gray-300 p-2 text-black"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
