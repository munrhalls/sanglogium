"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface SignInFormProps {
  googleEnabled?: boolean;
}

type SignInState =
  | { success: true; twoFactorRequired?: false; twoFactorMethods?: undefined }
  | { success: false; error: string; emailNotVerified?: boolean; email?: string; twoFactorRequired?: false; twoFactorMethods?: undefined }
  | { success: false; twoFactorRequired: true; twoFactorMethods?: string[] }
  | null;

type VerifyState = { success: true } | { success: false; error: string } | null;

export default function SignInForm({ googleEnabled }: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const [signInState, signInAction, signInPending] = useActionState<SignInState, FormData>(
    async (_prevState, formData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        const code = (result.error as { code?: string }).code;
        const isUnverified =
          code === "EMAIL_NOT_VERIFIED" ||
          result.error.message?.toLowerCase().includes("not verified") ||
          result.error.message?.toLowerCase().includes("email verified");
        return {
          success: false,
          error: result.error.message ?? "Sign in failed.",
          emailNotVerified: isUnverified,
          email: isUnverified ? email : undefined,
        };
      }

      const twoFactorRedirect = (result.data as any)?.twoFactorRedirect;
      if (twoFactorRedirect) {
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorMethods: (result.data as any)?.twoFactorMethods,
        };
      }

      return { success: true };
    },
    null
  );

  const [verifyState, verifyAction, verifyPending] = useActionState<VerifyState, FormData>(
    async (_prevState, formData) => {
      const code = formData.get("code") as string;
      const trustDevice = formData.get("trustDevice") === "on";

      const result = await (authClient as any).twoFactor.verifyTotp({
        code,
        trustDevice,
      });

      if (result.error) {
        return { success: false, error: result.error.message ?? "Invalid code." };
      }

      return { success: true };
    },
    null
  );

  useEffect(() => {
    if (signInState?.success || verifyState?.success) {
      const returnTo = searchParams.get("returnTo");
      const merge = searchParams.get("merge");

      const destination =
        merge === "1"
          ? "/account?merge=1"
          : returnTo && returnTo.startsWith("/")
          ? returnTo
          : "/account";

      router.push(destination);
    }
  }, [signInState, verifyState, router, searchParams]);

  async function handleResend() {
    if (!signInState || !("email" in signInState) || !signInState.email) return;
    setResendStatus("sending");
    setResendError(null);
    const merge = searchParams.get("merge");
    const callbackURL =
      merge === "1"
        ? "/sign-in?verified=true&merge=1"
        : "/sign-in?verified=true";
    const result = await authClient.sendVerificationEmail({
      email: signInState.email,
      callbackURL,
    });
    if (result.error) {
      setResendError(result.error.message ?? null);
      setResendStatus("error");
    } else {
      setResendStatus("sent");
    }
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/account",
    });
  }

  return (
    <div className="card-base w-full max-w-[440px]">
      <h1 className="type-section-hed mb-6">Sign In</h1>

      {isVerified && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Email verified successfully. Please sign in to continue.
        </div>
      )}

      {signInState && "error" in signInState && signInState.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {signInState.error}
          {signInState.emailNotVerified && (
            <div className="mt-2">
              {resendStatus === "sent" ? (
                <span className="text-success-500">Verification email sent. Check your inbox.</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || signInPending}
                  className="underline hover:no-underline disabled:opacity-50"
                >
                  {resendStatus === "sending" ? "Sending..." : "Resend verification email"}
                </button>
              )}
              {resendStatus === "error" && resendError && (
                <span className="block mt-1">{resendError}</span>
              )}
            </div>
          )}
        </div>
      )}

      {verifyState && "error" in verifyState && verifyState.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {verifyState.error}
        </div>
      )}

      {signInState?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Signed in successfully!{" "}
          <Link href="/account" className="underline hover:text-success-700">
            Go to your account
          </Link>
        </div>
      )}

      {signInState?.twoFactorRequired ? (
        <form action={verifyAction} className="space-y-4">
          <div>
            <label htmlFor="code" className="type-caption text-text-caption mb-1 block">
              Authenticator code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={8}
              placeholder="000000"
              className="input-field"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="trustDevice"
              value="on"
              className="mt-1 h-5 w-5 rounded border-border-primary bg-surface-elevated text-brand-400 focus:ring-brand-400 focus:ring-offset-0"
            />
            <span className="type-body">Remember this device for 30 days</span>
          </label>

          <button
            type="submit"
            disabled={verifyPending}
            className="btn-primary w-full py-3"
          >
            {verifyPending ? "Verifying..." : "Verify and sign in"}
          </button>
        </form>
      ) : (
        <form action={signInAction} className="space-y-4">
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
            disabled={signInPending}
            className="btn-primary w-full py-3"
          >
            {signInPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {googleEnabled && !signInState?.twoFactorRequired && (
        <>
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
        </>
      )}

      <p className="mt-4 text-center type-body">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-text-accent underline hover:text-text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
